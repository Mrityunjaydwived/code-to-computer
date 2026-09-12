import { ASTNode, IRInstruction, IROpcode } from './types';

export class Compiler {
  private instructions: IRInstruction[] = [];
  private instructionCount = 0;
  private functionLabels: Record<string, number> = {};
  private classDeclarations: Record<string, ASTNode> = {};
  private loopStack: Array<{ startIdx: number; breakJumps: number[] }> = [];

  public compile(ast: ASTNode): IRInstruction[] {
    this.instructions = [];
    this.instructionCount = 0;
    this.functionLabels = {};
    this.classDeclarations = {};
    this.loopStack = [];

    if (ast.type === 'Program') {
      // First pass: locate function and class declarations
      for (const stmt of ast.body) {
        if (stmt.type === 'FunctionDeclaration') {
          this.functionLabels[stmt.name] = 0;
        } else if (stmt.type === 'ClassDeclaration') {
          this.classDeclarations[stmt.name] = stmt;
        }
      }

      // Compile top-level statements
      for (const stmt of ast.body) {
        this.compileNode(stmt);
      }
    } else {
      this.compileNode(ast);
    }

    // Second pass: resolve function call jump targets for recursive and forward calls
    for (const inst of this.instructions) {
      if (inst.opcode === 'CALL' && typeof inst.op1 === 'string' && this.functionLabels[inst.op1] !== undefined) {
        inst.op2 = this.functionLabels[inst.op1];
      }
    }

    // Append HALT at the end of program
    this.emit('HALT', undefined, undefined, undefined, ast.line || 1, 'HLT', 'Halts CPU execution; finishes program');
    return this.instructions;
  }

  private emit(
    opcode: IROpcode,
    op1?: string | number,
    op2?: string | number,
    dest?: string,
    line: number = 1,
    assembly?: string,
    explanation?: string
  ): number {
    const idx = this.instructionCount++;
    const inst: IRInstruction = {
      index: idx,
      opcode,
      op1,
      op2,
      dest,
      line,
      assembly: assembly || `${opcode} ${dest || ''} ${op1 || ''} ${op2 || ''}`.trim(),
      explanation: explanation || `Execute ${opcode}`,
    };
    this.instructions.push(inst);
    return idx;
  }

  private compileNode(node: ASTNode): void {
    switch (node.type) {
      case 'Assignment': {
        // Compile expression on right-hand side -> result in RAX
        this.compileExpressionToRAX(node.value);

        if (node.target?.type === 'MemberAccess') {
          // obj.prop = val
          this.compileExpressionToReg(node.target.object, 'RBX');
          this.emit(
            'MEMBER_STORE',
            'RBX',
            node.target.property,
            'RAX',
            node.line,
            `MOV [RBX.${node.target.property}], RAX`,
            `Store RAX into member '${node.target.property}' of object in RBX`
          );
        } else if (node.target?.type === 'IndexAccess') {
          // Array index assignment: arr[idx] = val
          this.compileExpressionToReg(node.target.index, 'RBX');
          const targetName = typeof node.target.target === 'string' ? node.target.target : node.target.target?.name || 'arr';
          this.emit(
            'HEAP_STORE',
            targetName,
            'RBX',
            'RAX',
            node.line,
            `MOV [${targetName} + RBX*4], RAX`,
            `Store value in RAX to heap array '${targetName}' at indexed offset`
          );
        } else {
          const varName = typeof node.target === 'string' ? node.target : node.target?.name || 'temp';
          this.emit(
            'STORE_VAR',
            'RAX',
            undefined,
            varName,
            node.line,
            `MOV [${varName}], RAX`,
            `Store value from register RAX into memory address assigned to variable '${varName}'`
          );
        }
        break;
      }

      case 'PrintStatement': {
        for (const arg of node.args) {
          this.compileExpressionToRAX(arg);
          this.emit(
            'PRINT',
            'RAX',
            undefined,
            undefined,
            node.line,
            'OUT RAX',
            'Output register RAX value to standard console output buffer'
          );
        }
        break;
      }

      case 'IfStatement': {
        this.compileExpressionToRAX(node.condition);

        const jumpIfFalseIdx = this.emit(
          'JUMP_IF_FALSE',
          undefined,
          undefined,
          'RAX',
          node.line,
          'JZ [pending]',
          'Jump if condition in RAX is false (0)'
        );

        for (const stmt of node.consequent) {
          this.compileNode(stmt);
        }

        if (node.alternate && node.alternate.length > 0) {
          const jumpToEndIdx = this.emit('JUMP', undefined, undefined, undefined, node.line, 'JMP [pending]', 'Jump over else block');
          const elseStartIdx = this.instructionCount;
          this.instructions[jumpIfFalseIdx].op1 = elseStartIdx;
          this.instructions[jumpIfFalseIdx].assembly = `JZ line_${elseStartIdx}`;

          for (const stmt of node.alternate) {
            this.compileNode(stmt);
          }

          const endIdx = this.instructionCount;
          this.instructions[jumpToEndIdx].op1 = endIdx;
          this.instructions[jumpToEndIdx].assembly = `JMP line_${endIdx}`;
        } else {
          const endIdx = this.instructionCount;
          this.instructions[jumpIfFalseIdx].op1 = endIdx;
          this.instructions[jumpIfFalseIdx].assembly = `JZ line_${endIdx}`;
        }
        break;
      }

      case 'WhileStatement': {
        const loopStartIdx = this.instructionCount;
        this.compileExpressionToRAX(node.condition);
        const jumpExitIdx = this.emit(
          'JUMP_IF_FALSE',
          undefined,
          undefined,
          'RAX',
          node.line,
          'JZ [pending]',
          'Exit while loop if condition false'
        );

        this.loopStack.push({ startIdx: loopStartIdx, breakJumps: [] });

        for (const stmt of node.body) {
          this.compileNode(stmt);
        }

        const loop = this.loopStack.pop();

        // Jump back to condition
        this.emit('JUMP', loopStartIdx, undefined, undefined, node.line, `JMP line_${loopStartIdx}`, 'Jump back to while loop header');

        const exitIdx = this.instructionCount;
        this.instructions[jumpExitIdx].op1 = exitIdx;
        this.instructions[jumpExitIdx].assembly = `JZ line_${exitIdx}`;

        if (loop) {
          for (const bIdx of loop.breakJumps) {
            this.instructions[bIdx].op1 = exitIdx;
            this.instructions[bIdx].assembly = `JMP line_${exitIdx}`;
          }
        }
        break;
      }

      case 'ForStatement': {
        const iterVar = node.iterator;
        const range = node.iterable.value || { start: 0, end: 5, step: 1 };

        this.emit('LOAD_CONST', range.start, undefined, 'RAX', node.line, `MOV RAX, ${range.start}`, `Initialize loop iterator '${iterVar}'`);
        this.emit('STORE_VAR', 'RAX', undefined, iterVar, node.line, `MOV [${iterVar}], RAX`, `Store iterator '${iterVar}' into memory`);

        const loopHeaderIdx = this.instructionCount;

        this.emit('LOAD_VAR', iterVar, undefined, 'RAX', node.line, `MOV RAX, [${iterVar}]`, `Load loop iterator '${iterVar}'`);
        this.emit('CMP_LT', 'RAX', range.end, 'RAX', node.line, `CMP RAX, ${range.end}`, `Check if ${iterVar} < ${range.end}`);
        const jumpExitIdx = this.emit('JUMP_IF_FALSE', undefined, undefined, 'RAX', node.line, 'JZ [pending]', 'Exit for-loop when iterator reaches end');

        this.loopStack.push({ startIdx: loopHeaderIdx, breakJumps: [] });

        for (const stmt of node.body) {
          this.compileNode(stmt);
        }

        const loop = this.loopStack.pop();

        this.emit('LOAD_VAR', iterVar, undefined, 'RAX', node.line, `MOV RAX, [${iterVar}]`, `Load '${iterVar}' for increment`);
        this.emit('ADD', 'RAX', range.step, 'RAX', node.line, `ADD RAX, ${range.step}`, `Increment loop counter by ${range.step}`);
        this.emit('STORE_VAR', 'RAX', undefined, iterVar, node.line, `MOV [${iterVar}], RAX`, `Store updated '${iterVar}'`);

        this.emit('JUMP', loopHeaderIdx, undefined, undefined, node.line, `JMP line_${loopHeaderIdx}`, 'Jump to for-loop condition check');

        const exitIdx = this.instructionCount;
        this.instructions[jumpExitIdx].op1 = exitIdx;
        this.instructions[jumpExitIdx].assembly = `JZ line_${exitIdx}`;

        if (loop) {
          for (const bIdx of loop.breakJumps) {
            this.instructions[bIdx].op1 = exitIdx;
            this.instructions[bIdx].assembly = `JMP line_${exitIdx}`;
          }
        }
        break;
      }

      case 'BreakStatement': {
        const loop = this.loopStack[this.loopStack.length - 1];
        if (loop) {
          const jumpIdx = this.emit('JUMP', undefined, undefined, undefined, node.line, 'JMP [break]', 'Break out of current loop');
          loop.breakJumps.push(jumpIdx);
        }
        break;
      }

      case 'ContinueStatement': {
        const loop = this.loopStack[this.loopStack.length - 1];
        if (loop) {
          this.emit('JUMP', loop.startIdx, undefined, undefined, node.line, `JMP line_${loop.startIdx}`, 'Continue to next loop iteration');
        }
        break;
      }

      case 'ClassDeclaration': {
        this.classDeclarations[node.name] = node;
        for (const member of node.body) {
          if (member.type === 'FunctionDeclaration') {
            const qualifiedName = `${node.name}.${member.name}`;
            member.name = qualifiedName;
            this.compileNode(member);
          }
        }
        break;
      }

      case 'FunctionDeclaration': {
        const skipJumpIdx = this.emit('JUMP', undefined, undefined, undefined, node.line, 'JMP [pending]', `Skip over function '${node.name}' definition`);

        const fnEntryIdx = this.instructionCount;
        this.functionLabels[node.name] = fnEntryIdx;

        // Bind incoming arguments from stack to parameter variables in local frame
        if (node.params && node.params.length > 0) {
          for (let p = node.params.length - 1; p >= 0; p--) {
            const paramName = node.params[p];
            this.emit('POP', 'RAX', undefined, undefined, node.line, 'POP RAX', `Pop argument '${paramName}' from stack into RAX`);
            this.emit('STORE_VAR', 'RAX', undefined, paramName, node.line, `MOV [${paramName}], RAX`, `Store parameter '${paramName}' in local frame`);
          }
        }

        for (const stmt of node.body) {
          this.compileNode(stmt);
        }

        // Epilogue fallback
        this.emit('RET', undefined, undefined, undefined, node.line, 'RET', 'Return from function to caller RIP');

        const afterFnIdx = this.instructionCount;
        this.instructions[skipJumpIdx].op1 = afterFnIdx;
        this.instructions[skipJumpIdx].assembly = `JMP line_${afterFnIdx}`;
        break;
      }

      case 'ReturnStatement': {
        if (node.argument) {
          this.compileExpressionToRAX(node.argument);
        }
        this.emit('RET', undefined, undefined, undefined, node.line, 'RET', 'Return execution flow to caller instruction');
        break;
      }

      default:
        this.compileExpressionToRAX(node);
        break;
    }
  }

  private compileExpressionToRAX(node: ASTNode): void {
    this.compileExpressionToReg(node, 'RAX');
  }

  private compileExpressionToReg(node: ASTNode, targetReg: 'RAX' | 'RBX' | 'RCX' | 'RDX'): void {
    switch (node.type) {
      case 'Literal': {
        this.emit(
          'LOAD_CONST',
          node.value,
          undefined,
          targetReg,
          node.line,
          `MOV ${targetReg}, ${node.raw ?? JSON.stringify(node.value)}`,
          `Load immediate literal value ${node.raw ?? node.value} into register ${targetReg}`
        );
        break;
      }

      case 'Identifier': {
        this.emit(
          'LOAD_VAR',
          node.name,
          undefined,
          targetReg,
          node.line,
          `MOV ${targetReg}, [${node.name}]`,
          `Fetch value of variable '${node.name}' from memory into register ${targetReg}`
        );
        break;
      }

      case 'MemberAccess': {
        this.compileExpressionToReg(node.object, targetReg);
        this.emit(
          'MEMBER_LOAD',
          targetReg,
          node.property,
          targetReg,
          node.line,
          `MOV ${targetReg}, [${targetReg}.${node.property}]`,
          `Load member '${node.property}' from object reference in ${targetReg}`
        );
        break;
      }

      case 'ArrayLiteral': {
        const elementCount = node.elements.length;
        this.emit(
          'ALLOC_HEAP',
          Math.max(32, elementCount * 4),
          'array',
          targetReg,
          node.line,
          `ALLOC [Heap], ${elementCount * 4}B -> ${targetReg}`,
          `Allocate dynamic contiguous ${elementCount * 4}-byte memory block on Heap for array`
        );
        for (let i = 0; i < node.elements.length; i++) {
          this.compileExpressionToReg(node.elements[i], 'RBX');
          this.emit(
            'HEAP_STORE',
            targetReg,
            i,
            'RBX',
            node.line,
            `MOV [${targetReg} + ${i * 4}], RBX`,
            `Write element [${i}] to heap memory block`
          );
        }
        break;
      }

      case 'DictLiteral': {
        const count = node.entries.length;
        this.emit(
          'ALLOC_HEAP',
          Math.max(32, count * 16),
          'dict',
          targetReg,
          node.line,
          `ALLOC [Dict], ${count} entries -> ${targetReg}`,
          `Allocate dynamic HashMap on Heap with ${count} key-value pair(s)`
        );
        for (const entry of node.entries) {
          this.compileExpressionToReg(entry.key, 'RBX');
          this.compileExpressionToReg(entry.value, 'RCX');
          this.emit(
            'HEAP_STORE',
            targetReg,
            'RBX',
            'RCX',
            node.line,
            `DICT_SET [${targetReg} + RBX], RCX`,
            `Store key-value entry in heap dictionary`
          );
        }
        break;
      }

      case 'IndexAccess': {
        this.compileExpressionToReg(node.target, targetReg);
        this.compileExpressionToReg(node.index, 'RBX');
        this.emit(
          'HEAP_LOAD',
          targetReg,
          'RBX',
          targetReg,
          node.line,
          `MOV ${targetReg}, [${targetReg} + RBX*4]`,
          `Read element from heap at offset (index * 4 bytes) into ${targetReg}`
        );
        break;
      }

      case 'BinaryExpression': {
        this.compileExpressionToReg(node.left, targetReg);
        // Preserve intermediate left operand across right-hand evaluation
        this.emit('PUSH', targetReg, undefined, undefined, node.line, `PUSH ${targetReg}`, `Preserve intermediate operand on stack`);
        this.compileExpressionToReg(node.right, 'RBX');
        this.emit('POP', targetReg, undefined, undefined, node.line, `POP ${targetReg}`, `Restore intermediate operand into ${targetReg}`);

        const opMap: Record<string, { op: IROpcode; asm: string; desc: string }> = {
          '+': { op: 'ADD', asm: `ADD ${targetReg}, RBX`, desc: `ALU adds register RBX into ${targetReg}` },
          '-': { op: 'SUB', asm: `SUB ${targetReg}, RBX`, desc: `ALU subtracts register RBX from ${targetReg}` },
          '*': { op: 'MUL', asm: `IMUL ${targetReg}, RBX`, desc: `ALU multiplies ${targetReg} by RBX` },
          '/': { op: 'DIV', asm: `IDIV ${targetReg}, RBX`, desc: `ALU integer division: ${targetReg} / RBX` },
          '//': { op: 'DIV', asm: `IDIV ${targetReg}, RBX`, desc: `ALU integer floor division: ${targetReg} // RBX` },
          '%': { op: 'MOD', asm: `MOD ${targetReg}, RBX`, desc: `ALU modulo remainder: ${targetReg} % RBX` },
          '==': { op: 'CMP_EQ', asm: `CMP ${targetReg}, RBX (SETE)`, desc: 'ALU sets ZF flag if equal' },
          '!=': { op: 'CMP_NE', asm: `CMP ${targetReg}, RBX (SETNE)`, desc: 'ALU sets flag if not equal' },
          '<': { op: 'CMP_LT', asm: `CMP ${targetReg}, RBX (SETL)`, desc: 'ALU comparison: less than' },
          '>': { op: 'CMP_GT', asm: `CMP ${targetReg}, RBX (SETG)`, desc: 'ALU comparison: greater than' },
          '<=': { op: 'CMP_LE', asm: `CMP ${targetReg}, RBX (SETLE)`, desc: 'ALU comparison: less or equal' },
          '>=': { op: 'CMP_GE', asm: `CMP ${targetReg}, RBX (SETGE)`, desc: 'ALU comparison: greater or equal' },
          'and': { op: 'CMP_NE', asm: `AND ${targetReg}, RBX`, desc: 'Logical AND' },
          'or': { op: 'CMP_NE', asm: `OR ${targetReg}, RBX`, desc: 'Logical OR' },
        };

        const mapped = opMap[node.operator] || {
          op: 'ADD',
          asm: `ADD ${targetReg}, RBX`,
          desc: `Execute ${node.operator}`,
        };

        this.emit(mapped.op, targetReg, 'RBX', targetReg, node.line, mapped.asm, mapped.desc);
        break;
      }

      case 'FunctionCall': {
        if (node.callee.type === 'MemberAccess') {
          // Method call: e.g. arr.append(val) or obj.method(...)
          const obj = node.callee.object;
          const method = node.callee.property;
          this.compileExpressionToReg(obj, targetReg);
          if (node.arguments.length > 0) {
            this.compileExpressionToReg(node.arguments[0], 'RBX');
          }
          this.emit(
            'CALL_METHOD',
            targetReg,
            method,
            targetReg,
            node.line,
            `CALL [${targetReg}].${method}`,
            `Invoke method '${method}' on object instance/array in ${targetReg}`
          );
          break;
        }

        const fnName = node.callee.name || 'unknown_fn';
        const classDecl = this.classDeclarations[fnName];
        if (classDecl) {
          // Object-oriented class instantiation: obj = ClassName(...)
          this.emit('ALLOC_HEAP', 32, fnName, targetReg, node.line, `ALLOC [Heap], 32B -> ${targetReg}`, `Allocate new object instance of class '${fnName}' on Heap`);
          // Find __init__ method if defined
          const initMethod = classDecl.body.find((m: ASTNode) => m.type === 'FunctionDeclaration' && (m.name === '__init__' || m.name === `${fnName}.__init__`));
          if (initMethod) {
            const params = (initMethod.params || []).filter((p: string) => p !== 'self');
            const boundProps = new Set<string>();
            for (let i = 0; i < params.length && i < node.arguments.length; i++) {
              this.compileExpressionToReg(node.arguments[i], 'RBX');
              this.emit('MEMBER_STORE', targetReg, params[i], 'RBX', node.line, `MOV [${targetReg}.${params[i]}], RBX`, `Initialize attribute '${params[i]}' of instance in ${targetReg}`);
              boundProps.add(params[i]);
            }
            for (const stmt of initMethod.body) {
              if (stmt.type === 'Assignment' && stmt.target?.type === 'MemberAccess') {
                const prop = stmt.target.property;
                if (!boundProps.has(prop)) {
                  this.compileExpressionToReg(stmt.value, 'RBX');
                  this.emit('MEMBER_STORE', targetReg, prop, 'RBX', stmt.line, `MOV [${targetReg}.${prop}], RBX`, `Initialize member '${prop}'`);
                }
              }
            }
          }
          break;
        }

        for (let i = node.arguments.length - 1; i >= 0; i--) {
          this.compileExpressionToReg(node.arguments[i], 'RAX');
          this.emit('PUSH', 'RAX', undefined, undefined, node.line, 'PUSH RAX', `Push argument #${i + 1} onto call stack`);
        }

        this.emit(
          'CALL',
          fnName,
          node.arguments.length,
          undefined,
          node.line,
          `CALL ${fnName}`,
          `Call function '${fnName}': Pushes return address and branches to function header`
        );
        if (targetReg !== 'RAX') {
          this.emit('LOAD_VAR', 'RAX', undefined, targetReg, node.line, `MOV ${targetReg}, RAX`, `Copy return value to ${targetReg}`);
        }
        break;
      }

      default:
        break;
    }
  }
}

import { tokenize } from './tokenizer';
import { Parser } from './parser';
import { Compiler } from './compiler';
import { MemoryManager } from './memory';
import { CacheSimulator } from './cache';
import { StackManager } from './stack';
import { HeapManager } from './heap';
import { generateExplanation } from './explanations';
import {
  Token,
  ASTNode,
  IRInstruction,
  ExecutionSnapshot,
  CpuState,
  RegisterBank,
  ExecutionEvent,
  ExecutionMetrics,
} from './types';

export interface SimulationResult {
  tokens: Token[];
  ast: ASTNode | null;
  instructions: IRInstruction[];
  snapshots: ExecutionSnapshot[];
  metrics: ExecutionMetrics;
  error?: {
    line: number;
    col: number;
    message: string;
    suggestion: string;
  };
}

export class SimulationRuntime {
  public static execute(sourceCode: string): SimulationResult {
    // 1. Lexical Analysis
    const tokens = tokenize(sourceCode);

    // 2. Syntax Analysis (AST)
    const parser = new Parser(tokens);
    const parseResult = parser.parse();

    if (parseResult.error || !parseResult.ast) {
      return {
        tokens,
        ast: null,
        instructions: [],
        snapshots: [],
        metrics: {
          instructionsExecuted: 0,
          memoryUsedBytes: 0,
          stackDepth: 0,
          heapAllocations: 0,
          cacheHits: 0,
          cacheMisses: 0,
          cpuCycles: 0,
          functionsCalled: 0,
        },
        error: parseResult.error,
      };
    }

    const ast = parseResult.ast;

    // 3. Intermediate Representation Compilation
    const compiler = new Compiler();
    const instructions = compiler.compile(ast);

    // 4. Hardware Simulation Execution
    const memoryManager = new MemoryManager();
    const cacheSimulator = new CacheSimulator();
    const stackManager = new StackManager();
    const heapManager = new HeapManager();

    const registers: RegisterBank = {
      RAX: 0,
      RBX: 0,
      RCX: 0,
      RDX: 0,
      RSI: 0,
      RDI: 0,
      R8: 0,
      R9: 0,
      RSP: '0x7FFFFFF0',
      RBP: '0x7FFFFFF0',
      RIP: '0x00400000',
      FLAGS: { ZF: false, SF: false, OF: false },
    };

    const stdout: string[] = [];
    const snapshots: ExecutionSnapshot[] = [];
    const dataStack: any[] = [];
    let stepCount = 0;
    let functionsCalled = 0;

    // Initial snapshot: State 0 before execution
    const initEvent: ExecutionEvent = {
      id: 'evt_0',
      step: 0,
      timestamp: new Date().toLocaleTimeString(),
      subsystem: 'COMPILER',
      message: 'Source code parsed and compiled. CPU reset vector loaded.',
      whyExplanation: 'The computer has compiled code into intermediate instructions and loaded registers with initial defaults.',
    };

    snapshots.push({
      step: 0,
      line: 1,
      instruction: instructions[0],
      cpu: {
        registers: { ...registers, FLAGS: { ...registers.FLAGS } },
        activeCycleStage: 'FETCH',
        currentInstruction: instructions[0],
        alu: { active: false },
        controlUnit: { state: 'IDLE', signals: ['RESET_HIGH'] },
      },
      memory: memoryManager.cloneBlocks(),
      cache: cacheSimulator.getState(),
      stack: stackManager.getFrames(),
      heap: heapManager.getObjects(),
      stdout: [],
      lastEvent: initEvent,
      explanation: generateExplanation(undefined, {}),
    });

    let ip = 0; // instruction pointer index
    const maxSteps = 1000; // Safeguard against infinite loops

    while (ip >= 0 && ip < instructions.length && stepCount < maxSteps) {
      const inst = instructions[ip];
      stepCount++;
      ip++; // advance instruction pointer by default

      registers.RIP = `0x0040${(inst.index * 4).toString(16).padStart(4, '0')}`;
      let cycleStage: 'FETCH' | 'DECODE' | 'EXECUTE' | 'MEMORY' | 'WRITE_BACK' = 'EXECUTE';
      let aluActive = false;
      let aluOp = '';
      let aluOp1: any = undefined;
      let aluOp2: any = undefined;
      let aluResult: any = undefined;
      let busActivity: ExecutionSnapshot['busActivity'] = undefined;
      let eventMsg = '';
      let subsystem: ExecutionEvent['subsystem'] = 'CPU';

      switch (inst.opcode) {
        case 'LOAD_CONST': {
          const val = inst.op1;
          const destReg = (inst.dest || 'RAX') as 'RAX' | 'RBX' | 'RCX' | 'RDX';
          registers[destReg] = typeof val === 'string' && val.startsWith('"') ? val.slice(1, -1) : val ?? 0;
          cycleStage = 'WRITE_BACK';
          eventMsg = `Loaded immediate constant ${inst.op1} into register ${destReg}`;
          subsystem = 'CPU';
          busActivity = {
            from: 'CPU',
            to: 'REGISTERS',
            data: val,
            label: `${destReg} ← ${val}`,
            active: true,
          };
          break;
        }

        case 'LOAD_VAR': {
          const varName = String(inst.op1);
          const destReg = (inst.dest || 'RAX') as 'RAX' | 'RBX' | 'RCX' | 'RDX';
          let val: any;
          if (['RAX', 'RBX', 'RCX', 'RDX'].includes(varName)) {
            val = registers[varName as 'RAX' | 'RBX' | 'RCX' | 'RDX'];
          } else {
            const valFromStack = stackManager.getVariable(varName);
            const valFromMem = memoryManager.getVariableValue(varName);
            val = valFromStack !== undefined ? valFromStack : valFromMem !== undefined ? valFromMem : 0;
          }
          
          registers[destReg] = val;
          const addr = memoryManager.getVariableAddress(varName) || '0x00001000';
          cacheSimulator.access(addr, val);
          cycleStage = 'MEMORY';
          eventMsg = `Read variable '${varName}' (${val}) from memory/cache into ${destReg}`;
          subsystem = 'MEMORY';
          busActivity = {
            from: 'CACHE',
            to: 'REGISTERS',
            data: val,
            label: `${destReg} ← [${varName}]`,
            active: true,
          };
          break;
        }

        case 'STORE_VAR': {
          const srcReg = (inst.op1 || 'RAX') as 'RAX' | 'RBX' | 'RCX' | 'RDX';
          const varName = String(inst.dest);
          const val = registers[srcReg];

          const block = memoryManager.allocateVariable(varName, val, stepCount);
          stackManager.setLocal(varName, val, block.type);
          cacheSimulator.access(block.addressHex, val);

          cycleStage = 'MEMORY';
          eventMsg = `Stored register ${srcReg} (${val}) into variable '${varName}' at ${block.addressHex}`;
          subsystem = 'MEMORY';
          busActivity = {
            from: 'REGISTERS',
            to: 'RAM',
            data: val,
            label: `[${varName}] ← ${srcReg}`,
            active: true,
          };
          break;
        }

        case 'ADD':
        case 'SUB':
        case 'MUL':
        case 'DIV':
        case 'MOD': {
          const destReg = (inst.dest || 'RAX') as 'RAX' | 'RBX' | 'RCX' | 'RDX';
          const val1 = Number(registers[destReg]) || 0;
          let val2 = 0;

          if (typeof inst.op2 === 'string' && ['RAX', 'RBX', 'RCX', 'RDX'].includes(inst.op2)) {
            val2 = Number(registers[inst.op2 as 'RAX' | 'RBX' | 'RCX' | 'RDX']) || 0;
          } else {
            val2 = Number(inst.op2) || 0;
          }

          let res = 0;
          if (inst.opcode === 'ADD') res = val1 + val2;
          else if (inst.opcode === 'SUB') res = val1 - val2;
          else if (inst.opcode === 'MUL') res = val1 * val2;
          else if (inst.opcode === 'DIV') res = val2 !== 0 ? Math.floor(val1 / val2) : 0;
          else if (inst.opcode === 'MOD') res = val2 !== 0 ? val1 % val2 : 0;

          registers[destReg] = res;
          registers.FLAGS.ZF = res === 0;
          registers.FLAGS.SF = res < 0;

          aluActive = true;
          aluOp = inst.opcode;
          aluOp1 = val1;
          aluOp2 = val2;
          aluResult = res;
          cycleStage = 'EXECUTE';
          eventMsg = `ALU: ${val1} ${inst.opcode} ${val2} = ${res} (Stored in ${destReg})`;
          subsystem = 'CPU';
          busActivity = {
            from: 'ALU',
            to: 'REGISTERS',
            data: res,
            label: `${destReg} ← ALU Result (${res})`,
            active: true,
          };
          break;
        }

        case 'CMP_EQ':
        case 'CMP_NE':
        case 'CMP_LT':
        case 'CMP_GT':
        case 'CMP_LE':
        case 'CMP_GE': {
          const regVal = typeof inst.op1 === 'string' && ['RAX', 'RBX', 'RCX', 'RDX'].includes(inst.op1)
            ? registers[inst.op1 as 'RAX' | 'RBX' | 'RCX' | 'RDX']
            : inst.op1;
          const cmpVal = typeof inst.op2 === 'string' && ['RAX', 'RBX', 'RCX', 'RDX'].includes(inst.op2)
            ? registers[inst.op2 as 'RAX' | 'RBX' | 'RCX' | 'RDX']
            : inst.op2;

          let isTrue = false;
          if (inst.opcode === 'CMP_EQ') isTrue = regVal == cmpVal;
          else if (inst.opcode === 'CMP_NE') isTrue = regVal != cmpVal;
          else if (inst.opcode === 'CMP_LT') isTrue = Number(regVal) < Number(cmpVal);
          else if (inst.opcode === 'CMP_GT') isTrue = Number(regVal) > Number(cmpVal);
          else if (inst.opcode === 'CMP_LE') isTrue = Number(regVal) <= Number(cmpVal);
          else if (inst.opcode === 'CMP_GE') isTrue = Number(regVal) >= Number(cmpVal);

          registers.FLAGS.ZF = !isTrue; // In our bytecode, ZF is set when condition is false so JZ jumps
          registers.RAX = isTrue ? 1 : 0;

          aluActive = true;
          aluOp = inst.opcode;
          aluOp1 = regVal;
          aluOp2 = cmpVal;
          aluResult = isTrue ? 'TRUE (1)' : 'FALSE (0)';
          cycleStage = 'EXECUTE';
          eventMsg = `ALU Comparison: ${regVal} ${inst.opcode} ${cmpVal} => ${aluResult}`;
          subsystem = 'CPU';
          break;
        }

        case 'JUMP_IF_FALSE': {
          const targetIndex = Number(inst.op1);
          // If ZF is true (condition was false) or RAX is falsy / 0, jump
          if (registers.FLAGS.ZF || registers.RAX === 0 || !registers.RAX) {
            ip = targetIndex;
            eventMsg = `Condition False: Branch taken -> Jumped to instruction #${targetIndex}`;
          } else {
            eventMsg = `Condition True: Fall through to next instruction`;
          }
          cycleStage = 'EXECUTE';
          subsystem = 'CPU';
          break;
        }

        case 'JUMP': {
          const targetIndex = Number(inst.op1);
          ip = targetIndex;
          eventMsg = `Unconditional Jump -> instruction #${targetIndex}`;
          cycleStage = 'EXECUTE';
          subsystem = 'CPU';
          break;
        }

        case 'ALLOC_HEAP': {
          const size = Number(inst.op1) || 32;
          const type = String(inst.op2 || 'object');
          const destReg = (inst.dest || 'RAX') as 'RAX' | 'RBX' | 'RCX' | 'RDX';
          const heapObj = heapManager.allocate(type, {}, size, stepCount);
          registers[destReg] = heapObj.addressHex;
          cycleStage = 'MEMORY';
          eventMsg = `Allocated ${size}B on Heap at address ${heapObj.addressHex}`;
          subsystem = 'HEAP';
          busActivity = {
            from: 'CPU',
            to: 'HEAP',
            data: heapObj.addressHex,
            label: `Heap Alloc ${heapObj.addressHex}`,
            active: true,
          };
          break;
        }

        case 'HEAP_STORE': {
          const op1Str = String(inst.op1);
          const indexOrField = String(inst.op2);
          const srcReg = (inst.dest || 'RAX') as 'RAX' | 'RBX' | 'RCX' | 'RDX';
          const val = registers[srcReg];

          let addr = op1Str;
          if (['RAX', 'RBX', 'RCX', 'RDX'].includes(op1Str)) {
            addr = String(registers[op1Str as 'RAX' | 'RBX' | 'RCX' | 'RDX']);
          } else if (!addr.startsWith('0x')) {
            const varVal = stackManager.getVariable(op1Str) || memoryManager.getVariableValue(op1Str);
            if (typeof varVal === 'string' && varVal.startsWith('0x')) {
              addr = varVal;
            }
          }

          let index = indexOrField;
          if (['RAX', 'RBX', 'RCX', 'RDX'].includes(indexOrField)) {
            index = String(registers[indexOrField as 'RAX' | 'RBX' | 'RCX' | 'RDX']);
          }

          heapManager.updateField(addr, index, val);
          eventMsg = `Updated heap object at ${addr} [${index}] = ${val}`;
          subsystem = 'HEAP';
          break;
        }

        case 'HEAP_LOAD': {
          const destReg = (inst.dest || 'RAX') as 'RAX' | 'RBX' | 'RCX' | 'RDX';
          const op1Str = String(inst.op1 || 'RAX');
          const indexStr = String(inst.op2 || 'RBX');

          let addr = op1Str;
          if (['RAX', 'RBX', 'RCX', 'RDX'].includes(op1Str)) {
            addr = String(registers[op1Str as 'RAX' | 'RBX' | 'RCX' | 'RDX']);
          } else if (!addr.startsWith('0x')) {
            const varVal = stackManager.getVariable(op1Str) || memoryManager.getVariableValue(op1Str);
            if (typeof varVal === 'string' && varVal.startsWith('0x')) {
              addr = varVal;
            }
          }

          let index = indexStr;
          if (['RAX', 'RBX', 'RCX', 'RDX'].includes(indexStr)) {
            index = String(registers[indexStr as 'RAX' | 'RBX' | 'RCX' | 'RDX']);
          }

          const heapObj = heapManager.getObject(addr);
          const val = heapObj && heapObj.fields[index] !== undefined ? heapObj.fields[index] : 0;
          registers[destReg] = val;
          eventMsg = `Loaded element from heap ${addr}[${index}] (${val}) into ${destReg}`;
          subsystem = 'HEAP';
          break;
        }

        case 'MEMBER_STORE': {
          const baseReg = String(inst.op1 || 'RBX') as 'RAX' | 'RBX' | 'RCX' | 'RDX';
          const propName = String(inst.op2);
          const srcReg = (inst.dest || 'RAX') as 'RAX' | 'RBX' | 'RCX' | 'RDX';
          const val = registers[srcReg];
          const addr = String(registers[baseReg]);

          heapManager.updateField(addr, propName, val);
          eventMsg = `Updated member ${addr}.${propName} = ${val}`;
          subsystem = 'HEAP';
          break;
        }

        case 'MEMBER_LOAD': {
          const baseReg = String(inst.op1 || 'RAX') as 'RAX' | 'RBX' | 'RCX' | 'RDX';
          const propName = String(inst.op2);
          const destReg = (inst.dest || 'RAX') as 'RAX' | 'RBX' | 'RCX' | 'RDX';
          const addr = String(registers[baseReg]);

          const heapObj = heapManager.getObject(addr);
          const val = heapObj && heapObj.fields[propName] !== undefined ? heapObj.fields[propName] : 0;
          registers[destReg] = val;
          eventMsg = `Loaded member ${addr}.${propName} (${val}) into ${destReg}`;
          subsystem = 'HEAP';
          break;
        }

        case 'CALL_METHOD': {
          const targetReg = (inst.dest || 'RAX') as 'RAX' | 'RBX' | 'RCX' | 'RDX';
          const addr = String(registers[inst.op1 as 'RAX' | 'RBX' | 'RCX' | 'RDX']);
          const method = String(inst.op2);
          const heapObj = heapManager.getObject(addr);

          if (heapObj) {
            if (method === 'append') {
              const keys = Object.keys(heapObj.fields).map(Number).filter((n) => !isNaN(n));
              const nextIdx = keys.length > 0 ? Math.max(...keys) + 1 : 0;
              const valToAppend = registers.RBX;
              heapManager.updateField(addr, String(nextIdx), valToAppend);
              eventMsg = `List.append(): Pushed ${valToAppend} to heap array at [${nextIdx}]`;
            } else if (method === 'pop') {
              const keys = Object.keys(heapObj.fields).map(Number).filter((n) => !isNaN(n));
              if (keys.length > 0) {
                const maxKey = Math.max(...keys);
                const poppedVal = heapObj.fields[String(maxKey)];
                delete heapObj.fields[String(maxKey)];
                registers[targetReg] = poppedVal;
                eventMsg = `List.pop(): Removed element ${poppedVal} from heap array`;
              }
            }
          }
          subsystem = 'HEAP';
          break;
        }

        case 'PUSH': {
          const src = inst.op1;
          const val = typeof src === 'string' && ['RAX', 'RBX', 'RCX', 'RDX', 'RBP'].includes(src)
            ? registers[src as 'RAX' | 'RBX' | 'RCX' | 'RDX' | 'RBP']
            : src;
          dataStack.push(val);
          // Decrement RSP
          const currentRsp = parseInt(registers.RSP, 16);
          registers.RSP = `0x${(currentRsp - 4).toString(16).toUpperCase()}`;
          eventMsg = `Pushed ${val} onto Call Stack (RSP: ${registers.RSP})`;
          subsystem = 'STACK';
          busActivity = {
            from: 'REGISTERS',
            to: 'STACK',
            data: val,
            label: `Stack Push (${val})`,
            active: true,
          };
          break;
        }

        case 'POP': {
          const dest = inst.op1 as 'RAX' | 'RBX' | 'RCX' | 'RDX' | 'RBP';
          const currentRsp = parseInt(registers.RSP, 16);
          registers.RSP = `0x${(currentRsp + 4).toString(16).toUpperCase()}`;
          const poppedVal = dataStack.length > 0 ? dataStack.pop() : 0;
          if (dest && ['RAX', 'RBX', 'RCX', 'RDX', 'RBP'].includes(dest)) {
            registers[dest] = poppedVal;
          }
          eventMsg = `Popped value (${poppedVal}) from stack into ${dest}`;
          subsystem = 'STACK';
          break;
        }

        case 'CALL': {
          const fnName = String(inst.op1);
          functionsCalled++;

          // Built-in functions execution
          if (fnName === 'len') {
            const arg = registers.RAX;
            if (typeof arg === 'string' && arg.startsWith('0x')) {
              const heapObj = heapManager.getObject(arg);
              registers.RAX = heapObj ? Object.keys(heapObj.fields).length : 0;
            } else if (typeof arg === 'string') {
              registers.RAX = arg.length;
            } else {
              registers.RAX = 1;
            }
            eventMsg = `Built-in len() returned ${registers.RAX}`;
            subsystem = 'CPU';
            break;
          } else if (fnName === 'sum') {
            const addr = String(registers.RAX);
            const heapObj = heapManager.getObject(addr);
            if (heapObj) {
              const total = Object.values(heapObj.fields).reduce((acc: number, v: any) => acc + (Number(v) || 0), 0);
              registers.RAX = total;
            } else {
              registers.RAX = 0;
            }
            eventMsg = `Built-in sum() returned ${registers.RAX}`;
            subsystem = 'CPU';
            break;
          } else if (fnName === 'min' || fnName === 'max') {
            const val1 = Number(registers.RAX) || 0;
            const val2 = Number(registers.RBX) || 0;
            registers.RAX = fnName === 'min' ? Math.min(val1, val2) : Math.max(val1, val2);
            eventMsg = `Built-in ${fnName}() returned ${registers.RAX}`;
            subsystem = 'CPU';
            break;
          } else if (fnName === 'abs') {
            registers.RAX = Math.abs(Number(registers.RAX) || 0);
            eventMsg = `Built-in abs() returned ${registers.RAX}`;
            subsystem = 'CPU';
            break;
          }

          // User defined or recursive function
          const returnAddress = ip;
          stackManager.pushFrame(fnName, String(returnAddress), registers.RBP);
          const currentFrame = stackManager.getCurrentFrame();
          registers.RBP = currentFrame.framePointer;

          // Branch to function code
          if (typeof inst.op2 === 'number') {
            ip = inst.op2;
          }

          eventMsg = `Call ${fnName}(): Created new Stack Frame [${currentFrame.framePointer}]`;
          subsystem = 'STACK';
          break;
        }

        case 'RET': {
          const popped = stackManager.popFrame();
          const currentFrame = stackManager.getCurrentFrame();
          registers.RBP = currentFrame.framePointer;
          registers.RSP = currentFrame.stackPointer;

          if (popped && !isNaN(Number(popped.returnAddress))) {
            ip = Number(popped.returnAddress);
          }

          eventMsg = `Return: Deallocated stack frame for ${popped?.functionName || 'function'}`;
          subsystem = 'STACK';
          break;
        }

        case 'PRINT': {
          const srcReg = (inst.op1 || 'RAX') as 'RAX' | 'RBX' | 'RCX' | 'RDX';
          const printVal = String(registers[srcReg]);
          stdout.push(printVal);
          eventMsg = `Output: ${printVal}`;
          subsystem = 'OUTPUT';
          break;
        }

        case 'HALT': {
          eventMsg = 'Program execution halted (HLT).';
          subsystem = 'CPU';
          cycleStage = 'WRITE_BACK';
          break;
        }
      }

      const event: ExecutionEvent = {
        id: `evt_${stepCount}`,
        step: stepCount,
        timestamp: new Date().toLocaleTimeString(),
        subsystem,
        message: eventMsg,
        whyExplanation: inst.explanation,
      };

      snapshots.push({
        step: stepCount,
        line: inst.line,
        instruction: inst,
        cpu: {
          registers: { ...registers, FLAGS: { ...registers.FLAGS } },
          activeCycleStage: cycleStage,
          currentInstruction: inst,
          alu: {
            operation: aluOp,
            operand1: aluOp1,
            operand2: aluOp2,
            result: aluResult,
            active: aluActive,
          },
          controlUnit: {
            state: inst.opcode,
            signals: [`OP_${inst.opcode}`, `CYCLE_${cycleStage}`],
          },
        },
        memory: memoryManager.cloneBlocks(),
        cache: cacheSimulator.getState(),
        stack: stackManager.getFrames(),
        heap: heapManager.getObjects(),
        stdout: [...stdout],
        lastEvent: event,
        explanation: generateExplanation(inst, {
          targetVar: inst.dest,
          value: registers.RAX,
          reg: 'RAX',
        }),
        busActivity,
      });

      if (inst.opcode === 'HALT') break;
    }

    const finalCacheState = cacheSimulator.getState();
    const finalMemoryBlocks = memoryManager.getAllBlocks();

    return {
      tokens,
      ast,
      instructions,
      snapshots,
      metrics: {
        instructionsExecuted: stepCount,
        memoryUsedBytes: finalMemoryBlocks.length * 4,
        stackDepth: stackManager.getFrames().length,
        heapAllocations: heapManager.getObjects().length,
        cacheHits: finalCacheState.totalHits,
        cacheMisses: finalCacheState.totalMisses,
        cpuCycles: stepCount * 3, // average ~3 cycles per instruction
        functionsCalled,
      },
    };
  }
}

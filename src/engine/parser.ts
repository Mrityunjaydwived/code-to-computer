import { Token, ASTNode } from './types';

export interface ParseResult {
  ast: ASTNode | null;
  error?: {
    line: number;
    col: number;
    message: string;
    suggestion: string;
  };
}

export class Parser {
  private tokens: Token[];
  private current = 0;
  private nodeIdCounter = 0;

  constructor(tokens: Token[]) {
    // Filter out comments for syntactic parsing
    this.tokens = tokens.filter(t => t.type !== 'COMMENT');
  }

  private nextId(prefix: string): string {
    return `${prefix}_${++this.nodeIdCounter}`;
  }

  private peek(): Token {
    return this.tokens[this.current] || {
      type: 'EOF',
      value: '<EOF>',
      line: -1,
      col: -1,
      description: '',
      category: 'separator',
    };
  }

  private isAtEnd(): boolean {
    return this.peek().type === 'EOF';
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.tokens[this.current - 1];
  }

  private match(...values: string[]): boolean {
    for (const val of values) {
      if (this.check(val)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(value: string): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().value === value;
  }

  private checkType(type: string): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private skipNewlines(): void {
    while (!this.isAtEnd() && this.peek().value === '\\n') {
      this.advance();
    }
  }

  public parse(): ParseResult {
    try {
      this.skipNewlines();
      const statements: ASTNode[] = [];

      while (!this.isAtEnd()) {
        const stmt = this.parseStatement();
        if (stmt) statements.push(stmt);
        this.skipNewlines();
      }

      const rootAst: ASTNode = {
        type: 'Program',
        id: this.nextId('prog'),
        line: 1,
        col: 1,
        description: `Root Program with ${statements.length} top-level statements`,
        body: statements,
      };

      return { ast: rootAst };
    } catch (err: any) {
      return {
        ast: null,
        error: {
          line: err.line || this.peek().line || 1,
          col: err.col || this.peek().col || 1,
          message: err.message || 'Syntax Error during AST construction',
          suggestion: err.suggestion || 'Check syntax, colons, indentation, and matching parentheses.',
        },
      };
    }
  }

  private parseStatement(): ASTNode {
    const token = this.peek();

    if (token.value === 'def') {
      return this.parseFunctionDeclaration();
    }
    if (token.value === 'class') {
      return this.parseClassDeclaration();
    }
    if (token.value === 'return') {
      return this.parseReturnStatement();
    }
    if (token.value === 'if') {
      return this.parseIfStatement();
    }
    if (token.value === 'while') {
      return this.parseWhileStatement();
    }
    if (token.value === 'for') {
      return this.parseForStatement();
    }
    if (token.value === 'break') {
      const brk = this.advance();
      return {
        type: 'BreakStatement',
        id: this.nextId('brk'),
        line: brk.line,
        col: brk.col,
        description: 'Break: Terminate innermost loop',
      };
    }
    if (token.value === 'continue') {
      const cnt = this.advance();
      return {
        type: 'ContinueStatement',
        id: this.nextId('cont'),
        line: cnt.line,
        col: cnt.col,
        description: 'Continue: Jump to next iteration of loop',
      };
    }
    if (token.value === 'pass') {
      const p = this.advance();
      return {
        type: 'Literal',
        id: this.nextId('pass'),
        line: p.line,
        col: p.col,
        value: null,
        description: 'Pass statement (no-op)',
      };
    }
    if (token.value === 'import' || token.value === 'from') {
      const start = this.advance();
      while (!this.isAtEnd() && this.peek().value !== '\\n') {
        this.advance();
      }
      return {
        type: 'Literal',
        id: this.nextId('import'),
        line: start.line,
        col: start.col,
        value: null,
        description: 'Module import statement',
      };
    }
    if (token.value === 'print') {
      return this.parsePrintStatement();
    }

    // Assignment or standalone expression
    return this.parseAssignmentOrExpression();
  }

  private parseFunctionDeclaration(): ASTNode {
    const defToken = this.advance(); // consume 'def'
    const nameToken = this.advance();
    if (nameToken.type !== 'IDENTIFIER') {
      throw {
        line: nameToken.line,
        col: nameToken.col,
        message: `Expected function name after 'def', found '${nameToken.value}'`,
        suggestion: 'Provide a valid identifier for the function name (e.g. def calculate(a, b):)',
      };
    }

    if (!this.match('(')) {
      throw {
        line: this.peek().line,
        col: this.peek().col,
        message: "Expected '(' after function name",
        suggestion: 'Add opening parenthesis for parameter list',
      };
    }

    const params: string[] = [];
    if (!this.check(')')) {
      do {
        const param = this.advance();
        if (param.type !== 'IDENTIFIER' && param.value !== 'self') {
          throw {
            line: param.line,
            col: param.col,
            message: `Invalid parameter name '${param.value}'`,
            suggestion: 'Use identifiers for function parameters',
          };
        }
        params.push(param.value);
      } while (this.match(','));
    }

    if (!this.match(')')) {
      throw {
        line: this.peek().line,
        col: this.peek().col,
        message: "Expected ')' after parameter list",
        suggestion: 'Close parameter list with right parenthesis',
      };
    }

    if (!this.match(':')) {
      throw {
        line: this.peek().line,
        col: this.peek().col,
        message: "Expected ':' at end of function header",
        suggestion: "Add a colon ':' at the end of the def statement",
      };
    }

    this.skipNewlines();
    const body = this.parseBlock(defToken.col);

    return {
      type: 'FunctionDeclaration',
      id: this.nextId('fn'),
      line: defToken.line,
      col: defToken.col,
      name: nameToken.value,
      params,
      body,
      description: `Function '${nameToken.value}' defined with ${params.length} parameters (${params.join(', ')})`,
    };
  }

  private parseClassDeclaration(): ASTNode {
    const classToken = this.advance(); // consume 'class'
    const nameToken = this.advance();
    if (nameToken.type !== 'IDENTIFIER') {
      throw {
        line: nameToken.line,
        col: nameToken.col,
        message: `Expected class name after 'class', found '${nameToken.value}'`,
        suggestion: 'Provide a valid class name (e.g. class Student:)',
      };
    }

    if (!this.match(':')) {
      throw {
        line: this.peek().line,
        col: this.peek().col,
        message: "Expected ':' after class declaration",
        suggestion: "Add colon ':' after class name",
      };
    }

    this.skipNewlines();
    const body = this.parseBlock(classToken.col);

    return {
      type: 'ClassDeclaration',
      id: this.nextId('class'),
      line: classToken.line,
      col: classToken.col,
      name: nameToken.value,
      body,
      description: `Class blueprint '${nameToken.value}' for heap allocation`,
    };
  }

  private parseReturnStatement(): ASTNode {
    const retToken = this.advance(); // consume 'return'
    let argument: ASTNode | null = null;
    if (!this.check('\\n') && !this.isAtEnd()) {
      argument = this.parseExpression();
    }

    return {
      type: 'ReturnStatement',
      id: this.nextId('ret'),
      line: retToken.line,
      col: retToken.col,
      argument,
      description: argument 
        ? `Return statement: Passes result back into RAX register and tears down stack frame` 
        : 'Return statement: Exits function with void return',
    };
  }

  private parseIfStatement(): ASTNode {
    const ifToken = this.advance(); // consume 'if'
    const condition = this.parseExpression();

    if (!this.match(':')) {
      throw {
        line: this.peek().line,
        col: this.peek().col,
        message: "Expected ':' after if condition",
        suggestion: "Add a colon ':' at the end of the if statement",
      };
    }

    this.skipNewlines();
    const consequent = this.parseBlock(ifToken.col);
    let alternate: ASTNode[] | null = null;

    this.skipNewlines();
    if (this.check('elif')) {
      alternate = [this.parseElifStatement()];
    } else if (this.match('else')) {
      if (!this.match(':')) {
        throw {
          line: this.peek().line,
          col: this.peek().col,
          message: "Expected ':' after else",
          suggestion: "Add a colon ':' after else keyword",
        };
      }
      this.skipNewlines();
      alternate = this.parseBlock(ifToken.col);
    }

    return {
      type: 'IfStatement',
      id: this.nextId('if'),
      line: ifToken.line,
      col: ifToken.col,
      condition,
      consequent,
      alternate,
      description: `Branch instruction: Evaluates condition into CPU FLAGS and branches based on Zero Flag (ZF)`,
    };
  }

  private parseElifStatement(): ASTNode {
    const elifToken = this.advance(); // consume 'elif'
    const condition = this.parseExpression();

    if (!this.match(':')) {
      throw {
        line: this.peek().line,
        col: this.peek().col,
        message: "Expected ':' after elif condition",
        suggestion: "Add a colon ':' at the end of the elif statement",
      };
    }

    this.skipNewlines();
    const consequent = this.parseBlock(elifToken.col);
    let alternate: ASTNode[] | null = null;

    this.skipNewlines();
    if (this.check('elif')) {
      alternate = [this.parseElifStatement()];
    } else if (this.match('else')) {
      if (!this.match(':')) {
        throw {
          line: this.peek().line,
          col: this.peek().col,
          message: "Expected ':' after else",
          suggestion: "Add a colon ':' after else keyword",
        };
      }
      this.skipNewlines();
      alternate = this.parseBlock(elifToken.col);
    }

    return {
      type: 'IfStatement',
      id: this.nextId('elif'),
      line: elifToken.line,
      col: elifToken.col,
      condition,
      consequent,
      alternate,
      description: `Elif branch: Evaluates condition and branches`,
    };
  }

  private parseWhileStatement(): ASTNode {
    const whileToken = this.advance();
    const condition = this.parseExpression();

    if (!this.match(':')) {
      throw {
        line: this.peek().line,
        col: this.peek().col,
        message: "Expected ':' after while condition",
        suggestion: "Add colon ':' after condition",
      };
    }

    this.skipNewlines();
    const body = this.parseBlock(whileToken.col);

    return {
      type: 'WhileStatement',
      id: this.nextId('while'),
      line: whileToken.line,
      col: whileToken.col,
      condition,
      body,
      description: `While loop: Repeatedly checks ALU condition flags and jumps backward in instruction stream`,
    };
  }

  private parseForStatement(): ASTNode {
    const forToken = this.advance(); // consume 'for'
    const iterVar = this.advance();
    if (iterVar.type !== 'IDENTIFIER') {
      throw {
        line: iterVar.line,
        col: iterVar.col,
        message: "Expected iterator variable in 'for' loop",
        suggestion: 'Specify a loop variable (e.g. for i in range(5):)',
      };
    }

    if (!this.match('in')) {
      throw {
        line: this.peek().line,
        col: this.peek().col,
        message: "Expected 'in' in for loop",
        suggestion: "Use 'in' keyword (e.g. for x in range(3):)",
      };
    }

    let rangeStart = 0;
    let rangeEnd = 0;
    let rangeStep = 1;
    let iterableNode: ASTNode;

    if (this.check('range')) {
      this.advance(); // 'range'
      this.match('(');
      const arg1 = this.parseExpression();
      if (this.match(',')) {
        const arg2 = this.parseExpression();
        rangeStart = (arg1 as any).value ?? 0;
        rangeEnd = (arg2 as any).value ?? 0;
        if (this.match(',')) {
          const arg3 = this.parseExpression();
          rangeStep = (arg3 as any).value ?? 1;
        }
      } else {
        rangeEnd = (arg1 as any).value ?? 0;
      }
      this.match(')');

      iterableNode = {
        type: 'Literal',
        id: this.nextId('range'),
        line: forToken.line,
        col: forToken.col,
        value: { start: rangeStart, end: rangeEnd, step: rangeStep },
        description: `Range iterator: [${rangeStart}..${rangeEnd}] with step ${rangeStep}`,
      };
    } else {
      iterableNode = this.parseExpression();
    }

    if (!this.match(':')) {
      throw {
        line: this.peek().line,
        col: this.peek().col,
        message: "Expected ':' after for statement",
        suggestion: "Add colon ':' at end of for loop header",
      };
    }

    this.skipNewlines();
    const body = this.parseBlock(forToken.col);

    return {
      type: 'ForStatement',
      id: this.nextId('for'),
      line: forToken.line,
      col: forToken.col,
      iterator: iterVar.value,
      iterable: iterableNode,
      body,
      description: `For loop: Iterates '${iterVar.value}' across sequence updating RCX counter register`,
    };
  }

  private parsePrintStatement(): ASTNode {
    const printToken = this.advance(); // consume 'print'
    if (!this.match('(')) {
      throw {
        line: this.peek().line,
        col: this.peek().col,
        message: "Expected '(' after print",
        suggestion: 'Use parentheses for print call: print(...)',
      };
    }

    const args: ASTNode[] = [];
    if (!this.check(')')) {
      do {
        args.push(this.parseExpression());
      } while (this.match(','));
    }

    if (!this.match(')')) {
      throw {
        line: this.peek().line,
        col: this.peek().col,
        message: "Expected ')' after print arguments",
        suggestion: 'Close print call with right parenthesis',
      };
    }

    return {
      type: 'PrintStatement',
      id: this.nextId('print'),
      line: printToken.line,
      col: printToken.col,
      args,
      description: `Print statement: Flushes register/memory values to standard output stream (stdout)`,
    };
  }

  private parseBlock(parentCol: number = 0): ASTNode[] {
    this.skipNewlines();
    if (this.isAtEnd()) return [];

    // The first token establishes the block indentation level
    const blockIndent = this.peek().col;
    if (blockIndent <= parentCol) {
      return [];
    }

    const statements: ASTNode[] = [];
    while (!this.isAtEnd()) {
      this.skipNewlines();
      if (this.isAtEnd()) break;

      const nextToken = this.peek();
      // If token is less indented than this block, exit block
      if (nextToken.col < blockIndent) {
        break;
      }
      // If keyword belongs to parent construct (e.g. else/elif)
      if (nextToken.col <= parentCol && (nextToken.value === 'else' || nextToken.value === 'elif')) {
        break;
      }

      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);

      if (this.check('\\n')) {
        this.advance();
      }
    }
    return statements;
  }

  private parseAssignmentOrExpression(): ASTNode {
    const expr = this.parseExpression();

    // Assignment: identifier = expr or arr[index] = expr or obj.prop = expr
    if (this.match('=')) {
      const value = this.parseExpression();
      if (expr.type === 'Identifier') {
        return {
          type: 'Assignment',
          id: this.nextId('assign'),
          line: expr.line,
          col: expr.col,
          target: expr.name,
          value,
          description: `Assignment: Variable '${expr.name}' allocated/updated with result value`,
        };
      } else if (expr.type === 'IndexAccess') {
        return {
          type: 'Assignment',
          id: this.nextId('index_assign'),
          line: expr.line,
          col: expr.col,
          target: expr,
          value,
          description: `Indexed assignment into heap array memory`,
        };
      } else if (expr.type === 'MemberAccess') {
        return {
          type: 'Assignment',
          id: this.nextId('member_assign'),
          line: expr.line,
          col: expr.col,
          target: expr,
          value,
          description: `Member property assignment '${expr.property}' into object instance`,
        };
      }
    }

    // Compound assignment: +=, -=, *=, /=
    const compoundOps = ['+=', '-=', '*=', '/='];
    for (const op of compoundOps) {
      if (this.match(op)) {
        const value = this.parseExpression();
        const baseOp = op[0];
        const binaryExp: ASTNode = {
          type: 'BinaryExpression',
          id: this.nextId('binop'),
          line: expr.line,
          col: expr.col,
          operator: baseOp,
          left: expr,
          right: value,
          description: `ALU operation '${baseOp}' for compound assignment`,
        };
        return {
          type: 'Assignment',
          id: this.nextId('assign_compound'),
          line: expr.line,
          col: expr.col,
          target: (expr as any).name || 'temp',
          value: binaryExp,
          description: `Compound assignment '${op}' updates variable in memory`,
        };
      }
    }

    return expr;
  }

  private parseExpression(): ASTNode {
    return this.parseLogicalOr();
  }

  private parseLogicalOr(): ASTNode {
    let expr = this.parseLogicalAnd();
    while (this.match('or')) {
      const operator = 'or';
      const right = this.parseLogicalAnd();
      expr = {
        type: 'BinaryExpression',
        id: this.nextId('logic_or'),
        line: expr.line,
        col: expr.col,
        operator,
        left: expr,
        right,
        description: 'Logical OR operation in CPU ALU',
      };
    }
    return expr;
  }

  private parseLogicalAnd(): ASTNode {
    let expr = this.parseEquality();
    while (this.match('and')) {
      const operator = 'and';
      const right = this.parseEquality();
      expr = {
        type: 'BinaryExpression',
        id: this.nextId('logic_and'),
        line: expr.line,
        col: expr.col,
        operator,
        left: expr,
        right,
        description: 'Logical AND operation in CPU ALU',
      };
    }
    return expr;
  }

  private parseEquality(): ASTNode {
    let expr = this.parseComparison();
    while (this.match('==', '!=')) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.parseComparison();
      expr = {
        type: 'BinaryExpression',
        id: this.nextId('equality'),
        line: expr.line,
        col: expr.col,
        operator,
        left: expr,
        right,
        description: `Comparison '${operator}' sets CPU Zero Flag (ZF)`,
      };
    }
    return expr;
  }

  private parseComparison(): ASTNode {
    let expr = this.parseTerm();
    while (this.match('<', '>', '<=', '>=')) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.parseTerm();
      expr = {
        type: 'BinaryExpression',
        id: this.nextId('comp'),
        line: expr.line,
        col: expr.col,
        operator,
        left: expr,
        right,
        description: `Comparison '${operator}' sets CPU Sign Flag (SF) and Zero Flag (ZF)`,
      };
    }
    return expr;
  }

  private parseTerm(): ASTNode {
    let expr = this.parseFactor();
    while (this.match('+', '-')) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.parseFactor();
      expr = {
        type: 'BinaryExpression',
        id: this.nextId('term'),
        line: expr.line,
        col: expr.col,
        operator,
        left: expr,
        right,
        description: `ALU ${operator === '+' ? 'Addition' : 'Subtraction'} operation`,
      };
    }
    return expr;
  }

  private parseFactor(): ASTNode {
    let expr = this.parseUnary();
    while (this.match('*', '/', '//', '%', '**')) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.parseUnary();
      expr = {
        type: 'BinaryExpression',
        id: this.nextId('factor'),
        line: expr.line,
        col: expr.col,
        operator,
        left: expr,
        right,
        description: `ALU ${operator} operation`,
      };
    }
    return expr;
  }

  private parseUnary(): ASTNode {
    if (this.match('-', 'not')) {
      const operator = this.tokens[this.current - 1].value;
      const right = this.parseUnary();
      return {
        type: 'UnaryExpression',
        id: this.nextId('unary'),
        line: right.line,
        col: right.col,
        operator,
        argument: right,
        description: `Unary operation '${operator}' in CPU`,
      };
    }
    return this.parseCallOrMember();
  }

  private parseCallOrMember(): ASTNode {
    let expr = this.parsePrimary();

    while (true) {
      if (this.match('(')) {
        // Function call
        const args: ASTNode[] = [];
        if (!this.check(')')) {
          do {
            args.push(this.parseExpression());
          } while (this.match(','));
        }
        if (!this.match(')')) {
          throw {
            line: this.peek().line,
            col: this.peek().col,
            message: "Expected ')' to close argument list",
            suggestion: 'Add closing parenthesis',
          };
        }

        expr = {
          type: 'FunctionCall',
          id: this.nextId('call'),
          line: expr.line,
          col: expr.col,
          callee: expr,
          arguments: args,
          description: `Call function: Pushes new stack frame with ${args.length} argument(s)`,
        };
      } else if (this.match('[')) {
        // Array indexing
        const indexExpr = this.parseExpression();
        if (!this.match(']')) {
          throw {
            line: this.peek().line,
            col: this.peek().col,
            message: "Expected ']' after array index",
            suggestion: 'Add closing bracket',
          };
        }

        expr = {
          type: 'IndexAccess',
          id: this.nextId('idx'),
          line: expr.line,
          col: expr.col,
          target: expr,
          index: indexExpr,
          description: `Array index offset computation: Base address + (index * 4 bytes)`,
        };
      } else if (this.match('.')) {
        const propToken = this.advance();
        if (propToken.type !== 'IDENTIFIER' && propToken.type !== 'KEYWORD') {
          throw {
            line: propToken.line,
            col: propToken.col,
            message: `Expected property identifier after '.', found '${propToken.value}'`,
            suggestion: 'Use valid identifier for object property access (e.g. node.val, list.append)',
          };
        }
        expr = {
          type: 'MemberAccess',
          id: this.nextId('mem'),
          line: expr.line,
          col: expr.col,
          object: expr,
          property: propToken.value,
          description: `Member property access '${propToken.value}' on object reference`,
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private parsePrimary(): ASTNode {
    const token = this.peek();

    // Number literal
    if (this.matchNumber()) {
      const prev = this.tokens[this.current - 1];
      const val = prev.value.startsWith('0x') ? parseInt(prev.value, 16) : Number(prev.value);
      return {
        type: 'Literal',
        id: this.nextId('num'),
        line: prev.line,
        col: prev.col,
        value: val,
        raw: prev.value,
        dataType: 'int',
        description: `Numeric constant ${val} (loads into CPU register)`,
      };
    }

    // String literal
    if (this.matchString()) {
      const prev = this.tokens[this.current - 1];
      const strVal = prev.value.slice(1, -1);
      return {
        type: 'Literal',
        id: this.nextId('str'),
        line: prev.line,
        col: prev.col,
        value: strVal,
        raw: prev.value,
        dataType: 'string',
        description: `String constant "${strVal}" allocated in heap memory`,
      };
    }

    // Booleans & None
    if (this.match('True', 'False', 'None')) {
      const prev = this.tokens[this.current - 1];
      const val = prev.value === 'True' ? true : prev.value === 'False' ? false : null;
      return {
        type: 'Literal',
        id: this.nextId('lit'),
        line: prev.line,
        col: prev.col,
        value: val,
        raw: prev.value,
        dataType: prev.value === 'None' ? 'pointer' : 'boolean',
        description: `${prev.value} literal`,
      };
    }

    // Array / List literal or List Comprehension: [10, 20] or [0 for _ in range(n)]
    if (this.match('[')) {
      if (this.match(']')) {
        return {
          type: 'ArrayLiteral',
          id: this.nextId('arr'),
          line: token.line,
          col: token.col,
          elements: [],
          description: 'Empty list literal: Allocates contiguous block in Heap',
        };
      }
      const firstExpr = this.parseExpression();
      if (this.match('for')) {
        const iterVar = this.advance();
        this.match('in');
        const iterSrc = this.parseExpression();
        this.match(']');
        return {
          type: 'ListComprehension',
          id: this.nextId('listcomp'),
          line: token.line,
          col: token.col,
          expression: firstExpr,
          iterator: iterVar.value,
          iterable: iterSrc,
          description: 'List comprehension: Dynamically allocates and populates heap array',
        };
      }
      const elements: ASTNode[] = [firstExpr];
      while (this.match(',')) {
        if (this.check(']')) break;
        elements.push(this.parseExpression());
      }
      if (!this.match(']')) {
        throw {
          line: this.peek().line,
          col: this.peek().col,
          message: "Expected ']' to close list",
          suggestion: 'Add closing bracket to complete list declaration',
        };
      }
      return {
        type: 'ArrayLiteral',
        id: this.nextId('arr'),
        line: token.line,
        col: token.col,
        elements,
        description: `List literal with ${elements.length} elements: Allocates contiguous block in Heap`,
      };
    }

    // Dictionary / HashMap literal: {'a': 1, 'b': 2} or {}
    if (this.match('{')) {
      const entries: Array<{ key: ASTNode; value: ASTNode }> = [];
      if (!this.check('}')) {
        do {
          const key = this.parseExpression();
          if (!this.match(':')) {
            throw {
              line: this.peek().line,
              col: this.peek().col,
              message: "Expected ':' after dictionary key",
              suggestion: "Add ':' between key and value in dictionary",
            };
          }
          const value = this.parseExpression();
          entries.push({ key, value });
        } while (this.match(','));
      }
      if (!this.match('}')) {
        throw {
          line: this.peek().line,
          col: this.peek().col,
          message: "Expected '}' to close dictionary",
          suggestion: "Add closing brace '}'",
        };
      }
      return {
        type: 'DictLiteral',
        id: this.nextId('dict'),
        line: token.line,
        col: token.col,
        entries,
        description: `Dictionary / HashMap with ${entries.length} entries allocated in Heap`,
      };
    }

    // Identifier / Variable reference (including self)
    if (this.matchIdentifier() || this.match('self')) {
      const prev = this.tokens[this.current - 1];
      return {
        type: 'Identifier',
        id: this.nextId('id'),
        line: prev.line,
        col: prev.col,
        name: prev.value,
        description: `Variable identifier '${prev.value}' lookup from Stack frame`,
      };
    }

    // Grouping: ( expr )
    if (this.match('(')) {
      const expr = this.parseExpression();
      if (!this.match(')')) {
        throw {
          line: this.peek().line,
          col: this.peek().col,
          message: "Expected ')' after grouped expression",
          suggestion: 'Close parenthesis',
        };
      }
      return expr;
    }

    throw {
      line: token.line,
      col: token.col,
      message: `Unexpected token '${token.value}'`,
      suggestion: 'Check syntax and ensure statements are valid Python code',
    };
  }

  private matchNumber(): boolean {
    if (this.checkType('NUMBER')) {
      this.advance();
      return true;
    }
    return false;
  }

  private matchString(): boolean {
    if (this.checkType('STRING')) {
      this.advance();
      return true;
    }
    return false;
  }

  private matchIdentifier(): boolean {
    if (this.checkType('IDENTIFIER')) {
      this.advance();
      return true;
    }
    return false;
  }
}

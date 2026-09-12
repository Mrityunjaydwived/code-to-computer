import { describe, it, expect } from 'vitest';
import { tokenize } from '../engine/tokenizer';
import { Parser } from '../engine/parser';
import { Compiler } from '../engine/compiler';
import { SimulationRuntime } from '../engine/runtime';

describe('Engine: Lexer & Tokenizer', () => {
  it('should tokenize arithmetic assignment correctly', () => {
    const code = 'a = 10\nb = 20\nc = a + b\nprint(c)';
    const tokens = tokenize(code);
    expect(tokens.length).toBeGreaterThan(10);
    expect(tokens.some(t => t.type === 'IDENTIFIER' && t.value === 'a')).toBe(true);
    expect(tokens.some(t => t.type === 'OPERATOR' && t.value === '=')).toBe(true);
    expect(tokens.some(t => t.type === 'NUMBER' && t.value === '10')).toBe(true);
    expect(tokens.some(t => t.type === 'KEYWORD' && t.value === 'print')).toBe(true);
  });

  it('should tokenize function definitions', () => {
    const code = 'def add(x, y):\n    return x + y';
    const tokens = tokenize(code);
    expect(tokens.some(t => t.type === 'KEYWORD' && t.value === 'def')).toBe(true);
    expect(tokens.some(t => t.type === 'IDENTIFIER' && t.value === 'add')).toBe(true);
    expect(tokens.some(t => t.type === 'KEYWORD' && t.value === 'return')).toBe(true);
  });
});

describe('Engine: Parser & AST', () => {
  it('should build AST for basic assignment', () => {
    const tokens = tokenize('x = 42');
    const parser = new Parser(tokens);
    const res = parser.parse();
    expect(res.error).toBeUndefined();
    expect(res.ast).toBeDefined();
    expect(res.ast?.body[0].type).toBe('Assignment');
    expect(res.ast?.body[0].target).toBe('x');
    expect(res.ast?.body[0].value.value).toBe(42);
  });

  it('should build AST for binary arithmetic', () => {
    const tokens = tokenize('c = a + b');
    const parser = new Parser(tokens);
    const res = parser.parse();
    expect(res.ast?.body[0].value.type).toBe('BinaryExpression');
    expect(res.ast?.body[0].value.operator).toBe('+');
  });

  it('should gracefully handle syntax errors with line/col and suggestion', () => {
    const tokens = tokenize('if x > 10\n    y = 1'); // missing colon
    const parser = new Parser(tokens);
    const res = parser.parse();
    expect(res.error).toBeDefined();
    expect(res.error?.message).toContain("Expected ':' after if condition");
    expect(res.error?.suggestion).toBeDefined();
  });
});

describe('Engine: Compiler & IR Bytecode', () => {
  it('should compile AST to low-level assembly instructions', () => {
    const tokens = tokenize('a = 10\nb = 20\nc = a + b');
    const parser = new Parser(tokens);
    const parseRes = parser.parse();
    const compiler = new Compiler();
    const instructions = compiler.compile(parseRes.ast!);

    expect(instructions.length).toBeGreaterThan(0);
    expect(instructions.some(i => i.opcode === 'LOAD_CONST')).toBe(true);
    expect(instructions.some(i => i.opcode === 'STORE_VAR')).toBe(true);
    expect(instructions.some(i => i.opcode === 'ADD')).toBe(true);
    expect(instructions[instructions.length - 1].opcode).toBe('HALT');
  });
});

describe('Engine: Full Hardware Simulation & Snapshots', () => {
  it('should simulate execution of a = 10; b = 20; c = a + b; print(c)', () => {
    const code = 'a = 10\nb = 20\nc = a + b\nprint(c)';
    const result = SimulationRuntime.execute(code);

    expect(result.error).toBeUndefined();
    expect(result.snapshots.length).toBeGreaterThan(4);
    
    // Check stdout
    expect(result.snapshots[result.snapshots.length - 1].stdout).toEqual(['30']);

    // Check memory allocation
    const lastSnapshot = result.snapshots[result.snapshots.length - 1];
    const varC = lastSnapshot.memory.find(m => m.label === 'c');
    expect(varC).toBeDefined();
    expect(varC?.value).toBe(30);
    expect(varC?.addressHex).toMatch(/^0x[0-9A-F]{8}$/);

    // Check CPU registers
    expect(lastSnapshot.cpu.registers.RAX).toBe(30);
  });

  it('should correctly simulate conditional branching', () => {
    const code = 'x = 15\nif x > 10:\n    y = 100\nelse:\n    y = 200';
    const result = SimulationRuntime.execute(code);

    expect(result.error).toBeUndefined();
    const lastSnapshot = result.snapshots[result.snapshots.length - 1];
    const varY = lastSnapshot.memory.find(m => m.label === 'y');
    expect(varY?.value).toBe(100);
  });

  it('should correctly simulate heap array allocation', () => {
    const code = 'arr = [10, 20, 30]\nx = arr[1]';
    const result = SimulationRuntime.execute(code);

    expect(result.error).toBeUndefined();
    const lastSnapshot = result.snapshots[result.snapshots.length - 1];
    expect(lastSnapshot.heap.length).toBeGreaterThan(0);
    const varX = lastSnapshot.memory.find(m => m.label === 'x');
    expect(varX?.value).toBe(20);
  });

  it('should provide time-travel reproducibility', () => {
    const code = 'a = 1\na = 2\na = 3';
    const result = SimulationRuntime.execute(code);

    // Verify snapshots preserve intermediate values
    const stepWith1 = result.snapshots.find(s => s.memory.some(m => m.label === 'a' && m.value === 1));
    const stepWith2 = result.snapshots.find(s => s.memory.some(m => m.label === 'a' && m.value === 2));
    const stepWith3 = result.snapshots.find(s => s.memory.some(m => m.label === 'a' && m.value === 3));

    expect(stepWith1).toBeDefined();
    expect(stepWith2).toBeDefined();
    expect(stepWith3).toBeDefined();
    expect(stepWith1!.step).toBeLessThan(stepWith2!.step);
    expect(stepWith2!.step).toBeLessThan(stepWith3!.step);
  });
});

// Core data models and types for Code -> Computer simulation engine

export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'OPERATOR'
  | 'PUNCTUATION'
  | 'COMMENT'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  col: number;
  description: string;
  category: 'keyword' | 'identifier' | 'literal' | 'operator' | 'separator';
}

export type ASTNodeType =
  | 'Program'
  | 'Assignment'
  | 'BinaryExpression'
  | 'UnaryExpression'
  | 'Literal'
  | 'Identifier'
  | 'IfStatement'
  | 'WhileStatement'
  | 'ForStatement'
  | 'BreakStatement'
  | 'ContinueStatement'
  | 'FunctionDeclaration'
  | 'FunctionCall'
  | 'ReturnStatement'
  | 'ArrayLiteral'
  | 'DictLiteral'
  | 'ListComprehension'
  | 'IndexAccess'
  | 'MemberAccess'
  | 'MethodCall'
  | 'ClassDeclaration'
  | 'Instantiation'
  | 'PrintStatement';

export interface ASTNode {
  type: ASTNodeType;
  id: string;
  line: number;
  col: number;
  description: string;
  [key: string]: any;
}

export type IROpcode =
  | 'LOAD_CONST'
  | 'LOAD_VAR'
  | 'STORE_VAR'
  | 'ADD'
  | 'SUB'
  | 'MUL'
  | 'DIV'
  | 'MOD'
  | 'CMP_EQ'
  | 'CMP_NE'
  | 'CMP_LT'
  | 'CMP_GT'
  | 'CMP_LE'
  | 'CMP_GE'
  | 'JUMP_IF_FALSE'
  | 'JUMP'
  | 'CALL'
  | 'RET'
  | 'ALLOC_HEAP'
  | 'HEAP_STORE'
  | 'HEAP_LOAD'
  | 'MEMBER_LOAD'
  | 'MEMBER_STORE'
  | 'CALL_METHOD'
  | 'DICT_ALLOC'
  | 'DICT_STORE'
  | 'DICT_LOAD'
  | 'PRINT'
  | 'PUSH'
  | 'POP'
  | 'HALT';

export interface IRInstruction {
  index: number;
  opcode: IROpcode;
  op1?: string | number;
  op2?: string | number;
  dest?: string;
  line: number;
  assembly: string;
  explanation: string;
}

export interface RegisterBank {
  RAX: number | string; // Primary accumulator / return value
  RBX: number | string; // Base / scratch
  RCX: number | string; // Counter / 4th arg
  RDX: number | string; // Data / 3rd arg
  RSI: number | string; // 2nd function argument / Source index
  RDI: number | string; // 1st function argument / Destination index
  R8: number | string;  // 5th function argument / General purpose
  R9: number | string;  // 6th function argument / General purpose
  RSP: string;          // Stack pointer (hex string)
  RBP: string;          // Base frame pointer (hex string)
  RIP: string;          // Instruction pointer (hex string or instruction index)
  FLAGS: {
    ZF: boolean; // Zero Flag
    SF: boolean; // Sign Flag
    OF: boolean; // Overflow Flag
  };
}

export type CycleStage = 'FETCH' | 'DECODE' | 'EXECUTE' | 'MEMORY' | 'WRITE_BACK';

export interface CpuState {
  registers: RegisterBank;
  activeCycleStage: CycleStage;
  currentInstruction?: IRInstruction;
  alu: {
    operation?: string;
    operand1?: any;
    operand2?: any;
    result?: any;
    active: boolean;
  };
  controlUnit: {
    state: string;
    signals: string[];
  };
}

export interface MemoryBlock {
  address: number;
  addressHex: string;
  label: string;
  size: number; // in bytes (e.g. 4 for 32-bit int)
  value: any;
  type: 'int' | 'float' | 'string' | 'pointer' | 'array' | 'object';
  binaryRepresentation: string;
  hexRepresentation: string;
  isFree: boolean;
  allocatedAtStep?: number;
  segment: 'STACK' | 'HEAP' | 'DATA' | 'TEXT';
}

export interface CacheLine {
  lineIndex: number;
  tag: string;
  addressHex: string;
  data: any;
  valid: boolean;
  dirty: boolean;
  lastAccessed: number;
}

export interface CacheLevel {
  name: 'L1' | 'L2' | 'L3';
  lines: CacheLine[];
  sizeBytes: number;
  hits: number;
  misses: number;
  latencyCycles: number;
}

export interface CacheState {
  levels: {
    L1: CacheLevel;
    L2: CacheLevel;
    L3: CacheLevel;
  };
  totalHits: number;
  totalMisses: number;
  hitRatio: number;
  effectiveAccessTime: number; // in nanoseconds or cycles
  lastAccess?: {
    address: string;
    hitLevel?: 'L1' | 'L2' | 'L3' | 'RAM';
    status: 'HIT' | 'MISS';
  };
}

export interface StackFrame {
  id: string;
  functionName: string;
  returnAddress: string;
  savedRbp: string;
  parameters: Record<string, any>;
  locals: Record<string, { value: any; addressHex: string; type: string }>;
  framePointer: string;
  stackPointer: string;
}

export interface HeapObject {
  id: string;
  addressHex: string;
  type: string;
  size: number;
  fields: Record<string, any>;
  referenceCount: number;
  isReachable: boolean;
  allocatedAtStep: number;
}

export interface ExecutionEvent {
  id: string;
  step: number;
  timestamp: string;
  subsystem: 'COMPILER' | 'CPU' | 'MEMORY' | 'CACHE' | 'STACK' | 'HEAP' | 'OUTPUT';
  message: string;
  details?: string;
  whyExplanation?: string;
}

export interface Explanation {
  beginner: string;
  technical: string;
  gate: string;
  whySummary: string;
}

export interface ExecutionSnapshot {
  step: number;
  line: number;
  instruction?: IRInstruction;
  cpu: CpuState;
  memory: MemoryBlock[];
  cache: CacheState;
  stack: StackFrame[];
  heap: HeapObject[];
  stdout: string[];
  lastEvent: ExecutionEvent;
  explanation: Explanation;
  busActivity?: {
    from: 'CPU' | 'ALU' | 'REGISTERS' | 'CACHE' | 'RAM' | 'STACK' | 'HEAP';
    to: 'CPU' | 'ALU' | 'REGISTERS' | 'CACHE' | 'RAM' | 'STACK' | 'HEAP';
    data: any;
    label: string;
    active: boolean;
  };
}

export interface ExecutionMetrics {
  instructionsExecuted: number;
  memoryUsedBytes: number;
  stackDepth: number;
  heapAllocations: number;
  cacheHits: number;
  cacheMisses: number;
  cpuCycles: number;
  functionsCalled: number;
}

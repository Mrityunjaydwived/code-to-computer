export interface QuizOption {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface LessonStep {
  title: string;
  description: string;
  hardwareFocus: 'CPU' | 'MEMORY' | 'CACHE' | 'STACK' | 'COMPILER';
  codeSnippet: string;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  category: 'Basics' | 'Architecture' | 'Runtime';
  steps: LessonStep[];
  quiz: {
    question: string;
    options: QuizOption[];
  };
}

export const LESSONS: Lesson[] = [
  {
    id: 'lesson_assignment',
    title: 'What happens when you write a = 10?',
    subtitle: 'From human-readable text to silicon charges in 5 steps',
    category: 'Basics',
    steps: [
      {
        title: 'Step 1: Lexical Analysis',
        description: 'The lexer reads the character sequence and produces three tokens: IDENTIFIER(a), OPERATOR(=), NUMBER(10).',
        hardwareFocus: 'COMPILER',
        codeSnippet: 'a = 10',
        explanation: 'Characters are categorized into syntactic tokens with grammatical metadata.',
      },
      {
        title: 'Step 2: AST Construction',
        description: 'The parser builds an Assignment AST node binding target "a" to numeric literal 10.',
        hardwareFocus: 'COMPILER',
        codeSnippet: 'Assignment { target: "a", value: 10 }',
        explanation: 'The tree structure guarantees operator precedence and valid syntax.',
      },
      {
        title: 'Step 3: Bytecode Generation',
        description: 'The compiler emits two low-level instructions: MOV RAX, 10 then MOV [a], RAX.',
        hardwareFocus: 'COMPILER',
        codeSnippet: 'MOV RAX, 10\nMOV [a], RAX',
        explanation: 'CPUs cannot directly assign text to memory; immediate values load into registers first.',
      },
      {
        title: 'Step 4: Register Load',
        description: 'The CPU instruction decoder activates the immediate load circuit, placing 10 into register RAX.',
        hardwareFocus: 'CPU',
        codeSnippet: 'RAX ← 10 (0x0000000A)',
        explanation: 'Registers operate within ~0.5 nanoseconds at single clock cycle speed.',
      },
      {
        title: 'Step 5: Memory Allocation & Write',
        description: 'Memory controller allocates address 0x00001000 and writes the 32-bit binary representation of 10.',
        hardwareFocus: 'MEMORY',
        codeSnippet: '[0x00001000] ← 00000000 00000000 00000000 00001010',
        explanation: 'The variable name "a" is resolved to this physical virtual memory offset.',
      },
    ],
    quiz: {
      question: 'Where is the value 10 loaded immediately before being written to variable memory?',
      options: [
        { text: 'In the CPU Register (RAX)', isCorrect: true, explanation: 'Correct! The CPU scratchpad register holds the immediate operand before transferring it over the memory bus.' },
        { text: 'Directly in the Hard Disk', isCorrect: false, explanation: 'Incorrect. Disk storage is secondary and too slow for direct instruction execution.' },
        { text: 'In the Monitor Framebuffer', isCorrect: false, explanation: 'Incorrect. Framebuffer is for display pixels, not program variables.' },
        { text: 'In the Keyboard buffer', isCorrect: false, explanation: 'Incorrect. Keyboard buffer only receives input keystrokes.' },
      ],
    },
  },
  {
    id: 'lesson_functions',
    title: 'Inside a Function Call: The Call Stack',
    subtitle: 'Stack frames, activation records, and return pointers',
    category: 'Runtime',
    steps: [
      {
        title: '1. Preparing Arguments',
        description: 'Caller evaluates arguments and pushes them onto the stack or into argument registers.',
        hardwareFocus: 'STACK',
        codeSnippet: 'PUSH RAX  # Push argument',
        explanation: 'Arguments must be placed in agreed-upon locations according to the ABI calling convention.',
      },
      {
        title: '2. CALL Instruction',
        description: 'The CPU pushes the next instruction address (Return RIP) onto the stack so it knows where to return.',
        hardwareFocus: 'CPU',
        codeSnippet: 'CALL multiply',
        explanation: 'The program counter jumps to the function address while preserving caller return point.',
      },
      {
        title: '3. Stack Frame Creation',
        description: 'Old Base Pointer (RBP) is saved, and RBP is set to the current Stack Pointer (RSP).',
        hardwareFocus: 'STACK',
        codeSnippet: 'PUSH RBP\nMOV RBP, RSP',
        explanation: 'This creates an isolated activation record for local variables.',
      },
      {
        title: '4. Execution & Return',
        description: 'Function computes result into RAX, restores old RBP, and executes RET.',
        hardwareFocus: 'CPU',
        codeSnippet: 'POP RBP\nRET',
        explanation: 'RET pops the return address back into the instruction pointer (RIP).',
      },
    ],
    quiz: {
      question: 'What pointer marks the base of the currently active function call frame?',
      options: [
        { text: 'RBP (Base Pointer)', isCorrect: true, explanation: 'Correct! RBP anchors the base of the current stack frame, allowing local variables to be accessed at fixed offsets.' },
        { text: 'RAX (Accumulator)', isCorrect: false, explanation: 'Incorrect. RAX holds arithmetic operands and function return values.' },
        { text: 'CR3 (Control Register)', isCorrect: false, explanation: 'Incorrect. CR3 holds the page directory base address in x86 virtual memory.' },
        { text: 'FLAGS Register', isCorrect: false, explanation: 'Incorrect. FLAGS contains condition codes like ZF, SF, OF.' },
      ],
    },
  },
  {
    id: 'lesson_cache',
    title: 'Why Caches Exist: The Memory Wall',
    subtitle: 'L1, L2, L3 cache hierarchy and latency penalties',
    category: 'Architecture',
    steps: [
      {
        title: '1. The Speed Discrepancy',
        description: 'CPU ALU operates at ~3-4 GHz (0.3 ns per cycle), while Main Memory (RAM) takes ~50-100 ns.',
        hardwareFocus: 'CACHE',
        codeSnippet: 'CPU: 1 cycle | RAM: ~200 cycles stall',
        explanation: 'Without caching, the CPU would spend 99% of its time idle waiting for memory reads.',
      },
      {
        title: '2. L1 Cache: Ultra Fast',
        description: 'Tiny on-die SRAM (32KB - 64KB) accessible in 1 to 4 clock cycles.',
        hardwareFocus: 'CACHE',
        codeSnippet: 'L1 Hit: ~1-2 cycles latency',
        explanation: 'Directly adjacent to CPU core execution units.',
      },
      {
        title: '3. Spatial & Temporal Locality',
        description: 'Programs access the same variables repeatedly (Temporal) and sequential memory addresses (Spatial).',
        hardwareFocus: 'MEMORY',
        codeSnippet: 'arr[0], arr[1], arr[2] loaded in single 64B cache line',
        explanation: 'Fetching one address automatically preloads adjacent words into the cache line.',
      },
    ],
    quiz: {
      question: 'If a variable is already present in L1 Cache, approximately how long does the CPU take to access it?',
      options: [
        { text: '1 to 4 clock cycles', isCorrect: true, explanation: 'Correct! L1 cache hits complete in ~1-4 CPU cycles with near-zero latency.' },
        { text: '100 to 300 clock cycles', isCorrect: false, explanation: 'Incorrect. That is the penalty for a full RAM access miss.' },
        { text: '10,000 clock cycles', isCorrect: false, explanation: 'Incorrect. That is typical for SSD/disk I/O page faults.' },
        { text: '0 clock cycles (teleportation)', isCorrect: false, explanation: 'Incorrect. Physics dictates electrical signal delay across the die.' },
      ],
    },
  },
];

import { IRInstruction, Explanation } from './types';

export function generateExplanation(
  inst: IRInstruction | undefined,
  context: {
    targetVar?: string;
    value?: any;
    reg?: string;
    oldVal?: any;
    newVal?: any;
    op?: string;
    addrHex?: string;
  }
): Explanation {
  if (!inst) {
    return {
      beginner: 'Program is ready to execute. The CPU instruction pointer (RIP) points to entry point.',
      technical: 'Instruction Register (IR) reset. Program Counter (PC/RIP) initialized to 0x00400000.',
      gate: 'Initial state: Fetch cycle begins at reset vector. MAR receives PC value.',
      whySummary: 'Program initialized for execution.',
    };
  }

  const { opcode, op1, op2, dest } = inst;

  switch (opcode) {
    case 'LOAD_CONST':
      return {
        beginner: `The computer loaded the constant value ${op1} directly into register ${dest}. Think of a register as the CPU's ultra-fast scratchpad notebook.`,
        technical: `Immediate Addressing Mode: Operand '${op1}' is encoded directly inside the machine instruction word and transferred across the internal CPU bus into ${dest}.`,
        gate: `Addressing Mode: Immediate. RTL: ${dest} ← IR[operand]. Memory read cycles: 0 (operand fetched in instruction decode).`,
        whySummary: `Constants must be loaded into high-speed CPU registers before the ALU can perform arithmetic on them.`,
      };

    case 'LOAD_VAR':
      return {
        beginner: `The CPU read the value of '${op1}' from computer memory into register ${dest} so it can work on it.`,
        technical: `Direct Addressing: CPU issues a memory read request for variable '${op1}'. Data passes through L1 Cache (or RAM on cache miss) into ${dest}.`,
        gate: `RTL: MAR ← Address(${op1}); MBR ← Memory[MAR]; ${dest} ← MBR. Cache access evaluated.`,
        whySummary: `RAM and Cache store long-term values, but only registers can feed operands directly into the ALU.`,
      };

    case 'STORE_VAR':
      return {
        beginner: `The CPU saved the calculated result from register ${op1} into the memory address for '${dest}'.`,
        technical: `Memory Write: Content of ${op1} written to virtual memory at label '${dest}'. Cache line is updated (write-through / write-back buffer).`,
        gate: `RTL: MAR ← Address(${dest}); MBR ← ${op1}; Memory[MAR] ← MBR. Bus transaction: Memory Write Cycle.`,
        whySummary: `Registers are limited and temporary. Storing values to memory makes them permanent for future statements.`,
      };

    case 'ADD':
    case 'SUB':
    case 'MUL':
    case 'DIV':
    case 'MOD':
      return {
        beginner: `The Arithmetic Logic Unit (ALU) calculated ${op1} ${opcode} ${op2} and stored the result back in ${dest}.`,
        technical: `ALU Operation: Control signals activate integer ${opcode} circuit. Flags register updated (Zero Flag ZF, Sign Flag SF, Overflow OF).`,
        gate: `RTL: ${dest} ← ${dest} ${opcode === 'ADD' ? '+' : opcode === 'SUB' ? '-' : '*'} ${op2}. Flags: ZF updated if result == 0, SF updated based on MSB.`,
        whySummary: `The ALU is the mathematical execution engine of the computer that performs all binary and arithmetic logic.`,
      };

    case 'CMP_EQ':
    case 'CMP_NE':
    case 'CMP_LT':
    case 'CMP_GT':
    case 'CMP_LE':
    case 'CMP_GE':
      return {
        beginner: `The computer checked if the values matched the condition (${opcode}) to decide what code to run next.`,
        technical: `Comparison: ALU performs subtraction between operands without storing the numerical result, only updating CPU condition flags (ZF, SF).`,
        gate: `RTL: ALU_TEMP ← ${op1} - ${op2}; ZF ← (ALU_TEMP == 0); SF ← ALU_TEMP[31]. Condition evaluated for branch logic.`,
        whySummary: `Computers make decisions by checking condition flags set during arithmetic comparison.`,
      };

    case 'JUMP_IF_FALSE':
      return {
        beginner: `Because the condition was False, the CPU skipped over this block of code to continue below.`,
        technical: `Conditional Branch: Evaluates Zero Flag (ZF). If set, Program Counter (RIP) is overwritten with target target instruction address.`,
        gate: `Control Hazard: Branch prediction verified. If branch taken, pipeline must fetch from target target address. RTL: If ZF==1 then PC ← target.`,
        whySummary: `Branches change the instruction pointer to execute different paths based on runtime conditions.`,
      };

    case 'JUMP':
      return {
        beginner: `The CPU jumped unconditionally to another part of the program (e.g. looping back).`,
        technical: `Unconditional Jump: Instruction pointer (RIP) updated to jump target offset.`,
        gate: `RTL: PC ← TargetAddress. 0-operand control flow diversion.`,
        whySummary: `Loops and block skips require directing the CPU instruction counter to a previous or future instruction.`,
      };

    case 'CALL':
      return {
        beginner: `The program called function '${op1}'. A new call frame was pushed onto the computer's Call Stack.`,
        technical: `Call Instruction: Pushes return address (next RIP) onto the stack at [RSP], decrements RSP, and sets RIP to target function entry point.`,
        gate: `RTL: RSP ← RSP - 4; Memory[RSP] ← PC; PC ← FunctionAddress(${op1}). Call stack frame allocated.`,
        whySummary: `Functions need isolated memory spaces (stack frames) for their local variables and to remember where to return.`,
      };

    case 'RET':
      return {
        beginner: `The function finished and returned control back to the caller. The temporary stack frame was popped off.`,
        technical: `Return Instruction: Pops caller return address from [RSP] into RIP and increments RSP to deallocate the frame.`,
        gate: `RTL: PC ← Memory[RSP]; RSP ← RSP + 4. Deallocates current activation record.`,
        whySummary: `Returning pops the top stack frame, restoring the previous caller's execution context and base pointer.`,
      };

    case 'ALLOC_HEAP':
      return {
        beginner: `Dynamic memory was requested. The memory manager carved out a block on the Heap.`,
        technical: `Heap Allocation: Memory allocator searches free lists and assigns a contiguous heap block. Returns base pointer into register ${dest}.`,
        gate: `Dynamic Memory: Heap segment allocation. Address returned via ${dest}. Subject to Garbage Collection reachability analysis.`,
        whySummary: `Data whose size or lifetime extends beyond a single function call is stored dynamically on the heap.`,
      };

    case 'PRINT':
      return {
        beginner: `The CPU sent the value to standard output so the user can see it on the monitor screen.`,
        technical: `System I/O Call: Data in register transferred across peripheral bus / UART to standard output console buffer.`,
        gate: `I/O Instruction: Programmed I/O or system call interrupt (INT 0x80 / SYSCALL) writing to STDOUT file descriptor 1.`,
        whySummary: `Programs communicate results to the outside world through standard output streams.`,
      };

    case 'HALT':
      return {
        beginner: `The program completed successfully. The CPU has stopped running further instructions.`,
        technical: `HLT Instruction: CPU enters low-power idle state until the next interrupt or program restart.`,
        gate: `RTL: CPU halt state entered. Clock cycles terminate.`,
        whySummary: `Every program reaches a terminal instruction that signals the operating system that execution is complete.`,
      };

    default:
      return {
        beginner: `The CPU executed instruction ${inst.assembly}.`,
        technical: `Micro-operation completed for opcode ${inst.opcode}.`,
        gate: `RTL: Machine cycle completed.`,
        whySummary: `Standard CPU cycle progression.`,
      };
  }
}

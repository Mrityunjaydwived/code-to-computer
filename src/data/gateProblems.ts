export interface GateProblem {
  id: string;
  topic: 'Cache Memory' | 'Pipelining' | 'Virtual Memory' | 'CPU Architecture';
  title: string;
  problemStatement: string;
  formula: string;
  inputs: { label: string; defaultVal: number; unit: string; key: string }[];
  calculate: (vals: Record<string, number>) => { result: number; unit: string; steps: string[] };
  explanation: string;
  examTip: string;
}

export const GATE_PROBLEMS: GateProblem[] = [
  {
    id: 'emat_calculation',
    topic: 'Cache Memory',
    title: 'Effective Memory Access Time (EMAT) with Multi-level Cache',
    problemStatement:
      'Given L1 cache hit ratio H1, L1 access time T1, L2 hit ratio H2, L2 access time T2, and Main Memory access time Tm, compute the Effective Memory Access Time (EMAT).',
    formula: 'EMAT = H1 × T1 + (1 - H1) × [H2 × T2 + (1 - H2) × Tm]',
    inputs: [
      { label: 'L1 Hit Ratio (H1)', defaultVal: 0.90, unit: 'fraction (0-1)', key: 'h1' },
      { label: 'L1 Access Time (T1)', defaultVal: 2, unit: 'ns', key: 't1' },
      { label: 'L2 Hit Ratio (H2)', defaultVal: 0.80, unit: 'fraction (0-1)', key: 'h2' },
      { label: 'L2 Access Time (T2)', defaultVal: 15, unit: 'ns', key: 't2' },
      { label: 'Main Memory Time (Tm)', defaultVal: 100, unit: 'ns', key: 'tm' },
    ],
    calculate: (v) => {
      const h1 = v.h1 ?? 0.9;
      const t1 = v.t1 ?? 2;
      const h2 = v.h2 ?? 0.8;
      const t2 = v.t2 ?? 15;
      const tm = v.tm ?? 100;

      const l2Penalty = h2 * t2 + (1 - h2) * tm;
      const emat = h1 * t1 + (1 - h1) * l2Penalty;

      return {
        result: Number(emat.toFixed(2)),
        unit: 'ns',
        steps: [
          `L2 effective penalty: (${h2} × ${t2}) + ((1 - ${h2}) × ${tm}) = ${(h2 * t2).toFixed(2)} + ${((1 - h2) * tm).toFixed(2)} = ${l2Penalty.toFixed(2)} ns`,
          `L1 level substitution: (${h1} × ${t1}) + ((1 - ${h1}) × ${l2Penalty.toFixed(2)})`,
          `L1 contribution: ${(h1 * t1).toFixed(2)} ns`,
          `Miss penalty contribution: ${((1 - h1) * l2Penalty).toFixed(2)} ns`,
          `Total EMAT = ${emat.toFixed(2)} ns`,
        ],
      };
    },
    explanation:
      'Hierarchical memory systems hide slow DRAM latency by servicing high percentages of memory requests in fast SRAM on-chip caches.',
    examTip:
      'GATE Trap: Watch out whether cache access is simultaneous or hierarchical (in simultaneous, Tm includes T1; in hierarchical, each level is checked sequentially).',
  },
  {
    id: 'pipeline_speedup',
    topic: 'Pipelining',
    title: 'Pipeline Speedup & Efficiency',
    problemStatement:
      'A non-pipelined processor takes Tn ns per instruction. A k-stage pipelined processor with stage delay Tp ns executes n instructions. Find Speedup (S).',
    formula: 'Speedup S = (n × Tn) / [(k + n - 1) × Tp]',
    inputs: [
      { label: 'Number of Instructions (n)', defaultVal: 1000, unit: 'instructions', key: 'n' },
      { label: 'Number of Stages (k)', defaultVal: 5, unit: 'stages', key: 'k' },
      { label: 'Non-pipelined Time (Tn)', defaultVal: 20, unit: 'ns', key: 'tn' },
      { label: 'Pipelined Clock Cycle (Tp)', defaultVal: 4.5, unit: 'ns', key: 'tp' },
    ],
    calculate: (v) => {
      const n = v.n ?? 1000;
      const k = v.k ?? 5;
      const tn = v.tn ?? 20;
      const tp = v.tp ?? 4.5;

      const nonPipelinedTotal = n * tn;
      const pipelinedTotal = (k + n - 1) * tp;
      const speedup = nonPipelinedTotal / pipelinedTotal;

      return {
        result: Number(speedup.toFixed(2)),
        unit: 'x speedup',
        steps: [
          `Time non-pipelined: ${n} × ${tn} = ${nonPipelinedTotal.toLocaleString()} ns`,
          `Total clock cycles in pipeline: (${k} + ${n} - 1) = ${(k + n - 1).toLocaleString()} cycles`,
          `Time pipelined: ${(k + n - 1).toLocaleString()} × ${tp} = ${pipelinedTotal.toFixed(1)} ns`,
          `Speedup S = ${nonPipelinedTotal} / ${pipelinedTotal.toFixed(1)} = ${speedup.toFixed(2)}x`,
          `Theoretical Maximum Speedup = Tn / Tp = ${(tn / tp).toFixed(2)}x`,
        ],
      };
    },
    explanation:
      'Pipelining increases instruction throughput by overlapping execution of multiple instructions across distinct functional stages (Fetch, Decode, Execute, Memory, Write-back).',
    examTip:
      'For large n (n >> k), Speedup approaches (k × Tp) / Tp = k when stages are ideally balanced.',
  },
  {
    id: 'direct_mapped_cache',
    topic: 'Cache Memory',
    title: 'Cache Address Field Breakdown',
    problemStatement:
      'Given a 32-bit physical address space, Cache size C bytes, and Line/Block size B bytes. Compute Tag bits, Line index bits, and Block offset bits.',
    formula: 'Offset = log2(B), Index = log2(Lines), Tag = 32 - Index - Offset',
    inputs: [
      { label: 'Physical Address Width', defaultVal: 32, unit: 'bits', key: 'addrBits' },
      { label: 'Cache Size', defaultVal: 64, unit: 'KB', key: 'cacheKb' },
      { label: 'Block Size', defaultVal: 64, unit: 'Bytes', key: 'blockB' },
    ],
    calculate: (v) => {
      const addrBits = v.addrBits ?? 32;
      const cacheBytes = (v.cacheKb ?? 64) * 1024;
      const blockBytes = v.blockB ?? 64;

      const offsetBits = Math.round(Math.log2(blockBytes));
      const lineCount = cacheBytes / blockBytes;
      const indexBits = Math.round(Math.log2(lineCount));
      const tagBits = addrBits - indexBits - offsetBits;

      return {
        result: tagBits,
        unit: 'Tag bits',
        steps: [
          `Block offset bits = log2(${blockBytes}) = ${offsetBits} bits`,
          `Number of cache lines = ${cacheBytes} / ${blockBytes} = ${lineCount} lines`,
          `Index bits = log2(${lineCount}) = ${indexBits} bits`,
          `Tag bits = ${addrBits} - (${indexBits} + ${offsetBits}) = ${tagBits} bits`,
          `Address division: [ Tag: ${tagBits} bits | Index: ${indexBits} bits | Offset: ${offsetBits} bits ]`,
        ],
      };
    },
    explanation:
      'In direct-mapped cache, every memory block maps to exactly one predetermined line in cache determined by its index field.',
    examTip:
      'Tag bits overhead represents silicon SRAM cost. Remember to add valid bit + dirty bit (if write-back) per line when calculating total tag directory memory.',
  },
];

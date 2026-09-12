import { CacheLevel, CacheLine, CacheState } from './types';

export class CacheSimulator {
  private l1: CacheLevel;
  private l2: CacheLevel;
  private l3: CacheLevel;
  private totalHits = 0;
  private totalMisses = 0;
  private accessCounter = 0;
  private lastAccess?: CacheState['lastAccess'];

  constructor() {
    this.l1 = this.initLevel('L1', 4, 1);   // 4 lines, 1 cycle
    this.l2 = this.initLevel('L2', 8, 10);  // 8 lines, 10 cycles
    this.l3 = this.initLevel('L3', 16, 40); // 16 lines, 40 cycles
  }

  private initLevel(name: 'L1' | 'L2' | 'L3', lineCount: number, latencyCycles: number): CacheLevel {
    const lines: CacheLine[] = [];
    for (let i = 0; i < lineCount; i++) {
      lines.push({
        lineIndex: i,
        tag: '0x00',
        addressHex: '0x00000000',
        data: null,
        valid: false,
        dirty: false,
        lastAccessed: 0,
      });
    }
    return {
      name,
      lines,
      sizeBytes: lineCount * 32, // 32 bytes per line
      hits: 0,
      misses: 0,
      latencyCycles,
    };
  }

  public reset(): void {
    this.l1 = this.initLevel('L1', 4, 1);
    this.l2 = this.initLevel('L2', 8, 10);
    this.l3 = this.initLevel('L3', 16, 40);
    this.totalHits = 0;
    this.totalMisses = 0;
    this.accessCounter = 0;
    this.lastAccess = undefined;
  }

  public access(addressHex: string, data?: any): { status: 'HIT' | 'MISS'; level: 'L1' | 'L2' | 'L3' | 'RAM'; latency: number } {
    this.accessCounter++;
    const addrNum = parseInt(addressHex, 16) || 0;
    
    // Check L1
    const l1LineIdx = (addrNum >> 5) % this.l1.lines.length;
    const tag = `0x${(addrNum >> 7).toString(16).toUpperCase()}`;
    const l1Line = this.l1.lines[l1LineIdx];

    if (l1Line.valid && l1Line.tag === tag) {
      this.l1.hits++;
      this.totalHits++;
      l1Line.lastAccessed = this.accessCounter;
      if (data !== undefined) l1Line.data = data;
      this.lastAccess = { address: addressHex, hitLevel: 'L1', status: 'HIT' };
      return { status: 'HIT', level: 'L1', latency: this.l1.latencyCycles };
    }
    this.l1.misses++;

    // Check L2
    const l2LineIdx = (addrNum >> 5) % this.l2.lines.length;
    const l2Line = this.l2.lines[l2LineIdx];

    if (l2Line.valid && l2Line.tag === tag) {
      this.l2.hits++;
      this.totalHits++;
      l2Line.lastAccessed = this.accessCounter;
      // Populate L1
      this.populateLine(this.l1, l1LineIdx, tag, addressHex, data ?? l2Line.data);
      this.lastAccess = { address: addressHex, hitLevel: 'L2', status: 'HIT' };
      return { status: 'HIT', level: 'L2', latency: this.l2.latencyCycles };
    }
    this.l2.misses++;

    // Check L3
    const l3LineIdx = (addrNum >> 5) % this.l3.lines.length;
    const l3Line = this.l3.lines[l3LineIdx];

    if (l3Line.valid && l3Line.tag === tag) {
      this.l3.hits++;
      this.totalHits++;
      l3Line.lastAccessed = this.accessCounter;
      // Populate L2 and L1
      this.populateLine(this.l2, l2LineIdx, tag, addressHex, data ?? l3Line.data);
      this.populateLine(this.l1, l1LineIdx, tag, addressHex, data ?? l3Line.data);
      this.lastAccess = { address: addressHex, hitLevel: 'L3', status: 'HIT' };
      return { status: 'HIT', level: 'L3', latency: this.l3.latencyCycles };
    }
    this.l3.misses++;

    // RAM Fetch (Miss across all cache levels)
    this.totalMisses++;
    const ramLatency = 100; // 100 cycles
    this.populateLine(this.l3, l3LineIdx, tag, addressHex, data);
    this.populateLine(this.l2, l2LineIdx, tag, addressHex, data);
    this.populateLine(this.l1, l1LineIdx, tag, addressHex, data);

    this.lastAccess = { address: addressHex, hitLevel: 'RAM', status: 'MISS' };
    return { status: 'MISS', level: 'RAM', latency: ramLatency };
  }

  private populateLine(level: CacheLevel, index: number, tag: string, addressHex: string, data: any): void {
    const line = level.lines[index];
    line.valid = true;
    line.tag = tag;
    line.addressHex = addressHex;
    line.data = data;
    line.lastAccessed = this.accessCounter;
  }

  public getState(): CacheState {
    const total = this.totalHits + this.totalMisses;
    const hitRatio = total > 0 ? this.totalHits / total : 1;

    // EMAT Calculation: L1_hit * 1 + (1 - L1_hit) * (L2_hit * 10 + (1 - L2_hit) * (L3_hit * 40 + (1 - L3_hit) * 100))
    const l1Total = this.l1.hits + this.l1.misses;
    const h1 = l1Total > 0 ? this.l1.hits / l1Total : 1;
    const l2Total = this.l2.hits + this.l2.misses;
    const h2 = l2Total > 0 ? this.l2.hits / l2Total : 0.8;
    const l3Total = this.l3.hits + this.l3.misses;
    const h3 = l3Total > 0 ? this.l3.hits / l3Total : 0.6;

    const emat = h1 * 1 + (1 - h1) * (h2 * 10 + (1 - h2) * (h3 * 40 + (1 - h3) * 100));

    return {
      levels: {
        L1: { ...this.l1, lines: this.l1.lines.map(l => ({ ...l })) },
        L2: { ...this.l2, lines: this.l2.lines.map(l => ({ ...l })) },
        L3: { ...this.l3, lines: this.l3.lines.map(l => ({ ...l })) },
      },
      totalHits: this.totalHits,
      totalMisses: this.totalMisses,
      hitRatio: Number(hitRatio.toFixed(3)),
      effectiveAccessTime: Number(emat.toFixed(2)),
      lastAccess: this.lastAccess ? { ...this.lastAccess } : undefined,
    };
  }
}

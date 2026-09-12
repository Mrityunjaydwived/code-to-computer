import { MemoryBlock } from './types';

export class MemoryManager {
  private blocks: Map<number, MemoryBlock> = new Map();
  private nextAddress = 0x1000;
  private variableAddressMap: Map<string, number> = new Map();

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.blocks.clear();
    this.variableAddressMap.clear();
    this.nextAddress = 0x1000;
  }

  public allocateVariable(
    name: string,
    value: any,
    step: number,
    segment: 'STACK' | 'HEAP' | 'DATA' = 'DATA'
  ): MemoryBlock {
    // If variable already exists, overwrite value
    if (this.variableAddressMap.has(name)) {
      const addr = this.variableAddressMap.get(name)!;
      const existing = this.blocks.get(addr)!;
      existing.value = value;
      existing.binaryRepresentation = this.toBinary(value);
      existing.hexRepresentation = this.toHex(value);
      existing.type = this.inferType(value);
      return existing;
    }

    const addr = this.nextAddress;
    this.nextAddress += 4; // 32-bit word alignment

    const block: MemoryBlock = {
      address: addr,
      addressHex: `0x${addr.toString(16).toUpperCase().padStart(8, '0')}`,
      label: name,
      size: 4,
      value,
      type: this.inferType(value),
      binaryRepresentation: this.toBinary(value),
      hexRepresentation: this.toHex(value),
      isFree: false,
      allocatedAtStep: step,
      segment,
    };

    this.blocks.set(addr, block);
    this.variableAddressMap.set(name, addr);
    return block;
  }

  public allocateArray(
    name: string,
    elements: any[],
    step: number
  ): { baseAddressHex: string; blocks: MemoryBlock[] } {
    const allocated: MemoryBlock[] = [];
    const baseAddr = this.nextAddress;

    for (let i = 0; i < elements.length; i++) {
      const addr = this.nextAddress;
      this.nextAddress += 4;
      const block: MemoryBlock = {
        address: addr,
        addressHex: `0x${addr.toString(16).toUpperCase().padStart(8, '0')}`,
        label: `${name}[${i}]`,
        size: 4,
        value: elements[i],
        type: this.inferType(elements[i]),
        binaryRepresentation: this.toBinary(elements[i]),
        hexRepresentation: this.toHex(elements[i]),
        isFree: false,
        allocatedAtStep: step,
        segment: 'HEAP',
      };
      this.blocks.set(addr, block);
      allocated.push(block);
    }

    this.variableAddressMap.set(name, baseAddr);
    return {
      baseAddressHex: `0x${baseAddr.toString(16).toUpperCase().padStart(8, '0')}`,
      blocks: allocated,
    };
  }

  public getVariableAddress(name: string): string | undefined {
    const addr = this.variableAddressMap.get(name);
    return addr ? `0x${addr.toString(16).toUpperCase().padStart(8, '0')}` : undefined;
  }

  public getVariableValue(name: string): any {
    const addr = this.variableAddressMap.get(name);
    if (addr !== undefined && this.blocks.has(addr)) {
      return this.blocks.get(addr)!.value;
    }
    return undefined;
  }

  public getBlock(address: number): MemoryBlock | undefined {
    return this.blocks.get(address);
  }

  public getAllBlocks(): MemoryBlock[] {
    return Array.from(this.blocks.values()).sort((a, b) => a.address - b.address);
  }

  public cloneBlocks(): MemoryBlock[] {
    return this.getAllBlocks().map(b => ({ ...b }));
  }

  public inferType(val: any): 'int' | 'float' | 'string' | 'pointer' | 'array' | 'object' {
    if (typeof val === 'number') {
      return Number.isInteger(val) ? 'int' : 'float';
    }
    if (typeof val === 'string') {
      if (val.startsWith('0x')) return 'pointer';
      return 'string';
    }
    if (Array.isArray(val)) return 'array';
    if (val === null) return 'pointer';
    return 'object';
  }

  public toBinary(val: any): string {
    if (typeof val === 'number') {
      const num = Math.floor(val) >>> 0;
      const bin = num.toString(2).padStart(32, '0');
      // Format into 4-bit nibbles for high readability
      return bin.match(/.{1,4}/g)?.join(' ') || bin;
    }
    if (typeof val === 'string') {
      if (val.startsWith('0x')) {
        const num = parseInt(val, 16) >>> 0;
        return (num.toString(2).padStart(32, '0').match(/.{1,4}/g)?.join(' ')) || '0000 0000';
      }
      // ASCII character codes binary
      return val
        .split('')
        .slice(0, 4)
        .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ');
    }
    if (val === null || val === undefined) {
      return '0000 0000 0000 0000 0000 0000 0000 0000';
    }
    return '0000 0000 0000 0000 0000 0000 0000 0000';
  }

  public toHex(val: any): string {
    if (typeof val === 'number') {
      const num = Math.floor(val) >>> 0;
      return '0x' + num.toString(16).toUpperCase().padStart(8, '0');
    }
    if (typeof val === 'string') {
      if (val.startsWith('0x')) return val.toUpperCase();
      return '0x' + Array.from(val.slice(0, 4)).map(c => c.charCodeAt(0).toString(16)).join('').toUpperCase();
    }
    if (val === null) return '0x00000000';
    return '0x00000000';
  }
}

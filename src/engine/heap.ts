import { HeapObject } from './types';

export class HeapManager {
  private objects: Map<string, HeapObject> = new Map();
  private nextAddress = 0x5000;
  private objectCounter = 0;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.objects.clear();
    this.nextAddress = 0x5000;
    this.objectCounter = 0;
  }

  public allocate(type: string, fields: Record<string, any>, size: number = 32, step: number = 0): HeapObject {
    const addr = this.nextAddress;
    this.nextAddress += Math.max(32, Math.ceil(size / 16) * 16); // 16-byte alignment

    const obj: HeapObject = {
      id: `heap_obj_${++this.objectCounter}`,
      addressHex: `0x${addr.toString(16).toUpperCase().padStart(8, '0')}`,
      type,
      size,
      fields: { ...fields },
      referenceCount: 1,
      isReachable: true,
      allocatedAtStep: step,
    };

    this.objects.set(obj.addressHex, obj);
    return obj;
  }

  public getObject(addressHex: string): HeapObject | undefined {
    return this.objects.get(addressHex);
  }

  public updateField(addressHex: string, field: string, value: any): void {
    const obj = this.objects.get(addressHex);
    if (obj) {
      obj.fields[field] = value;
    }
  }

  public addReference(addressHex: string): void {
    const obj = this.objects.get(addressHex);
    if (obj) {
      obj.referenceCount++;
      obj.isReachable = true;
    }
  }

  public removeReference(addressHex: string): void {
    const obj = this.objects.get(addressHex);
    if (obj) {
      obj.referenceCount = Math.max(0, obj.referenceCount - 1);
      if (obj.referenceCount === 0) {
        obj.isReachable = false;
      }
    }
  }

  /**
   * Run Mark-and-Sweep Garbage Collection
   * Reclaims all objects not in the root pointers set
   */
  public runGarbageCollection(rootPointers: string[]): {
    reclaimedCount: number;
    reclaimedBytes: number;
    freedAddresses: string[];
  } {
    const reachableSet = new Set<string>();

    // Mark phase: mark all reachable from roots
    const queue = [...rootPointers];
    while (queue.length > 0) {
      const addr = queue.pop()!;
      if (reachableSet.has(addr)) continue;
      if (this.objects.has(addr)) {
        reachableSet.add(addr);
        const obj = this.objects.get(addr)!;
        obj.isReachable = true;
        // If this object references other heap addresses, enqueue them
        for (const val of Object.values(obj.fields)) {
          if (typeof val === 'string' && val.startsWith('0x') && this.objects.has(val)) {
            queue.push(val);
          }
        }
      }
    }

    // Sweep phase: unmark unreachable and collect
    let reclaimedCount = 0;
    let reclaimedBytes = 0;
    const freedAddresses: string[] = [];

    for (const [addr, obj] of Array.from(this.objects.entries())) {
      if (!reachableSet.has(addr)) {
        obj.isReachable = false;
        obj.referenceCount = 0;
        reclaimedCount++;
        reclaimedBytes += obj.size;
        freedAddresses.push(addr);
        this.objects.delete(addr);
      }
    }

    return { reclaimedCount, reclaimedBytes, freedAddresses };
  }

  public getObjects(): HeapObject[] {
    return Array.from(this.objects.values()).map(o => ({
      ...o,
      fields: { ...o.fields },
    }));
  }
}

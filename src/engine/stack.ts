import { StackFrame } from './types';

export class StackManager {
  private frames: StackFrame[] = [];
  private frameIdCounter = 0;
  private baseRsp = 0x7ffffff0;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.frames = [];
    this.frameIdCounter = 0;
    // Initialize root main() frame
    this.pushFrame('main()', '0x00000000', '0x00000000');
  }

  public pushFrame(functionName: string, returnAddress: string, savedRbp: string): StackFrame {
    const depth = this.frames.length;
    const rbp = this.baseRsp - depth * 0x80;
    const rsp = rbp - 0x20;

    const frame: StackFrame = {
      id: `frame_${++this.frameIdCounter}`,
      functionName,
      returnAddress,
      savedRbp,
      parameters: {},
      locals: {},
      framePointer: `0x${rbp.toString(16).toUpperCase()}`,
      stackPointer: `0x${rsp.toString(16).toUpperCase()}`,
    };

    this.frames.push(frame);
    return frame;
  }

  public popFrame(): StackFrame | undefined {
    if (this.frames.length <= 1) {
      // Don't pop main
      return undefined;
    }
    return this.frames.pop();
  }

  public getCurrentFrame(): StackFrame {
    return this.frames[this.frames.length - 1];
  }

  public setLocal(name: string, value: any, type: string = 'int'): void {
    const frame = this.getCurrentFrame();
    const localCount = Object.keys(frame.locals).length;
    const rbpNum = parseInt(frame.framePointer, 16) || this.baseRsp;
    const localAddr = rbpNum - (localCount + 1) * 4;

    frame.locals[name] = {
      value,
      addressHex: `0x${localAddr.toString(16).toUpperCase()}`,
      type,
    };
  }

  public setParameter(name: string, value: any): void {
    const frame = this.getCurrentFrame();
    frame.parameters[name] = value;
  }

  public getVariable(name: string): any {
    // Look up in current frame locals, then parameters, then fall back to main
    const current = this.getCurrentFrame();
    if (current.locals[name] !== undefined) return current.locals[name].value;
    if (current.parameters[name] !== undefined) return current.parameters[name];

    const main = this.frames[0];
    if (main && main.locals[name] !== undefined) return main.locals[name].value;

    return undefined;
  }

  public getFrames(): StackFrame[] {
    return this.frames.map(f => ({
      ...f,
      parameters: { ...f.parameters },
      locals: { ...f.locals },
    }));
  }
}

import { describe, it, expect } from 'vitest';
import { SimulationRuntime } from '../engine/runtime';

describe('Advanced Engine & DSA Simulation', () => {
  it('executes while loop with break and continue', () => {
    const code = `
i = 0
sum = 0
while i < 10:
    i += 1
    if i == 5:
        continue
    if i > 7:
        break
    sum += i
print(sum)
`;
    const result = SimulationRuntime.execute(code);
    expect(result.error).toBeFalsy();
    const finalSnapshot = result.snapshots[result.snapshots.length - 1];
    const sumVar = finalSnapshot.memory.find(m => m.label === 'sum');
    expect(sumVar?.value).toBe(23);
    expect(finalSnapshot.stdout).toContain('23');
  });

  it('handles binary search divide-and-conquer logic', () => {
    const code = `
arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
target = 23
low = 0
high = 9
found_idx = -1

while low <= high:
    mid = (low + high) // 2
    if arr[mid] == target:
        found_idx = mid
        break
    elif arr[mid] < target:
        low = mid + 1
    else:
        high = mid - 1

print(found_idx)
`;
    const result = SimulationRuntime.execute(code);
    expect(result.error).toBeFalsy();
    const finalSnapshot = result.snapshots[result.snapshots.length - 1];
    const foundVar = finalSnapshot.memory.find(m => m.label === 'found_idx');
    expect(foundVar?.value).toBe(5);
    expect(finalSnapshot.stdout).toContain('5');
  });

  it('supports list append and pop methods', () => {
    const code = `
stack = []
stack.append(10)
stack.append(20)
stack.append(30)
val = stack.pop()
l = len(stack)
print(val)
print(l)
`;
    const result = SimulationRuntime.execute(code);
    expect(result.error).toBeFalsy();
    const finalSnapshot = result.snapshots[result.snapshots.length - 1];
    const valVar = finalSnapshot.memory.find(m => m.label === 'val');
    const lVar = finalSnapshot.memory.find(m => m.label === 'l');
    expect(valVar?.value).toBe(30);
    expect(lVar?.value).toBe(2);
    expect(finalSnapshot.stdout).toContain('30');
    expect(finalSnapshot.stdout).toContain('2');
  });

  it('supports OOP class instantiation and member attribute access', () => {
    const code = `
class Node:
    def __init__(self, val):
        self.val = val
        self.next = 0

n1 = Node(42)
n2 = Node(99)
n1.next = n2
v1 = n1.val
v2 = n1.next.val
print(v1)
print(v2)
`;
    const result = SimulationRuntime.execute(code);
    expect(result.error).toBeFalsy();
    const finalSnapshot = result.snapshots[result.snapshots.length - 1];
    const v1Var = finalSnapshot.memory.find(m => m.label === 'v1');
    const v2Var = finalSnapshot.memory.find(m => m.label === 'v2');
    expect(v1Var?.value).toBe(42);
    expect(v2Var?.value).toBe(99);
    expect(finalSnapshot.stdout).toContain('42');
    expect(finalSnapshot.stdout).toContain('99');
  });

  it('supports recursive function execution with call stack frames', () => {
    const code = `
def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

ans = fib(4)
print(ans)
`;
    const result = SimulationRuntime.execute(code);
    expect(result.error).toBeFalsy();
    const finalSnapshot = result.snapshots[result.snapshots.length - 1];
    const ansVar = finalSnapshot.memory.find(m => m.label === 'ans');
    expect(ansVar?.value).toBe(3);
    expect(finalSnapshot.stdout).toContain('3');
  });
});

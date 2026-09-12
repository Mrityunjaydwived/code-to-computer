export interface CodeExample {
  id: string;
  title: string;
  category: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  code: string;
  highlights: string[];
}

export const CODE_EXAMPLES: CodeExample[] = [
  {
    id: 'arithmetic',
    title: 'Variables & Arithmetic',
    category: 'Beginner',
    description: 'Allocate variables in RAM, load values into registers RAX/RBX, compute sum in ALU, and print output.',
    code: `a = 10
b = 20
c = a + b
print(c)`,
    highlights: ['Register Load', 'ALU ADD Operation', 'Memory Allocation (c=30)', 'Stdout System Call'],
  },
  {
    id: 'conditions',
    title: 'Conditional Branching',
    category: 'Beginner',
    description: 'Evaluate comparison in ALU, set Zero Flag (ZF) and Sign Flag (SF), and branch instruction pointer (RIP).',
    code: `temperature = 35
if temperature > 30:
    status = 1
else:
    status = 0
print(status)`,
    highlights: ['ALU Comparison', 'Flags ZF/SF', 'Conditional JZ Branch', 'Control Flow'],
  },
  {
    id: 'for_loop',
    title: 'For Loop & Accumulator',
    category: 'Beginner',
    description: 'Iterate sequence using RCX loop counter, update accumulator in memory, and jump back to loop header.',
    code: `total = 0
for i in range(5):
    total += i
print(total)`,
    highlights: ['Loop Counter', 'Compound Addition (+=)', 'Branch Backward', 'Register Recycling'],
  },
  {
    id: 'while_countdown',
    title: 'While Loop Countdown',
    category: 'Beginner',
    description: 'Examines loop predicate check, register decrement, and termination upon zero condition.',
    code: `count = 4
while count > 0:
    count -= 1
print(count)`,
    highlights: ['Predicate Evaluation', 'ALU Decrement', 'Loop Termination', 'Zero Flag Detection'],
  },
  {
    id: 'function_call',
    title: 'Function Call & Stack Frame',
    category: 'Intermediate',
    description: 'Pushes caller context and parameters onto Call Stack, sets RBP/RSP, returns result in RAX, and pops frame.',
    code: `def multiply(x, y):
    return x * y

ans = multiply(6, 7)
print(ans)`,
    highlights: ['Stack Frame Push', 'Parameter Binding', 'Return Address', 'Stack Frame Pop'],
  },
  {
    id: 'heap_array',
    title: 'Heap Array Allocation & Indexing',
    category: 'Intermediate',
    description: 'Allocates dynamic contiguous memory block on Heap, calculates byte offset [base + idx * 4], and reads element.',
    code: `arr = [10, 20, 30, 40]
val = arr[2]
print(val)`,
    highlights: ['Heap Dynamic Allocation', 'Pointer Reference', 'Byte Offset Addressing', 'Contiguous Memory'],
  },
  {
    id: 'nested_computation',
    title: 'Nested Operations & Operator Precedence',
    category: 'Intermediate',
    description: 'Demonstrates order of operations, intermediate compiler temporary registers, and ALU precedence.',
    code: `x = 5
y = 10
z = x + y * 2
print(z)`,
    highlights: ['Multiplication before Addition', 'Intermediate Register Staging', 'Expression Tree'],
  },
  {
    id: 'cache_locality',
    title: 'Cache Locality & Memory Hierarchy',
    category: 'Advanced',
    description: 'Sequentially reads elements triggering L1 Cache Hits vs RAM Misses, calculating Effective Access Time.',
    code: `data = [100, 200, 300, 400]
sum = 0
for i in range(4):
    sum += data[i]
print(sum)`,
    highlights: ['L1/L2 Cache Hit Ratio', 'Spatial Locality', 'RAM Latency Penalty', 'Effective Memory Access Time'],
  },
  {
    id: 'heap_mutation',
    title: 'Heap Mutation & Reference Tracking',
    category: 'Advanced',
    description: 'Mutates heap memory block in place, tracing pointer reference counts and reachability from stack frame.',
    code: `buffer = [5, 10, 15]
buffer[1] = 99
result = buffer[1]
print(result)`,
    highlights: ['In-place Heap Mutation', 'Pointer Dereference', 'Reference Count Tracking', 'Memory Segment Split'],
  },
  {
    id: 'binary_search',
    title: 'Binary Search (Log N DSA)',
    category: 'Advanced',
    description: 'Classic competitive programming binary search utilizing while loop, pointer adjustment, and O(log N) divide-and-conquer.',
    code: `arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
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

print(found_idx)`,
    highlights: ['Logarithmic Time O(log N)', 'While Loop with Break', 'Array Pointer Arithmetic', 'Comparison Branching'],
  },
  {
    id: 'two_pointers',
    title: 'Two Pointers: Target Sum',
    category: 'Advanced',
    description: 'Competitive programming two-pointer technique on sorted array to locate two numbers summing to target.',
    code: `numbers = [1, 3, 4, 6, 8, 9, 11]
target = 14
left = 0
right = 6
pair_found = 0

while left < right:
    curr_sum = numbers[left] + numbers[right]
    if curr_sum == target:
        pair_found = 1
        break
    elif curr_sum < target:
        left += 1
    else:
        right -= 1

print(pair_found)`,
    highlights: ['Two Pointer Convergence', 'Linear Time O(N)', 'ALU Comparison', 'Early Break Exit'],
  },
  {
    id: 'fibonacci_recursion',
    title: 'Recursion & Call Stack Frames',
    category: 'Advanced',
    description: 'Recursive computation illustrating call stack growth, base case returns, frame unwind, and RSP/RBP management.',
    code: `def fib(n):
    if n <= 1:
        return n
    return fib(n - 1) + fib(n - 2)

result = fib(5)
print(result)`,
    highlights: ['Deep Stack Frames', 'Base-Case Guard', 'Call & Return Addresses', 'Register Context Preservation'],
  },
  {
    id: 'dp_knapsack',
    title: 'Dynamic Programming: 1D Array',
    category: 'Advanced',
    description: 'Optimal substructure bottom-up tabulation memoizing subproblems in heap memory.',
    code: `dp = [0, 0, 0, 0, 0, 0]
dp[0] = 1
dp[1] = 1

for i in range(2, 6):
    dp[i] = dp[i - 1] + dp[i - 2]

ans = dp[5]
print(ans)`,
    highlights: ['Dynamic Programming Memoization', 'Heap Array Mutation', 'Loop Accumulation', 'Subproblem State Transfer'],
  },
  {
    id: 'linked_list_oop',
    title: 'Linked List OOP (Classes & Pointers)',
    category: 'Advanced',
    description: 'Object-oriented Node class linked via reference pointers simulating dynamic memory allocation.',
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = 0

head = Node(10)
second = Node(20)
head.next = second

val1 = head.val
val2 = head.next.val
print(val1)
print(val2)`,
    highlights: ['Object-Oriented Programming', 'Heap Class Instance Allocation', 'Member Reference Chaining', 'Pointer Dereference'],
  },
  {
    id: 'stack_dsa',
    title: 'Stack DSA (Push & Pop)',
    category: 'Advanced',
    description: 'LIFO data structure with dynamic list appending, popping, and top inspection.',
    code: `stack = []
stack.append(100)
stack.append(200)
stack.append(300)

top_elem = stack.pop()
print(top_elem)
print(len(stack))`,
    highlights: ['LIFO Data Structure', 'Dynamic List .append() / .pop()', 'Built-in len()', 'Heap Buffer Resizing'],
  },
];

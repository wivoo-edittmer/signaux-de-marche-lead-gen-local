# Programming Fundamentals

## Why It Matters for Vibe
AI can generate syntactically correct code that is algorithmically wrong. You need to catch this.

## Must Know

### Data Structures
Know the trade-offs:
- **Array/List**: O(1) access, O(n) search, O(n) insert/delete at front
- **HashMap/Dictionary**: O(1) average case for insert, delete, search
- **Set**: O(1) membership test, no duplicates
- **Stack**: LIFO, O(1) push/pop
- **Queue**: FIFO, O(1) enqueue/dequeue
- **Tree**: Hierarchical, O(log n) search in balanced trees
- **Graph**: Nodes and edges, traversal algorithms

### Algorithms
Know when to use:
- **Sorting**: Quick sort (avg O(n log n)), Merge sort (O(n log n) stable)
- **Searching**: Binary search (O(log n) in sorted arrays)
- **Graph**: BFS (shortest path unweighted), DFS (path finding, cycles)
- **Dynamic Programming**: Overlapping subproblems, optimal substructure
- **Greedy**: Make locally optimal choice at each step

### Complexity Analysis
Always ask:
- What is the time complexity? (Big O)
- What is the space complexity?
- Can this be optimized?

## Design Patterns

### Creational
- **Singleton**: Single instance
- **Factory**: Object creation delegation
- **Builder**: Complex object construction
- **Prototype**: Clone objects

### Structural
- **Adapter**: Interface conversion
- **Decorator**: Add behavior dynamically
- **Facade**: Simplified interface
- **Proxy**: Control access

### Behavioral
- **Observer**: Publish/subscribe
- **Strategy**: Interchangeable algorithms
- **Command**: Encapsulate request as object
- **State**: Alter behavior based on state

## Code Quality Principles
- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion

## Applying with Vibe
- When AI suggests a solution, mentally check the complexity
- If it proposes a nested loop, ask if it can be O(n) instead of O(n²)
- If it uses the wrong data structure, guide it toward the right one
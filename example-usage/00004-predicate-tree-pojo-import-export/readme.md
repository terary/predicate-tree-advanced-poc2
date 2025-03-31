# Predicate Tree POJO Import Export

This document describes a use-case with serialization/deserialization of specialized tree structures.

We use a standard tree with two subtrees in this example to demonstrate the serialization/export (`toPojoAt`) and deserialization/import (`fromPojo`).

The three Trees are:

- PredicateTree (Main tree evaluations logic)
- ArithmeticTree (Subtree tree evaluations Arithmetic)
- NotTree (Subtree tree evaluations negations of it's predicates)

This would represent evaluating logic across mathematical dialects boundaries.

#### Things to note

- The root's parentId is equal to it's node id (this.nodeId === this.parentId)

## Running the Examples

The examples can be executed using Node.js with TypeScript support. To run the examples, navigate to the directory containing the `index.ts` file and execute:

```
npx ts-node ./index.ts [options]
```

Available options:

- `--help, -h`: Show help message
- `--basic, -b`: Run the basic POJO import/export example
- `--complex, -c`: Run the complex POJO import/export example
- `--arithmetic, -a`: Run the arithmetic tree example
- `--all, --all-examples`: Run all examples

Examples:

```
npx ts-node index.ts --basic        # Run the basic POJO example
npx ts-node index.ts --complex      # Run the complex POJO example
npx ts-node index.ts --arithmetic   # Run the arithmetic tree example
npx ts-node index.ts --all          # Run all examples
```

If no options are provided, the complex example will run by default.

## Example Descriptions

### Basic POJO Import/Export Example

This example demonstrates how to serialize and deserialize a simple tree with a NotTree subtree. Key points demonstrated:

1. Importing a tree from a POJO document (`PredicateTree.fromPojo`)
2. Adding a subtree to a node in the tree (`tree.createSubtreeNotTree`)
3. Ensuring subtree identity is preserved during POJO transformations
4. Exporting a tree with subtrees to POJO (`tree.toPojoAt`)
5. Importing the exported POJO back into a tree structure

### Complex POJO Import/Export Example

This example showcases more advanced serialization and deserialization with both NotTree and ArithmeticTree subtrees. Key aspects:

1. Creating an ArithmeticTree subtree with nested operations (`createSubtreeArithmeticTree`)
2. Evaluating arithmetic expressions within the subtree (`arithmeticSubtree.evaluate()`)
3. Complex tree export to POJO with multiple subtree types
4. Preserving evaluation results across POJO export/import cycles
5. Writing the exported POJO to a file for later use

### Arithmetic Operations Example

This example focuses specifically on the ArithmeticTree class and its operations:

1. Basic arithmetic operations (addition, subtraction, multiplication, division)
2. Creating complex expression trees with nested operations
3. POJO serialization of arithmetic expressions
4. Preserving operator precedence and tree structure
5. Demonstration of the `createArithmeticTree` factory function

## Key Classes and Their Import/Export Methods

### PredicateTree

The `PredicateTree` class serves as the main container for logical expressions and can contain subtrees of various types.

**Import (fromPojo)**:

```typescript
static fromPojo(srcPojoTree: TTreePojo<PredicateContent>): PredicateTree
```

The `fromPojo` method reconstructs a tree from a Plain Old JavaScript Object (POJO), identifying subtrees and creating appropriate instances for each one (NotTree or ArithmeticTree). It:

- Identifies the root node
- Recreates the tree structure
- Creates appropriate subtree instances based on the `nodeType` field
- Handles parent-child relationships

**Export (toPojoAt)**:

```typescript
toPojoAt(nodeId: string = this.rootNodeId): Record<string, any>
```

The `toPojoAt` method exports the tree to a POJO structure starting from a specified node (defaults to the root node). It:

- Preserves all node content
- Maintains the tree structure
- Includes subtree type information via the `nodeType` field
- Creates a serializable representation of the entire tree hierarchy

### NotTree

The `NotTree` is a specialized predicate tree that negates the meaning of all predicates within it.

**Import (fromPojo)**:

```typescript
static fromPojo<P extends NotTreePredicateContent>(srcPojoTree: TTreePojo<P>): NotTree
```

The `fromPojo` method creates a NotTree instance from a POJO, and ensures all nodes within it are marked as negated via the `_meta.negated` flag.

**Export (toPojoAt)**:

```typescript
toPojoAt(nodeId: string = this.rootNodeId): Record<string, any>
```

The `toPojoAt` method exports the NotTree to a POJO structure, preserving the negation information and marking the tree with the `nodeType: "subtree:NotTree"` identifier so it can be properly reconstructed during import.

### ArithmeticTree

The `ArithmeticTree` is a specialized tree for representing and evaluating arithmetic expressions.

**Import (fromPojo)**:

```typescript
static fromPojo<P extends ArithmeticContent>(srcPojoTree: TTreePojo<P>): ArithmeticTree
```

The `fromPojo` method recreates an ArithmeticTree from a POJO, preserving the arithmetic operations and operands. This allows the tree to be evaluated after deserialization.

**Export (toPojoAt)**:

```typescript
toPojoAt(nodeId: string = this.rootNodeId): Record<string, any>
```

The `toPojoAt` method exports the ArithmeticTree to a POJO, including necessary information about operators and operands. It marks the tree with the `nodeType: "subtree:ArithmeticTree"` identifier to ensure proper reconstruction.

## Practical Applications

The POJO import/export functionality enables several important use cases:

1. **Storage and Persistence**: Trees can be serialized to JSON and stored in databases or files
2. **Network Transmission**: Trees can be sent over network connections in a serialized format
3. **State Management**: Application state containing complex tree structures can be saved and restored
4. **Undo/Redo Functionality**: Tree states can be captured at different points for history tracking
5. **Cross-System Compatibility**: Trees can be shared between different systems that understand the POJO format

This flexible serialization approach allows complex tree structures with different behaviors (predicates, arithmetic expressions, negations) to be seamlessly converted between runtime objects and serialized representations.

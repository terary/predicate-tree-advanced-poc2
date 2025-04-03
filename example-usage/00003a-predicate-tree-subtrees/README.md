# PredicateTree Subtrees Demonstration

This example demonstrates the core functionality of PredicateTrees with specialized subtrees. Ultimately we'll use Predicate Trees and subtrees to filter build javscript function, that matches specific records (similar to a SQL where clause). Our complex tree will be serialized and deserialized and used to build two functionally identical matcher functions.

## What This Demonstrates

- **Complex Tree Structures**: Building predicate trees with three specialized subtree types (NotTree, PostalAddressTree, ArithmeticTree)
- **Serialization & Deserialization**: Converting trees to/from POJO format while maintaining structure integrity
- **Functional Equivalence**: Ensuring that original and reconstituted trees produce identical matcher functions
- **JavaScript Matcher Generation**: Creating executable JavaScript matcher functions from predicate trees

The demonstration builds a complex tree with all three subtree types, clones it through serialization (POJO), and then validates that both the original and cloned trees produce functionally identical JavaScript matchers.

## Running the Demonstration

To run the demonstration:

```bash
npx ts-node index.ts
```

From within the directory with with the example.\*

## Key Features

- **Subtree Support**: Each specialized subtree contributes different predicates to the final matcher function
- **Serialization**: Trees can be converted to POJO format and back without losing structure or behavior
- **Matcher Function**: The demonstration produces a JavaScript function that can evaluate records against the tree's predicates

The generated matcher functions from both the original and cloned trees will produce identical results when evaluating the same records, proving that functional equivalence is maintained throughout the serialization process.

## Implementation Notes

This implementation focuses on demonstrating core functionality without unnecessary complexity. Unlike some related examples, this demonstration does not use a subject dictionary, keeping the example straightforward and focused on tree behavior.

## Usage

See the examples.

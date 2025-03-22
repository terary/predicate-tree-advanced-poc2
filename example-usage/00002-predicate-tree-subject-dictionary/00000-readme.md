# Predicate Tree with Subject Dictionary Validation

This example demonstrates how to use a subject dictionary to validate predicates before adding them to a predicate tree. This is an advanced use case that builds upon the simple predicate tree example.

## What This Example Shows

1. **Subject Dictionary Creation**: Define a schema that describes the allowed subjects, their data types, and structure
2. **Validated Predicate Tree**: Implement a specialized tree that validates predicates against the subject dictionary
3. **Runtime Validation**: Check predicates before they're added to ensure they meet schema requirements
4. **Error Handling**: Properly handle validation errors with detailed messages
5. **Type Safety**: Ensure values match the expected data types defined in the dictionary

## Key Components

### Subject Dictionary

The subject dictionary serves as a schema for validation, describing:

- What fields (subjects) are allowed
- What data type each field should have
- For complex types (objects, arrays), what their structure should be

```typescript
export const customerProductDictionary: SubjectDictionary = {
  "customer.name": {
    dataType: "string",
  },
  "customer.age": {
    dataType: "number",
  },
  // ... more fields
};
```

### ValidatedPredicateTree

This extends the base `GenericExpressionTree` to add validation before predicates are added:

```typescript
export class ValidatedPredicateTree extends GenericExpressionTree<PredicateContent> {
  private subjectDictionary: SubjectDictionary;

  constructor(subjectDictionary: SubjectDictionary) {
    super();
    this.subjectDictionary = subjectDictionary;
  }

  // Overrides tree methods to add validation
  appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: PredicateContent
  ): string {
    // Validate before adding to tree
    if (nodeContent) {
      this.validatePredicate(nodeContent);
    }
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  // ... other methods
}
```

## Running the Example

When you run this example, it will:

1. Create a validated predicate tree with our subject dictionary
2. Add various predicates that conform to the dictionary
3. Export the resulting tree as a POJO
4. Demonstrate validation errors by attempting to add invalid predicates

## Why Use Subject Dictionary Validation?

In real-world applications, validating predicates against a schema provides several benefits:

- **Data Integrity**: Ensures predicates refer to valid subjects and use appropriate data types
- **Error Prevention**: Catches schema errors early, before tree operations are performed
- **Self-Documentation**: The subject dictionary serves as documentation of the allowed predicates
- **Framework for Advanced Validation**: Can be extended for domain-specific validation rules

This approach is particularly useful in systems where predicate trees are:

- Built dynamically based on user input
- Shared between different components or services
- Used to generate queries or filters for databases or APIs

## Differences from the Simple Example

Unlike the simple predicate tree example, this implementation:

- Uses a formal subject dictionary to define allowed fields
- Performs validation to ensure type conformance
- Handles validation errors gracefully
- Demonstrates both successful and error cases

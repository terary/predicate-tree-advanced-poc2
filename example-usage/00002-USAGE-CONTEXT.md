# Predicate Tree with Subject Dictionary Example (00002-predicate-tree-subject-dictionary)

This example demonstrates how to use a subject dictionary with predicate trees to validate predicates against a schema.

## What This Example Demonstrates

- Creating and using a subject dictionary (schema)
- Validating predicate values against their expected types
- Enforcing schema compliance in predicate trees
- Handling validation errors

## Key Concepts Covered

### Subject Dictionary

A subject dictionary defines the schema for your subjects, specifying what data types are expected for each subject:

```typescript
// Example of a subject dictionary
const subjectDictionary = {
  "customer.name": { datatype: "string" },
  "customer.age": { datatype: "number" },
  "customer.isActive": { datatype: "boolean" },
  "customer.signupDate": { datatype: "date" },
};
```

### Validation Function

Creating a validation function to check predicates against the subject dictionary:

```typescript
function validateNodeContent(content: NodeContent) {
  // Skip validation for junction operators
  if (content.operator === "$and" || content.operator === "$or") {
    return true;
  }

  // Check if subject exists in the dictionary
  if (!content.subject || !subjectDictionary[content.subject]) {
    throw new Error(`Unknown subject: ${content.subject}`);
  }

  const subjectType = subjectDictionary[content.subject].datatype;

  // Validate the value matches the expected type
  switch (subjectType) {
    case "string":
      if (typeof content.value !== "string") {
        throw new Error(`Value for ${content.subject} must be a string`);
      }
      break;
    // Additional type validations...
  }

  return true;
}
```

### Using Validation with Trees

```typescript
// Create a tree with validation
const tree = new GenericExpressionTree();
tree.replaceNodeContent(tree.rootNodeId, { operator: "$and" });

// This will pass validation
tree.appendChildNodeWithContent(
  tree.rootNodeId,
  {
    subject: "customer.age",
    operator: "greaterThan",
    value: 30,
  },
  validateNodeContent
);

// This would throw a validation error
try {
  tree.appendChildNodeWithContent(
    tree.rootNodeId,
    {
      subject: "customer.age",
      operator: "greaterThan",
      value: "thirty", // Type error - should be number
    },
    validateNodeContent
  );
} catch (error) {
  console.error("Validation error:", error.message);
}
```

## Running This Example

```bash
# Navigate to the example directory
cd 00002-predicate-tree-subject-dictionary

# Install dependencies
npm install

# Run the example
npm run start
```

## What You'll Learn

After working through this example, you'll understand:

1. How to create and use a subject dictionary
2. How to enforce type safety in predicate values
3. How to validate predicates before adding them to a tree
4. How to handle validation errors gracefully

This approach is essential for ensuring data consistency when working with predicate trees in applications with defined schemas.

# Example 00001 - Simple Predicate Tree

#### Objective

Demonstrate the use of Predicate Trees with a Subject Dictionary (Field List). Subject Dictionaries are used to validating and labeling Predicates within a Predicate Tree.

Subject Dictionaries are not part of the core PredicateTree library. They are a convention that is commonly used with Predicate Trees. A Subject Dictionary is a list of fields with properties `{fieldId: {prop0:'x', prop1:'y'}}`.

The convention is to use `subjectId` as a unique field identifies within the Subject Dictionary, and use that same subjectId within predicate condition: `{subjectId} {operator} {value}`.

#### Overview

We define a Predicate Tree with a Subject Dictionary and use the Subject Dictionary to validate the predicates and print Human readable labels.

### Usage

`./index-run.sh`

- _May require execution permissions_
- The script will present a help message if no arguments are provided.

### Discussion

All of these examples are contrived but they demonstrate usage of Subject Dictionary with PredicateTrees.

> **Important Note**: Subject Dictionaries are ONLY a convention commonly used to help manipulate nodeContent data. They are only a convention and NEVER part of the core PredicateTree library.

## Examples

- **predicate-tree-validation.ts**: Showcases using Subject Dictionaries and PredicateTrees for validation

- **predicate-tree-non-subject-dictionary.ts**: Showcases using Subject Dictionaries are not necessary for PredicateTrees.

- **predicate-tree-label-subjectdictionary.ts**: Showcases using Subject Dictionaries and PredicateTrees used for multilingual labels.

## Key Takeaways

1. **Validation vs. Flexibility**: The examples illustrate the tradeoff between strict validation (which provides safety) and flexibility (which allows for more dynamic usage).

2. **Subject Dictionaries**: Subject dictionaries serve multiple purposes - from type validation to providing human-readable labels for fields.

3. **Multilingual Support**: By incorporating language labels, predicate trees can power interfaces that present conditions in the user's preferred language.

4. **Tree Structure**: All examples follow a consistent approach to building tree structures, regardless of whether validation is applied.

5. **Self-Verification**: The examples demonstrate how to implement self-checking code to verify that tree structures match expected patterns.

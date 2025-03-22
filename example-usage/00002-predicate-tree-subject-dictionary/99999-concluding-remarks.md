# Concluding Remarks

This directory contains examples demonstrating different approaches to using predicate trees with various features and capabilities.

All of these examples are contrived but they do demonstrate usage of Subject Dictionary with PredicateTrees the are not necessary but very useful that many Expression Tree expression will implement some sort of Subject Dictionary.

> **Important Note**: Subject Dictionaries are ONLY a convention commonly used to help manipulate nodeContent data. They are only a convention and NEVER part of the cores PredicateTree library.

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

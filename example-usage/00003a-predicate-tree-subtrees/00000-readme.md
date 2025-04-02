Hello

# 00003a-predicate-tree-subtrees

## Main Objective

We are basically taken what has been done in `example-usage/00004-predicate-tree-pojo-import-export/common/classes` and copying it. We will alter the shape of nodeContent and we are adding-in and the subjectDictionary features - but that has very little impact on the overall objective.

Make an example of how to use the library (`src/` directory) with keen focus on outputting trees in different formats (javascript matcher). Most of this has already been done in `example-usage/00004-predicate-tree-pojo-import-export/common/classes` WE DO NOT NEED TO REINVENT THE WHEEL.

## Exercise Objective

We want to build an example of javascript matcher function. We have some example code that we can barrow from but this will be different in that it will be fully functional.

In this example we'll use are various trees (PredicateTree, NotTree, PostalAddressTree, ArithmeticTree) to build a more complex tree, and use that to build our matcher function.

Usage will look something like

```javascript
const complexTree = ComplexTree.fromPojo(complexTreePojo);

const matcher = complexTree.buildMatcherFunction();
```

Where Matcher will look something like:

```
matcher:  {
    isMatch: function(record) {
        /// pure javascript
    }
}

```

`record` will be defined from the subject dictionary.

I would expect the matcher body "// pure javascript" to look something like:

```javascript
function matcher(record) {
  return record["address"]["postalCode"] === "12345" && record["age"] > 18;
}
```

## Odd tidbits

- `example-usage/00003a-predicate-tree-subtrees/artifacts/JavascriptMatcher/` All of our files should go into this directory.
- I expect to run `npx ts-node index.ts' to see the example output.
- I expect the output to be pretty basic, clear in purpose.
- We are going to avoid extra niceties. We do not want any additional functionality that is not necessary.
- _VERY IMPORTANT_ We are basically taking the main classes and copying them and changing the shape of nodeContent. _VERY IMPORTANT_ WE ARE NOT REINVENTING THE WHEEL.

- _VERY IMPORTANT_ any \*Tree structure will be a tree structure for the project library. LIKE ALL THE FUCKING EXAMPLES
- _VERY IMPORTANT_ Keep it simple. We are writing to code to demonstrate a small subset of features.
  WE ARE NOT WRITING THE NEXT BEST COMPUTER PROGRAM - KEEP IT SIMPLE, CONCISE, LIMIT THE EXTRA SHIT TO
  A) Works, B), Is useful, C) Directly related to our activities here.
- _VERY IMPORTANT_ any \*Tree structure will be a tree structure for the project library. We are basically taken the existing tree definitions and altering the shape of nodeContent, otherwise the current trees do all we need (mostly). DO NOT REINVENT THE WHEEL.

- Statements like:
  > Based on the readme file, I'll summarize what needs to happen for this project: You need to create a JavaScript matcher function generator using predicate trees.

Are false. Our primary focus to make an example from a pre-existing example.

## References:

- `example-usage/00004-predicate-tree-pojo-import-export/common/classes`
  Several classes the demonstrate pattern/anti-pattern.  
  I very good example of iterating over tree can be found `ArithmeticTree.buildSqlExpression` (example-usage/00004-predicate-tree-pojo-import-export/common/classes/ArithmeticTree.ts),
  there are no loops(THAT IS IMPORTANT), or very tight loops, we do not loop over the tree structure. The inherited classes provide huge functionality to work with trees.

- Similar in purpose
  -- [ArithmeticTree](example-usage/00004-predicate-tree-pojo-import-export/common/classes/ArithmeticTree.ts)
  -- [NotTree](`example-usage/00004-predicate-tree-pojo-import-export/common/classes/NotTree.ts`)
  -- [PostalAddressTree](`example-usage/00004-predicate-tree-pojo-import-export/common/classes/PostalAddressTree.ts`)
  These classes demonstrate a how to accomplish pretty much the same thing we are trying to do. We will incorporate the subject dictionary to write
  true working matcher functions.

- [subject dictionary](src/test-resources/predicate-tree/SubjectsExamples.ts) - this is for demonstration purposes but notice there are fields: label, datatype, and subjectId. This should only serve as an example of what subject dictionaries often look like. The actual definition depends on our purposes.

## Knock-off List (ToDo List)

- [x] Build directory scaffolding for the example
- [x] Build the subject dictionary
- [ ] Build the NotTree (Inclusive of test, javascript interface implementation, human readable explanation)
- [ ] Build the PostalAddressTree (Inclusive of test, javascript interface implementation, human readable explanation)
- [ ] Build the ArithmeticTree (Inclusive of test, javascript interface implementation, human readable explanation)
- [ ] Build the PredicateTree (Inclusive of test, javascript interface implementation, human readable explanation)
- [ ] Write the Readme.md file

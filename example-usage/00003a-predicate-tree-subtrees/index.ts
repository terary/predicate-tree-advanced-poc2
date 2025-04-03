import { PredicateTree } from "./artifacts/JavascriptMatcher/PredicateTree";

// Function to build a complex predicate tree with all three subtree types
function buildComplexPredicateTree(tree: PredicateTree): PredicateTree {
  // Add regular predicates
  tree.appendChildNodeWithContent(tree.rootNodeId, {
    subjectId: "child.0",
    operator: "$eq",
    value: "first field",
  });
  tree.appendChildNodeWithContent(tree.rootNodeId, {
    subjectId: "child.1",
    operator: "$eq",
    value: "second field",
  });

  // Add a NotTree subtree
  const notTree = tree.createNotTreeAt(tree.rootNodeId);
  notTree.appendChildNodeWithContent(notTree.rootNodeId, {
    subjectId: "age",
    operator: "$lt",
    value: 18,
  });

  // Add a PostalAddressTree subtree
  const addressTree = tree.createPostalAddressTreeAt(tree.rootNodeId);
  addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
    subjectId: "postalCode",
    operator: "$eq",
    value: "04240",
  });

  // Add an ArithmeticTree subtree
  const arithmeticTree = tree.createArithmeticTreeAt(tree.rootNodeId);
  arithmeticTree.appendChildNodeWithContent(arithmeticTree.rootNodeId, {
    value: "3",
  });
  const arithmeticTreeAddBranchId = arithmeticTree.appendChildNodeWithContent(
    arithmeticTree.rootNodeId,
    {
      arithmeticOperator: "+",
    }
  );
  arithmeticTree.appendChildNodeWithContent(arithmeticTreeAddBranchId, {
    value: 10,
  });

  return tree;
}

// Create the original tree
const originalTree = buildComplexPredicateTree(new PredicateTree());
console.log("=== PredicateTree Demonstration ===");
console.log("Original tree created with all three subtree types.");

// Serialize to POJO and create a clone
const treeAsPojo = originalTree.toPojoAt();
const clonedTree = PredicateTree.fromPojo(treeAsPojo);
console.log(
  "Successfully cloned the tree from its serialized POJO representation."
);

// Build matcher functions from both trees
const originalMatcher = originalTree.buildMatcherFunction();
const clonedMatcher = clonedTree.buildMatcherFunction();

// Create test records
const passingRecord = {
  "child.0": "first field",
  "child.1": "second field",
  age: 21, // NOT less than 18 (passes NotTree condition)
  postalCode: "04240",
};

const failingRecord = {
  "child.0": "first field",
  "child.1": "second field",
  age: 16, // Less than 18 (fails NotTree condition)
  postalCode: "04240",
};

// Test both matchers with the records
const results = {
  originalMatcherBody: originalTree.buildJavaScriptMatcherBodyAt(
    originalTree.rootNodeId
  ),
  clonedMatcherBody: clonedTree.buildJavaScriptMatcherBodyAt(
    clonedTree.rootNodeId
  ),
  originalMatcher: {
    passingRecord: originalMatcher.isMatch(passingRecord),
    failingRecord: originalMatcher.isMatch(failingRecord),
  },
  clonedMatcher: {
    passingRecord: clonedMatcher.isMatch(passingRecord),
    failingRecord: clonedMatcher.isMatch(failingRecord),
  },
  matcherBodiesIdentical:
    originalTree.buildJavaScriptMatcherBodyAt(originalTree.rootNodeId) ===
    clonedTree.buildJavaScriptMatcherBodyAt(clonedTree.rootNodeId),
};

// Output results in a single log statement
console.log("\nTest Results:", JSON.stringify(results, null, 2));

// Check if both matchers behave identically
if (
  results.matcherBodiesIdentical &&
  results.originalMatcher.passingRecord ===
    results.clonedMatcher.passingRecord &&
  results.originalMatcher.failingRecord === results.clonedMatcher.failingRecord
) {
  console.log(
    "\n✅ Demonstration successful: Original and cloned trees produce identical matchers!"
  );
} else {
  console.log(
    "\n❌ Demonstration failed: Original and cloned trees produce different matchers."
  );
}

// Show the matcher function body
console.log("\nGenerated Matcher Function Body:");
console.log(results.originalMatcherBody);

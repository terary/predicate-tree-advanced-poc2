import { PredicateTree } from "./PredicateTree";
import { TPredicateOperator } from "./types";
import { NotTree } from "./NotTree";
describe("PredicateTree", () => {
  it("should store and retrieve content correctly", () => {
    // Create a tree
    const tree = new PredicateTree();

    // Create content with proper typing
    const content1 = { operator: "$and" as TPredicateOperator };
    const content2 = { operator: "$or" as TPredicateOperator };

    // Add content to tree
    const id1 = tree.appendChildNodeWithContent(tree.rootNodeId, content1);
    const id2 = tree.appendChildNodeWithContent(tree.rootNodeId, content2);

    // Retrieve content
    const retrieved1 = tree.getChildContentAt(id1);
    const retrieved2 = tree.getChildContentAt(id2);

    // Check content is same
    expect(retrieved1).toEqual(content1);
    expect(retrieved2).toEqual(content2);
  });
  it("should create ArithmeticTree correctly.", () => {
    // Create a tree
    const tree = new PredicateTree();
    tree.appendChildNodeWithContent(tree.rootNodeId, {
      subjectId: "child.0",
      operator: "$eq",
      value: "first field",
    });
    const ariTree = tree.createArithmeticTreeAt(tree.rootNodeId);

    const ariTreeAlias = tree.getChildContentAt(ariTree.rootNodeId);

    expect(Object.is(ariTreeAlias, ariTree)).toStrictEqual(true);

    const ariTreeAddNodeId = ariTree.appendChildNodeWithContent(
      ariTree.rootNodeId,
      {
        arithmeticOperator: "+",
      }
    );
    ariTree.appendChildNodeWithContent(ariTree.rootNodeId, {
      value: "99",
    });
    ariTree.appendChildNodeWithContent(ariTreeAddNodeId, {
      value: 100,
    });
    ariTree.appendChildNodeWithContent(ariTreeAddNodeId, {
      value: 101,
    });

    const treePojo = tree.toPojoAt();
    // --

    // Create content with proper typing
    expect(Object.keys(treePojo).length).toStrictEqual(7);
  });
  it("should create all three subtree types correctly in the same tree", () => {
    // Create a main tree
    const tree = new PredicateTree();

    // Create the three different subtree types
    const notTree = tree.createNotTreeAt(tree.rootNodeId);
    const addressTree = tree.createPostalAddressTreeAt(tree.rootNodeId);
    const arithmeticTree = tree.createArithmeticTreeAt(tree.rootNodeId);

    // Verify object identity for each subtree
    const notTreeAlias = tree.getChildContentAt(notTree.rootNodeId) as NotTree;
    const addressTreeAlias = tree.getChildContentAt(addressTree.rootNodeId);
    const arithmeticTreeAlias = tree.getChildContentAt(
      arithmeticTree.rootNodeId
    );

    // Check object identity using Object.is
    expect(Object.is(notTreeAlias, notTree)).toBe(true);
    expect(Object.is(addressTreeAlias, addressTree)).toBe(true);
    expect(Object.is(arithmeticTreeAlias, arithmeticTree)).toBe(true);

    // Verify we can modify each subtree independently
    addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
      subjectId: "city",
    });
    arithmeticTree.appendChildNodeWithContent(arithmeticTree.rootNodeId, {
      value: 42,
    });

    // Get child counts to verify that modifications worked

    const preNotTreeChildrenCount = notTree.getChildrenNodeIdsOf(
      notTree.rootNodeId
    ).length;
    expect(preNotTreeChildrenCount).toBe(0);

    const preNotTreeAliasChildrenCount = notTreeAlias.getChildrenNodeIdsOf(
      notTreeAlias.rootNodeId
    ).length;
    expect(preNotTreeAliasChildrenCount).toBe(0);

    // exercise
    notTree.appendChildNodeWithContent(notTree.rootNodeId, { operator: "$eq" });

    // verify
    const postNotTreeChildrenCount = notTree.getChildrenNodeIdsOf(
      notTree.rootNodeId
    ).length;
    expect(postNotTreeChildrenCount).toBe(1);

    const postNotTreeAliasChildrenCount = notTreeAlias.getChildrenNodeIdsOf(
      notTreeAlias.rootNodeId
    ).length;
    expect(postNotTreeAliasChildrenCount).toBe(1);

    // -------
    const notTreeChildren = notTreeAlias.getChildrenNodeIdsOf(
      notTreeAlias.rootNodeId
    );

    const addressTreeChildren = addressTree.getChildrenNodeIdsOf(
      addressTree.rootNodeId
    );
    const arithmeticTreeChildren = arithmeticTree.getChildrenNodeIdsOf(
      arithmeticTree.rootNodeId
    );

    expect(notTreeChildren.length).toBe(1);
    expect(addressTreeChildren.length).toBe(1);
    expect(arithmeticTreeChildren.length).toBe(1);
  });
  it("should be able to build complex matcher functions, serialize and deserialize.", () => {
    const pTree = buildMegaPredicateTree(new PredicateTree());

    const pTreePojo = pTree.toPojoAt();

    const pTreeClone = PredicateTree.fromPojo(pTreePojo);

    expect(Object.keys(pTreePojo).length).toBe(14);
  });
  it("should be able to build complex matcher function.", () => {
    const pTree = buildMegaPredicateTree(new PredicateTree());

    const pTreePojo = pTree.toPojoAt();

    // Add debug info to see the structure
    console.log(JSON.stringify(pTreePojo, null, 2));
    console.log("Node count:", Object.keys(pTreePojo).length);

    const pTreeClone = PredicateTree.fromPojo(pTreePojo);

    // Build the matcher function
    const matcher = pTree.buildMatcherFunction();

    // Debug the matcher function body
    const matcherFnBody = pTree.buildJavaScriptMatcherBodyAt(pTree.rootNodeId);
    console.log("\nGenerated matcher function body:", matcherFnBody);

    // Create a record that should PASS the matcher
    const passingRecord = {
      "child.0": "first field",
      "child.1": "second field",
      age: 21, // NOT less than 18 (passes NotTree condition)
      postalCode: "04240", // Matches postal code
    };

    // Create a record that should FAIL the matcher (age < 18)
    const failingRecord = {
      "child.0": "first field",
      "child.1": "second field",
      age: 16, // Less than 18 (fails NotTree condition)
      postalCode: "04240", // Matches postal code
    };

    // Test the matcher with both records
    console.log("Passing record result:", matcher.isMatch(passingRecord));
    console.log("Failing record result:", matcher.isMatch(failingRecord));

    // Assertions
    expect(matcher.isMatch(passingRecord)).toBe(true);
    expect(matcher.isMatch(failingRecord)).toBe(false);

    // Let's also check the clone works correctly
    const cloneMatcher = pTreeClone.buildMatcherFunction();
    expect(cloneMatcher.isMatch(passingRecord)).toBe(true);
    expect(cloneMatcher.isMatch(failingRecord)).toBe(false);
  });
  it.only("should be able to build complex functionally identical matcher function from reconstituted tree.", () => {
    // Create the original tree
    const originalTree = buildMegaPredicateTree(new PredicateTree());

    // Convert to POJO for serialization
    const originalTreePojo = originalTree.toPojoAt();

    // Add debug info to see the structure
    console.log(
      "Original tree POJO:",
      JSON.stringify(originalTreePojo, null, 2)
    );
    console.log("Node count:", Object.keys(originalTreePojo).length);

    // Create a clone from the original tree's POJO
    const clonedTree = PredicateTree.fromPojo(originalTreePojo);

    // Create matchers from both trees
    const originalMatcher = originalTree.buildMatcherFunction();
    const clonedMatcher = clonedTree.buildMatcherFunction();

    // Debug the matcher function bodies to confirm they're identical
    const originalMatcherBody = originalTree.buildJavaScriptMatcherBodyAt(
      originalTree.rootNodeId
    );
    const clonedMatcherBody = clonedTree.buildJavaScriptMatcherBodyAt(
      clonedTree.rootNodeId
    );

    console.log("\nOriginal tree matcher function body:", originalMatcherBody);
    console.log("Cloned tree matcher function body:", clonedMatcherBody);

    // Create a record that should PASS the matcher
    const passingRecord = {
      "child.0": "first field",
      "child.1": "second field",
      age: 21, // NOT less than 18 (passes NotTree condition)
      postalCode: "04240", // Matches postal code
    };

    // Create a record that should FAIL the matcher (age < 18)
    const failingRecord = {
      "child.0": "first field",
      "child.1": "second field",
      age: 16, // Less than 18 (fails NotTree condition)
      postalCode: "04240", // Matches postal code
    };

    // Assertions for the original tree
    expect(originalMatcher.isMatch(passingRecord)).toBe(true);
    expect(originalMatcher.isMatch(failingRecord)).toBe(false);

    // Assertions for the cloned tree
    expect(clonedMatcher.isMatch(passingRecord)).toBe(true);
    expect(clonedMatcher.isMatch(failingRecord)).toBe(false);

    // DO NOT REMOVE THIS COMMENT
    // Verify that both matchers produce identical function bodies
    // I am pretty sure 'toBe' works ONLY because we are talking about identical strings
    // Additionally, this may be a bit flaky because we make no guarantees about the order
    // of various predicates... Only functionally equivalency is guaranteed.
    expect(originalMatcherBody).toBe(clonedMatcherBody);
  });
});

function buildMegaPredicateTree(tree: PredicateTree): PredicateTree {
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

  const notTree = tree.createNotTreeAt(tree.rootNodeId);
  notTree.appendChildNodeWithContent(notTree.rootNodeId, {
    subjectId: "age",
    operator: "$lt",
    value: 18,
  });
  const addressTree = tree.createPostalAddressTreeAt(tree.rootNodeId);
  addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
    subjectId: "postalCode",
    operator: "$eq",
    value: "04240",
  });
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
  const arithmeticTreeQtyPriceBranchId =
    arithmeticTree.appendChildNodeWithContent(arithmeticTreeAddBranchId, {
      arithmeticOperator: "*",
    });
  arithmeticTree.appendChildNodeWithContent(arithmeticTreeQtyPriceBranchId, {
    value: "{qty}",
  });
  arithmeticTree.appendChildNodeWithContent(arithmeticTreeQtyPriceBranchId, {
    value: "{price}",
  });

  return tree;
}

import { PredicateTree } from "./PredicateTree";
import { TPredicateOperator } from "./types";
import * as testExpected from "./PredicateTree.test.json";
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
  it("should create NotTree correctly.", () => {
    // Create a tree
    const tree = new PredicateTree();
    tree.appendChildNodeWithContent(tree.rootNodeId, {
      subjectId: "child.0",
      operator: "$eq",
      value: "first field",
    });
    const notTree = tree.createNotTreeAt(tree.rootNodeId);

    const notTreeAlias = tree.getChildContentAt(notTree.rootNodeId);

    expect(Object.is(notTreeAlias, notTree)).toStrictEqual(true);

    const notTreeAddNodeId = notTree.appendChildNodeWithContent(
      notTree.rootNodeId,
      {
        subjectId: "age",
        operator: "$gt",
        value: 18,
      }
    );

    const treePojo = tree.toPojoAt();
    // --

    // Create content with proper typing
    expect(treePojo).toStrictEqual(testExpected.TEST_NOT_TREE_CREATE_POJO);
  });
  it("should create PostalAddressTree correctly.", () => {
    // Create a tree
    const tree = new PredicateTree();
    tree.appendChildNodeWithContent(tree.rootNodeId, {
      subjectId: "child.0",
      operator: "$eq",
      value: "first field",
    });
    const addressTree = tree.createPostalAddressTreeAt(tree.rootNodeId);

    const addressTreeAlias = tree.getChildContentAt(addressTree.rootNodeId);

    expect(Object.is(addressTreeAlias, addressTree)).toStrictEqual(true);

    addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
      subjectId: "postalCode",
      operator: "$gt",
      value: "10000",
    });

    const treePojo = tree.toPojoAt();
    // --

    // Create content with proper typing
    expect(treePojo).toStrictEqual(
      testExpected.TEST_POSTAL_ADDRESS_TREE_CREATE_POJO
    );
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
  it.only("should be able to build complex matcher functions", () => {
    const pTree = buildMegaPredicateTree(new PredicateTree());

    const pTreePojo = pTree.toPojoAt();

    const pTreeClone = PredicateTree.fromPojo(pTreePojo);

    expect(Object.keys(pTreePojo).length).toBe(10);
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

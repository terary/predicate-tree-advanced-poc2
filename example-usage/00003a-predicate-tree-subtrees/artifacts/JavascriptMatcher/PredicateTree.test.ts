import { PredicateTree } from "./PredicateTree";
import { TPredicateOperator } from "./types";
import * as testExpected from "./PredicateTree.test.json";
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
    expect(treePojo).toStrictEqual(
      testExpected.TEST_ARITHMETIC_TREE_CREATE_POJO
    );
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
});

import { AbstractExpressionTree } from "../DirectedGraph/AbstractExpressionTree/AbstractExpressionTree";
import { AbstractObfuscatedExpressionTree } from "./AbstractObfuscatedExpressionTree";
import { isUUIDv4 } from "../common/utilities/isFunctions";
import { makePojo3Children9Grandchildren } from "../DirectedGraph/AbstractExpressionTree/test-utilities";

class TestWidget {
  private _name: string;
  constructor(name: string) {
    this._name = name;
  }

  get name() {
    return this._name;
  }
}

class TestObfuscatedTree<P> extends AbstractObfuscatedExpressionTree<P> {}
class TestClearTextTree<P> extends AbstractExpressionTree<P> {}

describe("AbstractObfuscatedExpressionTree", () => {
  describe("constructor", () => {
    it("Should obfuscate root nodeId", () => {
      const oTree = new TestObfuscatedTree<TestWidget>(new TestClearTextTree());
      expect(oTree.getChildContentAt(oTree.rootNodeId)).toBeNull();

      expect(isUUIDv4(oTree.rootNodeId)).toBe(true);
    });
  });
  describe(".appendContentWithJunction", () => {
    it("Should obfuscate junction ids", () => {
      const oTree = new TestObfuscatedTree<TestWidget>(new TestClearTextTree());
      const widgetRoot = new TestWidget("root");
      const widgetChild_0 = new TestWidget("child_0");

      const junctionNodeIds = oTree.appendContentWithJunction(
        oTree.rootNodeId,
        widgetRoot,
        widgetChild_0
      );

      expect(junctionNodeIds.junctionNodeId).toBe(oTree.rootNodeId);
      expect(isUUIDv4(junctionNodeIds.originalContentNodeId)).toBe(true);
      expect(isUUIDv4(junctionNodeIds.newNodeId)).toBe(true);
      expect(oTree.getChildContentAt(junctionNodeIds.newNodeId)).toBe(widgetChild_0);
    });
  });
  describe("getChildrenNodeIdsOf", () => {
    it("Should return obfuscated nodeIds (keys).", () => {
      const oTree = new TestObfuscatedTree<TestWidget>(new TestClearTextTree());
      const widgetRoot = new TestWidget("root");
      const widgetChild_0 = new TestWidget("child_0");
      const junctionNodeIds = oTree.appendContentWithJunction(
        oTree.rootNodeId,
        widgetRoot,
        widgetChild_0
      );

      const childrenKeys = oTree.getChildrenNodeIdsOf(oTree.rootNodeId);
      expect(childrenKeys.length).toBe(2);
      expect(isUUIDv4(childrenKeys[0])).toBe(true);
      expect(isUUIDv4(childrenKeys[1])).toBe(true);
    });
  });
  describe(".get[child|children|descendant|tree][content|nodeIds]()", () => {
    it("Should return obfuscated nodeIds (keys).", () => {
      const oTree = new TestObfuscatedTree<TestWidget>(new TestClearTextTree());
      const widgetRoot = new TestWidget("root");
      const widgetChild_0 = new TestWidget("child_0");
      const junctionNodeIds = oTree.appendContentWithJunction(
        oTree.rootNodeId,
        widgetRoot,
        widgetChild_0
      );

      // getChildrenContentOf
      const childrenContent = oTree.getChildrenContentOf(oTree.rootNodeId);
      expect(childrenContent).toStrictEqual([null, widgetChild_0]);

      // getDescendantContentOf
      const descendantContent = oTree.getDescendantContentOf(oTree.rootNodeId);
      expect(descendantContent).toStrictEqual([null, widgetChild_0]);

      // getDescendantNodeIds
      const descendantKeys = oTree.getDescendantNodeIds(oTree.rootNodeId);
      expect(descendantKeys.length).toBe(2);
      expect(isUUIDv4(descendantKeys[0])).toBe(true);
      expect(isUUIDv4(descendantKeys[1])).toBe(true);

      // getTreeContentAt
      const treeContent = oTree.getTreeContentAt(oTree.rootNodeId);
      expect(treeContent).toStrictEqual([null, widgetChild_0, widgetRoot]);

      // getTreeNodeIdsAt
      const treeKeys = oTree.getTreeNodeIdsAt(oTree.rootNodeId);
      expect(treeKeys.length).toBe(3);
      expect(isUUIDv4(treeKeys[0])).toBe(true);
      expect(isUUIDv4(treeKeys[1])).toBe(true);
      expect(isUUIDv4(treeKeys[2])).toBe(true);
    });
  });
  describe(".is[Branch|Tree|Leaf]", () => {
    it("Should return accurate values.", () => {
      const oTree = new TestObfuscatedTree<TestWidget>(new TestClearTextTree());
      const widgetRoot = new TestWidget("root");
      const widgetChild_0 = new TestWidget("child_0");
      const junctionNodeIds = oTree.appendContentWithJunction(
        oTree.rootNodeId,
        widgetRoot,
        widgetChild_0
      );

      // .isBranch
      expect(oTree.isBranch(junctionNodeIds.junctionNodeId)).toBe(true);
      expect(oTree.isBranch(junctionNodeIds.newNodeId)).toBe(false);
      // junctionNodeIds.originalContentNodeId
      // .isBranch
      expect(oTree.isLeaf(junctionNodeIds.junctionNodeId)).toBe(false);
      expect(oTree.isLeaf(junctionNodeIds.newNodeId)).toBe(true);

      expect(1).toBe(2);
    });
  });
  describe(".fromPojo", () => {
    it.only("Should create a tree from Plain Ole Javascript Object.", () => {
      const pojo = makePojo3Children9Grandchildren();

      const oTree = TestObfuscatedTree.fromPojo<
        TestWidget,
        TestObfuscatedTree<TestWidget>
        // @ts-ignore - pojo  type definition
      >(pojo);
      const x = oTree.countTotalNodes();
      const tc = oTree.getTreeContentAt(oTree.rootNodeId);
      const tk = oTree.getTreeNodeIdsAt(oTree.rootNodeId);
      expect(oTree.countTotalNodes()).toEqual(13);

      // I think the tree is correct.  However, this._nodeDictionary has one entry
      // which means it's getting stored twice or its getting stored wrong.
      // next subtree
      expect(1).toBe(2);
    });
  });
});

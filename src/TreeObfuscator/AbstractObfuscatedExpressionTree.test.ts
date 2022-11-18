import { AbstractExpressionTree } from "../DirectedGraph/AbstractExpressionTree/AbstractExpressionTree";
import { AbstractObfuscatedExpressionTree } from "./AbstractObfuscatedExpressionTree";
import { isUUIDv4 } from "../common/utilities/isFunctions";
import { TestTreeVisitor } from "./test-helpers/TestTreeVisitor";
import { ITreeVisitor } from "../DirectedGraph/ITree";
import { TGenericNodeContent } from "../DirectedGraph/types";

import {
  makePojo3Children9Grandchildren,
  make3Children2Subtree3Children,
  SortPredicateTest,
} from "../DirectedGraph/AbstractExpressionTree/test-utilities";
import type {
  TJunction,
  TOperand,
  TOperandOperators,
  TPredicateNodeTypes,
  TPredicateTypes,
} from "../DirectedGraph/AbstractExpressionTree/types";
import { ObfuscatedError } from "./ObfuscatedError";
import { values } from "lodash";

class TestWidget {
  private _name: string;
  constructor(name: string) {
    this._name = name;
  }

  get name() {
    return this._name;
  }
}

class TestObfuscatedTree<P> extends AbstractObfuscatedExpressionTree<P> {
  public getIdKeyReverseMap() {
    return this.buildReverseMap();
  }

  public getNodeIdOrThrow(nodeKey: string) {
    return this._getNodeIdOrThrow(nodeKey);
  }
}
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
    });
  });
  describe(".fromPojo", () => {
    it("Should create a tree from Plain Ole Javascript Object.", () => {
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
    });
  });
  describe(".removeNode", () => {
    it("Should remove single node if not single child, elevate single child.", () => {
      class ExposedTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
      const exposedTree = new ExposedTree();
      const {
        dTreeIds,
        // dTree: dTree as ITree<TPredicateTypes>,
        subtree0,
        subtree1,
        originalWidgets: OO,
        //@ts-ignore - not ITree
      } = make3Children2Subtree3Children(exposedTree);

      const privateTree = new TestObfuscatedTree(exposedTree);
      expect(privateTree.countTotalNodes()).toEqual(exposedTree.countTotalNodes());

      const reverseMap = privateTree.getIdKeyReverseMap();
      Object.entries(dTreeIds).forEach(([debugLabel, nodeId]) => {
        dTreeIds[debugLabel] = reverseMap[nodeId];
      });

      // pre conditions
      expect(
        privateTree.getTreeContentAt(dTreeIds["child_0"]).sort(SortPredicateTest)
      ).toStrictEqual(
        [OO["child_0"], OO["child_0_0"], OO["child_0_1"], OO["child_0_2"]].sort(
          SortPredicateTest
        )
      );
      expect(privateTree.countTotalNodes()).toBe(13);

      // exercise 1, has 2 or more siblings
      privateTree.removeNodeAt(dTreeIds["child_0_0"]);

      // post conditions 1
      expect(privateTree.countTotalNodes()).toBe(12);
      expect(
        privateTree.getTreeContentAt(dTreeIds["child_0"]).sort(SortPredicateTest)
      ).toStrictEqual(
        [OO["child_0"], OO["child_0_1"], OO["child_0_2"]].sort(SortPredicateTest)
      );

      // exercise 2 - only 1 sibling
      privateTree.removeNodeAt(dTreeIds["child_0_1"]);

      // post conditions 2
      expect(privateTree.countTotalNodes()).toBe(10);
      expect(
        privateTree.getTreeContentAt(dTreeIds["child_0"]).sort(SortPredicateTest)
      ).toStrictEqual([OO["child_0_2"]].sort(SortPredicateTest));
    });
  });
  describe(".getSiblingIds", () => {
    it("Should return siblings of a given node.", () => {
      class ExposedTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
      const exposedTree = new ExposedTree();
      const {
        dTreeIds,
        // dTree: dTree as ITree<TPredicateTypes>,
        subtree0,
        subtree1,
        originalWidgets: OO,
        //@ts-ignore - not ITree
      } = make3Children2Subtree3Children(exposedTree);

      const privateTree = new TestObfuscatedTree(exposedTree);

      const reverseMap = privateTree.getIdKeyReverseMap();
      Object.entries(dTreeIds).forEach(([debugLabel, nodeId]) => {
        dTreeIds[debugLabel] = reverseMap[nodeId];
      });

      expect(privateTree.getSiblingIds(privateTree.rootNodeId)).toStrictEqual([]);
      expect(privateTree.getSiblingIds(dTreeIds["child_0"])).toStrictEqual([
        dTreeIds["child_1"],
        dTreeIds["child_2"],
      ]);
    });
  });
  describe("private/protected methods", () => {
    it(".getNodeIdOrThrow - will throw if key is not found.", () => {
      class ExposedTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
      const exposedTree = new ExposedTree();
      const privateTree = new TestObfuscatedTree(exposedTree);

      const willThrow = () => {
        privateTree.getNodeIdOrThrow("_DOES_NOT_EXIST_");
      };

      expect(willThrow).toThrow(
        new ObfuscatedError("Failed to find nodeId with key: '_DOES_NOT_EXIST_'.")
      );
    });
  });
  describe("visitors", () => {
    it(".visitAllAt - Blue skies", () => {
      class ExposedTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
      const exposedTree = new ExposedTree();
      const {
        dTreeIds,
        // dTree: dTree as ITree<TPredicateTypes>,
        subtree0,
        subtree1,
        originalWidgets: OO,
        //@ts-ignore - not ITree
      } = make3Children2Subtree3Children(exposedTree);

      const privateTree = new TestObfuscatedTree(exposedTree);

      const reverseMap = privateTree.getIdKeyReverseMap();
      Object.entries(dTreeIds).forEach(([debugLabel, nodeId]) => {
        dTreeIds[debugLabel] = reverseMap[nodeId];
      });

      const parentVisitor = new TestTreeVisitor();
      const subTreeVisitor0 = new TestTreeVisitor();
      const subTreeVisitor1 = new TestTreeVisitor();

      // exercise
      privateTree.visitAllAt(parentVisitor);
      subtree0.visitAllAt(subTreeVisitor0);
      subtree1.visitAllAt(subTreeVisitor1);

      // post conditions
      expect(parentVisitor.contentItems.sort(SortPredicateTest)).toStrictEqual(
        [
          OO["root"],
          OO["child_0"],
          OO["child_0_0"],
          OO["child_0_1"],
          OO["child_0_2"],
          OO["child_1"],
          OO["child_1_0"],
          OO["child_1_1"],
          OO["child_1_2"],
          OO["child_2"],
          OO["child_2_0"],
          OO["child_2_1"],
          OO["child_2_2"],

          OO["subtree0:root"],
          OO["subtree0:child_0"],
          OO["subtree0:child_1"],
          OO["subtree0:child_2"],
          OO["subtree1:root"],
          OO["subtree1:child_0"],
          OO["subtree1:child_1"],
          OO["subtree1:child_2"],
        ].sort(SortPredicateTest)
      );
      expect(subTreeVisitor0.contentItems).toStrictEqual([
        OO["subtree0:root"],
        OO["subtree0:child_0"],
        OO["subtree0:child_1"],
        OO["subtree0:child_2"],
      ]);
      expect(subTreeVisitor1.contentItems).toStrictEqual([
        OO["subtree1:root"],
        OO["subtree1:child_0"],
        OO["subtree1:child_1"],
        OO["subtree1:child_2"],
      ]);

      // const subtreePojo = dTree.toPojo(); dTree should have toPojo,?
    });
    it(".visitLeavesOf - Blue skies", () => {
      class ExposedTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
      const exposedTree = new ExposedTree();
      const {
        dTreeIds,
        // dTree: dTree as ITree<TPredicateTypes>,
        subtree0,
        subtree1,
        originalWidgets: OO,
        //@ts-ignore - not ITree
      } = make3Children2Subtree3Children(exposedTree);

      const privateTree = new TestObfuscatedTree(exposedTree);

      const reverseMap = privateTree.getIdKeyReverseMap();
      Object.entries(dTreeIds).forEach(([debugLabel, nodeId]) => {
        dTreeIds[debugLabel] = reverseMap[nodeId];
      });

      const parentVisitor = new TestTreeVisitor();
      parentVisitor.includeSubtrees = false;
      const parentVisitorWithSubtree = new TestTreeVisitor();
      parentVisitorWithSubtree.includeSubtrees = true;
      const subTreeVisitor0 = new TestTreeVisitor();
      const subTreeVisitor1 = new TestTreeVisitor();

      // exercise
      privateTree.visitLeavesOf(parentVisitor);
      privateTree.visitLeavesOf(parentVisitorWithSubtree);
      subtree0.visitLeavesOf(subTreeVisitor0);
      subtree1.visitLeavesOf(subTreeVisitor1);

      // const x = parentVisitor.contentItems.sort(SortPredicateTest);
      // post conditions
      expect(parentVisitorWithSubtree.contentItems.sort(SortPredicateTest)).toStrictEqual(
        [
          // OO["root"],
          // OO["child_0"],
          OO["child_0_0"],
          OO["child_0_1"],
          OO["child_0_2"],
          // OO["child_1"],
          OO["child_1_0"],
          OO["child_1_1"],
          OO["child_1_2"],
          // OO["child_2"],
          OO["child_2_0"],
          OO["child_2_1"],
          OO["child_2_2"],

          // // OO["subtree0:root"],
          OO["subtree0:child_0"],
          OO["subtree0:child_1"],
          OO["subtree0:child_2"],
          // // OO["subtree1:root"],
          OO["subtree1:child_0"],
          OO["subtree1:child_1"],
          OO["subtree1:child_2"],
        ].sort(SortPredicateTest)
      );

      expect(parentVisitor.contentItems.sort(SortPredicateTest)).toStrictEqual(
        [
          // OO["root"],
          // OO["child_0"],
          OO["child_0_0"],
          OO["child_0_1"],
          OO["child_0_2"],
          // OO["child_1"],
          OO["child_1_0"],
          OO["child_1_1"],
          OO["child_1_2"],
          // OO["child_2"],
          OO["child_2_0"],
          OO["child_2_1"],
          OO["child_2_2"],

          // // OO["subtree0:root"],
          // OO["subtree0:child_0"],
          // OO["subtree0:child_1"],
          // OO["subtree0:child_2"],
          // // OO["subtree1:root"],
          // OO["subtree1:child_0"],
          // OO["subtree1:child_1"],
          // OO["subtree1:child_2"],
        ].sort(SortPredicateTest)
      );
      expect(subTreeVisitor0.contentItems).toStrictEqual([
        // OO["subtree0:root"],
        OO["subtree0:child_0"],
        OO["subtree0:child_1"],
        OO["subtree0:child_2"],
      ]);
      expect(subTreeVisitor1.contentItems).toStrictEqual([
        // OO["subtree1:root"],
        OO["subtree1:child_0"],
        OO["subtree1:child_1"],
        OO["subtree1:child_2"],
      ]);

      // const subtreePojo = dTree.toPojo(); dTree should have toPojo,?
    });
  });
  describe("Integrity Check", () => {
    it.only("It should retrieve  the same object inserted.", () => {
      class ExposedTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
      const exposedTree = new ExposedTree();
      const privateTree = new TestObfuscatedTree(exposedTree);

      const {
        dTreeIds,
        // dTree: dTree as ITree<TPredicateTypes>,
        subtree0,
        subtree1,
        originalWidgets: OO,
        //@ts-ignore - not ITree
      } = make3Children2Subtree3Children(privateTree);

      // const reverseMap = privateTree.getIdKeyReverseMap();
      // Object.entries(dTreeIds).forEach(([debugLabel, nodeId]) => {
      //   dTreeIds[debugLabel] = reverseMap[debugLabel];
      // });

      // exercise
      expect(privateTree.getChildContentAt(dTreeIds["root"])).toBe(OO["root"]);
      expect(privateTree.getChildContentAt(dTreeIds["child_0"])).toBe(OO["child_0"]);
      expect(privateTree.getChildContentAt(dTreeIds["child_0_0"])).toBe(OO["child_0_0"]);
      expect(privateTree.getChildContentAt(dTreeIds["child_0_1"])).toBe(OO["child_0_1"]);
      expect(privateTree.getChildContentAt(dTreeIds["child_0_2"])).toBe(OO["child_0_2"]);

      expect(privateTree.getChildContentAt(dTreeIds["child_1"])).toBe(OO["child_1"]);
      expect(privateTree.getChildContentAt(dTreeIds["child_1_0"])).toBe(OO["child_1_0"]);
      expect(privateTree.getChildContentAt(dTreeIds["child_1_1"])).toBe(OO["child_1_1"]);
      expect(privateTree.getChildContentAt(dTreeIds["child_1_2"])).toBe(OO["child_1_2"]);

      expect(privateTree.getChildContentAt(dTreeIds["child_2"])).toBe(OO["child_2"]);
      expect(privateTree.getChildContentAt(dTreeIds["child_2_0"])).toBe(OO["child_2_0"]);
      expect(privateTree.getChildContentAt(dTreeIds["child_2_1"])).toBe(OO["child_2_1"]);
      expect(privateTree.getChildContentAt(dTreeIds["child_2_2"])).toBe(OO["child_2_2"]);

      expect(privateTree.getChildContentAt(subtree0.rootNodeId)).toBe(subtree0);
      expect(subtree0.getChildContentAt(dTreeIds["subtree0:child_0"])).toBe(
        OO["subtree0:child_0"]
      );
      expect(subtree0.getChildContentAt(dTreeIds["subtree0:child_1"])).toBe(
        OO["subtree0:child_1"]
      );
      expect(subtree0.getChildContentAt(dTreeIds["subtree0:child_2"])).toBe(
        OO["subtree0:child_2"]
      );

      expect(privateTree.getChildContentAt(subtree1.rootNodeId)).toBe(subtree1);
      expect(subtree1.getChildContentAt(dTreeIds["subtree1:child_0"])).toBe(
        OO["subtree1:child_0"]
      );
      expect(subtree1.getChildContentAt(dTreeIds["subtree1:child_1"])).toBe(
        OO["subtree1:child_1"]
      );
      expect(subtree1.getChildContentAt(dTreeIds["subtree1:child_2"])).toBe(
        OO["subtree1:child_2"]
      );
    });
  });
});

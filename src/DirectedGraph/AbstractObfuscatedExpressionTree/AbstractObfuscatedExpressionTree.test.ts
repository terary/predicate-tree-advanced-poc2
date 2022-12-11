import { AbstractExpressionTree } from "../AbstractExpressionTree/AbstractExpressionTree";
import { AbstractObfuscatedExpressionTree } from "./AbstractObfuscatedExpressionTree";
import { isUUIDv4 } from "../../common/utilities/isFunctions";
import { TestTreeVisitor } from "./test-helpers/TestTreeVisitor";
import { ITreeVisitor } from "../ITree";
import { TGenericNodeContent, TTreePojo } from "../types";
import {
  filterPojoContent,
  filterPojoContentPredicateValues,
  WidgetSort,
  // make3Children2Subtree3Children,
} from "./test-helpers/test.utilities";
import {
  makePojo3Children9Grandchildren,
  make3Children2Subtree3Children,
  SortPredicateTest,
} from "../AbstractExpressionTree/test-utilities";
import { ClassTestAbstractExpressionTree } from "../AbstractExpressionTree/AbstractExpressionTree.test";

//const exposedTree = new
//

import type {
  TJunction,
  TOperand,
  TOperandOperators,
  TPredicateNodeTypes,
  TPredicateTypes,
} from "../AbstractExpressionTree/types";
import { ObfuscatedError } from "./ObfuscatedError";
import { values } from "lodash";
import { ChildB } from "../../../dev-debug/ChildB";

class TestWidget {
  private _name: string;
  constructor(name: string) {
    this._name = name;
  }

  get name() {
    return this._name;
  }
}

export class TestObfuscatedTree<P> extends AbstractObfuscatedExpressionTree<P> {
  public getIdKeyReverseMap() {
    return this.buildReverseMap();
  }

  public getNodeIdOrThrow(nodeKey: string) {
    return this._getNodeIdOrThrow(nodeKey);
  }

  public appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<P>
  ): string {
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  public _appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<P>
  ): string {
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);
  }
}
class TestClearTextTree<P> extends AbstractExpressionTree<P> {}

describe("AbstractObfuscatedExpressionTree", () => {
  describe("constructor", () => {
    it("Should obfuscate root nodeId.", () => {
      const oTree = new TestObfuscatedTree<TestWidget>(new TestClearTextTree());
      expect(oTree.getChildContentAt(oTree.rootNodeId)).toBeNull();

      expect(isUUIDv4(oTree.rootNodeId)).toBe(true);
    });

    it("Should internal tree should be optional", () => {
      const oTree = new TestObfuscatedTree<TestWidget>();
      expect(oTree.getChildContentAt(oTree.rootNodeId)).toBeNull();

      expect(isUUIDv4(oTree.rootNodeId)).toBe(true);
    });
  });

  describe(".appendTreeAt()", () => {
    it("Should append tree as child, if target is branch", () => {
      const exposedTree = new ClassTestAbstractExpressionTree();
      const {
        dTreeIds,
        // dTree: dTree as ITree<TPredicateTypes>,
        subtree0,
        subtree1,
        originalWidgets: OO,
        //@ts-ignore - not ITree
      } = make3Children2Subtree3Children(exposedTree);

      const privateTree = new TestObfuscatedTree(exposedTree);
      expect(privateTree.countTotalNodes(undefined, true)).toEqual(
        exposedTree.countTotalNodes(undefined, true)
      );
      expect(privateTree.countTotalNodes(undefined, true)).toEqual(21);

      const reverseMap = privateTree.getIdKeyReverseMap();
      Object.entries(dTreeIds).forEach(([debugLabel, nodeId]) => {
        dTreeIds[debugLabel] = reverseMap[nodeId];
      });

      const appendPredicateRoot = {
        operator: "$and",
      };

      const appendPredicateChild_0 = {
        value: "child_0",
        operator: "$eq",
        subjectId: "customer.firstname",
      };
      const appendPredicateChild_1 = {
        value: "child_0",
        operator: "$eq",
        subjectId: "customer.firstname",
      };

      const appendTreePojo = {
        root: { parentId: "root", nodeContent: appendPredicateRoot },
        child_0: { parentId: "root", nodeContent: appendPredicateChild_0 },
        child_1: { parentId: "root", nodeContent: appendPredicateChild_1 },
      } as TTreePojo<TPredicateNodeTypes>;
      const sourceTree = AbstractObfuscatedExpressionTree.fromPojo<
        TPredicateNodeTypes,
        AbstractObfuscatedExpressionTree<TPredicateNodeTypes>
      >(appendTreePojo);

      expect(
        sourceTree.getTreeContentAt(sourceTree.rootNodeId).sort(SortPredicateTest)
      ).toStrictEqual(
        (
          [
            appendPredicateRoot,
            appendPredicateChild_0,
            appendPredicateChild_1,
          ] as TPredicateNodeTypes[]
        ).sort(SortPredicateTest)
      );

      // exercise
      const toFromKeys = privateTree.appendTreeAt(dTreeIds["child_0_0"], sourceTree);

      // post conditions
      expect(toFromKeys.length).toEqual(4);
      expect(privateTree.getChildContentAt(toFromKeys[0].to)).toBe(appendPredicateRoot);
      expect(privateTree.getChildContentAt(toFromKeys[1].to)).toBe(appendPredicateChild_0);
      expect(privateTree.getChildContentAt(toFromKeys[2].to)).toBe(appendPredicateChild_1);
      expect(privateTree.getChildContentAt(toFromKeys[3].to)).toBe(OO["child_0_0"]);
    });
    it.skip("Should create branch at specified location, append original content and new  tree as child, if target is leaf", () => {});
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
    it("Should append node and change branch junction.", () => {
      const exposedTree = new ClassTestAbstractExpressionTree();
      const {
        dTreeIds,
        // dTree: dTree as ITree<TPredicateTypes>,
        subtree0,
        subtree1,
        originalWidgets: OO,
        //@ts-ignore - not ITree
      } = make3Children2Subtree3Children(exposedTree);

      const privateTree = new TestObfuscatedTree(exposedTree);
      expect(privateTree.countTotalNodes(undefined, true)).toEqual(
        exposedTree.countTotalNodes(undefined, true)
      );
      expect(privateTree.countTotalNodes(undefined, true)).toEqual(21);

      const reverseMap = privateTree.getIdKeyReverseMap();
      Object.entries(dTreeIds).forEach(([debugLabel, nodeId]) => {
        dTreeIds[debugLabel] = reverseMap[nodeId];
      });

      // preCondition
      expect(privateTree.isBranch(dTreeIds["child_0"])).toBe(true);
      expect(
        privateTree.getTreeContentAt(dTreeIds["child_0"]).sort(SortPredicateTest)
      ).toStrictEqual(
        (
          [
            OO["child_0"],
            OO["child_0_0"],
            OO["child_0_1"],
            OO["child_0_2"],
          ] as TPredicateNodeTypes[]
        ).sort(SortPredicateTest)
      );

      // exercise
      privateTree.appendContentWithJunction(
        dTreeIds["child_0"],
        { operator: "$and" },
        { value: "append", operator: "$eq", subjectId: "customer.firstname" }
      );

      //post conditions
      expect(
        privateTree.getTreeContentAt(dTreeIds["child_0"]).sort(SortPredicateTest)
      ).toStrictEqual(
        (
          [
            { operator: "$and" },
            // OO["child_0"],
            OO["child_0_0"],
            OO["child_0_1"],
            OO["child_0_2"],
            { value: "append", operator: "$eq", subjectId: "customer.firstname" },
          ] as TPredicateNodeTypes[]
        ).sort(SortPredicateTest)
      );

      const treePojo = AbstractExpressionTree.obfuscatePojo(privateTree.toPojoAt());
    });
  });
  describe(".cloneAt([nodeId])", () => {
    it("Should create clone at given point", () => {
      const exposedTree = new ClassTestAbstractExpressionTree();
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

      // pre conditions
      expect(
        privateTree.getTreeContentAt(dTreeIds["child_0"]).sort(SortPredicateTest)
      ).toStrictEqual(
        (
          [
            OO["child_0"],
            OO["child_0_0"],
            OO["child_0_1"],
            OO["child_0_2"],
          ] as TPredicateNodeTypes[]
        ).sort(SortPredicateTest)
      );

      // exercise
      const cloneTree = privateTree.cloneAt(dTreeIds["child_0"]);

      // post conditions
      expect(
        cloneTree.getTreeContentAt(cloneTree.rootNodeId).sort(SortPredicateTest)
      ).toStrictEqual(
        (
          [
            OO["child_0"],
            OO["child_0_0"],
            OO["child_0_1"],
            OO["child_0_2"],
          ] as TPredicateNodeTypes[]
        ).sort(SortPredicateTest)
      );
    });
  });
  describe(".getTreeContentAt()", () => {
    it("Should be awesome", () => {
      const exposedTree = new ClassTestAbstractExpressionTree();
      const {
        dTreeIds,
        // dTree: dTree as ITree<TPredicateTypes>,
        subtree0,
        subtree1,
        originalWidgets: OO,
        //@ts-ignore - not ITree
      } = make3Children2Subtree3Children(exposedTree);

      const privateTree = new TestObfuscatedTree(exposedTree);
      expect(privateTree.countTotalNodes(undefined, true)).toEqual(
        exposedTree.countTotalNodes(undefined, true)
      );
      expect(privateTree.countTotalNodes(undefined, true)).toEqual(21);

      const reverseMap = privateTree.getIdKeyReverseMap();
      Object.entries(dTreeIds).forEach(([debugLabel, nodeId]) => {
        dTreeIds[debugLabel] = reverseMap[nodeId];
      });

      // exercise
      const treeContent = privateTree.getTreeContentAt();
      const treeContentWithSubtrees = privateTree.getTreeContentAt(undefined, true);

      expect(treeContent.sort(SortPredicateTest)).toStrictEqual(
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
        ].sort(SortPredicateTest)
      );
      expect(treeContentWithSubtrees.sort(SortPredicateTest)).toStrictEqual(
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

      // getTreeContentAt (with subtrees)
      const shouldIncludeSubtrees = true;
      const treeContentWithSubtrees = oTree.getTreeContentAt(
        oTree.rootNodeId,
        shouldIncludeSubtrees
      );
      expect(treeContentWithSubtrees).toStrictEqual([null, widgetChild_0, widgetRoot]);

      // getTreeNodeIdsAt
      const treeKeys = oTree.getTreeNodeIdsAt(oTree.rootNodeId);
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
      expect(oTree.countTotalNodes()).toEqual(13);
    });
  });

  describe(".toPojo", () => {
    it.skip("Should produce pojo for whole tree.", () => {
      const exposedTree = new ClassTestAbstractExpressionTree();
      const {
        dTreeIds,
        // dTree: dTree as ITree<TPredicateTypes>,
        subtree0,
        subtree1,
        originalWidgets: OO,
        //@ts-ignore - not ITree
      } = make3Children2Subtree3Children(exposedTree);

      const privateTree = new TestObfuscatedTree(exposedTree);
      expect(privateTree.countTotalNodes(undefined, true)).toEqual(
        exposedTree.countTotalNodes(undefined, true)
      );
      expect(privateTree.countTotalNodes(undefined, true)).toEqual(21);

      const reverseMap = privateTree.getIdKeyReverseMap();
      Object.entries(dTreeIds).forEach(([debugLabel, nodeId]) => {
        dTreeIds[debugLabel] = reverseMap[nodeId];
      });

      const treePojo = AbstractExpressionTree.obfuscatePojo(privateTree.toPojoAt());
      const subtree0Pojo = AbstractExpressionTree.obfuscatePojo(
        subtree0.toPojoAt(subtree0.rootNodeId)
      );
      const subtree1Pojo = AbstractExpressionTree.obfuscatePojo(
        subtree1.toPojoAt(subtree1.rootNodeId)
      );

      const pojoContent = filterPojoContent(treePojo);
      const pojoContentValues = filterPojoContentPredicateValues(treePojo);

      expect(Object.keys(treePojo).length).toEqual(21);

      expect(pojoContent.sort(SortPredicateTest)).toStrictEqual(
        privateTree
          .getTreeContentAt(
            privateTree.rootNodeId,
            AbstractObfuscatedExpressionTree.SHOULD_INCLUDE_SUBTREES
          )
          .sort(SortPredicateTest)
      );

      expect(Object.keys(treePojo).length).toEqual(21);
      expect(
        privateTree.countTotalNodes(
          undefined,
          AbstractObfuscatedExpressionTree.SHOULD_INCLUDE_SUBTREES
        )
      ).toEqual(Object.keys(treePojo).length);
      expect(
        subtree0.countTotalNodes(
          undefined,
          AbstractObfuscatedExpressionTree.SHOULD_INCLUDE_SUBTREES
        )
      ).toEqual(Object.keys(subtree0Pojo).length);
      expect(
        subtree1.countTotalNodes(
          undefined,
          AbstractObfuscatedExpressionTree.SHOULD_INCLUDE_SUBTREES
        )
      ).toEqual(Object.keys(subtree1Pojo).length);

      expect(Object.keys(subtree0Pojo).length).toEqual(4);
      expect(Object.keys(subtree1Pojo).length).toEqual(4);
    });
  });

  describe(".removeNode", () => {
    it("Should remove single node if not single child, elevate single child.", () => {
      // class ExposedTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
      // const exposedTree = new ExposedTree();
      const exposedTree = new ClassTestAbstractExpressionTree();

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
      expect(privateTree.countTotalNodes()).toBe(21);

      // exercise 1, has 2 or more siblings
      privateTree.removeNodeAt(dTreeIds["child_0_0"]);

      // post conditions 1
      expect(privateTree.countTotalNodes()).toBe(20);
      expect(
        privateTree.getTreeContentAt(dTreeIds["child_0"]).sort(SortPredicateTest)
      ).toStrictEqual(
        [OO["child_0"], OO["child_0_1"], OO["child_0_2"]].sort(SortPredicateTest)
      );

      // exercise 2 - only 1 sibling
      privateTree.removeNodeAt(dTreeIds["child_0_1"]);

      // post conditions 2
      expect(privateTree.countTotalNodes()).toBe(18);
      expect(
        privateTree.getTreeContentAt(dTreeIds["child_0"]).sort(SortPredicateTest)
      ).toStrictEqual([OO["child_0_2"]].sort(SortPredicateTest));
    });
  });

  describe(".getSiblingIds", () => {
    it("Should return siblings of a given node.", () => {
      // class ExposedTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
      // const exposedTree = new ExposedTree();
      const exposedTree = new ClassTestAbstractExpressionTree();

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
    it(".fromPojoAppendChildNodeWithContent - will throw if key is not found.", () => {
      class ExposedTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
      class ObfuscatedTree extends TestObfuscatedTree<TPredicateNodeTypes> {
        public appendChildNodeWithContentPojo(
          parentNodeKey: string,
          nodeContent: TGenericNodeContent<TPredicateNodeTypes>
        ): string {
          return this.fromPojoAppendChildNodeWithContent(parentNodeKey, nodeContent);
        }
      }
      const exposedTree = new ExposedTree();
      const privateTree = new ObfuscatedTree(exposedTree);

      const willThrow = () => {
        privateTree.appendChildNodeWithContentPojo("_DOES_NOT_EXIST_", { operator: "$or" });
      };

      expect(willThrow).toThrow(
        new ObfuscatedError(
          "Key: '_DOES_NOT_EXIST_' has 0 matches. Can not determine 1:1 mapping."
        )
      );
    });

    it(".fromPojoAppendChildNodeWithContent - will append child node.", () => {
      class ExposedTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
      class ObfuscatedTree extends TestObfuscatedTree<TPredicateNodeTypes> {
        public appendChildNodeWithContentPojo(
          parentNodeKey: string,
          nodeContent: TGenericNodeContent<TPredicateNodeTypes>
        ): string {
          return this.fromPojoAppendChildNodeWithContent(parentNodeKey, nodeContent);
        }

        nodeKeyToNodeId(key: string) {
          return this._getNodeIdOrThrow(key);
        }
        nodeIdToNodeKey(key: string) {
          return super.reverseMapKeys([key]).pop();
        }
      }
      const exposedTree = new ExposedTree();
      const obfusTree = new ObfuscatedTree(exposedTree);
      const nodeContent = { operator: "$or" } as TPredicateNodeTypes;

      const rootNodeId = obfusTree.nodeKeyToNodeId(obfusTree.rootNodeId) as string;

      const nodeId = obfusTree.appendChildNodeWithContentPojo(rootNodeId, nodeContent);
      const nodeKey = obfusTree.nodeIdToNodeKey(nodeId) as string;
      expect(obfusTree.getChildContentAt(nodeKey)).toBe(nodeContent);
    });

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
      // class ExposedTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
      // const exposedTree = new ExposedTree();
      const exposedTree = new ClassTestAbstractExpressionTree();
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
      // class ExposedTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
      // const exposedTree = new ExposedTree();
      const exposedTree = new ClassTestAbstractExpressionTree();
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
    it("It should retrieve  the same object inserted.", () => {
      // class ExposedTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
      // const exposedTree = new ExposedTree();
      const exposedTree = new ClassTestAbstractExpressionTree();
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

      const xr = subtree0.rootNodeId;
      const x = privateTree.getChildContentAt(subtree0.rootNodeId);
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

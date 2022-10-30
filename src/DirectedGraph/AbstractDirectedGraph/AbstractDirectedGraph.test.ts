import { AbstractDirectedGraph } from "./AbstractDirectedGraph";
import { ITree, ITreeVisitor } from "../ITree";
import { TTreePojo } from "../types";
import { TestTreeVisitor } from "../test-helpers/TestTreeVisitor";

import { DirectedGraphError } from "../DirectedGraphError";
import {
  WidgetSort,
  make3Children9GrandchildrenTreeAbstract,
  make3ChildrenSubgraph2Children,
  filterPojoContent,
  WidgetType,
} from "../test-helpers/test.utilities";

class TestAbstractDirectedGraph extends AbstractDirectedGraph<WidgetType> {
  public getParentNodeId(nodeId: string): string {
    return super.getParentNodeId(nodeId);
  }
}

describe("AbstractDirectedGraph", () => {
  describe("constructor", () => {
    it("Should accept optional root nodeContent", () => {
      const originalContent = { label: "root" };
      const testADGDefaultNull = new TestAbstractDirectedGraph(undefined);
      const testADGInitialized = new TestAbstractDirectedGraph(undefined, originalContent);

      const nodeContentDefaultNull = testADGDefaultNull.getChildContent(
        testADGDefaultNull.rootNodeId
      );
      const nodeContentInitialized = testADGInitialized.getChildContent(
        testADGInitialized.rootNodeId
      );

      expect(nodeContentDefaultNull).toBeNull;
      expect(Object.is(nodeContentInitialized, originalContent)).toStrictEqual(true);
    });
  }); // describe('constructor'
  describe(".cloneAt()", () => {
    it("should be awesome", () => {
      const { dTreeIds, dTree, subgraph } = make3ChildrenSubgraph2Children(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );

      const preTreeContent = dTree.getTreeContentAt(dTree.rootNodeId);
      const preSubgraphContent = subgraph.getTreeContentAt(subgraph.rootNodeId);

      // pre condition
      expect(preTreeContent.sort(WidgetSort)).toStrictEqual(
        [
          {
            label: "root",
          },
          {
            label: "child_0",
          },
          {
            label: "child_1",
          },
          {
            label: "child_2",
          },
          {
            label: "subgraph:root",
          },
        ].sort(WidgetSort)
      );

      expect(preSubgraphContent.sort(WidgetSort)).toStrictEqual(
        [
          {
            label: "subgraph:root",
          },
          {
            label: "child_1:subgraph_0",
          },
          {
            label: "child_1:subgraph_1",
          },
        ].sort(WidgetSort)
      );

      // exercise
      const cloneTree = dTree.cloneAt(dTree.rootNodeId);

      // post conditions
      const postTreeContent = cloneTree.getTreeContentAt(cloneTree.rootNodeId);

      const postSubgraphContent = subgraph.getTreeContentAt(cloneTree.rootNodeId);
      // need to find subTree
      expect(postTreeContent.sort(WidgetSort)).toStrictEqual(
        [
          {
            label: "root",
          },
          {
            label: "child_0",
          },
          {
            label: "child_1",
          },
          {
            label: "child_2",
          },
          {
            label: "subgraph:root",
          },
        ].sort(WidgetSort)
      );
    });
  });

  `couple more tests to include subtree - throw error
  consider makingFunction getTreeContent (root+ descendants)
 `;
  describe("counts", () => {
    describe(".countDescendantsOf([nodeId])", () => {
      it("Should return number of descendant.", () => {
        const { dTreeIds, dTree } = make3Children9GrandchildrenTreeAbstract(
          new TestAbstractDirectedGraph() as ITree<WidgetType>
        );
        expect(dTree.countDescendantsOf()).toEqual(dTree.countDescendantsOf(dTree.rootNodeId));
        expect(dTree.countDescendantsOf(undefined)).toEqual(
          dTree.countDescendantsOf(dTree.rootNodeId)
        );
        expect(dTree.countDescendantsOf(dTree.rootNodeId)).toEqual(12);

        expect(dTree.countDescendantsOf(dTreeIds["child_0"])).toEqual(3);
        expect(dTree.countDescendantsOf(dTreeIds["child_0_0"])).toEqual(0);
      });
      it("Should throw error if nodeId does not exist or otherwise not valid.", () => {
        const { dTreeIds, dTree } = make3Children9GrandchildrenTreeAbstract(
          new TestAbstractDirectedGraph() as ITree<WidgetType>
        );
        const willThrowDoesNotExist = () => {
          dTree.countDescendantsOf("_DOES_NOT_EXIST_");
        };

        const willThrowNull = () => {
          // @ts-ignore
          dTree.countDescendantsOf(null);
        };

        expect(willThrowDoesNotExist).toThrow(
          'Tried to retrieve node that does not exist. nodeId: "_DOES_NOT_EXIST_".'
        );
        expect(willThrowNull).toThrow(
          'Tried to retrieve node that does not exist. nodeId: "null".'
        );
      });
    }); // describe('countDescendantsOf'
    describe(".getCountMaxDepthAt([nodeId])", () => {
      it("Should count max depth", () => {
        // setup
        const { dTreeIds, dTree } = make3Children9GrandchildrenTreeAbstract(
          new TestAbstractDirectedGraph() as ITree<WidgetType>
        );
        const sourceNodeId = dTreeIds["child_0"];
        const targetNodeId = dTreeIds["child_1"];

        // preConditions
        expect(dTree.countGreatestDepthOf()).toBe(3);
        expect(dTree.countGreatestDepthOf(targetNodeId)).toBe(2);
        expect(dTree.countGreatestDepthOf(sourceNodeId)).toBe(2);
        expect(dTree.countGreatestDepthOf(dTreeIds["child_0_0"])).toBe(1);

        // exercise
        dTree.move(sourceNodeId, targetNodeId);

        // exercise & postConditions
        expect(dTree.countGreatestDepthOf()).toBe(4);
        expect(dTree.countGreatestDepthOf(targetNodeId)).toBe(3);
        expect(dTree.getChildContent(sourceNodeId)).toBeNull();
        expect(dTree.getChildContent(dTreeIds["child_0_0"])).toBeNull();
      });

      it("Should throw error if supplied nodeId doesn't exist.", () => {
        const { dTreeIds, dTree } = make3Children9GrandchildrenTreeAbstract(
          new TestAbstractDirectedGraph() as ITree<WidgetType>
        );
        const willThrow = () => {
          dTree.countGreatestDepthOf("_DOES_NOT_EXIST_");
        };
        expect(willThrow).toThrow(
          new DirectedGraphError(
            'Tried to retrieve node that does not exist. nodeId: "_DOES_NOT_EXIST_".'
          )
        );
      });
    }); // describe("getCountMaxDepthAt"
    describe(".getCountTotalNodes()", () => {
      it("Should return number of nodes (not nodeContent)", () => {
        const dTree = new TestAbstractDirectedGraph();
        expect(dTree.getCountTotalNodes()).toBe(1);

        dTree.appendChildNodeWithContent(dTree.rootNodeId, { label: "child_0" });
        dTree.appendChildNodeWithContent(dTree.rootNodeId, { label: "child_1" });

        expect(dTree.getCountTotalNodes()).toBe(3);
      });
      it("Should include subtree nodes", () => {
        const dTree = new TestAbstractDirectedGraph();
        expect(dTree.getCountTotalNodes()).toBe(1);

        const childId_0 = dTree.appendChildNodeWithContent(dTree.rootNodeId, {
          label: "child_0",
        });
        const subtree = dTree.createSubGraphAt(childId_0);
        subtree.appendChildNodeWithContent(dTree.rootNodeId, { label: "child_1" });

        expect(dTree.getCountTotalNodes()).toBe(3);
      });
    });
    describe(".countLeavesOf", () => {
      it("Should return count number of leaves", () => {
        // const { dTreeIds, dTree } = make3Children9GrandchildrenTree();

        const { dTreeIds, dTree } = make3Children9GrandchildrenTreeAbstract(
          new TestAbstractDirectedGraph() as ITree<WidgetType>
        );

        // 9 grandchildren
        expect(dTree.countLeavesOf()).toEqual(9);

        // default nodeId is rootNodeId
        expect(dTree.countLeavesOf()).toEqual(dTree.countLeavesOf(dTree.rootNodeId));
        expect(dTree.countLeavesOf(undefined)).toEqual(dTree.countLeavesOf(dTree.rootNodeId));

        // 3 grandchildren
        expect(dTree.countLeavesOf(dTreeIds["child_0"])).toEqual(3);

        // leaf has no leaves
        expect(dTree.countLeavesOf(dTreeIds["child_0_0"])).toEqual(0);
      });

      it.skip("Should throw DirectGraphError if nodeId is not valid.", () => {
        const { dTreeIds, dTree } = make3Children9GrandchildrenTreeAbstract(
          new TestAbstractDirectedGraph() as ITree<WidgetType>
        );

        // const willThrowDoesNotExist = () => {
        //   dTree.countLeavesOf("_DOES_NOT_EXIST_");
        // };

        // const willThrowNull = () => {
        //   // @ts-ignore
        //   dTree.countLeavesOf(null);
        // };

        // expect(willThrowDoesNotExist).toThrow(
        //   new DirectedGraphError(
        //     'Tried to retrieve node that does not exist. nodeId: "_DOES_NOT_EXIST_".'
        //   )
        // );

        // expect(willThrowNull).toThrow(
        //   new DirectedGraphError('Tried to retrieve node that does not exist. nodeId: "null".')
        // );
      });
    }); // describe(".countLeavesOf",
  });

  describe(".getNodeContentByKey", () => {
    it("Should return null if there is no stored value (bad key)", () => {
      const testADG = new TestAbstractDirectedGraph(undefined, { label: "root" });

      // exercise
      const preNodeContent = testADG.getChildContent("_DOES_NOT_EXIST_");

      // post conditions
      expect(preNodeContent).toBeNull;
      expect(preNodeContent).not.toBeUndefined;
    });
  }); // describe('.getNodeContentByKey
  describe(".moveChild(from, to)", () => {
    it("Should move child content to child other", () => {
      const tree = new TestAbstractDirectedGraph(undefined, { label: "root" });
      const childId_0 = tree.appendChildNodeWithContent(tree.rootNodeId, { label: "child_0" });
      const childId_1 = tree.appendChildNodeWithContent(tree.rootNodeId, { label: "child_1" });

      const childId_0_0 = tree.appendChildNodeWithContent(childId_0, { label: "child_0_0" });

      // expect(newChildId.indexOf(childId_1)).toBe(-1);

      // const newChildId = tree.moveChild(childId_0, childId_1);

      // expect(newChildId.indexOf(childId_1)).toBe(0);
    });
  });
  describe(".getTreeNodeIdsAt()", () => {
    it("Should get nodeIds for all descendants and the given nodeId", () => {
      const { dTreeIds, dTree, subgraph } = make3ChildrenSubgraph2Children(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      dTree.appendChildNodeWithContent(dTreeIds["child_0"], { label: "test_child0" });
      dTree.appendChildNodeWithContent(dTreeIds["child_0"], { label: "test_child1" });

      const treeIds = dTree.getTreeNodeIdsAt(dTreeIds["child_0"]);
      const subgraphTreeIds = subgraph.getTreeNodeIdsAt(subgraph.rootNodeId);

      expect(["_root_:0", "_root_:0:6", "_root_:0:7"].sort()).toStrictEqual(treeIds.sort());
      expect(["_root_:1:3", "_root_:1:3:4", "_root_:1:3:5"].sort()).toStrictEqual(
        subgraphTreeIds.sort()
      );
    });
    it("(getTreeContent) Should get nodeContent for all descendants and given root nodeId.", () => {
      const { dTreeIds, dTree, subgraph } = make3ChildrenSubgraph2Children(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      dTree.appendChildNodeWithContent(dTreeIds["child_0"], { label: "test_child0" });
      dTree.appendChildNodeWithContent(dTreeIds["child_0"], { label: "test_child1" });

      const treeContents = dTree.getTreeContentAt(dTreeIds["child_0"]);
      const subgraphTreeContents = subgraph.getTreeContentAt(subgraph.rootNodeId);

      expect(
        [
          {
            label: "child_0",
          },
          {
            label: "test_child0",
          },
          {
            label: "test_child1",
          },
        ].sort(WidgetSort)
      ).toStrictEqual(treeContents.sort(WidgetSort));

      expect(
        [
          {
            label: "subgraph:root",
          },
          {
            label: "child_1:subgraph_0",
          },
          {
            label: "child_1:subgraph_1",
          },
        ].sort()
      ).toStrictEqual(subgraphTreeContents.sort());
    });
  });
  describe(".getChildrenContent", () => {
    // *tmc* - curious but this describe block seems to have little impact on coverage report
    it("Should get all children for given node (root/child).", () => {
      const content0 = { myAwesome: "content0" };
      const content1 = { myAwesome: "content1" };
      const content2 = { myAwesome: "content2" };
      class TestClass extends AbstractDirectedGraph<object> {
        constructor() {
          super();
        }
        getRoodNodeId() {
          return this.rootNodeId;
        }
      }
      const dGraph = new TestClass();
      dGraph.appendChildNodeWithContent(dGraph.getRoodNodeId(), content0);
      dGraph.appendChildNodeWithContent(dGraph.getRoodNodeId(), content1);
      dGraph.appendChildNodeWithContent(dGraph.getRoodNodeId(), content2);
      const childrenContent = dGraph.getChildrenContent(dGraph.getRoodNodeId());
      expect([content0, content1, content2].sort()).toStrictEqual(childrenContent.sort());
    });
    `
      Need to verify or clarify behavior of:
        - createSubgraph(rootSubgraph),  - should throw error
        - if create subgraph, 
          can add additional nodes at that nodeId, 
          does create go into subgraph (no)
          should be invisible in root, root can/does traverse
    `;
    it("Should get all children for given node (root/child) including subtree.", () => {
      const contentRoot = { label: "root" };
      const contentSubtreeRoot = { label: "subtreeroot" };
      const contentGrandChild = { label: "grandChild" };
      const content0 = { label: "content0" };
      const content1 = { label: "content1" };
      const content2 = { label: "content2" };
      const content3 = { label: "content3" };
      const dGraph = new TestAbstractDirectedGraph();
      dGraph.replaceNodeContent(dGraph.rootNodeId, contentRoot);

      const childId_0 = dGraph.appendChildNodeWithContent(dGraph.rootNodeId, content0);
      const childId_1 = dGraph.appendChildNodeWithContent(dGraph.rootNodeId, content3);

      const subtree = dGraph.createSubGraphAt(dGraph.rootNodeId);
      subtree.replaceNodeContent(subtree.rootNodeId, contentSubtreeRoot);

      subtree.appendChildNodeWithContent(subtree.rootNodeId, content1);
      const stChild_1 = subtree.appendChildNodeWithContent(subtree.rootNodeId, content2);
      subtree.appendChildNodeWithContent(stChild_1, contentGrandChild);

      const dTreeChildrenContent = dGraph.getChildrenContent(dGraph.rootNodeId);
      expect(dTreeChildrenContent.sort(WidgetSort)).toStrictEqual(
        [contentSubtreeRoot, content0, content3].sort(WidgetSort)
      );

      const subtreeContent = subtree.getChildrenContent(subtree.rootNodeId);
      expect([content1, content2].sort()).toStrictEqual(subtreeContent.sort());
    });

    it("Should get all childrenIds for given node (child/grandChild).", () => {
      class TestClass extends AbstractDirectedGraph<object> {
        constructor() {
          super();
        }
        getRoodNodeId() {
          return this.rootNodeId;
        }
        public getChildrenNodeIds(parentNodeId = this.getRoodNodeId()) {
          return super.getChildrenNodeIds(parentNodeId);
        }
      }

      const content0 = { myAwesome: "content0" };
      const content1 = { myAwesome: "content1" };
      const content2 = { myAwesome: "content2" };
      const content3 = { myAwesome: "content3" };
      const content4 = { myAwesome: "content4" };

      // I am not sure there is a public use for getChildrenIds
      // There is likely a case for getChildrenContent?

      const dGraph = new TestClass();
      const childId0 = dGraph.appendChildNodeWithContent(dGraph.getRoodNodeId(), content0);
      const childId1 = dGraph.appendChildNodeWithContent(dGraph.getRoodNodeId(), content1);

      const grandChild0 = dGraph.appendChildNodeWithContent(childId1, content2);
      const grandChild1 = dGraph.appendChildNodeWithContent(childId1, content3);
      const grandChild2 = dGraph.appendChildNodeWithContent(childId1, content4);
      const childrenIds = dGraph.getChildrenNodeIds(childId1);
      expect(childrenIds.sort()).toStrictEqual([grandChild0, grandChild1, grandChild2].sort());
    });

    it("Should be safe to use duplicate values.", () => {
      // The key store uses object.is to compare values. That has oddities when
      // using string type, not String type.
      // DictionaryGraph MUST ALWAYS provide unique string for keys to keyStore.

      const content0 = "string_0";
      class TestClass extends AbstractDirectedGraph<string> {
        constructor() {
          super();
        }
        getRoodNodeId() {
          return this.rootNodeId;
        }
        public getChildrenNodeIds(parentNodeId = this.getRoodNodeId()) {
          return super.getChildrenNodeIds(parentNodeId);
        }
      }
      const dGraph = new TestClass();
      const childId0 = dGraph.appendChildNodeWithContent(dGraph.getRoodNodeId(), content0);
      const childId1 = dGraph.appendChildNodeWithContent(dGraph.getRoodNodeId(), content0);

      const grandChild_0_0 = dGraph.appendChildNodeWithContent(childId0, content0);
      const grandChild_1_0 = dGraph.appendChildNodeWithContent(childId1, content0);
      const grandChild_1_1 = dGraph.appendChildNodeWithContent(childId1, content0);
      const grandChild_1_2 = dGraph.appendChildNodeWithContent(childId1, content0);
      const childrenIds = dGraph.getChildrenNodeIds(childId1);
      expect(childrenIds.sort()).toStrictEqual(
        [grandChild_1_0, grandChild_1_1, grandChild_1_2].sort()
      );
    });
    it("Should empty if subtree called from parent, should be tree content if called from subtree.", () => {
      const dTree = new TestAbstractDirectedGraph();

      const childId_0 = dTree.appendChildNodeWithContent(dTree.rootNodeId, {
        label: "child_0",
      });

      const subtree1 = dTree.createSubGraphAt(childId_0);
      subtree1.appendChildNodeWithContent(subtree1.rootNodeId, { label: "child_1" });

      const subtreeContent = dTree.getChildrenContent(subtree1.rootNodeId);
      const subtreeContent2 = subtree1.getChildrenContent(subtree1.rootNodeId);
      const treeContent = dTree.getChildrenContent(dTree.rootNodeId);

      expect(subtreeContent).toStrictEqual([]);
      expect(subtreeContent2).toStrictEqual([{ label: "child_1" }]);
      expect(treeContent).toStrictEqual([{ label: "child_0" }]);
    });
  }); // describe(".getChildrenContent"

  describe(".getDescendantContent()", () => {
    // there were no tests in DirectedGraph - coming back to this
    it("Should get all children for given node (root/child).", () => {
      const content0 = { label: "content0" };
      const content1 = { label: "content1" };
      const content2 = { label: "content2" };

      const dGraph = new TestAbstractDirectedGraph();
      dGraph.appendChildNodeWithContent(dGraph.rootNodeId, content2);

      const child_0 = dGraph.appendChildNodeWithContent(dGraph.rootNodeId, content0);
      dGraph.appendChildNodeWithContent(child_0, content1);

      const childrenContent = dGraph.getDescendantContent(dGraph.rootNodeId);
      expect([content0, content1, content2].sort(WidgetSort)).toStrictEqual(
        childrenContent.sort(WidgetSort)
      );
    });
    it("Should get all children for given node (root/child).", () => {
      const rootContent = { label: "root" };
      const subtreeRootContent = { label: "subtreeroot" };

      const subtreeContent0 = { label: "subtreeContent0" };
      const subtreeContent1 = { label: "subtreeContent1" };

      const content0 = { label: "content0" };
      const content1 = { label: "content1" };

      const dGraph = new TestAbstractDirectedGraph(undefined, rootContent);
      const child_0 = dGraph.appendChildNodeWithContent(dGraph.rootNodeId, content0);
      const subgraph = dGraph.createSubGraphAt(child_0);

      subgraph.replaceNodeContent(subgraph.rootNodeId, subtreeRootContent);
      // dGraph.appendChildNodeWithContent(dGraph.rootNodeId, content0); // used for subtree
      dGraph.appendChildNodeWithContent(child_0, content1);
      subgraph.appendChildNodeWithContent(subgraph.rootNodeId, subtreeContent0);
      subgraph.appendChildNodeWithContent(subgraph.rootNodeId, subtreeContent1);

      const childrenContent = dGraph.getDescendantContent(dGraph.rootNodeId);
      expect(childrenContent.sort(WidgetSort)).toStrictEqual(
        [
          // rootContent,
          content0,
          content1,
          subtreeRootContent,
          subtreeContent0,
          subtreeContent1,
        ].sort(WidgetSort)
      );
      const subtreeContent = subgraph.getDescendantContent(subgraph.rootNodeId);
      expect(subtreeContent.sort(WidgetSort)).toStrictEqual(
        [
          // rootContent,
          // content0,
          // content1,
          // subtreeRootContent,
          subtreeContent0,
          subtreeContent1,
        ].sort(WidgetSort)
      );
    });
    it("Should get all children for given node (root/child).", () => {
      const rootContent = { label: "root" };
      const subtreeRootContent = { label: "subtreeroot" };

      const subtreeContent0 = { label: "subtreeContent0" };
      const subtreeContent1 = { label: "subtreeContent1" };

      const content0 = { label: "content0" };
      const content1 = { label: "content1" };

      const dGraph = new TestAbstractDirectedGraph(undefined, rootContent);
      const child_0 = dGraph.appendChildNodeWithContent(dGraph.rootNodeId, content0);
      const subgraph = dGraph.createSubGraphAt(child_0);

      subgraph.replaceNodeContent(subgraph.rootNodeId, subtreeRootContent);
      // dGraph.appendChildNodeWithContent(dGraph.rootNodeId, content0); // used for subtree
      dGraph.appendChildNodeWithContent(child_0, content1);
      subgraph.appendChildNodeWithContent(subgraph.rootNodeId, subtreeContent0);
      subgraph.appendChildNodeWithContent(subgraph.rootNodeId, subtreeContent1);

      const willThrow = () => {
        subgraph.getDescendantContent(dGraph.rootNodeId);
      };
      expect(willThrow).toThrow(
        new DirectedGraphError('Tried to retrieve node that does not exist. nodeId: "_root_".')
      );
    });
  });

  describe(".getParentNodeId()", () => {
    it("Should determine parent node id from child id.", () => {
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;
      expect(dTree.getParentNodeId(dTreeIds["child_0_0"])).toBe(dTreeIds["child_0"]);
      expect(dTree.getParentNodeId(dTreeIds["child_0"])).toBe(dTreeIds["root"]);
      expect(dTree.getParentNodeId(dTreeIds["root"])).toBe(dTreeIds["root"]);
    });
    it("Should throw error if childId doesn't exist.", () => {
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;
      const willThrow = () => {
        dTree.getParentNodeId("_DOES_NOT_EXIST_");
      };

      expect(willThrow).toThrow(
        new DirectedGraphError("Could not derive parent nodeId from '_DOES_NOT_EXIST_'.")
      );
      // --------------
    });
    it("Should throw error if childId is undefined.", () => {
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;
      const willThrow = () => {
        // @ts-ignore - it's the test case
        dTree.getParentNodeId(undefined);
      };

      expect(willThrow).toThrow(
        new DirectedGraphError("Could not derive parent nodeId from 'undefined'.")
      );
      // --------------
    });
  });
  describe(".getSiblingIds(nodeId)", () => {
    it("Should return the Ids of siblings of a given node.", () => {
      const { dTreeIds, dTree, subgraph } = make3ChildrenSubgraph2Children(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      expect(dTree.getSiblingIds(dTree.rootNodeId)).toStrictEqual([]);

      expect(dTree.getSiblingIds(dTreeIds["child_0"])).toStrictEqual([
        dTreeIds["child_1"],
        dTreeIds["child_2"],
      ]);

      expect(dTree.getSiblingIds(dTreeIds["child_1"])).toStrictEqual([
        dTreeIds["child_0"],
        dTreeIds["child_2"],
      ]);

      expect(subgraph.getSiblingIds(subgraph.rootNodeId)).toStrictEqual([]);

      expect(subgraph.getSiblingIds(dTreeIds["child_1:subgraph_0"])).toStrictEqual([
        dTreeIds["child_1:subgraph_1"],
      ]);
    });
    it("Should throw error if nodeId is not found.", () => {
      const { dTreeIds, dTree, subgraph } = make3ChildrenSubgraph2Children(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );

      const willThrowForUndefined = () => {
        dTree.getSiblingIds(undefined as unknown as string);
      };
      const willThrowForNotFound = () => {
        dTree.getSiblingIds("_DOES_NOT_EXIST_");
      };

      expect(willThrowForUndefined).toThrow(
        new DirectedGraphError("Could not derive parent nodeId from 'undefined'.")
      );
      expect(willThrowForNotFound).toThrow(
        new DirectedGraphError("Could not derive parent nodeId from '_DOES_NOT_EXIST_'.")
      );
    });
  });
  describe(".getSubgraphIdsAt()", () => {
    it("Should get an array of subgraph ids", () => {
      const { dTreeIds, dTree, subgraph } = make3ChildrenSubgraph2Children(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );

      const subgraphIds = dTree.getSubgraphIdsAt(dTree.rootNodeId);

      expect(subgraphIds.length).toBe(1);
      expect(subgraphIds[0]).toStrictEqual(subgraph.rootNodeId);
    });
  });
  describe("isFunctions", () => {
    it(".isLeaf(nodeId) / .isBranch(nodeId) / .isRoot(nodeId) / .isSubtree", () => {
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      dTreeIds["subtree-parent"] = dTree.appendChildNodeWithContent(dTree.rootNodeId, {
        label: "subtree-parent",
      });
      const subtree = dTree.createSubGraphAt(dTreeIds["subtree-parent"]);
      subtree.replaceNodeContent(subtree.rootNodeId, { label: "subtree-root" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtree:0" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtree:2" });
      dTreeIds["subtreeRoot"] = subtree.rootNodeId;

      const sourceNodeId = dTreeIds["child_0"];
      const targetNodeId = dTreeIds["child_1"];
      dTree.move(sourceNodeId, targetNodeId);

      expect(Object.is(subtree, dTree.getChildContent(dTreeIds["subtreeRoot"]))).toStrictEqual(
        true
      );

      expect(dTree.isRoot(dTree.rootNodeId)).toStrictEqual(true);
      expect(dTree.isBranch(dTree.rootNodeId)).toStrictEqual(true);
      expect(dTree.isLeaf(dTree.rootNodeId)).toStrictEqual(false);
      expect(dTree.isSubtree(dTree.rootNodeId)).toStrictEqual(false);

      expect(dTree.isRoot(targetNodeId)).toStrictEqual(false);
      expect(dTree.isBranch(targetNodeId)).toStrictEqual(true);
      expect(dTree.isLeaf(targetNodeId)).toStrictEqual(false);
      expect(dTree.isSubtree(targetNodeId)).toStrictEqual(false);

      expect(dTree.isRoot(dTreeIds["child_0_0"])).toStrictEqual(false);
      expect(dTree.isBranch(dTreeIds["child_0_0"])).toStrictEqual(false);
      expect(dTree.isLeaf(dTreeIds["child_0_0"])).toStrictEqual(true);
      expect(dTree.isSubtree(dTreeIds["child_0_0"])).toStrictEqual(false);

      expect(dTree.isSubtree(subtree.rootNodeId)).toStrictEqual(true);
      expect(dTree.isSubtree(dTreeIds["subtreeRoot"])).toStrictEqual(true);

      // const willThrowIsRoot = () => {
      //   dTree.isRoot("_DOES_NOT_EXIST_");
      // };

      // const willThrowIsBranch = () => {
      //   dTree.isBranch("_DOES_NOT_EXIST_");
      // };

      const willThrowIsLeaf = () => {
        dTree.isLeaf("_DOES_NOT_EXIST_");
      };

      // expect(willThrowIsRoot).toThrow(
      //   new DirectedGraphError(
      //     'Tried to retrieve node that does not exist. nodeId: "_DOES_NOT_EXIST_".'
      //   )
      // );

      // expect(willThrowIsBranch).toThrow(
      //   new DirectedGraphError(
      //     'Tried to retrieve node that does not exist. nodeId: "_DOES_NOT_EXIST_".'
      //   )
      // );

      // expect(willThrowIsLeaf).toThrow(
      //   new DirectedGraphError(
      //     'Tried to retrieve node that does not exist. nodeId: "_DOES_NOT_EXIST_".'
      //   )
      // );
    });
  });
  describe(".replaceNodeContent", () => {
    it("Should replace content of a given node. (ideal)", () => {
      const rootContent = { label: "root" };
      const replaceContent = { label: "replaceContent" };

      const content0 = { label: "content0" };

      const dGraph = new TestAbstractDirectedGraph(undefined, rootContent);
      const child_0 = dGraph.appendChildNodeWithContent(dGraph.rootNodeId, content0);

      // preCondition
      expect(Object.is(dGraph.getChildContent(child_0), content0)).toBeTruthy();

      // exercise
      dGraph.replaceNodeContent(child_0, replaceContent);

      // postCondition
      expect(Object.is(dGraph.getChildContent(child_0), replaceContent)).toBeTruthy();
    });
    it("Should replace content of a given node. (subtree)", () => {
      const rootContent = { label: "root" };
      const replaceContent = { label: "replaceContent" };

      const content0 = { label: "content0" };

      const dGraph = new TestAbstractDirectedGraph(undefined, rootContent);
      const subTree = dGraph.createSubGraphAt(dGraph.rootNodeId);
      const child_0 = subTree.appendChildNodeWithContent(dGraph.rootNodeId, content0);

      // preCondition
      expect(Object.is(subTree.getChildContent(child_0), content0)).toBeTruthy();

      // exercise
      subTree.replaceNodeContent(child_0, replaceContent);

      // postCondition
      expect(Object.is(subTree.getChildContent(child_0), replaceContent)).toBeTruthy();
    });
    it("Should throw error when attempting to replaceRoot content with tree.", () => {
      const rootContent = { label: "root" };

      const content0 = { label: "content0" };

      const dGraph = new TestAbstractDirectedGraph(undefined, rootContent);
      const subtree = dGraph.createSubGraphAt(dGraph.rootNodeId);

      const willThrow = () => {
        // @ts-ignore
        dGraph.replaceNodeContent(dGraph.rootNodeId, subtree);
      };

      expect(willThrow).toThrow(new DirectedGraphError("Can not replace root with subgraph."));
    });
  });
  describe("Visitors", () => {
    it(".visitAllAt(...) - Should visit all nodes by default.", () => {
      const treeVisitor = new TestTreeVisitor();
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      dTree.visitAllAt(treeVisitor);
      expect(treeVisitor.rootNodeIds).toStrictEqual([dTree.rootNodeId]);

      expect(treeVisitor.countUniqueVisits).toBe(13);
      expect(treeVisitor.contentItems.sort(WidgetSort)).toStrictEqual(
        [
          { label: "root" },
          { label: "child_0" },
          { label: "child_0_0" },
          { label: "child_0_1" },
          { label: "child_0_2" },
          { label: "child_1" },
          { label: "child_1_0" },
          { label: "child_1_1" },
          { label: "child_1_2" },
          { label: "child_2" },
          { label: "child_2_0" },
          { label: "child_2_1" },
          { label: "child_2_2" },
        ].sort(WidgetSort)
      );
    });
    it(".visitAllAt(...) - Should visit only nodes within the 'at' nodeId branch.", () => {
      const TreeVisitor = new TestTreeVisitor();
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      dTree.visitAllAt(TreeVisitor, dTreeIds["child_0"]);
      expect(TreeVisitor.rootNodeIds).toStrictEqual(["_root_:0"]);

      expect(TreeVisitor.countUniqueVisits).toBe(4);
      expect(TreeVisitor.contentItems.sort(WidgetSort)).toStrictEqual(
        [
          { label: "child_0" },
          { label: "child_0_0" },
          { label: "child_0_1" },
          { label: "child_0_2" },
        ].sort(WidgetSort)
      );
    });
    it(".visitAllAt(...) - Should visit all nodes by default. (with subGraph)", () => {
      const TreeVisitor = new TestTreeVisitor();
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      const subGraph = dTree.createSubGraphAt(dTree.rootNodeId);
      subGraph.replaceNodeContent(subGraph.rootNodeId, { label: "subGraphRoot" });
      subGraph.appendChildNodeWithContent(subGraph.rootNodeId, { label: "subGraphChild0" });
      subGraph.appendChildNodeWithContent(subGraph.rootNodeId, { label: "subGraphChild1" });

      dTree.visitAllAt(TreeVisitor);

      expect(TreeVisitor.rootNodeIds).toStrictEqual([dTree.rootNodeId, subGraph.rootNodeId]);
      expect(TreeVisitor.countUniqueVisits).toBe(16);
      expect(TreeVisitor.contentItems.sort(WidgetSort)).toStrictEqual(
        [
          { label: "root" },
          { label: "child_0" },
          { label: "child_0_0" },
          { label: "child_0_1" },
          { label: "child_0_2" },
          { label: "child_1" },
          { label: "child_1_0" },
          { label: "child_1_1" },
          { label: "child_1_2" },
          { label: "child_2" },
          { label: "child_2_0" },
          { label: "child_2_1" },
          { label: "child_2_2" },
          { label: "subGraphRoot" },
          { label: "subGraphChild0" },
          { label: "subGraphChild1" },
        ].sort(WidgetSort)
      );
    });
    it(".visitAllAt(...) - Should *not* visit subtree nodes if 'includeSubtree' is false.", () => {
      const TreeVisitor = new TestTreeVisitor();
      TreeVisitor.includeSubtrees = false;
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      const subGraph = dTree.createSubGraphAt(dTree.rootNodeId);
      subGraph.replaceNodeContent(subGraph.rootNodeId, { label: "subGraphRoot" });
      subGraph.appendChildNodeWithContent(subGraph.rootNodeId, { label: "subGraphChild0" });
      subGraph.appendChildNodeWithContent(subGraph.rootNodeId, { label: "subGraphChild1" });

      dTree.visitAllAt(TreeVisitor);

      expect(TreeVisitor.rootNodeIds).toStrictEqual([dTree.rootNodeId]);
      expect(TreeVisitor.countUniqueVisits).toBe(13);
      expect(TreeVisitor.contentItems.sort(WidgetSort)).toStrictEqual(
        [
          { label: "root" },
          { label: "child_0" },
          { label: "child_0_0" },
          { label: "child_0_1" },
          { label: "child_0_2" },
          { label: "child_1" },
          { label: "child_1_0" },
          { label: "child_1_1" },
          { label: "child_1_2" },
          { label: "child_2" },
          { label: "child_2_0" },
          { label: "child_2_1" },
          { label: "child_2_2" },
          // { label: "subGraphRoot" },
          // { label: "subGraphChild0" },
          // { label: "subGraphChild1" },
        ].sort(WidgetSort)
      );
    });

    // add 'traverseSubtree' or something to visitor type

    it(".visitAllAt(...) - Should visit subtree nodes if 'includeSubtree' is undefined.", () => {
      // const doNotIncludeSubtree = false;
      const TreeVisitor = new TestTreeVisitor();
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      const subGraph = dTree.createSubGraphAt(dTree.rootNodeId);
      subGraph.replaceNodeContent(subGraph.rootNodeId, { label: "subGraphRoot" });
      subGraph.appendChildNodeWithContent(subGraph.rootNodeId, { label: "subGraphChild0" });
      subGraph.appendChildNodeWithContent(subGraph.rootNodeId, { label: "subGraphChild1" });

      dTree.visitAllAt(TreeVisitor);
      expect(TreeVisitor.rootNodeIds).toStrictEqual([dTree.rootNodeId, subGraph.rootNodeId]);
      expect(TreeVisitor.countUniqueVisits).toBe(16);
      expect(TreeVisitor.contentItems.sort(WidgetSort)).toStrictEqual(
        [
          { label: "root" },
          { label: "child_0" },
          { label: "child_0_0" },
          { label: "child_0_1" },
          { label: "child_0_2" },
          { label: "child_1" },
          { label: "child_1_0" },
          { label: "child_1_1" },
          { label: "child_1_2" },
          { label: "child_2" },
          { label: "child_2_0" },
          { label: "child_2_1" },
          { label: "child_2_2" },
          { label: "subGraphRoot" },
          { label: "subGraphChild0" },
          { label: "subGraphChild1" },
        ].sort(WidgetSort)
      );
    });
    it(".visitAllAt(...) - Should visit all nodes by default. (with subGraph)", () => {
      // *tmc* is this the same as above?
      const TreeVisitor = new TestTreeVisitor();
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      const subGraph = dTree.createSubGraphAt(dTree.rootNodeId);
      subGraph.replaceNodeContent(subGraph.rootNodeId, { label: "subGraphRoot" });
      subGraph.appendChildNodeWithContent(subGraph.rootNodeId, { label: "subGraphChild0" });
      subGraph.appendChildNodeWithContent(subGraph.rootNodeId, { label: "subGraphChild1" });

      dTree.visitAllAt(TreeVisitor);

      expect(TreeVisitor.rootNodeIds).toStrictEqual([dTree.rootNodeId, subGraph.rootNodeId]);
      expect(TreeVisitor.countUniqueVisits).toBe(16);

      expect(TreeVisitor.contentItems.sort(WidgetSort)).toStrictEqual(
        [
          { label: "root" },
          { label: "child_0" },
          { label: "child_0_0" },
          { label: "child_0_1" },
          { label: "child_0_2" },
          { label: "child_1" },
          { label: "child_1_0" },
          { label: "child_1_1" },
          { label: "child_1_2" },
          { label: "child_2" },
          { label: "child_2_0" },
          { label: "child_2_1" },
          { label: "child_2_2" },
          { label: "subGraphRoot" },
          { label: "subGraphChild0" },
          { label: "subGraphChild1" },
        ].sort(WidgetSort)
      );
    });

    it(".visitAllAt(...) - Should visit all nodes by default. (with subGraph, includeSubtree=false)", () => {
      // *tmc* is this the same as above?
      const TreeVisitor = new TestTreeVisitor();
      TreeVisitor.includeSubtrees = false;

      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      const subGraph = dTree.createSubGraphAt(dTree.rootNodeId);
      subGraph.replaceNodeContent(subGraph.rootNodeId, { label: "subGraphRoot" });
      subGraph.appendChildNodeWithContent(subGraph.rootNodeId, { label: "subGraphChild0" });
      subGraph.appendChildNodeWithContent(subGraph.rootNodeId, { label: "subGraphChild1" });

      dTree.visitAllAt(TreeVisitor);

      expect(TreeVisitor.rootNodeIds).toStrictEqual([dTree.rootNodeId]);
      expect(TreeVisitor.countUniqueVisits).toBe(13);

      expect(TreeVisitor.contentItems.sort(WidgetSort)).toStrictEqual(
        [
          { label: "root" },
          { label: "child_0" },
          { label: "child_0_0" },
          { label: "child_0_1" },
          { label: "child_0_2" },
          { label: "child_1" },
          { label: "child_1_0" },
          { label: "child_1_1" },
          { label: "child_1_2" },
          { label: "child_2" },
          { label: "child_2_0" },
          { label: "child_2_1" },
          { label: "child_2_2" },
          // { label: "subGraphRoot" },
          // { label: "subGraphChild0" },
          // { label: "subGraphChild1" },
        ].sort(WidgetSort)
      );
    });
    it(".visitAllAt(...) - Should throw DirectedGraphError if trying to replace root with subtree.", () => {
      const dTree = new TestAbstractDirectedGraph();
      const subGraph = dTree.createSubGraphAt(dTree.rootNodeId);
      const willThrow = () => {
        // @ts-ignore - subGraph not a WidgetType
        dTree.replaceNodeContent(dTree.rootNodeId, subGraph);
      };

      expect(willThrow).toThrow(new DirectedGraphError("Can not replace root with subgraph."));
    });
    it(".visitLeavesOf(...) - Should visit all nodes by default.", () => {
      const TreeVisitor = new TestTreeVisitor();
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      const subGraph = dTree.createSubGraphAt(dTree.rootNodeId);
      subGraph.replaceNodeContent(subGraph.rootNodeId, { label: "subGraphRoot" });
      subGraph.appendChildNodeWithContent(subGraph.rootNodeId, { label: "subGraphChild0" });
      subGraph.appendChildNodeWithContent(subGraph.rootNodeId, { label: "subGraphChild1" });

      dTree.visitLeavesOf(TreeVisitor);
      expect(TreeVisitor.rootNodeIds).toStrictEqual([]);
      expect(TreeVisitor.countUniqueVisits).toBe(11);
      expect(TreeVisitor.contentItems.sort(WidgetSort)).toStrictEqual(
        [
          { label: "child_0_0" },
          { label: "child_0_1" },
          { label: "child_0_2" },
          { label: "child_1_0" },
          { label: "child_1_1" },
          { label: "child_1_2" },
          { label: "child_2_0" },
          { label: "child_2_1" },
          { label: "child_2_2" },
          { label: "subGraphChild0" },
          { label: "subGraphChild1" },
        ].sort(WidgetSort)
      );
    });
  }); // describe("Visitors"
  describe("SubTree POJO to/from", () => {
    it("Should be awesome", () => {
      const parentVisitor = new TestTreeVisitor();
      const subTreeVisitor = new TestTreeVisitor();
      const { dTreeIds, dTree, subgraph } = make3ChildrenSubgraph2Children(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );

      dTree.visitAllAt(parentVisitor);
      subgraph.visitAllAt(subTreeVisitor);
      expect(parentVisitor.contentItems.sort(WidgetSort)).toStrictEqual(
        [
          { label: "root" },
          { label: "child_0" },
          { label: "child_1" },
          { label: "child_2" },
          { label: "subgraph:root" },
          { label: "child_1:subgraph_0" },
          { label: "child_1:subgraph_1" },
        ].sort(WidgetSort)
      );
      expect(subTreeVisitor.contentItems).toStrictEqual([
        { label: "subgraph:root" },
        { label: "child_1:subgraph_0" },
        { label: "child_1:subgraph_1" },
      ]);

      // const subtreePojo = dTree.toPojo(); dTree should have toPojo,?
    });
    it("Should be able to convert tree to Pojo, and instantiate new identical tree with given Pojo.", () => {
      const { dTreeIds, dTree, subgraph } = make3ChildrenSubgraph2Children(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );

      const treePojo = dTree.toPojo() as TTreePojo<WidgetType>;

      const subgraphPojo = subgraph.toPojo() as TTreePojo<WidgetType>;

      const reTree = TestAbstractDirectedGraph.fromPojo(
        treePojo,
        undefined,
        TestAbstractDirectedGraph
      );
      const reSubtreeFromPojo = TestAbstractDirectedGraph.fromPojo(
        subgraphPojo,
        undefined,
        TestAbstractDirectedGraph
      );

      const reTreeContents = filterPojoContent(reTree.toPojo());
      const reSubtreeContents = filterPojoContent(reSubtreeFromPojo.toPojo());
      const dTreeContents = filterPojoContent(dTree.toPojo());
      const originalSubgraphContents = subgraph.getDescendantContent(subgraph.rootNodeId);
      originalSubgraphContents.push(subgraph.getChildContent(subgraph.rootNodeId));

      expect(originalSubgraphContents.sort(WidgetSort)).toStrictEqual(
        reSubtreeContents.sort(WidgetSort)
      );
      expect(reTreeContents.sort(WidgetSort)).toStrictEqual(dTreeContents.sort(WidgetSort));
    });

    it("Should throw error for orphan nodes.", () => {
      const orphanNodePojo = {
        _root_: { parentId: "_root_", nodeContent: { label: "root" } },
        child0: { parentId: "_root_", nodeContent: { label: "child0" } },
        child1: { parentId: "_root_", nodeContent: { label: "child1" } },
        orphan: { parentId: "_DOES_NOT_EXIST_", nodeContent: { label: "orphan" } },
      };
      const willThrow = () => {
        const dTree = TestAbstractDirectedGraph.fromPojo(
          orphanNodePojo,
          undefined,
          TestAbstractDirectedGraph
        );
      };
      expect(willThrow).toThrow(
        new DirectedGraphError("Orphan nodes detected while parson pojo object.")
      );
    });

    it("Should be able to create subTree export/import.", () => {
      // const { dTreeIds, dTree } = make3Children9GrandchildrenTree();
      const { dTreeIds, dTree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as ITree<WidgetType>
      );

      const subtreePojo = dTree.toPojoAt(dTreeIds["child_0"]);

      const subTreeContent = filterPojoContent(subtreePojo);
      expect(subTreeContent).toStrictEqual([
        { label: "child_0" },
        { label: "child_0_0" },
        { label: "child_0_1" },
        { label: "child_0_2" },
      ]);
      const newTree = AbstractDirectedGraph.fromPojo<WidgetType>(
        subtreePojo,
        undefined,
        TestAbstractDirectedGraph
      );
      expect(newTree.getChildContent(newTree.rootNodeId)).toStrictEqual({ label: "child_0" });
      const actualChildContent = newTree.getChildrenContent(newTree.rootNodeId);
      expect(actualChildContent).toStrictEqual([
        { label: "child_0_0" },
        { label: "child_0_1" },
        { label: "child_0_2" },
      ]);
    });
  }); // subtree fromPojo
  describe("AbstractDirectedGraph.fromPOJO", () => {
    it("Should create tree from pojo object. (ideal)", () => {
      const treeJsonString =
        '{"e883f4a3-b021-4ebe-8e41-ddef57e18624":{"parentId":"e883f4a3-b021-4ebe-8e41-ddef57e18624","nodeContent":{"label":"root"}},"4fca03eb-0f55-4851-814d-bbce9227486f":{"parentId":"e883f4a3-b021-4ebe-8e41-ddef57e18624","nodeContent":{"label":"child_0"}},"a4e88f12-93fb-416c-9f64-6cf7cfe2925d":{"parentId":"4fca03eb-0f55-4851-814d-bbce9227486f","nodeContent":{"label":"child_0_0"}},"d54acedf-912f-422f-9412-b530b0a815f4":{"parentId":"4fca03eb-0f55-4851-814d-bbce9227486f","nodeContent":{"label":"child_0_1"}},"6019df67-4dd3-4644-854b-7f2978408949":{"parentId":"4fca03eb-0f55-4851-814d-bbce9227486f","nodeContent":{"label":"child_0_2"}},"ebb08b47-7c62-4515-a3b4-1c569b03220d":{"parentId":"e883f4a3-b021-4ebe-8e41-ddef57e18624","nodeContent":{"label":"child_1"}},"18a8db96-c924-4cc5-853b-03bcb36da227":{"parentId":"ebb08b47-7c62-4515-a3b4-1c569b03220d","nodeContent":{"label":"child_1_0"}},"25791177-7b24-416f-b25c-54ed52fb53e2":{"parentId":"ebb08b47-7c62-4515-a3b4-1c569b03220d","nodeContent":{"label":"child_1_1"}},"758e30f5-d0af-476e-bbf0-45356b4848bc":{"parentId":"ebb08b47-7c62-4515-a3b4-1c569b03220d","nodeContent":{"label":"child_1_2"}},"2d2b98c3-e8fc-4dc3-b161-1469d1c04ea2":{"parentId":"e883f4a3-b021-4ebe-8e41-ddef57e18624","nodeContent":{"label":"child_2"}},"8586a3ca-8f71-4d6c-a414-5f0557a6e217":{"parentId":"2d2b98c3-e8fc-4dc3-b161-1469d1c04ea2","nodeContent":{"label":"child_2_0"}},"69d3aa07-e25f-45ca-af8b-820f9525f17c":{"parentId":"2d2b98c3-e8fc-4dc3-b161-1469d1c04ea2","nodeContent":{"label":"child_2_1"}},"58c712ac-0d75-4512-bee2-a795f52ecf8b":{"parentId":"2d2b98c3-e8fc-4dc3-b161-1469d1c04ea2","nodeContent":{"label":"child_2_2"}}}';
      const treePojoObject = JSON.parse(treeJsonString);
      const dTree = AbstractDirectedGraph.fromPojo(
        treePojoObject,
        undefined,
        AbstractDirectedGraph
      );
      const childrenIds = dTree.getChildrenNodeIds(dTree.rootNodeId);
      const content = [
        dTree.getChildContent(dTree.rootNodeId),
        ...dTree.getChildrenContent(dTree.rootNodeId),
      ];
      childrenIds.forEach((childId) => {
        const childContent = dTree.getChildrenContent(childId);
        content.push(...(childContent as any[]));
      });
      expect(content).toStrictEqual([
        { label: "root" },
        { label: "child_0" },
        { label: "child_1" },
        { label: "child_2" },

        { label: "child_0_0" },
        { label: "child_0_1" },
        { label: "child_0_2" },

        { label: "child_1_0" },
        { label: "child_1_1" },
        { label: "child_1_2" },

        { label: "child_2_0" },
        { label: "child_2_1" },
        { label: "child_2_2" },
      ]);
    });
    it("Should create subtrees if Pojo contains nodeType::subtree.", () => {
      const treePojoObject = {
        root: { parentId: "root", nodeContent: { label: "root" } },
        child_0: { parentId: "root", nodeContent: { label: "child_0" } },
        child_1: { parentId: "root", nodeContent: { label: "child_1" } },
        child_2: { parentId: "root", nodeContent: { label: "child_2" } },
        child_1_subtree: {
          parentId: "child_1",
          nodeType: "subtree",
          nodeContent: { label: "subtree-root" },
        },
        child_1_subtree_0: {
          parentId: "child_1_subtree",
          nodeContent: { label: "subtree:0" },
        },
        child_1_subtree_1: {
          parentId: "child_1_subtree",
          nodeContent: { label: "subtree:1" },
        },
      };

      const dTree = AbstractDirectedGraph.fromPojo(
        treePojoObject,
        undefined,
        AbstractDirectedGraph
      );

      const rootAndChildrenContent = [
        dTree.getChildContent(dTree.rootNodeId),
        ...dTree.getChildrenContent(dTree.rootNodeId),
      ];
      const rootAndGrandchildrenContent = rootAndChildrenContent.slice();
      const childrenIds = dTree.getChildrenNodeIds(dTree.rootNodeId);
      childrenIds.forEach((childId) => {
        const childContent = dTree.getChildrenContent(childId);
        rootAndGrandchildrenContent.push(...(childContent as any[]));
      });

      const rootAndDescendantContent = [
        dTree.getChildContent(dTree.rootNodeId),
        ...dTree.getDescendantContent(dTree.rootNodeId),
      ];

      expect(rootAndChildrenContent).toStrictEqual([
        { label: "root" },
        { label: "child_0" },
        { label: "child_1" },
        { label: "child_2" },
      ]);
      expect(rootAndGrandchildrenContent).toStrictEqual([
        { label: "root" },
        { label: "child_0" },
        { label: "child_1" },
        { label: "child_2" },
        { label: "subtree-root" },
      ]);
      expect(rootAndDescendantContent.sort(WidgetSort)).toStrictEqual(
        [
          { label: "root" },
          { label: "child_0" },
          { label: "child_1" },
          { label: "child_2" },

          { label: "subtree-root" },
          { label: "subtree:0" },
          { label: "subtree:1" },
        ].sort(WidgetSort)
      );
    });
    it("Should throw error if no root is found.", () => {
      const pojoObj = {
        child1: { parentId: "root1", nodeContent: { label: "child1" } },
        child00: { parentId: "child1", nodeContent: { label: "child00" } },
        child2: { parentId: "root1", nodeContent: { label: "child2" } },
      };

      const willThrow = () => {
        AbstractDirectedGraph.fromPojo(pojoObj, undefined, AbstractDirectedGraph);
      };

      expect(willThrow).toThrow(
        new DirectedGraphError(
          "No distinct root found. There must exist on and only one nodeId === {parentId}. Found 0."
        )
      );
    });
    it("Should throw error more than one root is found.", () => {
      const pojoObj = {
        root0: { parentId: "root0", nodeContent: { label: "root0" } },
        root1: { parentId: "root1", nodeContent: { label: "root1" } },
        child1: { parentId: "root1", nodeContent: { label: "child1" } },
        child2: { parentId: "root1", nodeContent: { label: "child2" } },
      };

      const willThrow = () => {
        AbstractDirectedGraph.fromPojo(pojoObj, undefined, AbstractDirectedGraph);
      };
      expect(willThrow).toThrow(
        new DirectedGraphError(
          "No distinct root found. There must exist on and only one nodeId === {parentId}. Found 2."
        )
      );
    });
    it("Should throw error orphans are found.", () => {
      const pojoObj = {
        root1: { parentId: "root1", nodeContent: { label: "root1" } },
        child1: { parentId: "root1", nodeContent: { label: "child1" } },
        child00: { parentId: "child1", nodeContent: { label: "child00" } },
        child2: { parentId: "_ORPHAN_", nodeContent: { label: "child2" } },
      };

      const willThrow = () => {
        AbstractDirectedGraph.fromPojo(pojoObj, undefined, AbstractDirectedGraph);
      };

      expect(willThrow).toThrow(
        new DirectedGraphError("Orphan nodes detected while parson pojo object.")
      );
    });
  }); // describe('DirectedGraph.fromPOJO'
});

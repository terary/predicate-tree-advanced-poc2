const todo = `
        
Write out different options for 'calculations'
if you choose to 'negate' 
  - as subtree
  - as singular node
  - as integrated in the operations ('ne' vs 'eq').  Do all operations have negations?
What if we want to use as arithmetic
What if we want to use as file/director/disk structure
What if we Date Validation to use as file/director/disk structure


What if I want to use this to calculate permission tree
How would this work with rest, rest represent a path, but what is the tree?
Understand and make clear in any writing that 'negate' is for only predicate trees 
Compare 3 trees, predicate,  arithmetic, (1 other)
  what are the different implementations

`;

import { AbstractDirectedGraph } from "./AbstractDirectedGraph";
import { IDirectedGraph, ITreeVisitor } from "../ITree";
import { TTreePojo, TNodePojo, TGenericNodeContent } from "../types";
import { DirectedGraphError } from "../DirectedGraphError";

import { TestTreeVisitor } from "../test-helpers/TestTreeVisitor";
import {
  WidgetSort,
  make3Children9GrandchildrenTreeAbstract,
  make3ChildrenSubtree2Children,
  make3Children2Subtree3Children,
  filterPojoContent,
  WidgetType,
} from "./test.utilities";
class TestAbstractDirectedGraph extends AbstractDirectedGraph<WidgetType> {
  public getParentNodeId(nodeId: string): string {
    return super.getParentNodeId(nodeId);
  }
}

describe("AbstractDirectedGraph", () => {
  it("Should pass simple smoke test.", () => {
    const parentVisitor = new TestTreeVisitor();
    const wholeTreeVisitor = new TestTreeVisitor();
    const subTreeVisitor = new TestTreeVisitor();
    parentVisitor.includeSubtrees = false;
    wholeTreeVisitor.includeSubtrees = true;

    const { dTreeIds, dTree, subtree } = make3ChildrenSubtree2Children(
      new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
    );
    dTree.visitAllAt(parentVisitor);
    dTree.visitAllAt(wholeTreeVisitor);
    subtree.visitAllAt(subTreeVisitor);

    expect(parentVisitor.contentItems.sort(WidgetSort)).toStrictEqual(
      [
        { label: "root" },
        { label: "child_0" },
        { label: "child_1" },
        { label: "child_2" },
      ].sort(WidgetSort)
    );
    expect(wholeTreeVisitor.contentItems.sort(WidgetSort)).toStrictEqual(
      [
        { label: "root" },
        { label: "child_0" },
        { label: "child_1" }, // test data changes this to '{ label: "subtree:root" }'
        { label: "child_2" },
        { label: "subtree:root" },
        { label: "child_1:subtree_0" },
        { label: "child_1:subtree_1" },
      ].sort(WidgetSort)
    );
    expect(subTreeVisitor.contentItems).toStrictEqual([
      { label: "subtree:root" },
      { label: "child_1:subtree_0" },
      { label: "child_1:subtree_1" },
    ]);
  });

  describe("constructor", () => {
    it("Should accept optional root nodeContent", () => {
      const originalContent = { label: "root" };
      const testADGDefaultNull = new TestAbstractDirectedGraph(undefined);
      const testADGInitialized = new TestAbstractDirectedGraph(undefined, originalContent);

      const nodeContentDefaultNull = testADGDefaultNull.getChildContentAt(
        testADGDefaultNull.rootNodeId
      );
      const nodeContentInitialized = testADGInitialized.getChildContentAt(
        testADGInitialized.rootNodeId
      );

      expect(nodeContentDefaultNull).toBeNull;
      expect(Object.is(nodeContentInitialized, originalContent)).toStrictEqual(true);
    });
  }); // describe('constructor'

  describe(".cloneAt()", () => {
    it("Should create clone at specific node", () => {
      const { dTreeIds, dTree, subtree } = make3ChildrenSubtree2Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      const preTreeContent = dTree.getTreeContentAt(dTreeIds["root"]);

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
        ].sort(WidgetSort)
      );

      // exercise
      const cloneTree = dTree.cloneAt(dTreeIds["child_0"]);

      // post conditions
      const postTreeContent = cloneTree.getTreeContentAt(cloneTree.rootNodeId);
      expect(postTreeContent.sort(WidgetSort)).toStrictEqual(
        [
          // this is not a mistake. The object containing the IDs is misaligned a little.
          // It has something to do with the nodeId vs. nodeContent not being the same thing
          {
            label: "child_0",
          },
        ].sort(WidgetSort)
      );
    });
    it("Should create clone at specific node - default root", () => {
      const { dTreeIds, dTree, subtree } = make3ChildrenSubtree2Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      const preTreeContent = dTree.getTreeContentAt();
      const preSubtreeContent = subtree.getTreeContentAt();

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
        ].sort(WidgetSort)
      );

      expect(preSubtreeContent.sort(WidgetSort)).toStrictEqual(
        [
          {
            label: "subtree:root",
          },
          {
            label: "child_1:subtree_0",
          },
          {
            label: "child_1:subtree_1",
          },
        ].sort(WidgetSort)
      );

      // exercise
      const cloneTree = dTree.cloneAt(dTree.rootNodeId);

      // post conditions
      const postTreeContent = cloneTree.getTreeContentAt(cloneTree.rootNodeId);
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
        ].sort(WidgetSort)
      );
    });
    it("Should create clone at specific node - will also clone whole tree.", () => {
      const { dTreeIds, dTree, subtree } = make3ChildrenSubtree2Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      const preTreeContent = dTree.getTreeContentAt(dTree.rootNodeId);
      const preSubtreeContent = subtree.getTreeContentAt();

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
        ].sort(WidgetSort)
      );

      expect(preSubtreeContent.sort(WidgetSort)).toStrictEqual(
        [
          {
            label: "subtree:root",
          },
          {
            label: "child_1:subtree_0",
          },
          {
            label: "child_1:subtree_1",
          },
        ].sort(WidgetSort)
      );

      // exercise
      const cloneTree = dTree.cloneAt(dTree.rootNodeId);

      // post conditions
      const postTreeContent = cloneTree.getTreeContentAt(cloneTree.rootNodeId);
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
        ].sort(WidgetSort)
      );
    });
  });

  describe("counts", () => {
    describe(".countDescendantsOf([nodeId])", () => {
      it("Should return number of descendant.", () => {
        const { dTreeIds, dTree } = make3Children9GrandchildrenTreeAbstract(
          new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
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
          new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
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
          new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
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
        expect(dTree.getChildContentAt(sourceNodeId)).toBeNull();
        expect(dTree.getChildContentAt(dTreeIds["child_0_0"])).toBeNull();
      });

      it("Should throw error if supplied nodeId doesn't exist.", () => {
        const { dTreeIds, dTree } = make3Children9GrandchildrenTreeAbstract(
          new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
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

      it("Should include subtree nodes by default.", () => {
        const dTree = new TestAbstractDirectedGraph();
        expect(dTree.getCountTotalNodes()).toBe(1);

        const childId_0 = dTree.appendChildNodeWithContent(dTree.rootNodeId, {
          label: "child_0",
        });
        const subtree = dTree.createSubtreeAt(childId_0);
        subtree.appendChildNodeWithContent(dTree.rootNodeId, { label: "child_1" });

        // exercise
        expect(dTree.getCountTotalNodes()).toBe(3);
      });
    });

    describe(".countLeavesOf", () => {
      it("Should return count number of leaves", () => {
        const { dTreeIds, dTree } = make3Children9GrandchildrenTreeAbstract(
          new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
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
    }); // describe(".countLeavesOf",
  });

  describe(".getNodeContentByKey", () => {
    it("Should return null if there is no stored value (bad key)", () => {
      const testADG = new TestAbstractDirectedGraph(undefined, { label: "root" });

      // exercise
      const preNodeContent = testADG.getChildContentAt("_DOES_NOT_EXIST_");

      // post conditions
      expect(preNodeContent).toBeNull;
      expect(preNodeContent).not.toBeUndefined;
    });
  }); // describe('.getNodeContentByKey

  describe(".move(source, targe)", () => {
    it("Should get nodeIds and content of child, children, descendants, tree", () => {
      const {
        dTreeIds,
        dTree,
        subtree0,
        subtree1,
        originalWidgets: OO,
      } = make3Children2Subtree3Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      expect(dTree.getTreeContentAt(dTreeIds["child_0"]).sort(WidgetSort)).toStrictEqual(
        [OO["child_0"], OO["child_0_0"], OO["child_0_1"], OO["child_0_2"]].sort(WidgetSort)
      );
      expect(dTree.getTreeContentAt(dTreeIds["child_1"]).sort(WidgetSort)).toStrictEqual(
        [OO["child_1"], OO["child_1_0"], OO["child_1_1"], OO["child_1_2"]].sort(WidgetSort)
      );

      // exercise
      const toFrom = dTree.move(dTreeIds["child_0"], dTreeIds["child_1"]);
      const toFromMapped = toFrom.map((x) => {
        return x.from;
      });

      // post conditions
      expect(dTree.getChildContentAt(subtree0.rootNodeId)).toBe(subtree0);
      expect(dTree.getChildContentAt(subtree1.rootNodeId)).toBe(subtree1);
      expect(toFromMapped.sort()).toStrictEqual(
        [
          dTreeIds["child_0"],
          dTreeIds["child_0_0"],
          dTreeIds["child_0_1"],
          dTreeIds["child_0_2"],
        ].sort()
      );
      expect(dTree.getTreeContentAt(dTreeIds["child_0"])).toStrictEqual([]);
      expect(dTree.getTreeContentAt(dTreeIds["child_1"]).sort(WidgetSort)).toStrictEqual(
        [
          OO["child_1"],
          OO["child_1_0"],
          OO["child_1_1"],
          OO["child_1_2"],
          OO["child_0"],
          OO["child_0_0"],
          OO["child_0_1"],
          OO["child_0_2"],
        ].sort(WidgetSort)
      );
    });
  });

  describe(".moveChildren(source, target)", () => {
    it("Should get nodeIds and content of child, children, descendants, tree", () => {
      const {
        dTreeIds,
        dTree,
        subtree0,
        subtree1,
        originalWidgets: OO,
      } = make3Children2Subtree3Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      // pre conditions
      expect(dTree.getTreeContentAt(dTreeIds["child_0"]).sort(WidgetSort)).toStrictEqual(
        [OO["child_0"], OO["child_0_0"], OO["child_0_1"], OO["child_0_2"]].sort(WidgetSort)
      );
      expect(dTree.getTreeContentAt(dTreeIds["child_1"]).sort(WidgetSort)).toStrictEqual(
        [OO["child_1"], OO["child_1_0"], OO["child_1_1"], OO["child_1_2"]].sort(WidgetSort)
      );

      // exercise
      const toFrom = dTree.moveChildren(dTreeIds["child_0"], dTreeIds["child_1"]);
      const toFromMapped = toFrom.map((x) => {
        return x.from;
      });

      // post conditions
      expect(dTree.getChildContentAt(subtree0.rootNodeId)).toBe(subtree0);
      expect(dTree.getChildContentAt(subtree1.rootNodeId)).toBe(subtree1);
      expect(toFromMapped.sort()).toStrictEqual(
        [
          // dTreeIds["child_0"],
          dTreeIds["child_0_0"],
          dTreeIds["child_0_1"],
          dTreeIds["child_0_2"],
        ].sort()
      );
      expect(dTree.getTreeContentAt(dTreeIds["child_0"])).toStrictEqual([OO["child_0"]]);
      expect(dTree.getTreeContentAt(dTreeIds["child_1"]).sort(WidgetSort)).toStrictEqual(
        [
          OO["child_1"],
          OO["child_1_0"],
          OO["child_1_1"],
          OO["child_1_2"],
          // OO["child_0"],
          OO["child_0_0"],
          OO["child_0_1"],
          OO["child_0_2"],
        ].sort(WidgetSort)
      );
    });
  });

  describe(".getTreeNodeIdsAt()", () => {
    it("Should get nodeIds for all descendants and the given nodeId", () => {
      const { dTreeIds, dTree, subtree } = make3ChildrenSubtree2Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );
      (dTree as IDirectedGraph<WidgetType>).appendChildNodeWithContent(dTreeIds["child_0"], {
        label: "test_child0",
      });
      (dTree as IDirectedGraph<WidgetType>).appendChildNodeWithContent(dTreeIds["child_0"], {
        label: "test_child1",
      });

      const treeIds = dTree.getTreeNodeIdsAt(dTreeIds["child_0"]);
      const subtreeTreeIds = subtree.getTreeNodeIdsAt(subtree.rootNodeId);

      expect(["_root_:0", "_root_:0:6", "_root_:0:7"].sort()).toStrictEqual(treeIds.sort());

      expect(["_root_:1:3", "_root_:1:3:4", "_root_:1:3:5"].sort()).toStrictEqual(
        subtreeTreeIds.sort()
      );
    });
    it("(getTreeContent) Should get nodeContent for all descendants and given root nodeId.", () => {
      const { dTreeIds, dTree, subtree } = make3ChildrenSubtree2Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );
      (dTree as IDirectedGraph<WidgetType>).appendChildNodeWithContent(dTreeIds["child_0"], {
        label: "test_child0",
      });
      (dTree as IDirectedGraph<WidgetType>).appendChildNodeWithContent(dTreeIds["child_0"], {
        label: "test_child1",
      });

      const treeContents = dTree.getTreeContentAt(dTreeIds["child_0"]);
      const subtreeTreeContents = subtree.getTreeContentAt(subtree.rootNodeId);

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
            label: "subtree:root",
          },
          {
            label: "child_1:subtree_0",
          },
          {
            label: "child_1:subtree_1",
          },
        ].sort(WidgetSort)
      ).toStrictEqual(subtreeTreeContents.sort(WidgetSort));
    });
  });

  describe(".getChildrenContentOf", () => {
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
      const childrenContent = dGraph.getChildrenContentOf(dGraph.getRoodNodeId());
      expect([content0, content1, content2].sort()).toStrictEqual(childrenContent.sort());
    });
    `
      Need to verify or clarify behavior of:
        - createSubtree(rootSubtree),  - should throw error
        - if create subtree, 
          can add additional nodes at that nodeId, 
          does create go into subtree (no)
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

      const subtree = dGraph.createSubtreeAt(dGraph.rootNodeId);
      subtree.replaceNodeContent(subtree.rootNodeId, contentSubtreeRoot);

      subtree.appendChildNodeWithContent(subtree.rootNodeId, content1);
      const stChild_1 = subtree.appendChildNodeWithContent(subtree.rootNodeId, content2);
      subtree.appendChildNodeWithContent(stChild_1, contentGrandChild);

      const dTreeChildrenContent = dGraph.getChildrenContentOf(dGraph.rootNodeId, true);
      expect(dTreeChildrenContent.sort(WidgetSort)).toStrictEqual(
        [contentSubtreeRoot, content0, content3].sort(WidgetSort)
      );

      const subtreeContent = subtree.getChildrenContentOf(subtree.rootNodeId);
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
        public getChildrenNodeIdsOf(parentNodeId = this.getRoodNodeId()) {
          return super.getChildrenNodeIdsOf(parentNodeId);
        }
      }

      const content0 = { myAwesome: "content0" };
      const content1 = { myAwesome: "content1" };
      const content2 = { myAwesome: "content2" };
      const content3 = { myAwesome: "content3" };
      const content4 = { myAwesome: "content4" };

      // I am not sure there is a public use for getChildrenIds
      // There is likely a case for getChildrenContentOf?

      const dGraph = new TestClass();
      const childId0 = dGraph.appendChildNodeWithContent(dGraph.getRoodNodeId(), content0);
      const childId1 = dGraph.appendChildNodeWithContent(dGraph.getRoodNodeId(), content1);

      const grandChild0 = dGraph.appendChildNodeWithContent(childId1, content2);
      const grandChild1 = dGraph.appendChildNodeWithContent(childId1, content3);
      const grandChild2 = dGraph.appendChildNodeWithContent(childId1, content4);
      const childrenIds = dGraph.getChildrenNodeIdsOf(childId1);
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
        public getChildrenNodeIdsOf(parentNodeId = this.getRoodNodeId()) {
          return super.getChildrenNodeIdsOf(parentNodeId);
        }
      }
      const dGraph = new TestClass();
      const childId0 = dGraph.appendChildNodeWithContent(dGraph.getRoodNodeId(), content0);
      const childId1 = dGraph.appendChildNodeWithContent(dGraph.getRoodNodeId(), content0);

      const grandChild_0_0 = dGraph.appendChildNodeWithContent(childId0, content0);
      const grandChild_1_0 = dGraph.appendChildNodeWithContent(childId1, content0);
      const grandChild_1_1 = dGraph.appendChildNodeWithContent(childId1, content0);
      const grandChild_1_2 = dGraph.appendChildNodeWithContent(childId1, content0);
      const childrenIds = dGraph.getChildrenNodeIdsOf(childId1);
      expect(childrenIds.sort()).toStrictEqual(
        [grandChild_1_0, grandChild_1_1, grandChild_1_2].sort()
      );
    });
    it("Should empty if subtree called from parent, should be tree content if called from subtree.", () => {
      const dTree = new TestAbstractDirectedGraph();
      dTree.replaceNodeContent(dTree.rootNodeId, { label: "root" });
      const childId_0 = dTree.appendChildNodeWithContent(dTree.rootNodeId, {
        label: "child_0",
      });

      const subtree1 = dTree.createSubtreeAt(childId_0);
      subtree1.replaceNodeContent(subtree1.rootNodeId, { label: "subtree0:root" });
      subtree1.appendChildNodeWithContent(subtree1.rootNodeId, { label: "child_1" });

      //     should  an empty array and not [null]
      dTree.getTreeContentAt(subtree1.rootNodeId);

      const subtreeContent = dTree.getTreeContentAt(subtree1.rootNodeId);
      const subtreeContent2 = subtree1.getTreeContentAt(subtree1.rootNodeId);
      const treeContent = dTree.getTreeContentAt(dTree.rootNodeId);

      expect(subtreeContent).toStrictEqual([subtree1]);

      expect(subtreeContent2).toStrictEqual([
        { label: "child_1" },
        { label: "subtree0:root" },
      ]);
      expect(treeContent.sort(WidgetSort)).toStrictEqual(
        [
          { label: "root" },
          {
            label: "child_0",
          },
        ].sort(WidgetSort)
      );
    });
  }); // describe(".getChildrenContentOf"

  describe(".getDescendantContentOf()", () => {
    // there were no tests in DirectedGraph - coming back to this
    it("Should get all children for given node (root/child).", () => {
      const content0 = { label: "content0" };
      const content1 = { label: "content1" };
      const content2 = { label: "content2" };

      const dGraph = new TestAbstractDirectedGraph();
      dGraph.appendChildNodeWithContent(dGraph.rootNodeId, content2);

      const child_0 = dGraph.appendChildNodeWithContent(dGraph.rootNodeId, content0);
      dGraph.appendChildNodeWithContent(child_0, content1);

      const childrenContent = dGraph.getDescendantContentOf(dGraph.rootNodeId);
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
      const subtree = dGraph.createSubtreeAt(child_0);

      subtree.replaceNodeContent(subtree.rootNodeId, subtreeRootContent);
      // dGraph.appendChildNodeWithContent(dGraph.rootNodeId, content0); // used for subtree
      dGraph.appendChildNodeWithContent(child_0, content1);
      subtree.appendChildNodeWithContent(subtree.rootNodeId, subtreeContent0);
      subtree.appendChildNodeWithContent(subtree.rootNodeId, subtreeContent1);

      const childrenContent = dGraph.getDescendantContentOf(dGraph.rootNodeId, true);
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
      const subtreeContent = subtree.getDescendantContentOf(subtree.rootNodeId);
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
      const subtree = dGraph.createSubtreeAt(child_0);

      subtree.replaceNodeContent(subtree.rootNodeId, subtreeRootContent);
      // dGraph.appendChildNodeWithContent(dGraph.rootNodeId, content0); // used for subtree
      dGraph.appendChildNodeWithContent(child_0, content1);
      subtree.appendChildNodeWithContent(subtree.rootNodeId, subtreeContent0);
      subtree.appendChildNodeWithContent(subtree.rootNodeId, subtreeContent1);

      const willThrow = () => {
        subtree.getDescendantContentOf(dGraph.rootNodeId);
      };
      expect(willThrow).toThrow(
        new DirectedGraphError('Tried to retrieve node that does not exist. nodeId: "_root_".')
      );
    });
  });

  describe(".getParentNodeId()", () => {
    it("Should determine parent node id from child id.", () => {
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;
      expect(dTree.getParentNodeId(dTreeIds["child_0_0"])).toBe(dTreeIds["child_0"]);
      expect(dTree.getParentNodeId(dTreeIds["child_0"])).toBe(dTreeIds["root"]);
      expect(dTree.getParentNodeId(dTreeIds["root"])).toBe(dTreeIds["root"]);
    });
    it("Should throw error if childId doesn't exist.", () => {
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
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
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
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
      const { dTreeIds, dTree, subtree } = make3ChildrenSubtree2Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );
      const s = dTree.getSiblingIds(dTree.rootNodeId);
      expect(dTree.getSiblingIds(dTree.rootNodeId)).toStrictEqual([]);

      expect(dTree.getSiblingIds(dTreeIds["child_0"])).toStrictEqual([
        dTreeIds["child_1"],
        dTreeIds["child_2"],
      ]);

      expect(dTree.getSiblingIds(dTreeIds["child_1"])).toStrictEqual([
        dTreeIds["child_0"],
        dTreeIds["child_2"],
      ]);

      expect(subtree.getSiblingIds(subtree.rootNodeId)).toStrictEqual([]);

      expect(subtree.getSiblingIds(dTreeIds["child_1:subtree_0"])).toStrictEqual([
        dTreeIds["child_1:subtree_1"],
      ]);
    });
    it("Should throw error if nodeId is not found.", () => {
      const { dTreeIds, dTree, subtree } = make3ChildrenSubtree2Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
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

  describe(".getSubtreeIdsAt()", () => {
    it("Should get an array of subtree ids", () => {
      const {
        dTreeIds,
        dTree,
        subtree0,
        subtree1,
        originalWidgets: OO,
      } = make3Children2Subtree3Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      expect(dTree.getSubtreeIdsAt()).toStrictEqual([
        dTreeIds["subtree0:root"],
        dTreeIds["subtree1:root"],
      ]);

      expect(dTree.getSubtreeIdsAt(dTree.rootNodeId)).toStrictEqual([
        dTreeIds["subtree0:root"],
        dTreeIds["subtree1:root"],
      ]);
      expect(dTree.getSubtreeIdsAt(dTreeIds["child_1"])).toStrictEqual([]);
      // const { dTreeIds, dTree, subtree } = make3ChildrenSubtree2Children(
      //   new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      // );
      // const subtreeIds = dTree.getSubtreeIdsAt(dTree.rootNodeId);
      // expect(subtreeIds.length).toBe(1);
      // expect(subtreeIds[0]).toStrictEqual(subtree.rootNodeId);
    });
  });

  describe("isFunctions", () => {
    it(".isLeaf(nodeId) / .isBranch(nodeId) / .isRoot(nodeId) / .isSubtree", () => {
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      dTreeIds["subtree-parent"] = dTree.appendChildNodeWithContent(dTree.rootNodeId, {
        label: "subtree-parent",
      });
      const subtree = dTree.createSubtreeAt(dTreeIds["subtree-parent"]);
      subtree.replaceNodeContent(subtree.rootNodeId, { label: "subtree-root" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtree:0" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtree:2" });
      dTreeIds["subtreeRoot"] = subtree.rootNodeId;

      const sourceNodeId = dTreeIds["child_0"];
      const targetNodeId = dTreeIds["child_1"];
      dTree.move(sourceNodeId, targetNodeId);

      expect(
        Object.is(subtree, dTree.getChildContentAt(dTreeIds["subtreeRoot"]))
      ).toStrictEqual(true);

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

  describe("removeNodeAt", () => {
    it("should be awesome", () => {
      const dTree = new TestAbstractDirectedGraph();
      dTree.replaceNodeContent(dTree.rootNodeId, { label: "root" });
      const childId_0 = dTree.appendChildNodeWithContent(dTree.rootNodeId, {
        label: "child_0",
      });

      // preconditions
      expect(dTree.getChildContentAt(dTree.rootNodeId)).toStrictEqual({ label: "root" });
      expect(dTree.getChildContentAt(childId_0)).toStrictEqual({ label: "child_0" });

      // exercise 1
      dTree.removeNodeAt(childId_0);
      expect(dTree.getChildContentAt(childId_0)).toStrictEqual(null);

      // exercise 2
      const willThrow = () => {
        dTree.removeNodeAt(dTree.rootNodeId);
      };

      expect(willThrow).toThrow(Error);
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
      expect(Object.is(dGraph.getChildContentAt(child_0), content0)).toBeTruthy();

      // exercise
      dGraph.replaceNodeContent(child_0, replaceContent);

      // postCondition
      expect(Object.is(dGraph.getChildContentAt(child_0), replaceContent)).toBeTruthy();
    });
    it("Should replace content of a given node. (subtree)", () => {
      const rootContent = { label: "root" };
      const replaceContent = { label: "replaceContent" };

      const content0 = { label: "content0" };

      const dGraph = new TestAbstractDirectedGraph(undefined, rootContent);
      const subTree = dGraph.createSubtreeAt(dGraph.rootNodeId);
      const child_0 = subTree.appendChildNodeWithContent(dGraph.rootNodeId, content0);

      // preCondition
      expect(Object.is(subTree.getChildContentAt(child_0), content0)).toBeTruthy();

      // exercise
      subTree.replaceNodeContent(child_0, replaceContent);

      // postCondition
      expect(Object.is(subTree.getChildContentAt(child_0), replaceContent)).toBeTruthy();
    });
    it("Should throw error when attempting to replaceRoot content with tree.", () => {
      const rootContent = { label: "root" };

      const content0 = { label: "content0" };

      const dGraph = new TestAbstractDirectedGraph(undefined, rootContent);
      const subtree = dGraph.createSubtreeAt(dGraph.rootNodeId);

      const willThrow = () => {
        // @ts-ignore
        dGraph.replaceNodeContent(dGraph.rootNodeId, subtree);
      };

      expect(willThrow).toThrow(new DirectedGraphError("Can not replace root with subtree."));
    });
  });

  describe("Visitors", () => {
    it(".visitAllAt(...) - Should visit all nodes by default.", () => {
      const treeVisitor = new TestTreeVisitor();
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
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
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
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
    it(".visitAllAt(...) - Should visit all nodes by default. (with subtree)", () => {
      const TreeVisitor = new TestTreeVisitor();
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      const subtree = dTree.createSubtreeAt(dTree.rootNodeId);
      subtree.replaceNodeContent(subtree.rootNodeId, { label: "subtreeRoot" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtreeChild0" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtreeChild1" });

      dTree.visitAllAt(TreeVisitor);

      expect(TreeVisitor.rootNodeIds).toStrictEqual([dTree.rootNodeId, subtree.rootNodeId]);
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
          { label: "subtreeRoot" },
          { label: "subtreeChild0" },
          { label: "subtreeChild1" },
        ].sort(WidgetSort)
      );
    });
    it(".visitAllAt(...) - Should *not* visit subtree nodes if 'includeSubtree' is false.", () => {
      const TreeVisitor = new TestTreeVisitor();
      TreeVisitor.includeSubtrees = false;
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      const subtree = dTree.createSubtreeAt(dTree.rootNodeId);
      subtree.replaceNodeContent(subtree.rootNodeId, { label: "subtreeRoot" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtreeChild0" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtreeChild1" });

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
          // { label: "subtreeRoot" },
          // { label: "subtreeChild0" },
          // { label: "subtreeChild1" },
        ].sort(WidgetSort)
      );
    });

    // add 'traverseSubtree' or something to visitor type

    it(".visitAllAt(...) - Should visit subtree nodes if 'includeSubtree' is undefined.", () => {
      // const doNotIncludeSubtree = false;
      const treeVisitor = new TestTreeVisitor();
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      const subtree = dTree.createSubtreeAt(dTree.rootNodeId);
      subtree.replaceNodeContent(subtree.rootNodeId, { label: "subtreeRoot" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtreeChild0" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtreeChild1" });
      treeVisitor.includeSubtrees = true;

      dTree.visitAllAt(treeVisitor);
      expect(treeVisitor.rootNodeIds).toStrictEqual([dTree.rootNodeId, subtree.rootNodeId]);
      expect(treeVisitor.countUniqueVisits).toBe(16);
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
          { label: "subtreeRoot" },
          { label: "subtreeChild0" },
          { label: "subtreeChild1" },
        ].sort(WidgetSort)
      );
    });
    it(".visitAllAt(...) - Should visit all nodes by default. (with subtree)", () => {
      // *tmc* is this the same as above?
      const TreeVisitor = new TestTreeVisitor();
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      const subtree = dTree.createSubtreeAt(dTree.rootNodeId);
      subtree.replaceNodeContent(subtree.rootNodeId, { label: "subtreeRoot" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtreeChild0" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtreeChild1" });

      dTree.visitAllAt(TreeVisitor);

      expect(TreeVisitor.rootNodeIds).toStrictEqual([dTree.rootNodeId, subtree.rootNodeId]);
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
          { label: "subtreeRoot" },
          { label: "subtreeChild0" },
          { label: "subtreeChild1" },
        ].sort(WidgetSort)
      );
    });

    it(".visitAllAt(...) - Should visit all nodes by default. (with subtree, includeSubtree=false)", () => {
      // *tmc* is this the same as above?
      const TreeVisitor = new TestTreeVisitor();
      TreeVisitor.includeSubtrees = false;

      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      const subtree = dTree.createSubtreeAt(dTree.rootNodeId);
      subtree.replaceNodeContent(subtree.rootNodeId, { label: "subtreeRoot" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtreeChild0" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtreeChild1" });

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
          // { label: "subtreeRoot" },
          // { label: "subtreeChild0" },
          // { label: "subtreeChild1" },
        ].sort(WidgetSort)
      );
    });
    it(".visitAllAt(...) - Should throw DirectedGraphError if trying to replace root with subtree.", () => {
      const dTree = new TestAbstractDirectedGraph();
      const subtree = dTree.createSubtreeAt(dTree.rootNodeId);
      const willThrow = () => {
        // @ts-ignore - subtree not a WidgetType
        dTree.replaceNodeContent(dTree.rootNodeId, subtree);
      };

      expect(willThrow).toThrow(new DirectedGraphError("Can not replace root with subtree."));
    });
    it(".visitLeavesOf(...) - Should visit all nodes by default.", () => {
      const treeVisitor = new TestTreeVisitor();
      const { dTreeIds, dTree: dTreeAsITree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );
      const dTree = dTreeAsITree as unknown as TestAbstractDirectedGraph;

      const subtree = dTree.createSubtreeAt(dTree.rootNodeId);
      subtree.replaceNodeContent(subtree.rootNodeId, { label: "subtreeRoot" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtreeChild0" });
      subtree.appendChildNodeWithContent(subtree.rootNodeId, { label: "subtreeChild1" });

      treeVisitor.includeSubtrees = true;

      dTree.visitLeavesOf(treeVisitor);

      expect(treeVisitor.rootNodeIds).toStrictEqual([]);
      //      expect(treeVisitor.countUniqueVisits).toBe(11);
      expect(treeVisitor.contentItems.sort(WidgetSort)).toStrictEqual(
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
          { label: "subtreeChild0" },
          { label: "subtreeChild1" },
        ].sort(WidgetSort)
      );
    });
  }); // describe("Visitors"

  describe(".fromPojo() / .toPojoAt()", () => {
    it("Should be able to create subTree export/import.", () => {
      const { dTreeIds, dTree } = make3Children9GrandchildrenTreeAbstract(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      const subtreePojo = dTree.toPojoAt(dTreeIds["child_0"]);

      const subTreeContent = filterPojoContent(subtreePojo);
      expect(subTreeContent).toStrictEqual([
        { label: "child_0" },
        { label: "child_0_0" },
        { label: "child_0_1" },
        { label: "child_0_2" },
      ]);
      const newTree = AbstractDirectedGraph.fromPojo<
        WidgetType,
        AbstractDirectedGraph<WidgetType>
      >(
        subtreePojo,
        undefined
        // TestAbstractDirectedGraph
      );
      expect(newTree.getChildContentAt(newTree.rootNodeId)).toStrictEqual({
        label: "child_0",
      });
      const actualChildContent = newTree.getChildrenContentOf(newTree.rootNodeId);
      expect(actualChildContent).toStrictEqual([
        { label: "child_0_0" },
        { label: "child_0_1" },
        { label: "child_0_2" },
      ]);
    });

    it("Should be able to convert tree to pojo (toPojo), and instantiate new identical tree with given Pojo (.fromPojo).", () => {
      const { dTreeIds, dTree, subtree } = make3ChildrenSubtree2Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      const treePojo = dTree.toPojoAt() as TTreePojo<WidgetType>;

      const subtreePojo = subtree.toPojoAt() as TTreePojo<WidgetType>;

      const reTree = TestAbstractDirectedGraph.fromPojo<
        WidgetType,
        AbstractDirectedGraph<WidgetType>
      >(
        treePojo,
        undefined
        // TestAbstractDirectedGraph
      );
      const reSubtreeFromPojo = TestAbstractDirectedGraph.fromPojo<
        WidgetType,
        AbstractDirectedGraph<WidgetType>
      >(subtreePojo);

      const reTreeContents = filterPojoContent(reTree.toPojoAt());
      const reSubtreeContents = filterPojoContent(reSubtreeFromPojo.toPojoAt());
      const dTreeContents = filterPojoContent(dTree.toPojoAt());
      const originalSubtreeContents = subtree.getDescendantContentOf(subtree.rootNodeId);
      originalSubtreeContents.push(subtree.getChildContentAt(subtree.rootNodeId));

      expect(originalSubtreeContents.sort(WidgetSort)).toStrictEqual(
        reSubtreeContents.sort(WidgetSort)
      );
      expect(reTreeContents.sort(WidgetSort)).toStrictEqual(dTreeContents.sort(WidgetSort));
    });

    it("(fromPojo) Should accept/use alternative pojo-to-object translator.", () => {
      const alternativeFromPojoTransform = (
        nodeContent: TNodePojo<WidgetType>
      ): TGenericNodeContent<WidgetType> => {
        return {
          label: nodeContent.nodeContent.label + " (alternative)",
        } as unknown as TGenericNodeContent<WidgetType>;
      };

      const { dTreeIds, dTree, subtree } = make3ChildrenSubtree2Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      const treePojo = dTree.toPojoAt() as TTreePojo<WidgetType>;

      // pre condition
      const dTreeContents = filterPojoContent(dTree.toPojoAt());
      expect(dTreeContents.sort(WidgetSort)).toStrictEqual(
        [
          { label: "root" },
          { label: "child_0" },
          { label: "child_1" },
          { label: "child_2" },
          { label: "subtree:root" },
          { label: "child_1:subtree_0" },
          { label: "child_1:subtree_1" },
        ].sort(WidgetSort)
      );

      // exercise
      const reTree = TestAbstractDirectedGraph.fromPojo<
        WidgetType,
        AbstractDirectedGraph<WidgetType>
      >(treePojo, alternativeFromPojoTransform);

      // post conditions
      const reTreeContents = filterPojoContent(reTree.toPojoAt());
      expect(reTreeContents.sort(WidgetSort)).toStrictEqual(
        [
          { label: "root (alternative)" },
          { label: "child_0 (alternative)" },
          { label: "child_1 (alternative)" },
          { label: "child_2 (alternative)" },
          { label: "subtree:root (alternative)" },
          { label: "child_1:subtree_0 (alternative)" },
          { label: "child_1:subtree_1 (alternative)" },
        ].sort(WidgetSort)
      );
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
          undefined
          // TestAbstractDirectedGraph
        );
      };
      expect(willThrow).toThrow(
        new DirectedGraphError("Orphan nodes detected while parson pojo object.")
      );
    });

    it("Should export (toPojo) subtree like normal tree.", () => {
      const {
        dTreeIds,
        dTree,
        subtree0,
        subtree1,
        originalWidgets: OO,
      } = make3Children2Subtree3Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      const treePojo = dTree.toPojoAt();
      const subtree0Pojo = dTree.toPojoAt(subtree0.rootNodeId);
      const subtree1Pojo = dTree.toPojoAt(subtree1.rootNodeId);

      const pojoContent = filterPojoContent(treePojo);
      expect(Object.keys(treePojo).length).toEqual(21);

      expect(pojoContent.sort(WidgetSort)).toStrictEqual(
        dTree
          .getTreeContentAt(undefined, AbstractDirectedGraph.SHOULD_INCLUDE_SUBTREES)
          .sort(WidgetSort)
      );

      expect(Object.keys(treePojo).length).toEqual(21);
      expect(
        dTree.countTotalNodes(undefined, AbstractDirectedGraph.SHOULD_INCLUDE_SUBTREES)
      ).toEqual(Object.keys(treePojo).length);
      expect(
        subtree0.countTotalNodes(undefined, AbstractDirectedGraph.SHOULD_INCLUDE_SUBTREES)
      ).toEqual(Object.keys(subtree0Pojo).length);
      expect(
        subtree1.countTotalNodes(undefined, AbstractDirectedGraph.SHOULD_INCLUDE_SUBTREES)
      ).toEqual(Object.keys(subtree1Pojo).length);

      expect(Object.keys(subtree0Pojo).length).toEqual(4);
      expect(Object.keys(subtree1Pojo).length).toEqual(4);
    });
    it("Should create pojo document at any given node.", () => {
      const {
        dTreeIds,
        dTree,
        subtree0,
        subtree1,
        originalWidgets: OO,
      } = make3Children2Subtree3Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      const littlePojo = dTree.toPojoAt(dTreeIds["child_0"]);

      const pojoContent = filterPojoContent(littlePojo);
      expect(Object.keys(littlePojo).length).toEqual(4);

      expect(pojoContent.sort(WidgetSort)).toStrictEqual([
        OO["child_0"],
        OO["child_0_0"],
        OO["child_0_1"],
        OO["child_0_2"],
      ]);
    });
    it("Should produce pojo at a specified node.", () => {
      const {
        dTreeIds,
        dTree,
        subtree0,
        subtree1,
        originalWidgets: OO,
      } = make3Children2Subtree3Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      const childPojo_0 = dTree.toPojoAt(dTreeIds["child_0"]);
      const childPojoContent_0 = filterPojoContent(childPojo_0);

      const childPojo_0_0 = dTree.toPojoAt(dTreeIds["child_0_0"]);
      const childPojoContent_0_0 = filterPojoContent(childPojo_0_0);

      expect(childPojoContent_0).toStrictEqual([
        OO["child_0"],
        OO["child_0_0"],
        OO["child_0_1"],
        OO["child_0_2"],
      ]);
      expect(childPojoContent_0_0).toStrictEqual([OO["child_0_0"]]);
    });
  }); // subtree fromPojo
  describe("AbstractDirectedGraph.obfuscatePojo", () => {
    it("Should export (toPojo) subtree like normal tree.", () => {
      const {
        dTreeIds,
        dTree,
        subtree0,
        subtree1,
        originalWidgets: OO,
      } = make3Children2Subtree3Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      const treePojo = dTree.toPojoAt();
      const treePojoObfuscated = AbstractDirectedGraph.obfuscatePojo(treePojo);
      // const subtree0Pojo = dTree.toPojoAt(subtree0.rootNodeId);
      // const subtree1Pojo = dTree.toPojoAt(subtree1.rootNodeId);

      const pojoContent = filterPojoContent(treePojo);
      expect(Object.keys(treePojo).length).toEqual(21);

      const pojoContentObfuscate = filterPojoContent(treePojoObfuscated);
      expect(Object.keys(pojoContentObfuscate).length).toEqual(21);

      expect(Object.keys(pojoContent).length).toEqual(
        Object.keys(pojoContentObfuscate).length
      );

      expect(pojoContent.sort(WidgetSort)).toStrictEqual(
        pojoContentObfuscate.sort(WidgetSort)
      );

      const reTree = AbstractDirectedGraph.fromPojo<
        WidgetType,
        AbstractDirectedGraph<WidgetType>
      >(treePojoObfuscated);

      expect(reTree.getSubtreeIdsAt().length).toEqual(2);
      expect(reTree.countTotalNodes(reTree.rootNodeId, true)).toEqual(21);
      expect(dTree.countTotalNodes(reTree.rootNodeId, true)).toEqual(21);
      expect(reTree.countTotalNodes()).toEqual(dTree.countTotalNodes());
      expect(reTree.getTreeContentAt().sort(WidgetSort)).toStrictEqual(
        dTree.getTreeContentAt().sort(WidgetSort)
      );
    });
  });
  describe("Subtree - get[Child | Children | Tree][Content | Ids ] (getChildrenIds getTreeContent)", () => {
    it("Should get nodeIds and content of child, children, descendants, tree", () => {
      const shouldIncludeSubtrees = true;
      const {
        dTreeIds,
        dTree,
        subtree0,
        subtree1,
        originalWidgets: OO,
      } = make3Children2Subtree3Children(
        new TestAbstractDirectedGraph() as IDirectedGraph<WidgetType>
      );

      expect(dTree.getChildContentAt(dTree.rootNodeId)).toStrictEqual({ label: "root" });

      expect(dTree.countTotalNodes(dTree.rootNodeId, true)).toEqual(21);
      expect(dTree.countTotalNodes(dTree.rootNodeId, false)).toEqual(13);
      expect(dTree.countTotalNodes()).toEqual(21);
      expect(dTree.countTotalNodes(dTreeIds["child_0"])).toEqual(4);

      expect(dTree.getChildContentAt(dTreeIds["subtree0:root"])).toBe(subtree0);

      expect(dTree.getChildContentAt(subtree0.rootNodeId)).toBe(subtree0);
      expect(subtree0.getChildContentAt(subtree0.rootNodeId)).toStrictEqual({
        label: "subtree0:root",
      });

      expect(dTree.getChildContentAt(subtree1.rootNodeId)).toBe(subtree1);
      expect(subtree1.getChildContentAt(subtree1.rootNodeId)).toStrictEqual({
        label: "subtree1:root",
      });

      expect(dTree.getChildrenNodeIdsOf(dTree.rootNodeId)).toStrictEqual([
        dTreeIds["child_0"],
        dTreeIds["child_1"],
        dTreeIds["child_2"],
      ]);
      expect(
        dTree.getChildrenNodeIdsOf(dTree.rootNodeId, shouldIncludeSubtrees)
      ).toStrictEqual([
        dTreeIds["child_0"],
        dTreeIds["subtree0:root"],
        dTreeIds["child_1"],
        dTreeIds["subtree1:root"],
        dTreeIds["child_2"],
      ]);

      expect(dTree.getChildrenContentOf(dTree.rootNodeId)).toStrictEqual([
        { label: "child_0" },
        { label: "child_1" },
        { label: "child_2" },
      ]);
      expect(
        dTree.getChildrenContentOf(dTree.rootNodeId, shouldIncludeSubtrees)
      ).toStrictEqual([
        OO["child_0"],
        OO["subtree0:root"],
        OO["child_1"],
        OO["subtree1:root"],
        OO["child_2"],
      ]);

      expect(
        dTree.getChildrenContentOf(dTree.rootNodeId, !shouldIncludeSubtrees)
      ).toStrictEqual([OO["child_0"], OO["child_1"], OO["child_2"]]);

      expect(
        dTree.getChildrenContentOf(dTreeIds["subtree0:root"], shouldIncludeSubtrees)
      ).toStrictEqual([]);
      expect(
        dTree.getChildrenContentOf(dTreeIds["subtree0:root"], !shouldIncludeSubtrees)
      ).toStrictEqual([]);
      expect(dTree.getChildContentAt(dTreeIds["subtree0:root"])).toBe(subtree0);
      expect(dTree.getChildContentAt(dTreeIds["subtree1:root"])).toBe(subtree1);

      expect(
        dTree.getChildrenContentOf(dTreeIds["child_1"], shouldIncludeSubtrees)
      ).toStrictEqual([OO["child_1_0"], OO["child_1_1"], OO["child_1_2"]]);

      expect(
        dTree.getChildrenContentOf(dTreeIds["child_0"], !shouldIncludeSubtrees)
      ).toStrictEqual([OO["child_0_0"], OO["child_0_1"], OO["child_0_2"]]);

      expect(
        dTree.getDescendantContentOf(dTree.rootNodeId, shouldIncludeSubtrees).sort(WidgetSort)
      ).toStrictEqual(
        [
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
          // OO["subtree1"],
          OO["subtree0:root"],
          OO["subtree0:child_0"],
          OO["subtree0:child_1"],
          OO["subtree0:child_2"],

          OO["subtree1:root"],
          OO["subtree1:child_0"],
          OO["subtree1:child_1"],
          OO["subtree1:child_2"],
        ].sort(WidgetSort)
      );

      expect(
        dTree.getDescendantContentOf(dTree.rootNodeId, !shouldIncludeSubtrees).sort(WidgetSort)
      ).toStrictEqual(
        [
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
        ].sort(WidgetSort)
      );
      expect(dTree.getTreeContentAt(dTree.rootNodeId).sort(WidgetSort)).toStrictEqual(
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
        ].sort(WidgetSort)
      );

      expect(
        dTree.getTreeContentAt(dTree.rootNodeId, shouldIncludeSubtrees).sort(WidgetSort)
      ).toStrictEqual(
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
          // OO["subtree1"],
          OO["subtree0:root"],
          OO["subtree0:child_0"],
          OO["subtree0:child_1"],
          OO["subtree0:child_2"],

          OO["subtree1:root"],
          OO["subtree1:child_0"],
          OO["subtree1:child_1"],
          OO["subtree1:child_2"],
        ].sort(WidgetSort)
      );
      expect(dTree.getChildrenNodeIdsOf(dTree.rootNodeId)).toStrictEqual([
        dTreeIds["child_0"],
        dTreeIds["child_1"],
        dTreeIds["child_2"],
      ]);

      // shouldIncludeSubtrees doesn't make sense, because the internal trees
      // are different so can not access content from oneTree to the other
      expect(dTree.getTreeNodeIdsAt(dTree.rootNodeId).sort()).toStrictEqual(
        [
          dTreeIds["root"],
          dTreeIds["child_0"],
          dTreeIds["child_0_0"],
          dTreeIds["child_0_1"],
          dTreeIds["child_0_2"],
          dTreeIds["child_1"],
          dTreeIds["child_1_0"],
          dTreeIds["child_1_1"],
          dTreeIds["child_1_2"],
          dTreeIds["child_2"],
          dTreeIds["child_2_0"],
          dTreeIds["child_2_1"],
          dTreeIds["child_2_2"],
        ].sort()
      );
    });
  });

  describe("AbstractDirectedGraph.fromPOJO", () => {
    it("Should create tree from pojo object. (ideal)", () => {
      const treeJsonString =
        '{"e883f4a3-b021-4ebe-8e41-ddef57e18624":{"parentId":"e883f4a3-b021-4ebe-8e41-ddef57e18624","nodeContent":{"label":"root"}},"4fca03eb-0f55-4851-814d-bbce9227486f":{"parentId":"e883f4a3-b021-4ebe-8e41-ddef57e18624","nodeContent":{"label":"child_0"}},"a4e88f12-93fb-416c-9f64-6cf7cfe2925d":{"parentId":"4fca03eb-0f55-4851-814d-bbce9227486f","nodeContent":{"label":"child_0_0"}},"d54acedf-912f-422f-9412-b530b0a815f4":{"parentId":"4fca03eb-0f55-4851-814d-bbce9227486f","nodeContent":{"label":"child_0_1"}},"6019df67-4dd3-4644-854b-7f2978408949":{"parentId":"4fca03eb-0f55-4851-814d-bbce9227486f","nodeContent":{"label":"child_0_2"}},"ebb08b47-7c62-4515-a3b4-1c569b03220d":{"parentId":"e883f4a3-b021-4ebe-8e41-ddef57e18624","nodeContent":{"label":"child_1"}},"18a8db96-c924-4cc5-853b-03bcb36da227":{"parentId":"ebb08b47-7c62-4515-a3b4-1c569b03220d","nodeContent":{"label":"child_1_0"}},"25791177-7b24-416f-b25c-54ed52fb53e2":{"parentId":"ebb08b47-7c62-4515-a3b4-1c569b03220d","nodeContent":{"label":"child_1_1"}},"758e30f5-d0af-476e-bbf0-45356b4848bc":{"parentId":"ebb08b47-7c62-4515-a3b4-1c569b03220d","nodeContent":{"label":"child_1_2"}},"2d2b98c3-e8fc-4dc3-b161-1469d1c04ea2":{"parentId":"e883f4a3-b021-4ebe-8e41-ddef57e18624","nodeContent":{"label":"child_2"}},"8586a3ca-8f71-4d6c-a414-5f0557a6e217":{"parentId":"2d2b98c3-e8fc-4dc3-b161-1469d1c04ea2","nodeContent":{"label":"child_2_0"}},"69d3aa07-e25f-45ca-af8b-820f9525f17c":{"parentId":"2d2b98c3-e8fc-4dc3-b161-1469d1c04ea2","nodeContent":{"label":"child_2_1"}},"58c712ac-0d75-4512-bee2-a795f52ecf8b":{"parentId":"2d2b98c3-e8fc-4dc3-b161-1469d1c04ea2","nodeContent":{"label":"child_2_2"}}}';
      const treePojoObject = JSON.parse(treeJsonString);
      const dTree = AbstractDirectedGraph.fromPojo<
        WidgetType,
        AbstractDirectedGraph<WidgetType>
      >(
        treePojoObject,
        undefined
        // AbstractDirectedGraph
      );
      const childrenIds = dTree.getChildrenNodeIdsOf(dTree.rootNodeId);
      const content = [
        dTree.getChildContentAt(dTree.rootNodeId),
        ...dTree.getChildrenContentOf(dTree.rootNodeId),
      ];
      childrenIds.forEach((childId) => {
        const childContent = dTree.getChildrenContentOf(childId);
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

      const dTree = AbstractDirectedGraph.fromPojo<
        WidgetType,
        AbstractDirectedGraph<WidgetType>
      >(
        treePojoObject,
        undefined
        // AbstractDirectedGraph
      );

      const rootAndChildrenContent = [
        dTree.getChildContentAt(dTree.rootNodeId),
        ...dTree.getChildrenContentOf(dTree.rootNodeId),
      ];
      const rootAndGrandchildrenContent = rootAndChildrenContent.slice();
      const childrenIds = dTree.getChildrenNodeIdsOf(dTree.rootNodeId);
      childrenIds.forEach((childId) => {
        const childContent = dTree.getChildrenContentOf(childId);
        rootAndGrandchildrenContent.push(...(childContent as any[]));
      });

      const rootAndDescendantContent = [
        dTree.getChildContentAt(dTree.rootNodeId),
        ...dTree.getDescendantContentOf(dTree.rootNodeId),
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
        // { label: "subtree-root" },
      ]);
      expect(rootAndDescendantContent.sort(WidgetSort)).toStrictEqual(
        [
          { label: "root" },
          { label: "child_0" },
          { label: "child_1" },
          { label: "child_2" },

          // { label: "subtree-root" },
          // { label: "subtree:0" },
          // { label: "subtree:1" },
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
        AbstractDirectedGraph.fromPojo(
          pojoObj,
          undefined
          // AbstractDirectedGraph
        );
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
        AbstractDirectedGraph.fromPojo(
          pojoObj,
          undefined
          //AbstractDirectedGraph
        );
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
        AbstractDirectedGraph.fromPojo(
          pojoObj,
          undefined
          //AbstractDirectedGraph
        );
      };

      expect(willThrow).toThrow(
        new DirectedGraphError("Orphan nodes detected while parson pojo object.")
      );
    });
  }); // describe('DirectedGraph.fromPojo'
});

import { AbstractDirectedGraph } from "../DirectedGraph/AbstractDirectedGraph";
import { ITree } from "../DirectedGraph/ITree";
import { TreeObfuscator } from "./TreeObfuscator";
import {
  originalPredicateObjects,
  SortPredicateTest,
  make3Children9GrandchildrenITreeWithSubgraph_2_3,
  make3Children9GrandchildrenITree,
  make3Children9GrandchildrenTree,
  filterPojoContent,
  checkIdMapsToCorrectObject,
} from "./test-helpers/test.utilities"; // "..test-helpers/test.utilities";
import { TestTreeVisitor } from "./test-helpers/TestTreeVisitor";
import { TTreePojo } from "../DirectedGraph/types";
import { DirectedGraphError } from "../DirectedGraph";

type LeafType = {
  operator: "$eq" | "$lt" | "$gt";
  subjectId: string;
  value: number | string | Date | null | ITree<LeafType>;
};
type BranchType = {
  operator: "$and" | "$or";
};

type PredicateTypes = LeafType | BranchType;
type PredicateNodeTypes = PredicateTypes | ITree<PredicateTypes>;
export type { BranchType, LeafType, PredicateNodeTypes, PredicateTypes };
// import {
//   PredicateNodeTypes,
//   PredicateTypes,
//   LeafType,
// } from "../LogicalExpressionGraph/LogicalExpressionGraph2";

// checkIdMapsToCorrectObject
class TestAbstractDirectedGraph extends AbstractDirectedGraph<PredicateNodeTypes> {
  public getParentNodeId(nodeId: string): string {
    return super.getParentNodeId(nodeId);
  }
}

describe("TreeObfuscator", () => {
  describe("Creation", () => {
    it("Should append/get child (blue skies).", () => {
      const predicate0 = {
        operator: "$eq",
        subjectId: "customer.predicate0",
        value: "predicate0",
      } as LeafType;
      const originalContent = { label: "root" };
      const originalGraph = new TestAbstractDirectedGraph(undefined);
      const obfuscatedGraph = new TreeObfuscator(originalGraph);
      const childId_0 = obfuscatedGraph.appendChildNodeWithContent(
        obfuscatedGraph.rootNodeId,
        predicate0
      );
      expect(obfuscatedGraph.getChildContent(childId_0)).toBe(predicate0);
    });
  });
  describe(".move(...) ", () => {
    it("Should move node. Preserve original target nodeId content relationship. (Leaf)", () => {
      const originalGraph = new TestAbstractDirectedGraph(undefined);
      const obfuscatedGraph = new TreeObfuscator(originalGraph);
      const { dTreeIds, dTree: dTree } = make3Children9GrandchildrenITree(obfuscatedGraph);

      const OO = originalPredicateObjects;

      const sourceNodeId = dTreeIds["child_0_1"];
      const targetNodeId = dTreeIds["child_1"];

      const preNodeCount = dTree.countTotalNodes();
      const preTargetDescendantCount = dTree.countDescendantsOf(targetNodeId);
      const preSourceDescendantCount = dTree.countDescendantsOf(sourceNodeId);

      const x = dTree.getChildrenContent(targetNodeId);
      // pre conditions
      expect(dTree.getChildrenContent(targetNodeId).sort()).toStrictEqual(
        [OO["child_1_0"], OO["child_1_1"], OO["child_1_2"]].sort()
      );

      // exercise
      dTree.move(sourceNodeId, targetNodeId);

      // post conditions
      const postTargetDescendantCount = dTree.countDescendantsOf(targetNodeId);
      const postSourceDescendantCount = dTree.countDescendantsOf(sourceNodeId);

      expect(dTree.getChildrenContent(targetNodeId).sort(SortPredicateTest)).toStrictEqual(
        [
          // OO["child_1"],
          OO["child_1_0"],
          OO["child_1_1"],
          OO["child_1_2"],
          OO["child_0_1"],
        ].sort(SortPredicateTest)
      );

      expect(dTree.countTotalNodes()).toStrictEqual(preNodeCount);
      expect(postTargetDescendantCount + postSourceDescendantCount).toBe(
        preTargetDescendantCount + preSourceDescendantCount + 1
      );
      // @ts-ignore - dTree not assignable...
      checkIdMapsToCorrectObject(dTree, dTreeIds);
    });

    it("Should move node. Preserve original target nodeId content relationship. (Branch)", () => {
      const originalGraph = new TestAbstractDirectedGraph(undefined);
      const obfuscatedGraph = new TreeObfuscator(originalGraph);
      const { dTreeIds, dTree: dTree } = make3Children9GrandchildrenITree(obfuscatedGraph);

      const OO = originalPredicateObjects;

      const sourceNodeId = dTreeIds["child_0"];
      const targetNodeId = dTreeIds["child_1"];

      const preNodeCount = dTree.countTotalNodes();
      const preTargetDescendantCount = dTree.countDescendantsOf(targetNodeId);
      const preSourceDescendantCount = dTree.countDescendantsOf(sourceNodeId);

      // pre conditions
      expect(dTree.getDescendantContent(targetNodeId).sort(SortPredicateTest)).toStrictEqual(
        [OO["child_1_0"], OO["child_1_1"], OO["child_1_2"]].sort(
          // @ts-ignore - these aren't Predicates
          SortPredicateTest
        )
      );

      // exercise
      dTree.move(sourceNodeId, targetNodeId);

      // post conditions
      const x = dTree.getDescendantContent(targetNodeId).sort(SortPredicateTest);
      expect(dTree.getDescendantContent(targetNodeId).sort(SortPredicateTest)).toStrictEqual(
        (
          [
            // { operator: "$or" },
            // OO["child_1"],
            OO["child_1_0"],
            OO["child_1_1"],
            OO["child_1_2"],
            OO["child_0"],
            OO["child_0_0"],
            OO["child_0_1"],
            OO["child_0_2"],
          ] as PredicateNodeTypes[]
        ).sort(SortPredicateTest)
      );

      const postTargetDescendantCount = dTree.countDescendantsOf(targetNodeId);
      expect(dTree.countTotalNodes()).toStrictEqual(preNodeCount);
      expect(postTargetDescendantCount).toBe(
        preTargetDescendantCount + preSourceDescendantCount + 1
      );
      // @ts-ignore - dTree not assignable....
      checkIdMapsToCorrectObject(dTree, dTreeIds);
    });
  }); // describe(".move(...) "

  describe(".moveChildren(...)", () => {
    it("Should attach children of source to target and remove source Node", () => {
      const originalGraph = new TestAbstractDirectedGraph(undefined);
      const obfuscatedGraph = new TreeObfuscator(originalGraph);

      const { dTreeIds, dTree: dTree } = make3Children9GrandchildrenITree(obfuscatedGraph);

      const OO = originalPredicateObjects;
      const targetNodeId = dTreeIds["child_1"];
      const sourceNodeId = dTreeIds["child_0"];

      // pre conditions
      expect(dTree.countTotalNodes(dTree.rootNodeId)).toEqual(13);
      expect(dTree.countTotalNodes(sourceNodeId)).toEqual(4);
      expect(dTree.countTotalNodes(targetNodeId)).toEqual(4);

      const preTargetDescendantContent = dTree.getDescendantContent(targetNodeId);
      expect(preTargetDescendantContent.sort(SortPredicateTest)).toStrictEqual(
        [OO["child_1_0"], OO["child_1_1"], OO["child_1_2"]].sort(SortPredicateTest)
      );

      const preSourceDescendantContent = dTree.getDescendantContent(sourceNodeId);
      expect(preSourceDescendantContent.sort(SortPredicateTest)).toStrictEqual(
        [OO["child_0_0"], OO["child_0_1"], OO["child_0_2"]].sort(SortPredicateTest)
      );

      // exercise
      dTree.moveChildren(sourceNodeId, targetNodeId);

      // post conditions
      expect(dTree.countTotalNodes(dTree.rootNodeId)).toEqual(13);
      expect(dTree.countTotalNodes(sourceNodeId)).toEqual(1);
      expect(dTree.countTotalNodes(targetNodeId)).toEqual(7);

      //- children child_0 and child_1 are descendants - just verify, I think that is correct
      expect(dTree.getDescendantContent(targetNodeId).sort(SortPredicateTest)).toStrictEqual(
        [
          // OO["child_0"],
          OO["child_0_0"],
          OO["child_0_1"],
          OO["child_0_2"],
          // OO["child_1"],
          OO["child_1_0"],
          OO["child_1_1"],
          OO["child_1_2"],
        ].sort(SortPredicateTest)
      );
      expect(dTree.getDescendantContent(sourceNodeId).sort(SortPredicateTest)).toStrictEqual(
        [].sort(SortPredicateTest)
      );

      // @ts-ignore - dTree not assignable
      checkIdMapsToCorrectObject(dTree, dTreeIds);
    });
  });

  describe("SubTree POJO to/from", () => {
    it("Blue skies", () => {
      const originalGraph = new TestAbstractDirectedGraph(undefined);
      const obfuscatedGraph = new TreeObfuscator(originalGraph);
      const { dTreeIds, dTree, subgraph } =
        make3Children9GrandchildrenITreeWithSubgraph_2_3(obfuscatedGraph);
      const OO = originalPredicateObjects;

      const parentVisitor = new TestTreeVisitor();
      const subTreeVisitor = new TestTreeVisitor();

      dTree.visitAllAt(parentVisitor);
      subgraph.visitAllAt(subTreeVisitor);
      const x = parentVisitor.contentItems.sort(SortPredicateTest);
      //      dTree._internalTree has  13 items - parentVisitor has 18 (maybe non-uniqueID whichs is ok)
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

          OO["subgraph_root"],
          OO["subgraph_0"],
          OO["subgraph_0_0"],
          OO["subgraph_0_1"],
          OO["subgraph_0_2"],
          OO["subgraph_1"],
          OO["subgraph_1_0"],
          OO["subgraph_1_1"],
          OO["subgraph_1_2"],
        ].sort(SortPredicateTest)
      );
      expect(subTreeVisitor.contentItems).toStrictEqual([
        OO["subgraph_root"],
        OO["subgraph_0"],
        OO["subgraph_0_0"],
        OO["subgraph_0_1"],
        OO["subgraph_0_2"],
        OO["subgraph_1"],
        OO["subgraph_1_0"],
        OO["subgraph_1_1"],
        OO["subgraph_1_2"],
      ]);

      // const subtreePojo = dTree.toPojo(); dTree should have toPojo,?
    });
    it("Should be able to convert tree to Pojo, and instantiate new identical tree with given Pojo.", () => {
      const originalGraph = new TestAbstractDirectedGraph(undefined);
      const obfuscatedGraph = new TreeObfuscator(originalGraph);
      const { dTreeIds, dTree, subgraph } =
        make3Children9GrandchildrenITreeWithSubgraph_2_3(obfuscatedGraph);
      const OO = originalPredicateObjects;

      const treePojo = dTree.toPojo() as TTreePojo<PredicateNodeTypes>;

      const subgraphPojo = subgraph.toPojo() as TTreePojo<PredicateNodeTypes>;

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

      expect(originalSubgraphContents.sort(SortPredicateTest)).toStrictEqual(
        reSubtreeContents.sort(SortPredicateTest)
      );
      expect(reTreeContents.sort(SortPredicateTest)).toStrictEqual(
        dTreeContents.sort(SortPredicateTest)
      );
    });

    it("(Predicate not WidgetType)Should throw error for orphan nodes.", () => {
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
      const originalGraph = new TestAbstractDirectedGraph(undefined);
      const obfuscatedGraph = new TreeObfuscator(originalGraph);
      const { dTreeIds, dTree, subgraph } =
        make3Children9GrandchildrenITreeWithSubgraph_2_3(obfuscatedGraph);
      const OO = originalPredicateObjects;

      const subtreePojo = dTree.toPojoAt(dTreeIds["child_0"]);

      const subTreeContent = filterPojoContent(subtreePojo);
      expect(subTreeContent).toStrictEqual([
        OO["child_0"],
        OO["child_0_0"],
        OO["child_0_1"],
        OO["child_0_2"],
      ]);
      const newTree = AbstractDirectedGraph.fromPojo<PredicateNodeTypes>(
        subtreePojo,
        undefined,
        TestAbstractDirectedGraph
      );
      expect(newTree.getChildContent(newTree.rootNodeId)).toStrictEqual(OO["child_0"]);
      const actualChildContent = newTree.getChildrenContent(newTree.rootNodeId);
      expect(actualChildContent).toStrictEqual([
        OO["child_0_0"],
        OO["child_0_1"],
        OO["child_0_2"],
      ]);
    });
  }); // subtree fromPojo

  describe("AbstractDirectedGraph.fromPOJO", () => {
    it("(not predicate widgets)Should create tree from pojo object. (ideal)", () => {
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
    it.skip("(Predicate not WidgetType)Should create subtrees if Pojo contains nodeType::subtree.", () => {
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

      //@ts-ignore SortPredicateTest
      expect(rootAndDescendantContent.sort(SortPredicateTest)).toStrictEqual(
        (
          [
            { label: "root" },
            { label: "child_0" },
            { label: "child_1" },
            { label: "child_2" },

            { label: "subtree-root" },
            { label: "subtree:0" },
            { label: "subtree:1" },
          ] as unknown as PredicateNodeTypes[]
        ).sort(SortPredicateTest)
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

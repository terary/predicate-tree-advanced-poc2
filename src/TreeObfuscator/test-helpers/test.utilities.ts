import { AbstractDirectedGraph } from "../../DirectedGraph/AbstractDirectedGraph";
import { ITree } from "../../DirectedGraph/ITree";
import { TGenericNodeContent } from "../../DirectedGraph/types";
import type { PredicateNodeTypes, PredicateTypes, LeafType } from "../TreeObfuscator.test";
import { TreeObfuscator } from "../TreeObfuscator";
class ExtAbstractTestClass extends TreeObfuscator<PredicateTypes> {}

const make3Children9GrandchildrenTreeAbstract = (dTree: ExtAbstractTestClass) => {
  return _make3Children9GrandchildrenTree(dTree);
};

const make3Children9GrandchildrenTree = () => {
  // @ts-ignore - missing ITree properties
  return _make3Children9GrandchildrenTree(new ExtAbstractTestClass());
};
const _make3Children9GrandchildrenTree = (dTree: ExtAbstractTestClass) => {
  const dTreeIds: { [id: string]: string } = {};
  dTree.replaceNodeContent(
    dTree.rootNodeId,
    originalPredicateObjects["root"] as PredicateNodeTypes
  );
  dTreeIds["root"] = dTree.rootNodeId;
  dTreeIds["child_0"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalPredicateObjects["child_0"] as PredicateNodeTypes
  );
  dTreeIds["child_1"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalPredicateObjects["child_1"] as PredicateNodeTypes
  );

  dTreeIds["child_2"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalPredicateObjects["child_2"] as PredicateNodeTypes
  );

  dTreeIds["child_0_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalPredicateObjects["child_0_0"] as PredicateNodeTypes
  );
  dTreeIds["child_0_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalPredicateObjects["child_0_1"] as PredicateNodeTypes
  );
  dTreeIds["child_0_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalPredicateObjects["child_0_2"] as PredicateNodeTypes
  );

  dTreeIds["child_1_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalPredicateObjects["child_1_0"] as PredicateNodeTypes
  );
  dTreeIds["child_1_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalPredicateObjects["child_1_1"] as PredicateNodeTypes
  );
  dTreeIds["child_1_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalPredicateObjects["child_1_2"] as PredicateNodeTypes
  );

  dTreeIds["child_2_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalPredicateObjects["child_2_0"] as PredicateNodeTypes
  );
  dTreeIds["child_2_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalPredicateObjects["child_2_1"] as PredicateNodeTypes
  );
  dTreeIds["child_2_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalPredicateObjects["child_2_2"] as PredicateNodeTypes
  );

  // ((3**(3+1)) - 1)/(3-1)
  // https://math.stackexchange.com/questions/2697334/what-is-the-formula-for-finding-the-summation-of-an-exponential-function
  // expect(dTree.countTotalNodes()).toEqual(13);
  return {
    dTreeIds,
    // originalPredicateObjects,
    //@ts-ignore - dTree -> ITree maybe mistake ..
    dTree: dTree as ITree<PredicateNodeTypes>,
  };
};

const make3Children9GrandchildrenITree = (dTree: ITree<PredicateNodeTypes>) => {
  const dTreeIds: { [id: string]: string } = {};
  dTree.replaceNodeContent(
    dTree.rootNodeId,
    originalPredicateObjects["root"] as PredicateNodeTypes
  );
  dTreeIds["root"] = dTree.rootNodeId;
  dTree.replaceNodeContent(dTree.rootNodeId, { operator: "$and" });

  dTreeIds["child_0"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalPredicateObjects["child_0"] as PredicateNodeTypes
  );
  dTreeIds["child_0_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalPredicateObjects["child_0_0"] as PredicateNodeTypes
  );
  dTreeIds["child_0_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalPredicateObjects["child_0_1"] as PredicateNodeTypes
  );
  dTreeIds["child_0_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalPredicateObjects["child_0_2"] as PredicateNodeTypes
  );

  dTreeIds["child_1"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalPredicateObjects["child_1"] as PredicateNodeTypes
  );
  // ----------
  dTreeIds["child_1_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalPredicateObjects["child_1_0"] as PredicateNodeTypes
  );
  dTreeIds["child_1_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalPredicateObjects["child_1_1"] as PredicateNodeTypes
  );
  dTreeIds["child_1_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalPredicateObjects["child_1_2"] as PredicateNodeTypes
  );
  // ----------
  dTreeIds["child_2"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalPredicateObjects["child_2"] as PredicateNodeTypes
  );
  // ----------
  dTreeIds["child_2_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalPredicateObjects["child_2_0"] as PredicateNodeTypes
  );
  dTreeIds["child_2_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalPredicateObjects["child_2_1"] as PredicateNodeTypes
  );
  dTreeIds["child_2_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalPredicateObjects["child_2_2"] as PredicateNodeTypes
  );
  // ((3**(3+1)) - 1)/(3-1)
  // https://math.stackexchange.com/questions/2697334/what-is-the-formula-for-finding-the-summation-of-an-exponential-function
  // expect(dTree.countTotalNodes()).toEqual(13);
  return {
    dTreeIds,
    // originalPredicateObjects,
    //@ts-ignore - dTree -> ITree maybe mistake ..
    dTree: dTree as ITree<PredicateNodeTypes>,
  };
};

const make3Children9GrandchildrenITreeWithSubgraph_2_3 = (
  dTree: ITree<PredicateNodeTypes>
) => {
  const dTreeIds: { [id: string]: string } = {};
  dTree.replaceNodeContent(
    dTree.rootNodeId,
    originalPredicateObjects["root"] as PredicateNodeTypes
  );
  dTreeIds["root"] = dTree.rootNodeId;
  // dTree.replaceNodeContent(dTree.rootNodeId, { operator: "$and" });

  // ----------
  dTreeIds["child_0"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalPredicateObjects["child_0"] as PredicateNodeTypes
  );
  dTreeIds["child_0_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalPredicateObjects["child_0_0"] as PredicateNodeTypes
  );
  dTreeIds["child_0_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalPredicateObjects["child_0_1"] as PredicateNodeTypes
  );
  dTreeIds["child_0_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalPredicateObjects["child_0_2"] as PredicateNodeTypes
  );

  // ----------
  dTreeIds["child_1"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalPredicateObjects["child_1"] as PredicateNodeTypes
  );
  dTreeIds["child_1_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalPredicateObjects["child_1_0"] as PredicateNodeTypes
  );
  dTreeIds["child_1_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalPredicateObjects["child_1_1"] as PredicateNodeTypes
  );
  dTreeIds["child_1_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalPredicateObjects["child_1_2"] as PredicateNodeTypes
  );
  // ----------

  const subgraph = dTree.createSubGraphAt(dTreeIds["child_1"]);

  subgraph.replaceNodeContent(subgraph.rootNodeId, originalPredicateObjects["subgraph_root"]);
  dTreeIds["subgraph_0"] = subgraph.appendChildNodeWithContent(
    subgraph.rootNodeId,
    originalPredicateObjects["subgraph_0"] as PredicateNodeTypes
  );

  dTreeIds["subgraph_0_0"] = subgraph.appendChildNodeWithContent(
    dTreeIds["subgraph_0"],
    originalPredicateObjects["subgraph_0_0"] as PredicateNodeTypes
  );
  dTreeIds["subgraph_0_1"] = subgraph.appendChildNodeWithContent(
    dTreeIds["subgraph_0"],
    originalPredicateObjects["subgraph_0_1"] as PredicateNodeTypes
  );
  dTreeIds["subgraph_0_2"] = subgraph.appendChildNodeWithContent(
    dTreeIds["subgraph_0"],
    originalPredicateObjects["subgraph_0_2"] as PredicateNodeTypes
  );

  dTreeIds["subgraph_1"] = subgraph.appendChildNodeWithContent(
    subgraph.rootNodeId,
    originalPredicateObjects["subgraph_1"] as PredicateNodeTypes
  );
  dTreeIds["subgraph_1_0"] = subgraph.appendChildNodeWithContent(
    dTreeIds["subgraph_1"],
    originalPredicateObjects["subgraph_1_0"] as PredicateNodeTypes
  );
  dTreeIds["subgraph_1_1"] = subgraph.appendChildNodeWithContent(
    dTreeIds["subgraph_1"],
    originalPredicateObjects["subgraph_1_1"] as PredicateNodeTypes
  );
  dTreeIds["subgraph_1_2"] = subgraph.appendChildNodeWithContent(
    dTreeIds["subgraph_1"],
    originalPredicateObjects["subgraph_1_2"] as PredicateNodeTypes
  );

  // ----------
  dTreeIds["child_2"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalPredicateObjects["child_2"] as PredicateNodeTypes
  );
  dTreeIds["child_2_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalPredicateObjects["child_2_0"] as PredicateNodeTypes
  );
  dTreeIds["child_2_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalPredicateObjects["child_2_1"] as PredicateNodeTypes
  );
  dTreeIds["child_2_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalPredicateObjects["child_2_2"] as PredicateNodeTypes
  );
  return {
    dTreeIds,
    subgraph,
    dTree: dTree as ITree<PredicateNodeTypes>,
  };
};

const originalPredicateObjects: { [nodeId: string]: TGenericNodeContent<PredicateNodeTypes> } =
  {
    root: {
      // operator: "$and",
      operator: "$gt",
      subjectId: "customer.root",
      value: "root",
    },
    child_0: {
      // operator: "$or",
      operator: "$lt",
      subjectId: "customer.child_0",
      value: "child_0",
    },
    child_1: {
      // operator: "$or",
      operator: "$eq",
      subjectId: "customer.child_1",
      value: "child_1",
    },
    child_2: {
      // operator: "$or",
      operator: "$eq",
      subjectId: "customer.child_2",
      value: "child_2",
    },
    child_0_0: {
      operator: "$eq",
      subjectId: "customer.child_0_0",
      value: "child_0_0",
    },

    child_0_1: {
      operator: "$eq",
      subjectId: "customer.child_0_1",
      value: "child_0_1",
    },
    child_0_2: {
      operator: "$eq",
      subjectId: "customer.child_0_2",
      value: "child_0_2",
    },
    // ---
    child_1_0: {
      operator: "$eq",
      subjectId: "customer.child_1_0",
      value: "child_1_0",
    },

    child_1_1: {
      operator: "$eq",
      subjectId: "customer.child_1_1",
      value: "child_1_1",
    },
    child_1_2: {
      operator: "$eq",
      subjectId: "customer.child_1_2",
      value: "child_1_2",
    },
    child_2_0: {
      operator: "$eq",
      subjectId: "customer.child_2_0",
      value: "child_2_0",
    },

    child_2_1: {
      operator: "$eq",
      subjectId: "customer.child_2_1",
      value: "child_2_1",
    },
    child_2_2: {
      operator: "$eq",
      subjectId: "customer.child_2_2",
      value: "child_2_2",
    },

    subgraph_0: {
      operator: "$eq",
      subjectId: "customer.subgraph_0",
      value: "subgraph_0",
    },
    subgraph_0_0: {
      operator: "$eq",
      subjectId: "customer.subgraph_0_0",
      value: "subgraph_0_0",
    },
    subgraph_0_1: {
      operator: "$eq",
      subjectId: "customer.subgraph_0_1",
      value: "subgraph_0_1",
    },
    subgraph_0_2: {
      operator: "$eq",
      subjectId: "customer.subgraph_0_2",
      value: "subgraph_0_2",
    },
    subgraph_root: {
      operator: "$eq",
      subjectId: "customer.subgraph_root",
      value: "subgraph_root",
    },
    subgraph_1: {
      operator: "$eq",
      subjectId: "customer.subgraph_1",
      value: "subgraph_1",
    },
    subgraph_1_0: {
      operator: "$eq",
      subjectId: "customer.subgraph_1_0",
      value: "subgraph_1_0",
    },
    subgraph_1_1: {
      operator: "$eq",
      subjectId: "customer.subgraph_1_1",
      value: "subgraph_1_1",
    },
    subgraph_1_2: {
      operator: "$eq",
      subjectId: "customer.subgraph_1_2",
      value: "subgraph_1_2",
    },
  };
Object.freeze(originalPredicateObjects);

const isBranchPredicate = (p: PredicateNodeTypes) => {
  return (p as PredicateTypes).operator === "$or" || (p as PredicateTypes).operator === "$and";
};

const isLeafPredicate = (p: PredicateNodeTypes) => {
  return !isBranchPredicate(p);
};

const checkIdMapsToCorrectObject = (
  dTree: ITree<PredicateNodeTypes>,
  dTreeIds: { [id: string]: string }
): void => {
  const missingIds: string[] = [];
  const x = originalPredicateObjects;
  Object.entries(originalPredicateObjects).forEach(([key, originalObject]) => {
    const debug1 = dTreeIds[key];
    if (dTreeIds[key] === undefined) {
      // this is a subtree thing
      return;
    }
    const debug2 = dTree.getChildContentAt(dTreeIds[key]) as PredicateTypes;
    if (!["$and", "$or"].includes(debug2?.operator)) {
      expect(dTree.getChildContentAt(dTreeIds[key])).toBe(originalObject);
    }
  });
};

const SortPredicateTest = (
  predicate1: PredicateNodeTypes | ITree<PredicateNodeTypes> | null,
  predicate2: PredicateNodeTypes | ITree<PredicateNodeTypes> | null
) => {
  const p1 = predicate1 as PredicateTypes;
  const p2 = predicate2 as PredicateTypes;
  if (isBranchPredicate(p1) && isBranchPredicate(p2)) {
    if (p1.operator > p2.operator) {
      return 1;
    }
    if (p1.operator < p2.operator) {
      return -1;
    }
    return 0;
  }
  if (isBranchPredicate(p1) && !isBranchPredicate(p2)) {
    return -1;
  }
  if (!isBranchPredicate(p1) && isBranchPredicate(p2)) {
    return 1;
  }

  if (isLeafPredicate(p1) && isLeafPredicate(p2)) {
    const { value: v1 } = p1 as LeafType;
    const { value: v2 } = p2 as LeafType;
    if ((v1 as string) > (v2 as string)) {
      return 1;
    }
    if ((v1 as string) < (v2 as string)) {
      return -1;
    }
    return 0;
  }

  return -1;
};

const filterPojoContent = (pojo: object) => {
  return Object.entries(pojo).map(([key, value]) => {
    return value.nodeContent;
  });
};

export {
  checkIdMapsToCorrectObject,
  filterPojoContent,
  originalPredicateObjects,
  make3Children9GrandchildrenITree,
  make3Children9GrandchildrenITreeWithSubgraph_2_3,
  make3Children9GrandchildrenTree,
  make3Children9GrandchildrenTreeAbstract,
  SortPredicateTest,
  PredicateNodeTypes,
};

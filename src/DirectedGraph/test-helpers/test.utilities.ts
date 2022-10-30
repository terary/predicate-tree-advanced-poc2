import { AbstractDirectedGraph } from "../AbstractDirectedGraph";
// import { ExtAbstractTestClass } from "../ExtAbstractTestClass";
import { ITree } from "../ITree";

class ExtAbstractTestClass extends AbstractDirectedGraph<WidgetType> {}

const make3ChildrenSubgraph2Children = (dTree: ITree<WidgetType>) => {
  // const dTree = new DirectedGraph<WidgetType>();
  const dTreeIds: { [id: string]: string } = {};
  dTree.replaceNodeContent(dTree.rootNodeId, { label: "root" });

  dTreeIds["root"] = dTree.rootNodeId;

  dTreeIds["child_0"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalWidgets["child_0"]
  );
  dTreeIds["child_1"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalWidgets["child_1"]
  );

  dTreeIds["child_2"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalWidgets["child_2"]
  );

  const subgraph = dTree.createSubGraphAt(dTreeIds["child_1"]);

  subgraph.replaceNodeContent(subgraph.rootNodeId, { label: "subgraph:root" });
  dTreeIds["child_1:subgraph_0"] = subgraph.appendChildNodeWithContent(subgraph.rootNodeId, {
    label: "child_1:subgraph_0",
  });
  dTreeIds["child_1:subgraph_1"] = subgraph.appendChildNodeWithContent(subgraph.rootNodeId, {
    label: "child_1:subgraph_1",
  });

  // *tmc* good check to have, but gums up debugging
  // expect(dTree.countTotalNodes()).toEqual(5);

  return {
    dTreeIds,
    dTree: dTree as ITree<WidgetType>,
    subgraph: subgraph as ITree<WidgetType>,
  };
};

const make3Children9GrandchildrenTreeAbstract = (dTree: ITree<WidgetType>) => {
  return _make3Children9GrandchildrenTree(dTree);
};

const make3Children9GrandchildrenTree = () => {
  // @ts-ignore - missing ITree properties
  return _make3Children9GrandchildrenTree(new ExtAbstractTestClass<WidgetType>());
};
const _make3Children9GrandchildrenTree = (dTree: ITree<WidgetType>) => {
  // const dTree = new ExtAbstractTestClass<WidgetType>();
  const dTreeIds: { [id: string]: string } = {};
  dTree.replaceNodeContent(dTree.rootNodeId, originalWidgets["root"]);

  dTreeIds["root"] = dTree.rootNodeId;

  dTreeIds["child_0"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalWidgets["child_0"]
  );
  dTreeIds["child_1"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalWidgets["child_1"]
  );
  dTreeIds["child_2"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalWidgets["child_2"]
  );

  dTreeIds["child_0_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalWidgets["child_0_0"]
  );
  dTreeIds["child_0_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalWidgets["child_0_1"]
  );
  dTreeIds["child_0_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalWidgets["child_0_2"]
  );

  dTreeIds["child_1_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalWidgets["child_1_0"]
  );
  dTreeIds["child_1_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalWidgets["child_1_1"]
  );
  dTreeIds["child_1_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalWidgets["child_1_2"]
  );

  dTreeIds["child_2_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalWidgets["child_2_0"]
  );
  dTreeIds["child_2_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalWidgets["child_2_1"]
  );
  dTreeIds["child_2_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalWidgets["child_2_2"]
  );

  // ((3**(3+1)) - 1)/(3-1)
  // https://math.stackexchange.com/questions/2697334/what-is-the-formula-for-finding-the-summation-of-an-exponential-function
  // expect(dTree.countTotalNodes()).toEqual(13);
  return {
    dTreeIds,
    //@ts-ignore - dTree -> ITree maybe mistake ..
    dTree: dTree as ITree<WidgetType>,
  };
};

type WidgetType = { label: string };

const originalWidgets = {
  root: {
    label: "root",
  },
  child_0: {
    label: "child_0",
  },
  child_0_0: {
    label: "child_0_0",
  },

  child_0_1: {
    label: "child_0_1",
  },
  child_0_2: {
    label: "child_0_2",
  },

  child_1: {
    label: "child_1",
  },

  child_1_0: {
    label: "child_1_0",
  },
  child_1_1: {
    label: "child_1_1",
  },
  child_1_2: {
    label: "child_1_2",
  },

  child_2: {
    label: "child_2",
  },
  child_2_0: {
    label: "child_2_0",
  },
  child_2_1: {
    label: "child_2_1",
  },
  child_2_2: {
    label: "child_2_2",
  },
};
Object.freeze(originalWidgets);
const WidgetSort = (a: any, b: any) => {
  if (a === null || b === null) {
    return 0;
  }
  if (!("label" in a || "label" in a)) {
    return 0;
  }

  if (a.label === b.label) {
    return 0;
  }
  if (a.label > b.label) {
    return 1;
  }
  return -1;
};

const filterPojoContent = (pojo: object) => {
  return Object.entries(pojo).map(([key, value]) => {
    return value.nodeContent;
  });
};

export {
  filterPojoContent,
  originalWidgets,
  make3Children9GrandchildrenTree,
  make3Children9GrandchildrenTreeAbstract,
  make3ChildrenSubgraph2Children,
  WidgetSort,
  WidgetType,
};

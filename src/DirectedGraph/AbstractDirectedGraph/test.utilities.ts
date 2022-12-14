import { AbstractDirectedGraph } from "./AbstractDirectedGraph";
// import { ExtAbstractTestClass } from "../ExtAbstractTestClass";
import { IDirectedGraph, ITree } from "../ITree";

class ExtAbstractTestClass extends AbstractDirectedGraph<WidgetType> {}

const make3ChildrenSubtree2Children = (dTree: IDirectedGraph<WidgetType>) => {
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

  const subtree = dTree.createSubtreeAt(dTreeIds["child_1"]);
  dTreeIds["child_1:subtree_root"] = subtree.rootNodeId;
  subtree.replaceNodeContent(subtree.rootNodeId, { label: "subtree:root" });
  dTreeIds["child_1:subtree_0"] = subtree.appendChildNodeWithContent(subtree.rootNodeId, {
    label: "child_1:subtree_0",
  });
  dTreeIds["child_1:subtree_1"] = subtree.appendChildNodeWithContent(subtree.rootNodeId, {
    label: "child_1:subtree_1",
  });

  // *tmc* good check to have, but gums up debugging
  // expect(dTree.countTotalNodes()).toEqual(5);

  return {
    dTreeIds,
    dTree: dTree as IDirectedGraph<WidgetType>,
    subtree: subtree as IDirectedGraph<WidgetType>,
  };
};

const make3Children2Subtree3Children = (dTree: IDirectedGraph<WidgetType>) => {
  const dTreeIds: { [id: string]: string } = {};
  dTree.replaceNodeContent(dTree.rootNodeId, { label: "root" });

  dTreeIds["root"] = dTree.rootNodeId;

  //child0, subtree0, child1, subtree1, child2
  dTreeIds["child_0"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalWidgetsSubtree["child_0"]
  );

  const subtree0 = dTree.createSubtreeAt(dTree.rootNodeId);
  dTreeIds["subtree0:root"] = subtree0.rootNodeId;
  subtree0.replaceNodeContent(subtree0.rootNodeId, originalWidgetsSubtree["subtree0:root"]);

  dTreeIds["child_1"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalWidgetsSubtree["child_1"]
  );

  const subtree1 = dTree.createSubtreeAt(dTree.rootNodeId);
  dTreeIds["subtree1:root"] = subtree1.rootNodeId;
  subtree1.replaceNodeContent(subtree1.rootNodeId, originalWidgetsSubtree["subtree1:root"]);

  dTreeIds["child_2"] = dTree.appendChildNodeWithContent(
    dTree.rootNodeId,
    originalWidgetsSubtree["child_2"]
  );

  /// --- children of child0
  dTreeIds["child_0_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalWidgetsSubtree["child_0_0"]
  );

  dTreeIds["child_0_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalWidgetsSubtree["child_0_1"]
  );

  dTreeIds["child_0_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalWidgetsSubtree["child_0_2"]
  );

  /// --- children of subtree0
  dTreeIds["subtree0:child_0"] = subtree0.appendChildNodeWithContent(
    dTreeIds["subtree0:root"],
    originalWidgetsSubtree["subtree0:child_0"]
  );

  dTreeIds["subtree0:child_1"] = subtree0.appendChildNodeWithContent(
    dTreeIds["subtree0:root"],
    originalWidgetsSubtree["subtree0:child_1"]
  );

  dTreeIds["subtree0:child_2"] = subtree0.appendChildNodeWithContent(
    dTreeIds["subtree0:root"],
    originalWidgetsSubtree["subtree0:child_2"]
  );

  /// --- children of child_1
  dTreeIds["child_1_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalWidgetsSubtree["child_1_0"]
  );
  dTreeIds["child_1_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalWidgetsSubtree["child_1_1"]
  );
  dTreeIds["child_1_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalWidgetsSubtree["child_1_2"]
  );

  /// --- children of subtree1
  dTreeIds["subtree1:child_0"] = subtree1.appendChildNodeWithContent(
    dTreeIds["subtree1:root"],
    originalWidgetsSubtree["subtree1:child_0"]
  );
  dTreeIds["subtree1:child_1"] = subtree1.appendChildNodeWithContent(
    dTreeIds["subtree1:root"],
    originalWidgetsSubtree["subtree1:child_1"]
  );

  dTreeIds["subtree1:child_2"] = subtree1.appendChildNodeWithContent(
    dTreeIds["subtree1:root"],
    originalWidgetsSubtree["subtree1:child_2"]
  );

  // --- children of child_2
  dTreeIds["child_2_0"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalWidgetsSubtree["child_2_0"]
  );
  dTreeIds["child_2_1"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalWidgetsSubtree["child_2_1"]
  );
  dTreeIds["child_2_2"] = dTree.appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalWidgetsSubtree["child_2_2"]
  );

  // *tmc* good check to have, but gums up debugging
  // expect(dTree.countTotalNodes()).toEqual(5);

  return {
    dTreeIds,
    dTree: dTree as ITree<WidgetType>,
    subtree0: subtree0 as ITree<WidgetType>,
    subtree1: subtree1 as ITree<WidgetType>,
    originalWidgets: originalWidgetsSubtree,
  };
};

const make3Children9GrandchildrenTreeAbstract = (dTree: IDirectedGraph<WidgetType>) => {
  return _make3Children9GrandchildrenTree(dTree);
};

const make3Children9GrandchildrenTree = () => {
  // @ts-ignore - missing ITree properties
  return _make3Children9GrandchildrenTree(new ExtAbstractTestClass<WidgetType>());
};
const _make3Children9GrandchildrenTree = (dTree: IDirectedGraph<WidgetType>) => {
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

const originalWidgetsSubtree = {
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

  "subtree0:root": {
    label: "subtree0:root",
  },

  "subtree0:child_0": {
    label: "subtree0:child_0",
  },
  "subtree0:child_1": {
    label: "subtree0:child_1",
  },
  "subtree0:child_2": {
    label: "subtree0:child_2",
  },

  "subtree1:root": {
    label: "subtree1:root",
  },
  "subtree1:child_0": {
    label: "subtree1:child_0",
  },
  "subtree1:child_1": {
    label: "subtree1:child_1",
  },
  "subtree1:child_2": {
    label: "subtree1:child_2",
  },
};
Object.freeze(originalWidgetsSubtree);

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

const filterPojoContentPredicateValues = (pojo: object) => {
  return Object.entries(pojo).map(([key, value]) => {
    const { nodeContent } = value;
    if (nodeContent.value) {
      return nodeContent.value;
    }
    return nodeContent.operator;
  });
};

const filterPojoContent = (pojo: object) => {
  return Object.entries(pojo).map(([key, value]) => {
    return value.nodeContent;
  });
};

export {
  filterPojoContent,
  filterPojoContentPredicateValues,
  originalWidgets,
  make3Children9GrandchildrenTree,
  make3Children9GrandchildrenTreeAbstract,
  make3ChildrenSubtree2Children,
  make3Children2Subtree3Children,
  WidgetSort,
  WidgetType,
};

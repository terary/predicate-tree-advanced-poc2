import type {
  TJunction,
  TOperand,
  TOperandOperators,
  TPredicateNodeTypes,
  TPredicateTypes,
} from "./types";
import fs from "fs";
import { IExpressionTree, ITree } from "../ITree";
import type { TGenericNodeContent } from "../types"; //<TPredicateNodeTypes>
import { AbstractTree } from "../AbstractTree/AbstractTree";

import { ClassTestAbstractExpressionTree } from "./AbstractExpressionTree.test";

// const exportForTestOnly = {
//   ClassTestAbstractExpressionTree,
// };

const makePojo3Children9Grandchildren = () => {
  return {
    root: {
      parentId: "root",
      nodeContent: { operator: "$and" },
    },
    child_0: {
      parentId: "root",
      nodeContent: {
        operator: "$or",
      },
    },
    child_1: {
      parentId: "root",
      nodeContent: {
        operator: "$or",
      },
    },
    child_2: {
      parentId: "root",
      nodeContent: {
        operator: "$or",
      },
    },
    child_0_0: {
      parentId: "child_0",
      nodeContent: {
        operator: "$eq",
        subjectId: "customer.child_0_0",
        value: "child_0_0",
      },
    },
    child_0_1: {
      parentId: "child_0",
      nodeContent: {
        operator: "$eq",
        subjectId: "customer.child_0_1",
        value: "child_0_1",
      },
    },
    child_0_2: {
      parentId: "child_0",
      nodeContent: {
        operator: "$eq",
        subjectId: "customer.child_0_2",
        value: "child_0_2",
      },
    },
    child_1_0: {
      parentId: "child_1",
      nodeContent: {
        operator: "$eq",
        subjectId: "customer.child_1_0",
        value: "child_1_0",
      },
    },
    child_1_1: {
      parentId: "child_1",
      nodeContent: {
        operator: "$eq",
        subjectId: "customer.child_1_1",
        value: "child_1_1",
      },
    },
    child_1_2: {
      parentId: "child_1",
      nodeContent: {
        operator: "$eq",
        subjectId: "customer.child_1_2",
        value: "child_1_2",
      },
    },
    child_2_0: {
      parentId: "child_2",
      nodeContent: {
        operator: "$eq",
        subjectId: "customer.child_2_0",
        value: "child_2_0",
      },
    },
    child_2_1: {
      parentId: "child_2",
      nodeContent: {
        operator: "$eq",
        subjectId: "customer.child_2_1",
        value: "child_2_1",
      },
    },
    child_2_2: {
      parentId: "child_2",
      nodeContent: {
        operator: "$eq",
        subjectId: "customer.child_2_2",
        value: "child_2_2",
      },
    },
  };
};

const pojo2Children1subtree9leaves_content: { [nodeId: string]: TPredicateTypes } = {};
pojo2Children1subtree9leaves_content["root"] = { operator: "$and" };
pojo2Children1subtree9leaves_content["child_0"] = { operator: "$or" };
pojo2Children1subtree9leaves_content["child_1"] = { operator: "$or" };
pojo2Children1subtree9leaves_content["child_2"] = { operator: "$or" };
pojo2Children1subtree9leaves_content["child_0_0"] = {
  operator: "$eq",
  subjectId: "customer.child_0_0",
  value: "child_0_0",
};
pojo2Children1subtree9leaves_content["child_0_1"] = {
  operator: "$eq",
  subjectId: "customer.child_0_1",
  value: "child_0_1",
};
pojo2Children1subtree9leaves_content["child_0_2"] = {
  operator: "$eq",
  subjectId: "customer.child_0_2",
  value: "child_0_2",
};
pojo2Children1subtree9leaves_content["child_1_0"] = {
  operator: "$eq",
  subjectId: "customer.child_1_0",
  value: "child_1_0",
};
pojo2Children1subtree9leaves_content["child_1_1"] = {
  operator: "$eq",
  subjectId: "customer.child_1_1",
  value: "child_1_1",
};
pojo2Children1subtree9leaves_content["child_1_2"] = {
  operator: "$eq",
  subjectId: "customer.child_1_2",
  value: "child_1_2",
};
pojo2Children1subtree9leaves_content["child_2_0"] = {
  operator: "$eq",
  subjectId: "customer.child_2_0",
  value: "child_2_0",
};
pojo2Children1subtree9leaves_content["child_2_1"] = {
  operator: "$eq",
  subjectId: "customer.child_2_1",
  value: "child_2_1",
};
pojo2Children1subtree9leaves_content["child_2_2"] = {
  operator: "$eq",
  subjectId: "customer.child_2_2",
  value: "child_2_2",
};
// --------

// const make3Children2Subtree3Children = (dTree: IExpressionTree<TPredicateTypes>) => {
const make3Children2Subtree3Children = (dTree: ClassTestAbstractExpressionTree) => {
  const dTreeIds: { [id: string]: string } = {};

  dTree.replaceNodeContent(dTree.rootNodeId, originalWidgetsSubtree["root"]);

  dTreeIds["root"] = dTree.rootNodeId;
  //child0, subtree0, child1, subtree1, child2
  dTreeIds["child_0"] = dTree._appendChildNodeWithContent(
    dTree.rootNodeId,
    originalWidgetsSubtree["child_0"]
  );
  // const subtree0 = dTree.createSubtreeAt(dTreeIds["child_0"]);
  const subtree0 = dTree.createSubtreeAt(dTree.rootNodeId) as ClassTestAbstractExpressionTree;
  dTreeIds["subtree0:root"] = subtree0.rootNodeId;
  subtree0.replaceNodeContent(subtree0.rootNodeId, originalWidgetsSubtree["subtree0:root"]);

  dTreeIds["child_1"] = dTree._appendChildNodeWithContent(
    dTree.rootNodeId,
    originalWidgetsSubtree["child_1"]
  );

  const subtree1 = dTree.createSubtreeAt(dTree.rootNodeId) as ClassTestAbstractExpressionTree;
  dTreeIds["subtree1:root"] = subtree1.rootNodeId;
  subtree1.replaceNodeContent(subtree1.rootNodeId, originalWidgetsSubtree["subtree1:root"]);

  dTreeIds["child_2"] = dTree._appendChildNodeWithContent(
    dTree.rootNodeId,
    originalWidgetsSubtree["child_2"]
  );

  /// --- children of child0
  dTreeIds["child_0_0"] = dTree._appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalWidgetsSubtree["child_0_0"]
  );

  dTreeIds["child_0_1"] = dTree._appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalWidgetsSubtree["child_0_1"]
  );

  dTreeIds["child_0_2"] = dTree._appendChildNodeWithContent(
    dTreeIds["child_0"],
    originalWidgetsSubtree["child_0_2"]
  );

  /// --- children of subtree0
  dTreeIds["subtree0:child_0"] = subtree0._appendChildNodeWithContent(
    dTreeIds["subtree0:root"],
    originalWidgetsSubtree["subtree0:child_0"]
  );

  dTreeIds["subtree0:child_1"] = subtree0._appendChildNodeWithContent(
    dTreeIds["subtree0:root"],
    originalWidgetsSubtree["subtree0:child_1"]
  );

  dTreeIds["subtree0:child_2"] = subtree0._appendChildNodeWithContent(
    dTreeIds["subtree0:root"],
    originalWidgetsSubtree["subtree0:child_2"]
  );

  /// --- children of child_1
  dTreeIds["child_1_0"] = dTree._appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalWidgetsSubtree["child_1_0"]
  );

  dTreeIds["child_1_1"] = dTree._appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalWidgetsSubtree["child_1_1"]
  );

  dTreeIds["child_1_2"] = dTree._appendChildNodeWithContent(
    dTreeIds["child_1"],
    originalWidgetsSubtree["child_1_2"]
  );

  /// --- children of subtree1
  dTreeIds["subtree1:child_0"] = subtree1._appendChildNodeWithContent(
    dTreeIds["subtree1:root"],
    originalWidgetsSubtree["subtree1:child_0"]
  );

  dTreeIds["subtree1:child_1"] = subtree1._appendChildNodeWithContent(
    dTreeIds["subtree1:root"],
    originalWidgetsSubtree["subtree1:child_1"]
  );

  dTreeIds["subtree1:child_2"] = subtree1._appendChildNodeWithContent(
    dTreeIds["subtree1:root"],
    originalWidgetsSubtree["subtree1:child_2"]
  );

  // --- children of child_2
  dTreeIds["child_2_0"] = dTree._appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalWidgetsSubtree["child_2_0"]
  );

  dTreeIds["child_2_1"] = dTree._appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalWidgetsSubtree["child_2_1"]
  );

  dTreeIds["child_2_2"] = dTree._appendChildNodeWithContent(
    dTreeIds["child_2"],
    originalWidgetsSubtree["child_2_2"]
  );

  // *tmc* good check to have, but gums up debugging
  // expect(dTree.countTotalNodes()).toEqual(5);

  return {
    dTreeIds,
    dTree: dTree as ITree<TPredicateTypes>,
    subtree0: subtree0 as ITree<TPredicateTypes>,
    subtree1: subtree1 as ITree<TPredicateTypes>,
    originalWidgets: originalWidgetsSubtree,
  };
};

const originalWidgetsSubtree: { [nodeId: string]: TPredicateTypes } = {
  root: {
    operator: "$and",
  },
  child_0: {
    operator: "$or",
  },
  child_0_0: {
    operator: "$eq",
    subjectId: "customer.child_0_0",
    value: "child_0_0",
  },
  child_0_1: {
    operator: "$eq",
    subjectId: "customer.child_0_1",
    value: "child_0_0",
  },
  child_0_2: {
    operator: "$eq",
    subjectId: "customer.child_0_2",
    value: "child_0_0",
  },

  child_1: {
    operator: "$or",
  },

  child_1_0: {
    operator: "$eq",
    subjectId: "customer.child_1_0",
    value: "child_1_0",
  },
  child_1_1: {
    operator: "$eq",
    subjectId: "customer.child_1_1",
    value: "child_1_0",
  },
  child_1_2: {
    operator: "$eq",
    subjectId: "customer.child_1_2",
    value: "child_1_0",
  },

  child_2: {
    operator: "$or",
  },
  child_2_0: {
    operator: "$eq",
    subjectId: "customer.child_2_0",
    value: "child_2_0",
  },
  child_2_1: {
    operator: "$eq",
    subjectId: "customer.child_2_1",
    value: "child_2_0",
  },
  child_2_2: {
    operator: "$eq",
    subjectId: "customer.child_2_2",
    value: "child_2_0",
  },

  "subtree0:root": {
    operator: "$and",
    //    label: "subtree0:root",
  },

  "subtree0:child_0": {
    operator: "$eq",
    subjectId: "customer.subtree0:child_0",
    value: "subtree0:child_0",
  },
  "subtree0:child_1": {
    operator: "$eq",
    subjectId: "customer.subtree0:child_1",
    value: "subtree0:child_1",
  },
  "subtree0:child_2": {
    operator: "$eq",
    subjectId: "customer.subtree0:child_2",
    value: "subtree0:child_2",
  },

  "subtree1:root": {
    operator: "$or",
    // label: "subtree1:root",
  },
  "subtree1:child_0": {
    operator: "$eq",
    subjectId: "customer.subtree1:child_0",
    value: "subtree1:child_0",
  },
  "subtree1:child_1": {
    operator: "$eq",
    subjectId: "customer.subtree1:child_1",
    value: "subtree1:child_1",
  },
  "subtree1:child_2": {
    operator: "$eq",
    subjectId: "customer.subtree1:child_2",
    value: "subtree1:child_2",
  },
};
Object.freeze(originalWidgetsSubtree);

// --------
const makePojo2Children1subtree9leaves_content = {
  root: {
    parentId: "root",
    nodeContent: { operator: "$and" },
  },
  child_0: {
    parentId: "root",
    nodeContent: {
      operator: "$or",
    },
  },
  child_1: {
    parentId: "root",
    nodeType: "subtree",
    nodeContent: {
      operator: "$or",
    },
  },
  child_2: {
    parentId: "root",
    nodeContent: {
      operator: "$or",
    },
  },
  child_0_0: {
    parentId: "child_0",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.child_0_0",
      value: "child_0_0",
    },
  },
  child_0_1: {
    parentId: "child_0",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.child_0_1",
      value: "child_0_1",
    },
  },
  child_0_2: {
    parentId: "child_0",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.child_0_2",
      value: "child_0_2",
    },
  },
  child_1_0: {
    parentId: "child_1",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.child_1_0",
      value: "child_1_0",
    },
  },
  child_1_1: {
    parentId: "child_1",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.child_1_1",
      value: "child_1_1",
    },
  },
  child_1_2: {
    parentId: "child_1",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.child_1_2",
      value: "child_1_2",
    },
  },
  child_2_0: {
    parentId: "child_2",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.child_2_0",
      value: "child_2_0",
    },
  },
  child_2_1: {
    parentId: "child_2",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.child_2_1",
      value: "child_2_1",
    },
  },
  child_2_2: {
    parentId: "child_2",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.child_2_2",
      value: "child_2_2",
    },
  },
};

const makePojo2Children1subtree9leaves = () => {
  const content = pojo2Children1subtree9leaves_content;
  return {
    root: {
      parentId: "root",
      nodeContent: content["root"],
    },
    child_0: {
      parentId: "root",
      nodeContent: content["child_0"],
    },
    child_1: {
      parentId: "root",
      nodeType: "subtree",
      nodeContent: content["child_1"],
    },
    child_2: {
      parentId: "root",
      nodeContent: content["child_2"],
    },
    child_0_0: {
      parentId: "child_0",
      nodeContent: content["child_0_0"],
    },
    child_0_1: {
      parentId: "child_0",
      nodeContent: content["child_0_1"],
    },
    child_0_2: {
      parentId: "child_0",
      nodeContent: content["child_0_2"],
    },
    child_1_0: {
      parentId: "child_1",
      nodeContent: content["child_1_0"],
    },
    child_1_1: {
      parentId: "child_1",
      nodeContent: content["child_1_1"],
    },
    child_1_2: {
      parentId: "child_1",
      nodeContent: content["child_1_2"],
    },
    child_2_0: {
      parentId: "child_2",
      nodeContent: content["child_2_0"],
    },
    child_2_1: {
      parentId: "child_2",
      nodeContent: content["child_2_1"],
    },
    child_2_2: {
      parentId: "child_2",
      nodeContent: content["child_2_2"],
    },
  };
};

makePojo2Children1subtree9leaves.content = pojo2Children1subtree9leaves_content;
const makePojo3Children = () => {
  return {
    root: {
      parentId: "root",
      nodeContent: { operator: "$and" },
    },
    child_0: {
      parentId: "root",
      nodeContent: {
        operator: "$eq",
        subjectId: "customer.child_0",
        value: "child_0",
      },
    },
    child_1: {
      parentId: "root",
      nodeContent: {
        operator: "$eq",
        subjectId: "customer.child_1",
        value: "child_1",
      },
    },
    child_2: {
      parentId: "root",
      nodeContent: {
        operator: "$eq",
        subjectId: "customer.child_2",
        value: "child_2",
      },
    },
  };
};

const isBranchPredicate = (p: TPredicateTypes) => {
  return p.operator === "$or" || p.operator === "$and";
};

const isLeafPredicate = (p: TPredicateTypes) => {
  return !isBranchPredicate(p);
};

const SortPredicateTest = (
  predicate1: TGenericNodeContent<TPredicateNodeTypes>,
  predicate2: TGenericNodeContent<TPredicateNodeTypes>
) => {
  const p1 = predicate1 as TPredicateTypes;
  const p2 = predicate2 as TPredicateTypes;

  if (p1 === null && p2 !== null) {
    return 1;
  }
  if (p1 !== null && p2 === null) {
    return -1;
  }
  if (p1 === null && p2 === null) {
    return 0;
  }

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
    const { value: v1 } = p1 as unknown as TOperand;
    const { value: v2 } = p2 as unknown as TOperand;
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

export {
  make3Children2Subtree3Children, // don't know why the 'as' is necessary
  makePojo3Children9Grandchildren,
  makePojo3Children,
  makePojo2Children1subtree9leaves,
  SortPredicateTest,
};

import type {
  TJunction,
  TOperand,
  TOperandOperators,
  TPredicateNodeTypes,
  TPredicateTypes,
} from "./types";
import { ITree } from "../ITree";

// type PredicateTypes = TOperand | TJunction;
// type PredicateNodeTypes = TOperand | TJunction;

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
  predicate1: TPredicateNodeTypes | null,
  predicate2: TPredicateNodeTypes | null
) => {
  const p1 = predicate1 as TPredicateTypes;
  const p2 = predicate2 as TPredicateTypes;
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
  makePojo3Children9Grandchildren,
  makePojo3Children,
  makePojo2Children1subtree9leaves,
  SortPredicateTest,
};

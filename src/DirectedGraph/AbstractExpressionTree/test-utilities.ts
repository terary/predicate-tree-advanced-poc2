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

const makePojo2Children1subtree9leaves = () => {
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
};

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
export {
  makePojo3Children9Grandchildren,
  makePojo3Children,
  makePojo2Children1subtree9leaves,
};

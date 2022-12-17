import type { TTreePojo } from "../../src";
import type { TPredicateNodeTypes } from "./types";

const rubblePojo = {
  rubble: { parentId: "root", nodeContent: { operator: "$and" } },
  "rubble.lastname": {
    parentId: "rubble",
    nodeContent: { value: "Rubble", operator: "$eq", subjectId: "customer.lastname" },
  },
  "rubble.firstname": {
    parentId: "rubble",
    nodeContent: { operator: "$or" },
  },
  "rubble.firstname0": {
    parentId: "rubble.firstname",
    nodeContent: { value: "Barney", operator: "$eq", subjectId: "customer.firstname" },
  },
  "rubble.firstname1": {
    parentId: "rubble.firstname",
    nodeContent: { value: "Betty", operator: "$eq", subjectId: "customer.firstname" },
  },
};

const flintstonePojo = {
  flintstone: { parentId: "root", nodeContent: { operator: "$and" } },
  "flintstone.lastname": {
    parentId: "flintstone",
    nodeContent: { value: "Flintstone", operator: "$eq", subjectId: "customer.lastname" },
  },
  "flintstone.firstname": {
    parentId: "flintstone",
    nodeContent: { operator: "$or" },
  },
  "flintstone.firstname0": {
    parentId: "flintstone.firstname",
    nodeContent: { value: "Fred", operator: "$eq", subjectId: "customer.firstname" },
  },
  "flintstone.firstname1": {
    parentId: "flintstone.firstname",
    nodeContent: { value: "Wilma", operator: "$eq", subjectId: "customer.firstname" },
  },
};
const agePojo = {
  age: { parentId: "root", nodeType: "subtree", nodeContent: { operator: "$and" } },
  "age.min": {
    parentId: "age",
    nodeContent: { value: 3, operator: "$ge", subjectId: "customer.age" },
  },
  "age.max": {
    parentId: "age",
    nodeContent: { value: 42, operator: "$lt", subjectId: "customer.age" },
  },
};

const notTree = {
  not: { parentId: "root", nodeType: "subtree", nodeContent: { operator: "$not" } },
  "not.001": {
    parentId: "not",
    nodeContent: { value: "mickey", operator: "$eq", subjectId: "customer.firstname" },
  },
  "not.002": {
    parentId: "not",
    nodeContent: { value: "minnie", operator: "$eq", subjectId: "customer.firstname" },
  },
};

const rootPojo = {
  root: { parentId: "root", nodeContent: { operator: "$or" } },
};

const matcherPojo = {
  ...rootPojo,
  ...rubblePojo,
  ...flintstonePojo,
  // ...agePojo,
} as TTreePojo<TPredicateNodeTypes>;

export { matcherPojo, notTree as notTreePojo, agePojo };

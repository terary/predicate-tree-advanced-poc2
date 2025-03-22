/**
 * Simple Predicate Tree POJO for the example
 * This represents a tree with the logical expression:
 * (firstname === "John" AND age >= 18) OR (firstname === "Jane" AND active === true)
 */
import { TTreePojo } from "../../../src";

export const predicateTreePojo = {
  _root_: {
    nodeType: "branch",
    nodeContent: { operator: "$or" },
  },
  "_root_->0": {
    nodeType: "branch",
    nodeContent: { operator: "$and" },
  },
  "_root_->1": {
    nodeType: "branch",
    nodeContent: { operator: "$and" },
  },
  "_root_->0->0": {
    nodeType: "leaf",
    nodeContent: {
      subject: "person.firstname",
      operator: "$eq",
      value: "John",
    },
  },
  "_root_->0->1": {
    nodeType: "leaf",
    nodeContent: {
      subject: "person.age",
      operator: "$gte",
      value: 18,
    },
  },
  "_root_->1->0": {
    nodeType: "leaf",
    nodeContent: {
      subject: "person.firstname",
      operator: "$eq",
      value: "Jane",
    },
  },
  "_root_->1->1": {
    nodeType: "leaf",
    nodeContent: {
      subject: "person.active",
      operator: "$eq",
      value: true,
    },
  },
};

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

const rootPojo = {
  root: { parentId: "root", nodeContent: { operator: "$or" } },
};

const addressTreePojo = {
  "customer.address": {
    nodeType: "subtree",
    parentId: "customer.address",
    nodeContent: { operator: "$addressTree" },
  },
  "customer.address.address1": {
    parentId: "customer.address",
    nodeContent: { operator: "$eq", subjectId: "customer.address.address1", value: "addr1" },
  },
  "customer.address.address2": {
    parentId: "customer.address",
    nodeContent: { operator: "$eq", subjectId: "customer.address.address2", value: "addr2" },
  },
  "customer.address.address3": {
    parentId: "customer.address",
    nodeContent: { operator: "$eq", subjectId: "customer.address.address3", value: "addr3" },
  },
  "customer.address.city": {
    parentId: "customer.address",
    nodeContent: { operator: "$eq", subjectId: "customer.address.city", value: "city" },
  },
  "customer.address.stateOrProvince": {
    parentId: "customer.address",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.address.stateOrProvince",
      value: "stateOrProvince",
    },
  },
  "customer.address.postalCode": {
    parentId: "customer.address",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.address.postalCode",
      value: "postalCode",
    },
  },
  "customer.address.country": {
    parentId: "customer.address",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.address.country",
      value: "country",
    },
  },
  "customer.address.specialInstructions": {
    parentId: "customer.address",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.address.specialInstructions",
      value: "specialInstructions",
    },
  },
};

const addressTreePojo = {
  "customer.address": {
    nodeType: "subtree",
    parentId: "customer.address",
    nodeContent: { operator: "$addressTree" },
  },
  "customer.address.address1": {
    parentId: "customer.address",
    nodeContent: { operator: "$eq", subjectId: "customer.address.address1", value: "addr1" },
  },
  "customer.address.address2": {
    parentId: "customer.address",
    nodeContent: { operator: "$eq", subjectId: "customer.address.address2", value: "addr2" },
  },
  "customer.address.address3": {
    parentId: "customer.address",
    nodeContent: { operator: "$eq", subjectId: "customer.address.address3", value: "addr3" },
  },
  "customer.address.city": {
    parentId: "customer.address",
    nodeContent: { operator: "$eq", subjectId: "customer.address.city", value: "city" },
  },
  "customer.address.stateOrProvince": {
    parentId: "customer.address",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.address.stateOrProvince",
      value: "stateOrProvince",
    },
  },
  "customer.address.postalCode": {
    parentId: "customer.address",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.address.postalCode",
      value: "postalCode",
    },
  },
  "customer.address.country": {
    parentId: "customer.address",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.address.country",
      value: "country",
    },
  },
  "customer.address.specialInstructions": {
    parentId: "customer.address",
    nodeContent: {
      operator: "$eq",
      subjectId: "customer.address.specialInstructions",
      value: "specialInstructions",
    },
  },
};

const matcherPojo = {
  ...rootPojo,
  ...rubblePojo,
  ...flintstonePojo,
} as TTreePojo<TPredicateNodeTypes>;

export { matcherPojo, notTree as notTreePojo, agePojo, addressTreePojo };

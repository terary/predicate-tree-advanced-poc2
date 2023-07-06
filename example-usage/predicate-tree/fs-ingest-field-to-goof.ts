import form5350841 from "./fs-form/form5350841.json";
import form5353031 from "./fs-form/form5353031.json";
import { checksToPojo } from "./fs-form/util";

import type { TPojoDocument } from "./fs-form/types";
type TPredicateNode = {
  parentId: string;
  nodeContent: any;
};

// type TPredicateDocument = {
//   [fieldId: string]: TPredicateNode;
// };

const convertFieldLogic = (field: any) => {
  const fieldPojo: TPojoDocument = {};
  const fieldId = field.id;
  const checks = field.logic.checks;
  const logic = field.logic;

  const { action, conditional } = logic;
  fieldPojo[fieldId] = {
    parentId: fieldId,
    nodeContent: { action, conditional },
  };
  checksToPojo(fieldPojo, fieldId, checks);
  return fieldPojo;
};

const logicArray: any[] = [];

const fields = form5350841.fields.map((field) => convertFieldLogic(field));
// const fields = form5353031.fields.map((field) => convertFieldLogic(field));

const parentIds: { [nodeId: string]: string[] } = {};

fields.forEach((field) => {
  Object.entries(field).forEach(([nodeId, node]) => {
    logicArray.push({
      nodeId,
      parentId: node.parentId,
      node,
      origin: 147366613,
    });
  });
});

logicArray.forEach((f) => {
  // if (f.parentId === f.nodeId) {
  //   return;
  // }
  if (parentIds[f.nodeId] === undefined) {
    parentIds[f.nodeId] = [f.parentId];
  } else if (!parentIds[f.nodeId].includes(f.parentId)) {
    parentIds[f.nodeId].push(f.parentId);
  }
});

Object.entries(parentIds).forEach(([nodeId, parents]) => {
  console.log(
    `nodeId: ${nodeId} as ${parents.length} parents: ${parents.join(", ")}`
  );
});

process.exit(-1);

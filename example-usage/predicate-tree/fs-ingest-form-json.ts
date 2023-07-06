import form5350841 from "./fs-form/form5350841.json";
import { checksToPojo } from "./fs-form/util";
import { JsPredicateTree } from "./JsPredicateTree/JsPredicateTree";
import { SubjectsForm } from "./fs-form/form-logic/SubjectsForms";
import { AbstractExpressionFactory } from "./AbstractExpressionFactory";

import type { TPojoDocument } from "./fs-form/types";
let formPojo: TPojoDocument = {};

const convertFieldLogic = (field: any) => {
  const fieldPojo: TPojoDocument = {};
  const fieldId = field.id;
  const checks = field.logic.checks;
  const logic = field.logic;

  const { action, conditional } = logic;
  fieldPojo[fieldId] = {
    // parentId: "theForm",
    parentId: fieldId,
    nodeContent: { action, conditional },
  };
  checksToPojo(fieldPojo, fieldId, checks);
  return fieldPojo;
};

// formPojo = { ...convertFieldLogic(form5350841.fields[0]) };
// formPojo = { ...convertFieldLogic(form5350841.fields[1]) };
formPojo = { ...convertFieldLogic(form5350841.fields[1]), ...formPojo };
formPojo = { ...convertFieldLogic(form5350841.fields[2]), ...formPojo };
// form5350841.fields.forEach((field) => {
//   formPojo[field.id] = convertFieldLogic(field);
// });
// formPojo["theForm"] = {
//   parentId: "theForm",
//   nodeContent: { operator: "$or" },
// };

console.log(JSON.stringify(formPojo, null, 2));
// delete formPojo["147366619"];
// here
const treeFromPojo = AbstractExpressionFactory.fromPojo({
  ...formPojo,
  // ...formPojo["147366613"],
  // ...formPojo["147366617"],
  // ...formPojo["147366619"],
}) as JsPredicateTree;

const fnBody = treeFromPojo.toFunctionBody(
  treeFromPojo.rootNodeId,
  SubjectsForm
);

//
if (require && require.main === module) {
  console.log("called directly");
  console.log({
    // genericTree,
    // addressTree,
    // address2,
    treeFromPojo,
  });
  console.log({ fnBody });
} else {
  // Likely being called from tests
  // console.log('required as a module');
}

export { fnBody };

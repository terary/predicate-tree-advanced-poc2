// import { rubblePojo } from "./MatcherPojoWithSubtree";
import {
  formPojo,
  formPojoCircular,
} from "./fs-form/form-logic/form5350841Pojo";

import { JsPredicateTree } from "./JsPredicateTree/JsPredicateTree";
import { SubjectsSimple } from "./SubjectsExamples";
// import { SubjectsSimple } from "./fs-form/form-logic/SubjectsForms";
import { AbstractExpressionFactory } from "./AbstractExpressionFactory";
const treeFromPojo = AbstractExpressionFactory.fromPojo({
  ...formPojoCircular,
  ...formPojo,
}) as JsPredicateTree;

const fnBody = treeFromPojo.toFunctionBody(
  treeFromPojo.rootNodeId,
  SubjectsSimple
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

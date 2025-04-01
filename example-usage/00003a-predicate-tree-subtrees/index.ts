import { AbstractExpressionTree } from "../../src";
import { AbstractExpressionFactory } from "./AbstractExpressionFactory";
import { JsPredicateTree } from "./JsPredicateTree/JsPredicateTree";
import {
  addressTreePojo,
  matcherPojo,
  rubblePojo,
} from "./MatcherPojoWithSubtree";
import { SubjectsSimple } from "./SubjectsExamples";
import { TPredicateTypes } from "./types";

const genericTree = AbstractExpressionFactory.createExpressionTree("_root_", {
  operator: "$and",
}) as AbstractExpressionTree<TPredicateTypes>;
const addressTree = AbstractExpressionFactory.createExpressionTree("_root_", {
  operator: "$addressTree",
}) as AbstractExpressionTree<TPredicateTypes>;

const treeFromPojo = AbstractExpressionFactory.fromPojo({
  ...matcherPojo,
  ...rubblePojo,
  ...addressTreePojo,
}) as JsPredicateTree;

const fnBody = treeFromPojo.toFunctionBody(
  treeFromPojo.rootNodeId,
  SubjectsSimple
);
//
if (require && require.main === module) {
  console.log("called directly");
  // console.log({
  //   genericTree,
  //   addressTree,
  //   address2,
  //      treeFromPojo,
  // });
  console.log({ fnBody });
} else {
  // Likely being called from tests
  // console.log('required as a module');
}

export { fnBody };

import { AbstractExpressionTree } from "../../src";
import { AbstractExpressionFactory } from "./AbstractExpressionFactory";
import { TPredicateTypes } from "./types";
import { SubjectsSimple } from "./SubjectsExamples";
import {
  matcherPojo,
  //notTreePojo,
  // agePojo,
  rubblePojo,
  addressTreePojo,
} from "./MatcherPojoWithSubtree";
import { JsPredicateTree } from "./JsPredicateTree/JsPredicateTree";

const genericTree = AbstractExpressionFactory.createExpressionTree("_root_", {
  operator: "$and",
}) as AbstractExpressionTree<TPredicateTypes>;
const addressTree = AbstractExpressionFactory.createExpressionTree("_root_", {
  operator: "$addressTree",
}) as AbstractExpressionTree<TPredicateTypes>;

const address2 = AbstractExpressionFactory.createSubtreeAt(
  genericTree,
  genericTree.rootNodeId,
  {
    operator: "$addressTree",
  }
);
// AbstractExpressionTree.createSubtreeAt_x(genericTree, genericTree.rootNodeId, addressTree);
const treeFromPojo = AbstractExpressionFactory.fromPojo({
  ...matcherPojo,
  ...rubblePojo,
  ...addressTreePojo,
}) as JsPredicateTree;

const fnBody = treeFromPojo.toFunctionBody(treeFromPojo.rootNodeId, SubjectsSimple);
if (require.main === module) {
  console.log('called directly');
  console.log({
    genericTree,
    addressTree,
    address2,
    treeFromPojo,
  });
  console.log({ fnBody });

} else {
  // Likely being called from tests
  // console.log('required as a module');
}

export { fnBody }
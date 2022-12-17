import type { TPredicateNodeTypes } from "./types";
import type { TTreePojo } from "../../src";

import { AbstractObfuscatedExpressionTree } from "../../src";
import { predicateTreeToJavaScriptMatcher } from "./predicateTreeToJavascript";
import assert from "assert";
import { matcherPojo, notTreePojo, agePojo } from "./MatcherPojoWithSubtree";
import { PredicateTreeJs } from "../../dev-debug/PredicateTreeJs/PredicateTreeJs";
class ObfuscateExpressionTree extends AbstractObfuscatedExpressionTree<TPredicateNodeTypes> {}
class ObfuscateNotTree extends AbstractObfuscatedExpressionTree<TPredicateNodeTypes | TNot> {}

type TNot = {
  operator: "$not";
};

const predicateTree = AbstractObfuscatedExpressionTree.fromPojo<
  TPredicateNodeTypes,
  ObfuscateExpressionTree
>({ ...matcherPojo, ...agePojo } as TTreePojo<TPredicateNodeTypes>);

const x = predicateTree.toPojoAt();
const fromPredicatePojo = AbstractObfuscatedExpressionTree.fromPojo<
  TPredicateNodeTypes,
  AbstractObfuscatedExpressionTree<TPredicateNodeTypes>
>(predicateTree.toPojoAt());

const { fnBody } = predicateTreeToJavaScriptMatcher(fromPredicatePojo);
// const { fnBody } = predicateTreeToJavaScriptMatcher(predicateTree);
console.log(fnBody);
const matcherFn = new Function("record", fnBody);
[
  { "customer.firstname": "Barney", "customer.lastname": "Rubble", shouldBe: true },
  { "customer.firstname": "Betty", "customer.lastname": "Rubble", shouldBe: true },
  { "customer.firstname": "Fred", "customer.lastname": "Flintstone", shouldBe: true },
  { "customer.firstname": "Wilma", "customer.lastname": "Flintstone", shouldBe: true },

  { "customer.firstname": "Betty", "customer.lastname": "Flintstone", shouldBe: false },
  { "customer.firstname": "Wilma", "customer.lastname": "Rubble", shouldBe: false },
].forEach((name) => {
  console.log(`matcher(${JSON.stringify(name)})`, matcherFn(name));
  assert.strictEqual(matcherFn(name), name.shouldBe);
});

//assert.strictEqual(predicateTree.countTotalNodes(), 11);

import type { TPredicateNodeTypes } from "./types";
import { AbstractObfuscatedExpressionTree } from "../../src";
import { predicateTreeToJavaScriptMatcher } from "./predicateTreeToJavascript";
import assert from "assert";
import { matcherPojo } from "./MatcherPojoSimple";
class ObfuscateExpressionTree extends AbstractObfuscatedExpressionTree<TPredicateNodeTypes> {}

const predicateTree = AbstractObfuscatedExpressionTree.fromPojo<
  TPredicateNodeTypes,
  ObfuscateExpressionTree
>(matcherPojo);

const { fnBody } = predicateTreeToJavaScriptMatcher(predicateTree);
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
assert.strictEqual(predicateTree.countTotalNodes(), 11);

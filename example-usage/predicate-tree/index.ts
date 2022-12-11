import type {
  TPredicateNodeTypes,
  TPredicateTypes,
  TJunction,
  TOperandOperators,
  TOperand,
} from "./types";
import { AbstractObfuscatedExpressionTree } from "../../src";
import { AbstractExpressionTree, ITreeVisitor } from "../../src";
import type { TGenericNodeContent, TTreePojo } from "../../src";
import { predicateTreeToJavaScriptMatcher } from "./predicateTreeToJavascript";
import assert from "assert";

class ObfuscateExpressionTree extends AbstractObfuscatedExpressionTree<TPredicateNodeTypes> {}

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

// @ts-ignore
const rootPojo = {
  root: { parentId: "root", nodeContent: { operator: "$or" } },
};
// @ts-ignore
const matcherPojo = {
  ...rootPojo,
  ...rubblePojo,
  ...flintstonePojo,
} as TTreePojo<TPredicateNodeTypes>;

const predicateTree = AbstractObfuscatedExpressionTree.fromPojo<
  TPredicateNodeTypes,
  ObfuscateExpressionTree
>(matcherPojo);

const matcherFn = predicateTreeToJavaScriptMatcher(predicateTree) as Function;

console.log("Iam", {
  matcherFn: matcherFn.toString(),
  'matcherFn({ "customer.firstname": "Fred", "customer.lastname": "Flintstone" })': matcherFn({
    "customer.firstname": "Fred",
    "customer.lastname": "Flintstone",
  }),
  'matcherFn({ "customer.firstname": "Barney", "customer.lastname": "Rubble" })': matcherFn({
    "customer.firstname": "Barney",
    "customer.lastname": "Rubble",
  }),
  'matcherFn({ "customer.firstname": "Barney", "customer.lastname": "Flintstone" })':
    matcherFn({
      "customer.firstname": "Barney",
      "customer.lastname": "Flintstone",
    }),
});

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

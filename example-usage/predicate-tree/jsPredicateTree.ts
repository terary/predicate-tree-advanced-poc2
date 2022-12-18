import { matcherPojo, notTreePojo, agePojo } from "./MatcherPojoWithSubtree";
import { JsPredicateTree } from "./JsPredicateTree/JsPredicateTree";
import type { TJsPredicate, TSubjectDictionary } from "./JsPredicateTree/types";
import assert from "assert";

type TNot = {
  operator: "$not";
};

const Subjects: TSubjectDictionary = {
  "customer.firstname": {
    datatype: "string",
    label: "First Name",
  },
  "customer.lastname": {
    datatype: "string",
    label: "Last Name",
  },
  "customer.birthdate": {
    datatype: "string",
    label: "Birth Date",
  },
  "customer.age": {
    datatype: "datetime",
    label: "Birth Date",
  },
};

const jsTree = JsPredicateTree.fromPojo<TJsPredicate, JsPredicateTree>({
  ...matcherPojo,
  ...agePojo,
});

const recordShape = jsTree.commentedRecord(Subjects);
const fnBody: any = jsTree.toFunctionBody(undefined, Subjects);
const matcherFn = new Function("record", `${recordShape}\nreturn (\n${fnBody}\n)`);
console.log({ fnBody, fnBody_toString: matcherFn.toString() });

[
  { "customer.firstname": "Barney", "customer.lastname": "Rubble", shouldBe: true },
  { "customer.firstname": "Betty", "customer.lastname": "Rubble", shouldBe: true },
  { "customer.firstname": "Fred", "customer.lastname": "Flintstone", shouldBe: true },
  { "customer.firstname": "Wilma", "customer.lastname": "Flintstone", shouldBe: true },

  { "customer.firstname": "Betty", "customer.lastname": "Flintstone", shouldBe: false },
  { "customer.firstname": "Wilma", "customer.lastname": "Rubble", shouldBe: false },
  { "customer.firstname": "Mickey", "customer.lastname": "Mouse", shouldBe: false },
  {
    "customer.firstname": "Mickey",
    "customer.lastname": "Mouse",
    "customer.age": 23,
    shouldBe: true,
  },
].forEach((name) => {
  console.log(`matcher(${JSON.stringify(name)})`, matcherFn(name));
  assert.strictEqual(matcherFn(name), name.shouldBe);
});
assert.strictEqual(jsTree.countTotalNodes(), 14);

import {
  matcherPojo,
  //notTreePojo,
  // agePojo,
  addressTreePojo,
} from "./MatcherPojoWithSubtree";
import { JsPredicateTree } from "./JsPredicateTree/JsPredicateTree";
import type { TJsPredicate, TSubjectDictionary } from "./JsPredicateTree/types";
import assert from "assert";
import { AddressTree } from "./JsPredicateTree/AddressTree";
import { SubtreeFactory } from "./JsPredicateTree/SubtreeFactory";

import { TPredicateTypes } from "./types";
//import { UtilizedLeafVisitor } from "";
const x = `
  also, the Abstract classes that have generic counter parts
  But the Abstract depends on an inherited class, kinda a big no-no

  this is bad design but also could lead to infinite loops

  `;

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
    datatype: "datetime",
    label: "Birth Date",
  },
  "customer.age": {
    datatype: "datetime",
    label: "Birth Date",
  },
  "customer.address": {
    address1: {
      datatype: "string",
      label: "Street Address",
    },
    address2: {
      datatype: "string",
      label: "Secondary Address",
    },
    address3: {
      datatype: "string",
      label: "Extra Address Line",
    },
    countryCode: {
      datatype: "string",
      label: "Country",
    },
    postalCode: {
      datatype: "string",
      label: "Country",
    },
    specialInstructions: {
      datatype: "string",
      label: "Leave under the mat.",
    },
    datatype: "AddressTree",
    label: "address",
  },

  // type TAddressSubject = {
  //   addressLine1?: TSubjectType;
  //   addressLine2?: TSubjectType;
  //   addressLine3?: TSubjectType;
  //   city?: TSubjectType;
  //   state?: TSubjectType;
  //   postalCode?: TSubjectType;
  //   specialInstructions?: TSubjectType;
  //   countryCode?: TSubjectType;

  //   datatype: "AddressTree";
  //   label: string;
  // };
};
const t = AddressTree.getNewInstance("_subtreeRoot_");
const t2 = AddressTree.fromPojo(
  AddressTree.defaultTreePojo("customer.address")
);

const t3 = AddressTree.fromPojo({ ...addressTreePojo, ...{} });
// "customer.address": {
//   nodeType: "subtree",
//   parentId: "customer.address",
//   nodeContent: { operator: "$addressTree" },
// }

const reRootedPojo = {
  ...addressTreePojo,
  ...{
    "customer.address": {
      parentId: "root",
      nodeType: "subtree",
      nodeContent: { operator: "$addressTree" },
    },
  },
};

// @ts-ignore
const jsTree = JsPredicateTree.fromPojo<TPredicateTypes, JsPredicateTree>({
  ...matcherPojo,
  // ...agePojo,
  // ...notTreePojo,
  ...reRootedPojo,
}) as JsPredicateTree;

const factory = SubtreeFactory.getInstance();
const t4 = SubtreeFactory.getNewTreeInstance("$addressTree");
const a = AddressTree.fromPojo(AddressTree.defaultTreePojo("customer.address"));

// const subtreeIds = jsTree.getSubtreeIdsAt();
// const address = AddressTree.getNewInstance(subtreeIds[0]);
// jsTree.replaceNodeContent(subtreeIds[0], address);
// const subtree = AbstractTree.createSubtreeAt<TPredicateTypes, AddressTree>(
//   // @ts-ignore - TJsPredicate not the same as TPredicate
//   jsTree,
//   jsTree.rootNodeId,
//   AddressTree,
//   addressTreePojo
//   // AddressTree.defaultTreePojo("customer.address")
// );

// pojo needs to have prefix 'customer.' on subject id (or is it implied need to be re add?)
// I think we want/need to keep subfield names (*postalCode, *addressLine1)
//  so our subtree should either be flat or not but can be flattened if we want

// const subtreeLeafVisitor = new UtilizedLeafVisitor();
// subtreeLeafVisitor.includeSubtrees = true;
// subtree.visitLeavesOf(subtreeLeafVisitor);

// const superTreeLeafVisitor = new UtilizedLeafVisitor();
// superTreeLeafVisitor.includeSubtrees = true;
// // @ts-ignore TJsPredicate TPredicate
// jsTree.visitLeavesOf(superTreeLeafVisitor);

const notes = `
  This looks good, probably need to override visitor 
  to get subjectIds to work properly
`;

// factory.createSubtreeAt(jsTree, subtreeIds[0], "$addressTree");
// const subtreeIds = jsTree.getSubtreeIdsAt();
// const subtree = jsTree.getChildContentAt(subtreeIds[0]);
// const addressTree = AddressTree.getNewInstance(subtreeIds[0]);
// jsTree.replaceNodeContent(subtreeIds[0], addressTree);

// const jsTreeObfus = new JsPredicateTreeObfuscated(jsTree);
// const recordShape = jsTree.commentedRecord(Subjects);
// const fnBody: any = jsTree.toFunctionBody(undefined, Subjects);
// const matcherFn = new Function("record", `${recordShape}\nreturn (\n${fnBody}\n)`);
// console.log({ fnBody, fnBody_toString: matcherFn.toString() });

// [
//   { "customer.firstname": "Barney", "customer.lastname": "Rubble", shouldBe: true },
//   { "customer.firstname": "Betty", "customer.lastname": "Rubble", shouldBe: true },
//   { "customer.firstname": "Fred", "customer.lastname": "Flintstone", shouldBe: true },
//   { "customer.firstname": "Wilma", "customer.lastname": "Flintstone", shouldBe: true },

//   { "customer.firstname": "Betty", "customer.lastname": "Flintstone", shouldBe: false },
//   { "customer.firstname": "Wilma", "customer.lastname": "Rubble", shouldBe: false },
//   { "customer.firstname": "Mickey", "customer.lastname": "Mouse", shouldBe: false },
//   {
//     "customer.firstname": "Mickey",
//     "customer.lastname": "Mouse",
//     "customer.age": 23,
//     shouldBe: true,
//   },
// ].forEach((name) => {
//   console.log(`matcher(${JSON.stringify(name)})`, matcherFn(name));
//   assert.strictEqual(matcherFn(name), name.shouldBe);
// });

// assert.strictEqual(jsTree.countTotalNodes(), 177);

//console.log(jsTreeObfus.getTreeContentAt());

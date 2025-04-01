import { IExpressionTree } from "../../src";

type TOperandOperators = "$eq" | "$lte" | "$lt" | "$gt" | "$gte";
type TJunctionOperators = "$or" | "$and" | "$addressTree";
type TJunction = {
  operator: TJunctionOperators;
};

type TOperand = {
  subjectId: string;
  operator: TOperandOperators;
  value: any;
};

type TPredicateTypes = TJunction | TOperand;
type TPredicateNodeTypes = TPredicateTypes | IExpressionTree<TPredicateTypes>;
type TPredicateNodeTypesOrNull = null | TPredicateNodeTypes;

type TSubjectDataTypes = "string" | "number" | "datetime" | "AddressTree";

type TSubjectDictionary = {
  [subjectId: string]: TSubjectType | TSubjectAddressType;
};

type TSubjectType = {
  datatype: TSubjectDataTypes;
  label: string;
};

type TSubjectAddressType = TSubjectType & {
  address1: TSubjectType;
  address2: TSubjectType;
  address3: TSubjectType;
  city: TSubjectType;
  state: TSubjectType;
  postalCode: TSubjectType;
  countryCode: TSubjectType;
  specialInstructions: TSubjectType;
};

type TJsJunctionOperators = "&&" | "||";

// type TSubjectDataTypes = "string" | "number" | "datetime" | "AddressTree";
type TJsOperandOperators = "===" | ">" | ">=" | "<" | "<=";

type TJsLeafNode = {
  subjectId: string;
  operator: TJsOperandOperators;
  value: number | Date | string | null;
};

export type {
  TJsJunctionOperators,
  TJsLeafNode,
  TJsOperandOperators,
  TJunction,
  TJunctionOperators,
  TOperand,
  TOperandOperators,
  TPredicateNodeTypes,
  TPredicateTypes,
  TPredicateNodeTypesOrNull,
  TSubjectDataTypes,
  TSubjectDictionary,
};

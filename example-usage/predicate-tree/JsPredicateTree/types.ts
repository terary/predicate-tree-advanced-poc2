type TJsPredicate = {};
type TJunctionOperators = "$and" | "$or";
type TJsJunctionOperators = "&&" | "||";

type TOperandOperators = "$eq" | "$gt" | "$gte" | "$lt" | "$lte";
type TJsOperandOperators = "===" | ">" | ">=" | "<" | "<=";

type TJsLeafNode = {
  subjectId: string;
  operator: TJsOperandOperators;
  value: number | Date | string | null;
};

type TJsBranchNode = {
  operator: TJsJunctionOperators;
};
type TSubjectDataTypes = "string" | "number" | "datetime" | "AddressTree";
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

type TSubjectDictionary = { [subjectId: string]: TSubjectType | TSubjectAddressType };

export type {
  TJsPredicate,
  TSubjectDictionary,
  TJunctionOperators,
  TJsJunctionOperators,
  TOperandOperators,
  TJsOperandOperators,
  TSubjectDataTypes,
  TJsLeafNode,
  TJsBranchNode,
};

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
type TSubjectDataTypes = "string" | "number" | "datetime";
type TSubjectType = {
  datatype: TSubjectDataTypes;
  label: string;
};
type TSubjectDictionary = { [subjectId: string]: TSubjectType };

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

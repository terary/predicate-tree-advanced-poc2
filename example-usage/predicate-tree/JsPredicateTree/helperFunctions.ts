import type {
  TJunctionOperators,
  TJsJunctionOperators,
  TOperandOperators,
  TJsOperandOperators,
  TSubjectDataTypes,
  TJsPredicate,
  TSubjectDictionary,
  TJsLeafNode,
  TJsBranchNode,
} from "./types";
const predicateOperatorToJsOperator = (operator: TOperandOperators): TJsOperandOperators => {
  switch (operator) {
    case "$eq":
      return "===";
    case "$gt":
      return ">";
    case "$gte":
      return ">=";
    case "$lt":
      return "<";
    case "$lte":
      return "<=";
    default:
      return operator;
  }
};

const predicateJunctionToJsOperator = (operator: TJunctionOperators): TJsJunctionOperators => {
  switch (operator) {
    case "$and":
      return "&&";
    case "$or":
      return "||";
    default:
      return operator;
  }
};

const quoteValue = (datatype: TSubjectDataTypes, value: any) => {
  switch (datatype) {
    case "string":
    case "datetime":
      return `'${value}'`;
    case "number":
      return value;

    default:
      break;
  }
};

export { quoteValue, predicateJunctionToJsOperator, predicateOperatorToJsOperator };

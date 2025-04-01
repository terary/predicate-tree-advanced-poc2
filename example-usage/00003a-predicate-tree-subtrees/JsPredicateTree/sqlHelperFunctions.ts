import type {
  TJunctionOperators,
  TOperandOperators,
  TSubjectDataTypes,
} from "../types";

const predicateOperatorToSqlOperator = (
  operator: TOperandOperators
): string => {
  switch (operator) {
    case "$eq":
      return "=";
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

const predicateJunctionToSqlOperator = (
  operator: TJunctionOperators
): string => {
  switch (operator) {
    case "$and":
      return "AND";
    case "$or":
      return "OR";
    default:
      return String(operator);
  }
};

const sqlQuoteValue = (datatype: TSubjectDataTypes, value: any): string => {
  switch (datatype) {
    case "string":
    case "datetime":
      return `'${value}'`;
    case "number":
      return String(value);
    default:
      return `'${value}'`;
  }
};

export {
  sqlQuoteValue,
  predicateJunctionToSqlOperator,
  predicateOperatorToSqlOperator,
};

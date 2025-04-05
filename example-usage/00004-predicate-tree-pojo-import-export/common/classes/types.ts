// Define the allowed operator types
export type TOperandOperator =
  | "$eq"
  | "$ne"
  | "$gt"
  | "$gte"
  | "$lt"
  | "$lte"
  | "$in"
  | "$nin";
export type TJunctionOperator = "$and" | "$or";
export type TPredicateOperator = TOperandOperator | TJunctionOperator;

interface ISqlWhereClause {
  toSqlWhereClauseAt(nodeId: string, withOptions: any): string;
}

interface IJavascriptMatcherFunction {
  toJavascriptMatcherFunctionAt(nodeId: string, withOptions: any): string;
  toJavascriptMatcherFunctionBodyAt(nodeId: string, withOptions: any): string;
}

export type { ISqlWhereClause, IJavascriptMatcherFunction };

import type { TJunctionOperators, TOperandOperators, TJsOperandOperators, TSubjectDataTypes, TJsJunctionOperators } from "../types";
declare const predicateOperatorToJsOperator: (operator: TOperandOperators) => TJsOperandOperators;
declare const predicateJunctionToJsOperator: (operator: TJunctionOperators) => TJsJunctionOperators;
declare const quoteValue: (datatype: TSubjectDataTypes, value: any) => any;
export { quoteValue, predicateJunctionToJsOperator, predicateOperatorToJsOperator, };

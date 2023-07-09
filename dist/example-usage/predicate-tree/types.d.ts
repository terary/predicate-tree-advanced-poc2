import { IExpressionTree } from "../../src";
declare type TOperandOperators = "$eq" | "$lte" | "$lt" | "$gt" | "$gte";
declare type TJunctionOperators = "$or" | "$and" | "$addressTree";
declare type TJunction = {
    operator: TJunctionOperators;
};
declare type TOperand = {
    subjectId: string;
    operator: TOperandOperators;
    value: any;
};
declare type TPredicateTypes = TJunction | TOperand;
declare type TPredicateNodeTypes = TPredicateTypes | IExpressionTree<TPredicateTypes>;
declare type TPredicateNodeTypesOrNull = null | TPredicateNodeTypes;
declare type TSubjectDataTypes = "string" | "number" | "datetime" | "AddressTree";
declare type TSubjectDictionary = {
    [subjectId: string]: TSubjectType | TSubjectAddressType;
};
declare type TSubjectType = {
    datatype: TSubjectDataTypes;
    label: string;
};
declare type TSubjectAddressType = TSubjectType & {
    address1: TSubjectType;
    address2: TSubjectType;
    address3: TSubjectType;
    city: TSubjectType;
    state: TSubjectType;
    postalCode: TSubjectType;
    countryCode: TSubjectType;
    specialInstructions: TSubjectType;
};
declare type TJsJunctionOperators = "&&" | "||";
declare type TJsOperandOperators = "===" | ">" | ">=" | "<" | "<=";
declare type TJsLeafNode = {
    subjectId: string;
    operator: TJsOperandOperators;
    value: number | Date | string | null;
};
export type { TJsJunctionOperators, TJsLeafNode, TJsOperandOperators, TJunction, TJunctionOperators, TOperand, TOperandOperators, TPredicateNodeTypes, TPredicateTypes, TPredicateNodeTypesOrNull, TSubjectDataTypes, TSubjectDictionary, };

type TOperandOperators = "$eq" | "$lte" | "$le" | "$gt" | "$gte";
type TJunctionOperators = "$or" | "$and";
import type { ITree } from "../ITree";

type TJunction = {
  operator: TJunctionOperators;
};
type TOperand = {
  subjectId: string;
  operator: TOperandOperators;
  value: any;
};
// type TPredicateTypes = PredicateTypes | ITree<PredicateTypes>;
type TPredicateTypes = TJunction | TOperand;
type TPredicateNodeTypes = TPredicateTypes | ITree<TPredicateTypes>; // does null belong here?

/**
 * Interface representing a junction operator in an expression tree
 */
export interface IJunctionOperator {
  operator: string;
}

/**
 * Common junction operator types
 */
export enum JunctionOperatorType {
  AND = "$and",
  OR = "$or",
}

/**
 * Basic AND junction
 */
export interface IAndJunction extends IJunctionOperator {
  operator: JunctionOperatorType.AND;
}

/**
 * Basic OR junction
 */
export interface IOrJunction extends IJunctionOperator {
  operator: JunctionOperatorType.OR;
}

/**
 * Creates a new AND junction
 */
export function createAndJunction(): IAndJunction {
  return { operator: JunctionOperatorType.AND };
}

/**
 * Creates a new OR junction
 */
export function createOrJunction(): IOrJunction {
  return { operator: JunctionOperatorType.OR };
}

export type TJunctionType = IAndJunction | IOrJunction;

export type {
  TJunction,
  TOperand,
  TOperandOperators,
  TPredicateNodeTypes,
  TPredicateTypes,
};

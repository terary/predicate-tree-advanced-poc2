import type { ITree } from "../../src";
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
type TPredicateNodeTypes = TPredicateTypes | ITree<TPredicateTypes>; // does null belong here?

export type { TJunction, TOperand, TOperandOperators, TPredicateNodeTypes, TPredicateTypes };

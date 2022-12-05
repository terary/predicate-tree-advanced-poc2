import type { ITree } from "../../src";
type TOperandOperators = "$eq" | "$lte" | "$le" | "$gt" | "$gte";
type TJunctionOperators = "$or" | "$and";

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

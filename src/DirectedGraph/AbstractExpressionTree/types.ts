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

export type { TJunction, TOperand, TOperandOperators, TPredicateNodeTypes, TPredicateTypes };

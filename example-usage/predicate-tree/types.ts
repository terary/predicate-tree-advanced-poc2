import { IExpressionTree } from "../../src/DirectedGraph/ITree";

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
type TPredicateNodeTypes = TPredicateTypes | IExpressionTree<TPredicateTypes>;
type TPredicateNodeTypesOrNull = null | TPredicateNodeTypes;

export type { TJunction, TOperand, TOperandOperators, TPredicateNodeTypes, TPredicateTypes, TPredicateNodeTypesOrNull };

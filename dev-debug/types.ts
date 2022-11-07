type TOperandOperators = "$eq" | "$lt" | "$lte" | "$gt" | "$gte";
type TOperandOperatorsJs = "==" | ">" | ">=" | "<" | "<=";

type TJunctionOperators = "$or" | "$and";
type TJunctionOperatorsJs = "||" | "&&";
import type { ITree } from "../src/DirectedGraph/ITree";

type TJunction = {
  operator: TJunctionOperators;
};
type TJunctionJs = {
  operator: TJunctionOperatorsJs;
};
type TOperand = {
  subjectId: string;
  operator: TOperandOperators;
  value: any;
};
type TOperandJs = {
  subjectId: string;
  operator: TOperandOperatorsJs;
  value: any;
};
// type TPredicateTypes = PredicateTypes | ITree<PredicateTypes>;
type TPredicateTypes = TJunction | TOperand;
type TPredicateTypesJs = TJunctionJs | TOperandJs;
type TPredicateNodeTypes = TPredicateTypes | ITree<TPredicateTypes>; // does null belong here?

export type {
  TJunction,
  TOperand,
  TOperandJs,
  TOperandOperators,
  TPredicateNodeTypes,
  TPredicateTypes,
  TPredicateTypesJs,
};

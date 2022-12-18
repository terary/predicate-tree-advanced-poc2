import type { TPredicateNodeTypes } from "./types";
import { AbstractExpressionTree, TTreePojo } from "../../src";

// const x:TGenericNodeContent
// TNodePojo
// TGenericNodeContent
// import { predicateOperatorToJsOperator } from "./predicateTreeToJavascript";
import { AbstractObfuscatedExpressionTree } from "../../src";
import { predicateTreeToJavaScriptMatcher } from "./predicateTreeToJavascript";
import assert from "assert";
import { matcherPojo, notTreePojo, agePojo } from "./MatcherPojoWithSubtree";
import { PredicateTreeJs } from "../../dev-debug/PredicateTreeJs/PredicateTreeJs";
import { IExpressionTree } from "../../src/DirectedGraph/ITree";
import { TGenericNodeContent, TNodePojo } from "../../src/DirectedGraph/types";
class ObfuscateExpressionTree extends AbstractObfuscatedExpressionTree<TPredicateNodeTypes> {}
class ObfuscateNotTree extends AbstractObfuscatedExpressionTree<TPredicateNodeTypes | TNot> {}
type TJsPredicate = {};
type TNot = {
  operator: "$not";
};
type TJunctionOperators = "$and" | "$or";
type TJsJunctionOperators = "&&" | "||";

type TOperandOperators = "$eq" | "$gt" | "$gte" | "$lt" | "$lte";
type TJsOperandOperators = "===" | ">" | ">=" | "<" | "<=";

type TJsLeafNode = {
  subjectId: string;
  operator: TJsOperandOperators;
  value: number | Date | string | null;
};

type TJsBranchNode = {
  operator: TJsJunctionOperators;
};

const predicateJunctionToJsOperator = (operator: TJunctionOperators): TJsJunctionOperators => {
  switch (operator) {
    case "$and":
      return "&&";
    case "$or":
      return "||";
    default:
      return operator;
  }
};

const predicateOperatorToJsOperator = (operator: TOperandOperators): TJsOperandOperators => {
  switch (operator) {
    case "$eq":
      return "===";
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

// const predicateTree = AbstractObfuscatedExpressionTree.fromPojo<
//   TPredicateNodeTypes,
//   ObfuscateExpressionTree
// >({ ...matcherPojo, ...agePojo } as TTreePojo<TPredicateNodeTypes>);

class JsPredicateTree extends AbstractExpressionTree<TJsPredicate> {
  //  #_internalTree: IExpressionTree<TJsPredicate>;

  constructor(rootSeedNodeId?: string, nodeContent?: TJsPredicate) {
    super();
  }

  toFunctionBody(
    rootNodeId: string = this.rootNodeId
    //    currentDocument: object | object[] = {}
  ): string {
    if (this.isLeaf(rootNodeId)) {
      const { subjectId, operator, value } = this.getChildContentAt(rootNodeId) as TJsLeafNode;
      return ` (${subjectId} ${operator} ${value}) `;
    } else if (this.isBranch(rootNodeId)) {
      const { operator } = this.getChildContentAt(rootNodeId) as TJsBranchNode;

      // @ts-ignore
      return (
        "(" +
        this.getChildrenNodeIdsOf(rootNodeId)
          .map((childId) => {
            return this.toFunctionBody(childId);
          })
          .join(` ${operator} `) +
        ")"
      );
    } else {
      return "Not a leaf, not a branch";
    }
  }

  getNewInstance() {
    return new JsPredicateTree();
  }

  static fromPojo<P, Q>(srcPojoTree: TTreePojo<P>): Q {
    const translate = (nodePojo: TNodePojo<P>) => {
      const { parentId, nodeContent } = nodePojo;

      // @ts-ignore
      const { operator, subjectId, value } = { ...nodeContent };

      if (subjectId === undefined) {
        return {
          operator: predicateJunctionToJsOperator(operator),
        };
      }

      return {
        operator: predicateOperatorToJsOperator(operator),
        subjectId,
        value,
      };
    };

    // @ts-ignore - translate typing
    return AbstractExpressionTree.fromPojo<P, Q>(srcPojoTree, translate, () => {
      return JsPredicateTree.getNewInstance();
    });
  }

  static getNewInstance() {
    return new JsPredicateTree();
  }
}

// const jsTree = JsPredicateTree.fromPojo<TJsPredicate, JsPredicateTree>({
//   ...matcherPojo,
//   ...agePojo,
// });
const jsTree = JsPredicateTree.fromPojo<TJsPredicate, JsPredicateTree>({
  root: { parentId: "root", nodeContent: { operator: "$and" } },
  child_0: {
    parentId: "root",
    nodeContent: { operator: "$eq", subjectId: "customer.firstname", value: "fred" },
  },
  child_1: {
    parentId: "root",
    nodeContent: { operator: "$eq", subjectId: "customer.last", value: "flintstone" },
  },
  child_2: {
    parentId: "root",
    nodeContent: { operator: "$or" },
  },
  child_2_0: {
    parentId: "child_2",
    nodeContent: { operator: "$gt", subjectId: "customer.age", value: 3 },
  },
  child_2_1: {
    parentId: "child_2",
    nodeContent: { operator: "$lt", subjectId: "customer.age", value: 29 },
  },
});

const x: any = jsTree.toFunctionBody();
console.log({ jsTree, fnBody: JSON.stringify(x, null, 2) });

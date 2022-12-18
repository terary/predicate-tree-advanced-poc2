import { AbstractExpressionTree, TTreePojo } from "../../../src";
import { TGenericNodeContent, TNodePojo } from "../../../src/DirectedGraph/types";
import { UtilizedLeafVisitor } from "./UtilizedLeafVisitor";
import type {
  TJunctionOperators,
  TJsJunctionOperators,
  TOperandOperators,
  TJsOperandOperators,
  TSubjectDataTypes,
  TJsPredicate,
  TSubjectDictionary,
  TJsLeafNode,
  TJsBranchNode,
} from "./types";

const commentOutObject = (obj: Object): string => {
  const json = JSON.stringify(obj, null, 2);
  return "//" + json.replace(/\n/gi, "\n//");
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
const quoteValue = (datatype: TSubjectDataTypes, value: any) => {
  switch (datatype) {
    case "string":
    case "datetime":
      return `'${value}'`;
    case "number":
      return value;

    default:
      break;
  }
};

class JsPredicateTree extends AbstractExpressionTree<TJsPredicate> {
  //  #_internalTree: IExpressionTree<TJsPredicate>;

  constructor(rootSeedNodeId?: string, nodeContent?: TJsPredicate) {
    super();
  }

  toFunctionBody(rootNodeId: string = this.rootNodeId, subjects: TSubjectDictionary): string {
    if (this.isSubtree(rootNodeId)) {
      const subtree = this.getChildContentAt(rootNodeId);
      if (subtree instanceof JsPredicateTree) {
        return subtree.toFunctionBody(subtree.rootNodeId, subjects);
      } else {
        return "_MISSING_BRANCH_STRUCTURE_";
      }
    } else if (this.isLeaf(rootNodeId)) {
      const { subjectId, operator, value } = this.getChildContentAt(rootNodeId) as TJsLeafNode;
      const { datatype } = subjects[subjectId];
      return ` (record['${subjectId}'] ${operator} ${quoteValue(datatype, value)}) `;
    } else if (this.isBranch(rootNodeId)) {
      const { operator } = this.getChildContentAt(rootNodeId) as TJsBranchNode;

      // @ts-ignore
      return (
        "(" +
        this.getChildrenNodeIdsOf(rootNodeId, true)
          .map((childId) => {
            return this.toFunctionBody(childId, subjects);
          })
          .join(` ${operator} `) +
        ")"
      );
    } else {
      return "Not a leaf, not a branch";
    }
  }
  // commentedRecord
  commentedRecord(subjects: TSubjectDictionary): string {
    const leafVisitor = new UtilizedLeafVisitor();
    leafVisitor.includeSubtrees = true;
    // @ts-ignore
    this.visitLeavesOf(leafVisitor);
    const recordProperties = leafVisitor.utilizedSubjectIds.sort().map((subjectId) => {
      const { datatype } = subjects[subjectId];
      return `${subjectId}: ${datatype}`;
    });
    const recordShape = {
      record: recordProperties,
    };

    return commentOutObject(recordShape);
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

export { JsPredicateTree };

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
import { SubtreeFactory } from "./SubtreeFactory";
import { TJunction, TOperand, TPredicateTypes } from "../types";

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

class JsPredicateTree extends AbstractExpressionTree<TPredicateTypes> {
  //  #_internalTree: IExpressionTree<TJsPredicate>;

  constructor(rootSeedNodeId?: string, nodeContent?: TPredicateTypes) {
    super(rootSeedNodeId, nodeContent);
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
      const { subjectId, operator, value } = this.getChildContentAt(rootNodeId) as TOperand;
      const { datatype } = subjects[subjectId];
      return ` (record['${subjectId}'] ${operator} ${quoteValue(datatype, value)}) `;
    } else if (this.isBranch(rootNodeId)) {
      const { operator } = this.getChildContentAt(rootNodeId) as TJunction;

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
    const flatSubject = `
    Want to use the current form of
      customer.address: {
        address1: {...}
        address2: {...}
        ...
      }

      Will probably want to override in Address .visitLeaves (or whatever)
       that will allow it to fold back on itself {if my parent ===, the subject id . parent.root.address1}.

    need to convert 
      subjects: {
        address: {
          address1,
          address2,
          ...
        }
      }  
    
      to subjects: {
        customer.address.address1
        customer.address.address2
        ...
      }



    `;
    const recordProperties = leafVisitor.utilizedSubjectIds.sort().map((subjectId) => {
      if (!(subjectId in subjects) || !("datatype" in subjects[subjectId])) {
        console.log("Found it");
      }
      const { datatype } = subjects[subjectId];
      return `${subjectId}: ${datatype}`;
    });
    const recordShape = {
      record: recordProperties,
    };

    return commentOutObject(recordShape);
  }

  // getNewInstance() {
  //   return new JsPredicateTree();
  // }

  protected fromPojoAppendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<TPredicateTypes>
  ): string {
    return super.fromPojoAppendChildNodeWithContent(parentNodeId, nodeContent);
  }

  // static getNewInstance(rootSeedNodeId?: string, nodeContent?: TPredicateTypes) {
  //   return new JsPredicateTree(rootSeedNodeId, nodeContent);
  // }
}
export const dev_only_export = {
  predicateOperatorToJsOperator,
  predicateJunctionToJsOperator,
};
export { JsPredicateTree };

import { JsPredicateTree } from "./JsPredicateTree";
import { IExpressionTree } from "../../../src";
import type { TSubjectDictionary } from "../types";
import {
  TJunction,
  TOperand,
  TPredicateNodeTypesOrNull,
  TPredicateTypes,
} from "../types";
import {
  predicateJunctionToSqlOperator,
  sqlQuoteValue,
} from "./sqlHelperFunctions";

class SQLOutputTree extends JsPredicateTree {
  constructor(
    rootSeedNodeId?: string,
    nodeContent?: TPredicateNodeTypesOrNull
  ) {
    super(rootSeedNodeId, nodeContent);
  }

  getNewInstance(
    rootSeed?: string,
    nodeContent?: TPredicateNodeTypesOrNull
  ): IExpressionTree<TPredicateTypes> {
    return new SQLOutputTree(rootSeed, nodeContent);
  }

  toSqlWhereClause(
    rootNodeId: string = this.rootNodeId,
    subjects: TSubjectDictionary
  ): string {
    if (this.isSubtree(rootNodeId)) {
      const subtree = this.getChildContentAt(rootNodeId);
      if (subtree instanceof SQLOutputTree) {
        return subtree.toSqlWhereClause(subtree.rootNodeId, subjects);
      } else {
        return "_MISSING_BRANCH_STRUCTURE_";
      }
    } else if (this.isLeaf(rootNodeId)) {
      const { subjectId, operator, value } = this.getChildContentAt(
        rootNodeId
      ) as TOperand;
      try {
        subjects[subjectId];
      } catch (e) {
        throw e;
      }

      const { datatype } = subjects[subjectId];

      return `(${subjectId} ${predicateOperatorToSqlOperator(
        operator
      )} ${sqlQuoteValue(datatype, value)})`;
    } else if (this.isBranch(rootNodeId)) {
      const { operator } = this.getChildContentAt(rootNodeId) as TJunction;

      return (
        "(" +
        this.getChildrenNodeIdsOf(rootNodeId, true)
          .map((childId) => {
            return this.toSqlWhereClause(childId, subjects);
          })
          .join(` ${predicateJunctionToSqlOperator(operator)} `) +
        ")"
      );
    } else {
      return "Not a leaf, not a branch";
    }
  }

  createSubtreeAt(nodeId: string): IExpressionTree<TPredicateTypes> {
    // Override to return the correct type
    return this;
  }

  // Public utility method to add child nodes
  addChildNode(
    parentNodeId: string,
    nodeContent: TPredicateNodeTypesOrNull
  ): string {
    return this.fromPojoAppendChildNodeWithContent(parentNodeId, nodeContent);
  }
}

// Import the missing function from helper file
import { predicateOperatorToSqlOperator } from "./sqlHelperFunctions";

export { SQLOutputTree };

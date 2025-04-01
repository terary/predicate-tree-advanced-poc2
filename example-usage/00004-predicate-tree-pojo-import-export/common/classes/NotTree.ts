/**
 * NotTree.ts
 *
 * This file defines a NotTree, which is a specialized Predicate Tree that
 * negates predicates. It serves as an example of a subtree with custom behavior.
 */

import {
  GenericExpressionTree,
  IExpressionTree,
  treeUtils,
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
} from "../../../../src";
import { PredicateContent } from "./PredicateTree";
import {
  ISqlWhereClause,
  TOperandOperator,
  TPredicateOperator,
  IJavascriptMatcherFunction,
} from "./types";

// Extend the PredicateContent interface to include _meta
export interface NotTreePredicateContent extends PredicateContent {
  operator?: TPredicateOperator;
  _meta?: {
    negated?: boolean;
    description?: string;
    isSubtree?: boolean;
    [key: string]: any;
  };
}

/**
 * NotTree - A tree that negates predicates
 *
 * When this tree is attached as a subtree, all predicates inside it
 * will be negated in their meaning.
 */
// @ts-ignore - Bypass TypeScript's static inheritance checking
export class NotTree
  extends GenericExpressionTree<NotTreePredicateContent>
  implements ISqlWhereClause, IJavascriptMatcherFunction
{
  public SubtreeNodeTypeName: string = "NotTree";

  /**
   * Create a new NotTree with a negated AND root
   */
  constructor(
    rootNodeId: string = "not-root",
    nodeContent?: NotTreePredicateContent
  ) {
    super(rootNodeId, nodeContent);

    // Initialize with a default root node if not provided
    if (!nodeContent) {
      this.replaceNodeContent(this.rootNodeId, {
        operator: "$and",
        _meta: {
          negated: true,
          description: "NOT group (all predicates inside are negated)",
        },
      });
    }
  }

  /**
   * Override the append child method to ensure all predicates are marked as negated
   */
  appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: NotTreePredicateContent
  ): string {
    // Mark this predicate as negated
    const contentWithMeta = {
      ...nodeContent,
      _meta: {
        ...(nodeContent._meta || {}),
        negated: true,
      },
    };

    // Use the parent class method to append the child
    return super.appendChildNodeWithContent(parentNodeId, contentWithMeta);
  }

  /**
   * Get a negated operator string for a standard operator
   */
  getNegatedOperator(operator: TPredicateOperator): string {
    // Map of operators to their negated versions
    const negatedOperators: Record<string, string> = {
      $eq: "$ne",
      $ne: "$eq",
      $gt: "$lte",
      $gte: "$lt",
      $lt: "$gte",
      $lte: "$gt",
      $in: "$nin",
      $nin: "$in",
    };

    return negatedOperators[operator] || `NOT(${operator})`;
  }

  /**
   * Override createSubtreeAt to ensure subtrees within this NotTree
   * also maintain the negation behavior
   */
  createSubtreeAt<Q extends NotTreePredicateContent>(
    targetNodeId: string
  ): IExpressionTree<Q> {
    // Create a new NotTree subtree instead of a generic one
    const subtree = new NotTree() as unknown as IExpressionTree<Q>;

    // Handle the attachment using parent implementation logic
    const subtreeParentNodeId = this.appendChildNodeWithContent(targetNodeId, {
      operator: "$and",
      _meta: {
        negated: true,
        description: "Nested NOT group",
      },
    } as unknown as NotTreePredicateContent);

    // Reroot and configure the subtree
    GenericExpressionTree.reRootTreeAt<Q>(
      subtree as unknown as GenericExpressionTree<Q>,
      subtree.rootNodeId,
      subtreeParentNodeId
    );

    // Access protected properties with type casting to avoid errors
    (subtree as any)._rootNodeId = subtreeParentNodeId;
    (subtree as any)._incrementor = this._incrementor;

    return subtree;
  }

  /**
   * Create a NotTree instance from a POJO document
   * @param srcPojoTree The POJO document to import
   * @param transform Optional transformation function for node content
   * @returns A new NotTree instance
   */
  static fromPojo<P extends NotTreePredicateContent, Q = unknown>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): NotTree {
    // Create a tree using the parent class's fromPojo
    const tree = GenericExpressionTree.fromPojo(
      srcPojoTree,
      transform
    ) as unknown as NotTree;

    // Mark all nodes as negated
    const markAllNegated = (nodeId: string) => {
      const nodeContent = tree.getChildContentAt(nodeId);
      if (
        nodeContent &&
        typeof nodeContent === "object" &&
        !("rootNodeId" in nodeContent)
      ) {
        // Mark as negated - only for non-ITree node content
        tree.replaceNodeContent(nodeId, {
          ...nodeContent,
          _meta: {
            ...(nodeContent._meta || {}),
            negated: true,
          },
        });
      }

      // Process all children
      const childIds = tree.getChildrenNodeIdsOf(nodeId);
      childIds.forEach(markAllNegated);
    };

    // Start from the root
    markAllNegated(tree.rootNodeId);

    return tree;
  }

  /**
   * Constant for the subtree node type
   * This ensures that the nodeType is consistent across all uses
   */
  public static SubtreeNodeTypeName: string = "NotTree";

  /**
   * Convert the tree to a POJO document with correct NotTree nodeType
   * This ensures that when this tree is used as a subtree, it will be properly recognized
   * during import with fromPojo
   */
  toPojoAt(nodeId: string = this.rootNodeId): Record<string, any> {
    // Use the parent class implementation to get the base POJO
    const pojo = super.toPojoAt(nodeId) as Record<string, any>;
    // const pojoRootKey = treeUtils.parseUniquePojoRootKeyOrThrow(pojo);
    //    pojo[pojoRootKey].nodeType = "subtree:NotTree";

    // // Set the correct nodeType for all nodes in this tree
    // Object.keys(pojo).forEach((key) => {
    //   if (pojo[key].nodeType === "subtree") {
    //     pojo[key].nodeType = "subtree:NotTree";
    //   }
    // });

    return pojo;
  }

  toSqlWhereClauseAt(
    nodeId: string = this.rootNodeId,
    withOptions: { shouldDistributeNegation?: boolean } = {}
  ): string {
    // Get all children from the root node
    const childrenIds = this.getChildrenNodeIdsOf(this.rootNodeId);

    if (childrenIds.length === 0) {
      return "";
    }

    // Build SQL predicates for each child
    const sqlPredicates = [];

    for (const childId of childrenIds) {
      // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****
      // This is a bit of of an anti-pattern.
      // In this case its works because our tree is only root + children (no other descendants)
      // In most case we will have to deal with recursing into the tree and we'll have subtrees to deal with
      // Hence, this iterative pattern is a bad idea.
      // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****

      const content = this.getChildContentAt(childId);

      // Skip if content is null or it's a subtree
      if (
        !content ||
        (typeof content === "object" && "rootNodeId" in content)
      ) {
        // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****
        // WE have tools to determine a subtree - we should never rely on
        // content examination.
        // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****
        // -
        // -
        // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****
        // Subtrees should always be dealt with.  We ignore them sometimes but rarely for
        // things like toSomething - in which case, we either accept a 'shouldIncludeSubtrees' or
        // we default to include them.
        // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****

        continue;
      }

      // Cast to the expected type
      const predicate = content as NotTreePredicateContent;

      // Skip if missing required fields
      if (!predicate.subjectId || !predicate.operator) {
        continue;
      }

      // Get the appropriate operator based on the negation strategy
      let sqlOperator: string;

      if (withOptions.shouldDistributeNegation) {
        // Use negated operators when distributing negation
        sqlOperator = this.getNegatedSqlOperator(
          predicate.operator as TOperandOperator
        );
      } else {
        // Use normal operators when wrapping with NOT
        sqlOperator = this.getSqlOperator(
          predicate.operator as TOperandOperator
        );
      }

      // Format the value
      let sqlValue = predicate.value;
      if (typeof predicate.value === "string") {
        // If it can be converted to a number, don't use quotes
        if (!isNaN(Number(predicate.value))) {
          sqlValue = predicate.value;
        } else {
          sqlValue = `'${predicate.value}'`;
        }
      }

      // Build the SQL predicate
      const sqlPredicate = `${predicate.subjectId} ${sqlOperator} ${sqlValue}`;
      sqlPredicates.push(sqlPredicate);
    }

    if (sqlPredicates.length === 0) {
      return "";
    }

    // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****
    // `return NOT ( ${sqlPredicates.join(" AND ")} )`;
    // doesn't make a lot of sense if following traditional pattern.
    // the root should be set (in our case $and or $or).  It should naturally
    // unfold and there should be no join.. Join is valid for iterative solutions
    // but not necessary for recursive solutions.
    // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****

    // Apply negation based on the strategy
    if (withOptions.shouldDistributeNegation) {
      // When distributing negation, each predicate is already negated,
      // so we still wrap with NOT to create a double negation that cancels out
      return `NOT ( ${sqlPredicates.join(" AND ")} )`;
    } else {
      // When not distributing, we simply wrap all predicates with NOT
      return `NOT ( ${sqlPredicates.join(" AND ")} )`;
    }
  }

  /**
   * Get the appropriate SQL operator (non-negated version)
   */
  private getSqlOperator(operator: TOperandOperator): string {
    const operatorMap: Record<TOperandOperator, string> = {
      $eq: "=",
      $ne: "!=",
      $gt: ">",
      $gte: ">=",
      $lt: "<",
      $lte: "<=",
      $in: "IN",
      $nin: "NOT IN",
    };

    return operatorMap[operator] || operator;
  }

  /**
   * Get the negated SQL operator for a standard operator
   */
  private getNegatedSqlOperator(operator: TOperandOperator): string {
    const negatedOperatorMap: Record<TOperandOperator, string> = {
      $eq: "!=",
      $ne: "=",
      $gt: "<=",
      $gte: "<",
      $lt: ">=",
      $lte: ">",
      $in: "NOT IN",
      $nin: "IN",
    };

    return negatedOperatorMap[operator] || `NOT ${operator}`;
  }

  /**
   * Generate a JavaScript function that implements the predicate logic
   * @param nodeId The node ID to start from
   * @param withOptions Options for generation
   * @returns A complete JavaScript function as a string
   */
  toJavascriptMatcherFunctionAt(
    nodeId: string = this.rootNodeId,
    withOptions: { functionName?: string; recordName?: string } = {}
  ): string {
    const functionName = withOptions.functionName || "matchesCondition";
    const recordName = withOptions.recordName || "record";

    const functionBody = this.toJavascriptMatcherFunctionBodyAt(
      nodeId,
      withOptions
    );

    return `function ${functionName}(${recordName}) {
  return ${functionBody};
}`;
  }

  /**
   * Generate just the body of a JavaScript function that implements the predicate logic
   * @param nodeId The node ID to start from
   * @param withOptions Options for generation
   * @returns The function body as a string
   */
  toJavascriptMatcherFunctionBodyAt(
    nodeId: string = this.rootNodeId,
    withOptions: {
      recordName?: string;
      shouldDistributeNegation?: boolean;
    } = {}
  ): string {
    const recordName = withOptions.recordName || "record";

    // Get all children from the root node
    const childrenIds = this.getChildrenNodeIdsOf(this.rootNodeId);

    if (childrenIds.length === 0) {
      return "true"; // Empty NOT is always true
    }

    // Build JavaScript predicates for each child
    const jsPredicates = [];

    for (const childId of childrenIds) {
      const content = this.getChildContentAt(childId);

      // Skip if content is null or it's a subtree
      if (
        !content ||
        (typeof content === "object" && "rootNodeId" in content)
      ) {
        continue;
      }

      // Cast to the expected type
      const predicate = content as NotTreePredicateContent;

      // Skip if missing required fields
      if (!predicate.subjectId || !predicate.operator) {
        continue;
      }

      // Get appropriate JS operator
      let jsOperator: string;

      if (withOptions.shouldDistributeNegation) {
        // Use negated operators when distributing negation
        jsOperator = this.getNegatedJsOperator(
          predicate.operator as TOperandOperator
        );
      } else {
        // Use normal operators
        jsOperator = this.getJsOperator(predicate.operator as TOperandOperator);
      }

      // Format the value appropriately for JavaScript
      let jsValue: string;

      if (typeof predicate.value === "string") {
        // If it can be converted to a number, use the number
        if (!isNaN(Number(predicate.value))) {
          jsValue = predicate.value;
        } else {
          // It's a string, so wrap in quotes
          jsValue = `"${predicate.value}"`;
        }
      } else if (predicate.value === null) {
        jsValue = "null";
      } else if (predicate.value === undefined) {
        jsValue = "undefined";
      } else if (Array.isArray(predicate.value)) {
        jsValue = JSON.stringify(predicate.value);
      } else {
        // For other types, convert to string representation
        jsValue = String(predicate.value);
      }

      // Build the JavaScript predicate
      const jsPredicate = `${recordName}["${predicate.subjectId}"] ${jsOperator} ${jsValue}`;
      jsPredicates.push(jsPredicate);
    }

    if (jsPredicates.length === 0) {
      return "true"; // Empty NOT is always true
    }

    // Apply negation based on the strategy
    if (withOptions.shouldDistributeNegation) {
      // When distributing negation, we apply ! to the entire expression,
      // but each predicate already has its operator negated, so it's a double negation
      return `!( ${jsPredicates.join(" && ")} )`;
    } else {
      // When not distributing, we wrap with ! to negate the entire expression
      return `!( ${jsPredicates.join(" && ")} )`;
    }
  }

  /**
   * Convert a predicate operator to its JavaScript equivalent
   */
  private getJsOperator(operator: TOperandOperator): string {
    const operatorMap: Record<TOperandOperator, string> = {
      $eq: "===",
      $ne: "!==",
      $gt: ">",
      $gte: ">=",
      $lt: "<",
      $lte: "<=",
      $in: "in", // This will need special handling
      $nin: "not in", // This will need special handling
    };

    // Special case for $in and $nin
    if (operator === "$in") {
      return "includes"; // Will be used like array.includes(value)
    } else if (operator === "$nin") {
      return "!includes"; // Will need special handling
    }

    return operatorMap[operator] || operator;
  }

  /**
   * Get the negated JavaScript operator for a standard operator
   */
  private getNegatedJsOperator(operator: TOperandOperator): string {
    const negatedOperatorMap: Record<TOperandOperator, string> = {
      $eq: "!==",
      $ne: "===",
      $gt: "<=",
      $gte: "<",
      $lt: ">=",
      $lte: ">",
      $in: "!includes",
      $nin: "includes",
    };

    return negatedOperatorMap[operator] || `!${operator}`;
  }
}

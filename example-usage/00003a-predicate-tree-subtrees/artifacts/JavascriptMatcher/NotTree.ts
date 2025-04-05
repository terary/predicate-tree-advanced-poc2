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
  ITree,
  ITreeVisitor,
} from "../../../../src";
import {
  IMatcher,
  IJavaScriptMatchable,
  PredicateContent,
  TOperandOperator,
  TPredicateOperator,
} from "./types";

// Extend the PredicateContent interface for NotTree
export interface NotTreePredicateContent extends PredicateContent {
  operator?: TPredicateOperator;
  subjectId?: string;
  value?: any;
  _meta?: {
    negated?: boolean;
    description?: string;
    isSubtree?: boolean;
    [key: string]: any;
  };
}

/**
 * Visitor for marking all nodes in the NotTree as negated
 */
class NegationVisitor<T extends NotTreePredicateContent>
  implements ITreeVisitor<T>
{
  public includeSubtrees = false;
  private tree: NotTree;

  constructor(tree: NotTree) {
    this.tree = tree;
  }

  visit(
    nodeId: string,
    nodeContent: TGenericNodeContent<T>,
    parentId: string
  ): void {
    if (
      nodeContent &&
      typeof nodeContent === "object" &&
      !("rootNodeId" in nodeContent)
    ) {
      // Mark as negated - only for non-ITree node content
      this.tree.replaceNodeContent(nodeId, {
        ...nodeContent,
        _meta: {
          ...((nodeContent._meta as any) || {}),
          negated: true,
        },
      });
    }
  }
}

/**
 * NotTree - A tree that negates predicates
 *
 * When this tree is attached as a subtree, all predicates inside it
 * will be negated in their meaning.
 */
// @ts-ignore - Bypass TypeScript's static inheritance checking "Class static side ..."
export class NotTree
  extends GenericExpressionTree<NotTreePredicateContent>
  implements IJavaScriptMatchable
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

    // Mark all nodes as negated using the visitor pattern
    const negationVisitor = new NegationVisitor(tree);
    tree.visitAllAt(negationVisitor);

    return tree;
  }

  /**
   * Constant for the subtree node type
   * This ensures that the nodeType is consistent across all uses
   */
  public static SubtreeNodeTypeName: string = "NotTree";

  /**
   * Convert the tree to a POJO document with correct NotTree nodeType
   */
  toPojoAt(nodeId: string = this.rootNodeId): Record<string, any> {
    // Use the parent class implementation to get the base POJO
    const pojo = super.toPojoAt(nodeId) as Record<string, any>;

    // Add the nodeType to all nodes to identify this as a NotTree
    // WE DO NOT TAG EACH NODE WITH nodeType -
    // That is strictly a function of the super/parent tree
    // for (const key in pojo) {
    //   if (Object.prototype.hasOwnProperty.call(pojo, key)) {
    //     pojo[key].nodeType = NotTree.SubtreeNodeTypeName;
    //   }
    // }

    return pojo;
  }

  /**
   * Build a JavaScript matcher function from this NotTree
   */
  buildMatcherFunction(): IMatcher {
    // Generate the JavaScript code
    const jsBody = this.buildJavaScriptMatcherBodyAt(this.rootNodeId);

    // Create a matcher function from the generated code
    const matcherFunction = new Function("record", `return ${jsBody};`) as (
      record: any
    ) => boolean;

    // Return an object that implements the IMatcher interface
    return {
      isMatch: matcherFunction,
    };
  }

  /**
   * Generate the JavaScript matcher function body for a node
   */
  buildJavaScriptMatcherBodyAt(
    nodeId: string = this.rootNodeId,
    withOptions: {
      recordName?: string;
      shouldDistributeNegation?: boolean;
    } = {}
  ): string {
    const recordName = withOptions.recordName || "record";
    const nodeContent = this.getChildContentAt(nodeId);

    if (!nodeContent) {
      return "false";
    }

    // Check if this is an ITree node
    if (this.isSubtree(nodeId)) {
      // Handle subtree nodes differently if needed
      return "false"; // Default for now
    }

    // At this point we know nodeContent is not an ITree
    const predicateContent = nodeContent as NotTreePredicateContent;
    const operator = predicateContent.operator;
    const isNegated = predicateContent._meta?.negated || false;

    // Handle leaf nodes (predicates)
    if (this.isLeaf(nodeId)) {
      const subject = predicateContent.subjectId;
      const value = predicateContent.value;

      // Get the appropriate JavaScript operator based on the original operator
      let jsOperator = this.getJsOperator(operator as TOperandOperator);

      // Format the value appropriately
      const formattedValue = this.formatValueForJs(value);

      // Create the JavaScript expression using the subject ID as an atomic value
      const jsExpr = `${recordName}["${subject}"] ${jsOperator} ${formattedValue}`;

      // For a NotTree, we negate individual leaf nodes
      return `!(${jsExpr})`;
    }

    // Handle junctions ($and, $or)
    if (this.isBranch(nodeId)) {
      const childIds = this.getChildrenNodeIdsOf(nodeId);

      if (childIds.length === 0) {
        return operator === "$and" ? "true" : "false";
      }

      // Get the negated expressions for all children
      const childExpressions = childIds.map((childId) =>
        this.buildJavaScriptMatcherBodyAt(childId, withOptions)
      );

      // Apply DeMorgan's law at the root level only
      if (this.isRoot(nodeId)) {
        // For a NotTree with $and root, we implement DeMorgan's law:
        // NOT(A AND B) = NOT(A) OR NOT(B)
        // Since our child expressions are already negated, we join with OR
        if (operator === "$and") {
          return childExpressions.join(" || ");
        }
        // For a NotTree with $or root, we implement DeMorgan's law:
        // NOT(A OR B) = NOT(A) AND NOT(B)
        // Since our child expressions are already negated, we join with AND
        else if (operator === "$or") {
          return childExpressions.join(" && ");
        }
      }

      // For nested operators that are already part of a NotTree,
      // we keep the original operator logic
      const junction = operator === "$and" ? "&&" : "||";
      return childExpressions.join(` ${junction} `);
    }

    // Default case
    return "false";
  }

  /**
   * Format a value for use in JavaScript
   */
  private formatValueForJs(value: any): string {
    if (value === null || value === undefined) {
      return "null";
    }

    if (typeof value === "string") {
      // Escape quotes and wrap in quotes
      return `"${value.replace(/"/g, '\\"')}"`;
    }

    if (Array.isArray(value)) {
      const formattedItems = value.map((item) => this.formatValueForJs(item));
      return `[${formattedItems.join(", ")}]`;
    }

    // Numbers, booleans, etc. can be used as-is
    return String(value);
  }

  /**
   * Get the JavaScript operator for a predicate operator
   */
  private getJsOperator(operator: TOperandOperator): string {
    const operatorMap: Record<TOperandOperator, string> = {
      $eq: "===",
      $ne: "!==",
      $gt: ">",
      $gte: ">=",
      $lt: "<",
      $lte: "<=",
      $in: "INVALID_IN", // Requires special handling
      $nin: "INVALID_NIN", // Requires special handling
    };

    const jsOperator = operatorMap[operator];

    // Special handling for array operations
    if (operator === "$in") {
      return "includes";
    }

    if (operator === "$nin") {
      return "!includes";
    }

    return jsOperator;
  }
}

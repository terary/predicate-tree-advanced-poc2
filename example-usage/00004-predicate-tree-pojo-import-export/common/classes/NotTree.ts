/**
 * NotTree.ts
 *
 * This file defines a NotTree, which is a specialized Predicate Tree that
 * negates predicates. It serves as an example of a subtree with custom behavior.
 */

import { GenericExpressionTree, IExpressionTree } from "../../../../src";
import { PredicateContent } from "./PredicateTree";
import type {
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
} from "../../../../src/DirectedGraph/types";
import treeUtils from "../../../../src/DirectedGraph/AbstractDirectedGraph/treeUtilities";
// Extend the PredicateContent interface to include _meta
export interface NotTreePredicateContent extends PredicateContent {
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
export class NotTree extends GenericExpressionTree<NotTreePredicateContent> {
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
  getNegatedOperator(operator: string): string {
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
}

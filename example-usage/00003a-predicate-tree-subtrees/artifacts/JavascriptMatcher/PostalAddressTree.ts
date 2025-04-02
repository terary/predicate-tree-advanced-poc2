/**
 * PostalAddressTree.ts
 *
 * This file defines a PostalAddressTree, which is a specialized Predicate Tree that
 * handles address-related predicates. It serves as an example of a subtree with custom behavior.
 *
 * This is demonstration only.  In a real implementation we would implement checks
 * to prevent adding complex types.  Address (as atomic type) can only be a leaf probably.
 * We make none of the considerations in this example.
 *
 *
 */

import {
  GenericExpressionTree,
  IExpressionTree,
  treeUtils,
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
  ITree,
} from "../../../../src";
import {
  IMatcher,
  IJavaScriptMatchable,
  PredicateContent,
  TOperandOperator,
  TPredicateOperator,
} from "./types";

// Extend the PredicateContent interface for PostalAddressTree
export interface PostalAddressTreePredicateContent extends PredicateContent {
  operator?: TPredicateOperator;
  subjectId?: string;
  value?: any;
  _meta?: {
    description?: string;
    isSubtree?: boolean;
    [key: string]: any;
  };
}

/**
 * PostalAddressTree - A tree specialized for handling address-related predicates
 *
 * This tree treats predicates as parts of an address structure and handles
 * them appropriately when building JavaScript matcher functions.
 */
// @ts-ignore - Bypass TypeScript's static inheritance checking "Class static side ..."
export class PostalAddressTree
  extends GenericExpressionTree<PostalAddressTreePredicateContent>
  implements IJavaScriptMatchable
{
  public SubtreeNodeTypeName: string = "PostalAddressTree";

  /**
   * Create a new PostalAddressTree with an AND root
   */
  constructor(
    rootNodeId: string = "address-root",
    nodeContent?: PostalAddressTreePredicateContent
  ) {
    super(rootNodeId, nodeContent);

    // Initialize with a default root node if not provided
    if (!nodeContent) {
      this.replaceNodeContent(this.rootNodeId, {
        operator: "$and",
        _meta: {
          description: "Address predicates (all conditions must be met)",
        },
      });
    }
  }

  /**
   * Override the append child method to process node content
   */
  appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: PostalAddressTreePredicateContent
  ): string {
    // Preserve existing metadata but don't add special flags
    const contentWithMeta = {
      ...nodeContent,
      _meta: {
        ...(nodeContent._meta || {}),
      },
    };

    // Use the parent class method to append the child
    return super.appendChildNodeWithContent(parentNodeId, contentWithMeta);
  }

  /**
   * Override createSubtreeAt to ensure subtrees within this PostalAddressTree
   * also maintain the address behavior
   */
  createSubtreeAt<Q extends PostalAddressTreePredicateContent>(
    targetNodeId: string
  ): IExpressionTree<Q> {
    // Create a new PostalAddressTree subtree
    const subtree = new PostalAddressTree() as unknown as IExpressionTree<Q>;

    // Handle the attachment using parent implementation logic
    const subtreeParentNodeId = this.appendChildNodeWithContent(targetNodeId, {
      operator: "$and",
      _meta: {
        description: "Nested address group",
      },
    } as unknown as PostalAddressTreePredicateContent);

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
   * Create a PostalAddressTree instance from a POJO document
   */
  static fromPojo<P extends PostalAddressTreePredicateContent, Q = unknown>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): PostalAddressTree {
    // Find the root node ID from the POJO
    const rootNodeId =
      Object.keys(srcPojoTree).find(
        (key) => srcPojoTree[key].parentId === key || !srcPojoTree[key].parentId
      ) || "address-root";

    // Create a new PostalAddressTree instance with the determined root node ID
    const tree = new PostalAddressTree(rootNodeId);

    // Get the root content from the POJO
    const rootContent = srcPojoTree[rootNodeId]?.nodeContent;
    if (rootContent) {
      // Set the root content in our new tree
      tree.replaceNodeContent(tree.rootNodeId, rootContent);
    }

    // Function to recursively add child nodes
    const addChildrenRecursively = (parentId: string) => {
      // Find all children of this parent in the POJO
      const childNodeIds = Object.keys(srcPojoTree).filter(
        (nodeId) =>
          srcPojoTree[nodeId].parentId === parentId && nodeId !== parentId
      );

      // Add each child to the tree
      childNodeIds.forEach((childId) => {
        const childContent = srcPojoTree[childId].nodeContent;
        const newChildId = tree.appendChildNodeWithContent(
          parentId,
          childContent
        );

        // Recursively add this child's children
        addChildrenRecursively(childId);
      });
    };

    // Start the recursive process from the root
    addChildrenRecursively(rootNodeId);

    return tree;
  }

  /**
   * Constant for the subtree node type
   * This ensures that the nodeType is consistent across all uses
   */
  public static SubtreeNodeTypeName: string = "PostalAddressTree";

  /**
   * Convert the tree to a POJO document with correct PostalAddressTree nodeType
   */
  toPojoAt(nodeId: string = this.rootNodeId): Record<string, any> {
    // Use the parent class implementation to get the base POJO
    const pojo = super.toPojoAt(nodeId) as Record<string, any>;

    // Add the nodeType to all nodes to identify this as a PostalAddressTree
    for (const key in pojo) {
      if (Object.prototype.hasOwnProperty.call(pojo, key)) {
        pojo[key].nodeType = PostalAddressTree.SubtreeNodeTypeName;
      }
    }

    return pojo;
  }

  /**
   * Build a JavaScript matcher function from this PostalAddressTree
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
      addressPrefix?: string;
    } = {}
  ): string {
    const recordName = withOptions.recordName || "record";
    const addressPrefix = "address";
    const nodeContent = this.getChildContentAt(nodeId);

    if (!nodeContent) {
      return "false";
    }

    // Check if this is a subtree node
    if (this.isSubtree(nodeId)) {
      // Handle subtree nodes differently if needed
      return "false"; // Default for now
    }

    // At this point we know nodeContent is not an ITree
    const predicateContent = nodeContent as PostalAddressTreePredicateContent;
    const operator = predicateContent.operator;

    // Handle leaf nodes (predicates)
    if (this.isLeaf(nodeId)) {
      const subject = predicateContent.subjectId;
      const value = predicateContent.value;

      // Get the appropriate JavaScript operator based on the original operator
      let jsOperator = this.getJsOperator(operator as TOperandOperator);

      // Format the value appropriately
      const formattedValue = this.formatValueForJs(value);

      // Create the JavaScript expression with address prefix
      const jsExpr = `${recordName}["${addressPrefix}"]["${subject}"] ${jsOperator} ${formattedValue}`;

      return jsExpr;
    }

    // Handle junctions ($and, $or)
    if (this.isBranch(nodeId)) {
      const childIds = this.getChildrenNodeIdsOf(nodeId);

      if (childIds.length === 0) {
        return operator === "$and" ? "true" : "false";
      }

      // Get expressions for all children
      const childExpressions = childIds.map((childId) =>
        this.buildJavaScriptMatcherBodyAt(childId, withOptions)
      );

      // Combine expressions based on the junction type
      if (this.isRoot(nodeId)) {
        const junction = operator === "$and" ? "&&" : "||";
        return childExpressions.join(` ${junction} `);
      } else {
        // For nested junctions, wrap them in parentheses
        const junction = operator === "$and" ? "&&" : "||";
        return `(${childExpressions.join(` ${junction} `)})`;
      }
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

/**
 * PredicateTree.ts
 *
 * This file defines a PredicateTree, which is a master tree that can contain
 * various specialized subtrees (NotTree, PostalAddressTree, ArithmeticTree).
 * It can generate JavaScript matcher functions that combine all subtrees.
 */

import {
  GenericExpressionTree,
  IExpressionTree,
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
  treeUtils,
} from "../../../../src";
import { ArithmeticTree } from "./ArithmeticTree";
import { NotTree } from "./NotTree";
import { PostalAddressTree } from "./PostalAddressTree";
import {
  IJavaScriptMatchable,
  IMatcher,
  PredicateContent,
  TOperandOperator,
} from "./types";

/**
 * PredicateTree - A master tree that can contain various specialized subtrees
 * and generate JavaScript matcher functions.
 */
// @ts-ignore - Bypass TypeScript's static inheritance checking "Class static side ..."
export class PredicateTree
  extends GenericExpressionTree<PredicateContent>
  implements IJavaScriptMatchable
{
  public SubtreeNodeTypeName: string = "PredicateTree";

  /**
   * Create a new PredicateTree
   */
  constructor(
    rootNodeId: string = "predicate-root",
    nodeContent?: PredicateContent
  ) {
    super(rootNodeId, nodeContent);

    // Initialize with a default root node if not provided
    if (!nodeContent) {
      this.replaceNodeContent(this.rootNodeId, {
        operator: "$and",
      });
    }
  }

  /**
   * Generic method to create a subtree of the specified type
   * This reduces the duplicate code in the previous implementation
   */
  private createSubtreeOfType<T extends GenericExpressionTree<any>>(
    parentNodeId: string,
    SubtreeClass: new (rootNodeId?: string, nodeContent?: any) => T
  ): T {
    // Create a new instance of the specified subtree class
    const subtree = new SubtreeClass();

    // Create a unique ID for the subtree node
    const subtreeNodeId = this.appendChildNodeWithContent(parentNodeId, {});

    // Reroot the subtree to make it a subtree of this tree
    GenericExpressionTree.reRootTreeAt(
      subtree,
      subtree.rootNodeId,
      subtreeNodeId
    );

    // Set the internal properties to integrate with this tree
    // @ts-ignore - Access protected properties with type casting
    subtree._rootNodeId = subtreeNodeId;
    // @ts-ignore - Share the incrementor with the parent tree
    subtree._incrementor = this._incrementor;

    // Critical fix: Store the actual subtree object as the node content
    // This ensures object identity is maintained when retrieved
    // @ts-ignore - Access protected properties to directly modify the node dictionary
    this._nodeDictionary[subtreeNodeId].nodeContent = subtree;

    return subtree;
  }

  /**
   * Create a NotTree subtree at the specified node
   */
  createNotTreeAt(parentNodeId: string): NotTree {
    return this.createSubtreeOfType(parentNodeId, NotTree);
  }

  /**
   * Create a PostalAddressTree subtree at the specified node
   */
  createPostalAddressTreeAt(parentNodeId: string): PostalAddressTree {
    return this.createSubtreeOfType(parentNodeId, PostalAddressTree);
  }

  /**
   * Create an ArithmeticTree subtree at the specified node
   */
  createArithmeticTreeAt(parentNodeId: string): ArithmeticTree {
    return this.createSubtreeOfType(parentNodeId, ArithmeticTree);
  }

  /**
   * Create a subtree of a specific type based on the nodeType string
   */
  createSubtreeOfTypeAt<Q extends PredicateContent>(
    parentNodeId: string,
    nodeType: string
  ): IExpressionTree<Q> {
    if (nodeType === NotTree.SubtreeNodeTypeName) {
      return this.createNotTreeAt(
        parentNodeId
      ) as unknown as IExpressionTree<Q>;
    } else if (nodeType === PostalAddressTree.SubtreeNodeTypeName) {
      return this.createPostalAddressTreeAt(
        parentNodeId
      ) as unknown as IExpressionTree<Q>;
    } else if (nodeType === ArithmeticTree.SubtreeNodeTypeName) {
      return this.createArithmeticTreeAt(
        parentNodeId
      ) as unknown as IExpressionTree<Q>;
    } else {
      throw new Error(`Unknown subtree type: ${nodeType}`);
    }
  }

  /**
   * Create a PredicateTree instance from a POJO document
   *
   * This method uses what we call an "Inverted Duck Punch" approach:
   * Rather than manipulating the prototype chain, we create a generic tree
   * and then copy its internal structure to a new PredicateTree instance.
   *
   * This approach is needed because of the inheritance limitations in TypeScript
   * where the return type of static methods cannot be properly overridden in subclasses.
   * See the @ts-ignore comment above the class definition for related context.
   */
  static fromPojo<P extends PredicateContent, Q = unknown>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): PredicateTree {
    // ** Inverted Duck Punch ** DO NOT REMOVE THIS COMMENT
    // Create a generic tree using the parent class's fromPojo
    const genericTree = GenericExpressionTree.fromPojo(srcPojoTree, transform);

    // Create a new PredicateTree
    const predicateTree = new PredicateTree();

    // Copy the internal properties from the generic tree (Duck Punch)
    // @ts-ignore - Set internal properties from generic tree
    predicateTree._incrementor = genericTree._incrementor;
    // @ts-ignore
    predicateTree._rootNodeId = genericTree._rootNodeId;
    // @ts-ignore
    predicateTree._nodeDictionary = genericTree._nodeDictionary;
    // ** Inverted Duck Punch ** DO NOT REMOVE THIS COMMENT

    return predicateTree;
  }

  /**
   * Constant for the subtree node type
   * This ensures that the nodeType is consistent across all uses
   */
  public static SubtreeNodeTypeName: string = "PredicateTree";

  /**
   * Convert the tree to a POJO document
   */
  toPojoAt(nodeId: string = this.rootNodeId): Record<string, any> {
    // Use the parent class implementation to get the POJO
    const pojo = super.toPojoAt(nodeId) as Record<string, any>;
    return pojo;
  }

  /**
   * Build a JavaScript matcher function from this tree
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
    } = {}
  ): string {
    const recordName = withOptions.recordName || "record";
    const nodeContent = this.getChildContentAt(nodeId);

    if (!nodeContent) {
      return "false";
    }

    // Check if this is a subtree
    if (this.isSubtree(nodeId)) {
      // Check if the subtree implements buildJavaScriptMatcherBodyAt
      const subtree = nodeContent as any;
      if (
        subtree &&
        typeof subtree.buildJavaScriptMatcherBodyAt === "function"
      ) {
        return subtree.buildJavaScriptMatcherBodyAt(subtree.rootNodeId, {
          recordName,
        });
      }
      return "false"; // Default for unknown subtree type
    }

    // At this point we know nodeContent is not a tree instance
    const predicateContent = nodeContent as PredicateContent;
    const operator = predicateContent.operator;

    // Handle leaf nodes (predicates)
    if (this.isLeaf(nodeId)) {
      if (!operator || !predicateContent.subjectId) {
        return "true"; // Empty predicate is always true
      }

      const subject = predicateContent.subjectId;
      const value = predicateContent.value;

      // Get the appropriate JavaScript operator
      const jsOperator = this.getJsOperator(operator as TOperandOperator);

      // Format the value appropriately
      const formattedValue = this.formatValueForJs(value);

      // Create the JavaScript expression
      return `${recordName}["${subject}"] ${jsOperator} ${formattedValue}`;
    }

    // Handle junctions ($and, $or)
    if (this.isBranch(nodeId)) {
      const childIds = this.getChildrenNodeIdsOf(nodeId);

      if (childIds.length === 0) {
        return operator === "$and" ? "true" : "false";
      }

      // Get the expressions for all children
      const childExpressions = childIds.map((childId) =>
        this.buildJavaScriptMatcherBodyAt(childId, withOptions)
      );

      // Join with the appropriate junction operator
      const junction = operator === "$and" ? "&&" : "||";
      return childExpressions.length === 1
        ? childExpressions[0]
        : `(${childExpressions.join(` ${junction} `)})`;
    }

    // Default case
    return "true";
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
      $in: "includes", // Use includes method for arrays
      $nin: "!includes", // Use negated includes for arrays
    };

    return operatorMap[operator] || "===";
  }
}

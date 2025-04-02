/**
 * ArithmeticTree.ts
 *
 * A specialized tree for handling arithmetic expressions.
 * Supports operations like addition, subtraction, multiplication, and division,
 * and can generate JavaScript matcher expressions from these operations.
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

// Define supported arithmetic operators
export type TArithmeticOperator = "+" | "-" | "*" | "/" | "%" | "**";

// Extend the PredicateContent interface for ArithmeticTree
export interface ArithmeticTreePredicateContent extends PredicateContent {
  arithmeticOperator?: TArithmeticOperator;
  subjectId?: string;
  value?: any;
  constant?: number;
}

/**
 * ArithmeticTree - A tree specialized for handling arithmetic expressions
 *
 * This tree creates JavaScript expressions that perform arithmetic operations
 * on record fields and constants.
 */
// @ts-ignore - Bypass TypeScript's static inheritance checking "Class static side ..."
export class ArithmeticTree
  extends GenericExpressionTree<ArithmeticTreePredicateContent>
  implements IJavaScriptMatchable
{
  public SubtreeNodeTypeName: string = "ArithmeticTree";

  /**
   * Create a new ArithmeticTree
   */
  constructor(
    rootNodeId: string = "arithmetic-root",
    nodeContent?: ArithmeticTreePredicateContent
  ) {
    super(rootNodeId, nodeContent);

    // Initialize with a default root node if not provided
    if (!nodeContent) {
      this.replaceNodeContent(this.rootNodeId, {
        arithmeticOperator: "+", // Default to addition
      });
    }
  }

  /**
   * Override createSubtreeAt to ensure subtrees within this ArithmeticTree
   * also maintain the arithmetic behavior
   */
  createSubtreeAt<Q extends ArithmeticTreePredicateContent>(
    targetNodeId: string
  ): IExpressionTree<Q> {
    // Create a new ArithmeticTree subtree
    const subtree = new ArithmeticTree() as unknown as IExpressionTree<Q>;

    // Handle the attachment using parent implementation logic
    const subtreeParentNodeId = this.appendChildNodeWithContent(targetNodeId, {
      arithmeticOperator: "+", // Default to addition
    } as unknown as ArithmeticTreePredicateContent);

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
   * Create an ArithmeticTree instance from a POJO document
   *
   * This method uses what we call an "Inverted Duck Punch" approach:
   * Rather than manipulating the prototype chain, we create a generic tree
   * and then copy its internal structure to a new ArithmeticTree instance.
   *
   * This approach is needed because of the inheritance limitations in TypeScript
   * where the return type of static methods cannot be properly overridden in subclasses.
   * See the @ts-ignore comment above the class definition for related context.
   */
  static fromPojo<P extends ArithmeticTreePredicateContent, Q = unknown>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): ArithmeticTree {
    // Create a generic tree using the parent class's fromPojo
    const genericTree = GenericExpressionTree.fromPojo(srcPojoTree, transform);

    // Create a new ArithmeticTree
    const arithmeticTree = new ArithmeticTree();

    // Copy the internal properties from the generic tree
    // @ts-ignore - Set internal properties from generic tree
    arithmeticTree._incrementor = genericTree._incrementor;
    // @ts-ignore
    arithmeticTree._rootNodeId = genericTree._rootNodeId;
    // @ts-ignore
    arithmeticTree._nodeDictionary = genericTree._nodeDictionary;

    return arithmeticTree;
  }

  /**
   * Constant for the subtree node type
   * This ensures that the nodeType is consistent across all uses
   */
  public static SubtreeNodeTypeName: string = "ArithmeticTree";

  /**
   * Convert the tree to a POJO document with correct ArithmeticTree nodeType
   */
  toPojoAt(nodeId: string = this.rootNodeId): Record<string, any> {
    // Use the parent class implementation to get the base POJO
    const pojo = super.toPojoAt(nodeId) as Record<string, any>;

    // Add the nodeType only to our own nodes, not subtrees
    for (const key in pojo) {
      if (Object.prototype.hasOwnProperty.call(pojo, key)) {
        if (!pojo[key].nodeType) {
          // Only add if it doesn't already have a nodeType
          pojo[key].nodeType = ArithmeticTree.SubtreeNodeTypeName;
        }
      }
    }

    return pojo;
  }

  /**
   * Build a JavaScript matcher function from this ArithmeticTree
   * The matcher checks if the result of the arithmetic expression
   * matches a certain condition (if specified).
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
      return "0"; // Default for arithmetic - return 0
    }

    // Check if this is a subtree node
    if (this.isSubtree(nodeId)) {
      // Handle subtrees properly by checking for buildJavaScriptMatcherBodyAt
      const subtree = nodeContent as unknown as ITree<any> & {
        buildJavaScriptMatcherBodyAt?: Function;
      };
      if (
        subtree &&
        typeof subtree.buildJavaScriptMatcherBodyAt === "function"
      ) {
        return subtree.buildJavaScriptMatcherBodyAt(
          subtree.rootNodeId,
          withOptions
        );
      }
      return "0"; // Default if subtree doesn't support our interface
    }

    // At this point we know nodeContent is not an ITree
    const predicateContent = nodeContent as ArithmeticTreePredicateContent;
    const operator = predicateContent.arithmeticOperator;

    // Handle leaf nodes (values or record fields)
    if (this.isLeaf(nodeId)) {
      // If it's a constant value
      if (predicateContent.constant !== undefined) {
        return String(predicateContent.constant);
      }

      // If it's a record field
      if (predicateContent.subjectId) {
        return `${recordName}["${predicateContent.subjectId}"]`;
      }

      // If it has a value
      if (predicateContent.value !== undefined) {
        return this.formatValueForJs(predicateContent.value);
      }

      // Default case for a leaf
      return "0";
    }

    // Handle branch nodes (arithmetic operations)
    if (this.isBranch(nodeId)) {
      const childIds = this.getChildrenNodeIdsOf(nodeId);

      if (childIds.length === 0) {
        return "0"; // Default for empty operations
      }

      // Get expressions for all children
      const childExpressions = childIds.map((childId) =>
        this.buildJavaScriptMatcherBodyAt(childId, withOptions)
      );

      // Single child - no operation needed
      if (childExpressions.length === 1) {
        return childExpressions[0];
      }

      // Combine expressions based on the arithmetic operator
      return `(${childExpressions.join(` ${operator} `)})`;
    }

    // Default case
    return "0";
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
}

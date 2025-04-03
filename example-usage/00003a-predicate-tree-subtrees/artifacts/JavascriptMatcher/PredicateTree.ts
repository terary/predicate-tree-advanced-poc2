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

    // IMPORTANT: Create a node in this tree to host the subtree
    // The subtree object itself becomes the node content
    const subtreeNodeId = this.appendChildNodeWithContent(
      parentNodeId,
      subtree
    );

    // Reroot the subtree to the node we just created
    GenericExpressionTree.reRootTreeAt(
      subtree,
      subtree.rootNodeId,
      subtreeNodeId
    );

    // Update the subtree's internal properties to integrate with this tree
    // @ts-ignore - Access protected properties with type casting
    subtree._rootNodeId = subtreeNodeId;
    // @ts-ignore - Share the incrementor with the parent tree
    subtree._incrementor = this._incrementor;

    // The critical part is to ensure the node directly references the subtree object
    // This directly matches the reference implementation in AbstractExpressionTree.createSubtreeAt
    // No need to explicitly set the content since it's already set by appendChildNodeWithContent

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
    // Extract the actual type name by removing the 'subtree:' prefix if present
    const typeName = nodeType.startsWith("subtree:")
      ? nodeType.substring(8)
      : nodeType;

    if (typeName === NotTree.SubtreeNodeTypeName) {
      return this.createNotTreeAt(
        parentNodeId
      ) as unknown as IExpressionTree<Q>;
    } else if (typeName === PostalAddressTree.SubtreeNodeTypeName) {
      return this.createPostalAddressTreeAt(
        parentNodeId
      ) as unknown as IExpressionTree<Q>;
    } else if (typeName === ArithmeticTree.SubtreeNodeTypeName) {
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
   * This method properly processes subtree nodeTypes to create the correct subtree instances.
   */
  static fromPojo<P extends PredicateContent>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): PredicateTree {
    // Use default transform if not provided
    const transformer =
      transform || ((nodeContent: TNodePojo<P>) => nodeContent.nodeContent);

    // Create a copy of the source POJO to work with
    const pojoObject = { ...srcPojoTree };

    // Find the root node ID
    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(pojoObject);
    const rootNodePojo = pojoObject[rootNodeId];

    // Create a new PredicateTree with the root node
    const dTree = new PredicateTree(rootNodeId);
    dTree.replaceNodeContent(
      dTree.rootNodeId,
      transformer(rootNodePojo) as PredicateContent
    );
    delete pojoObject[rootNodeId];

    // Process all child nodes and create appropriate subtrees
    PredicateTree.fromPojoTraverseAndExtractChildren(
      dTree.rootNodeId,
      rootNodeId,
      dTree as unknown as IExpressionTree<P>,
      pojoObject,
      transformer
    );

    // Check for orphaned nodes
    if (Object.keys(pojoObject).length > 0) {
      throw new Error(
        "Orphan nodes detected while parsing POJO object: " +
          Object.keys(pojoObject).join(", ")
      );
    }

    return dTree;
  }

  /**
   * Helper method to traverse POJO and extract children with appropriate subtree handling
   */
  private static fromPojoTraverseAndExtractChildren<P extends PredicateContent>(
    treeParentId: string,
    jsonParentId: string,
    dTree: IExpressionTree<P>,
    treeObject: TTreePojo<P>,
    transformer: (nodePojo: TNodePojo<P>) => TGenericNodeContent<P>
  ): void {
    // Extract all children of the current node
    const childrenNodes = treeUtils.extractChildrenNodes<P>(
      jsonParentId,
      treeObject
    ) as TTreePojo<P>;

    // Process each child node
    Object.entries(childrenNodes).forEach(([nodeId, nodePojo]) => {
      // Check if this is a subtree node
      if (nodePojo.nodeType && nodePojo.nodeType.startsWith("subtree:")) {
        // Create the appropriate subtree type - we need to cast dTree to PredicateTree
        const subtree = (
          dTree as unknown as PredicateTree
        ).createSubtreeOfTypeAt(treeParentId, nodePojo.nodeType);

        // Set the content for the subtree root
        subtree.replaceNodeContent(
          subtree.rootNodeId,
          transformer(nodePojo) as PredicateContent
        );

        // Process children of this subtree
        PredicateTree.fromPojoTraverseAndExtractChildren(
          subtree.rootNodeId,
          nodeId,
          subtree as unknown as IExpressionTree<P>,
          treeObject,
          transformer
        );
      } else {
        // Regular node - add it to the tree
        const childId = dTree.appendChildNodeWithContent(
          treeParentId,
          transformer(nodePojo) as P
        );

        // Process children of this node
        PredicateTree.fromPojoTraverseAndExtractChildren(
          childId,
          nodeId,
          dTree,
          treeObject,
          transformer
        );
      }
    });
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

    // For each subtree node, ensure it has the correct nodeType
    Object.keys(pojo).forEach((key) => {
      const node = pojo[key];
      if (this.isSubtree(key)) {
        const subtree = this.getChildContentAt(key);
        if (
          subtree &&
          typeof subtree === "object" &&
          "SubtreeNodeTypeName" in subtree
        ) {
          // Set the nodeType using the pattern "subtree:SubtreeTypeName"
          node.nodeType = `subtree:${(subtree as any).SubtreeNodeTypeName}`;

          // Make sure we don't have nodeType on inner nodes of this subtree
          // Find all child nodes that belong to this subtree
          const allNodes = Object.keys(pojo);
          const childrenIds = allNodes.filter((id) => {
            return id !== key && id.startsWith(key + ":");
          });

          // Remove any nodeType set on inner nodes of this subtree
          childrenIds.forEach((childId) => {
            if (
              pojo[childId].nodeType === (subtree as any).SubtreeNodeTypeName
            ) {
              delete pojo[childId].nodeType;
            }
          });
        }
      }
    });

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

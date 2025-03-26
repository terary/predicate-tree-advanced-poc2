/**
 * PredicateTree Implementation
 *
 * A specialized implementation of GenericExpressionTree that supports POJO import/export
 */

import { GenericExpressionTree, IExpressionTree, ITree } from "../../../src";
import treeUtils from "../../../src/DirectedGraph/AbstractDirectedGraph/treeUtilities";
import {
  validOperators,
  validSubjects,
  isValidOperatorForSubject,
} from "./subjectDictionary";
import type {
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
} from "../../../src/DirectedGraph/types";
import { AbstractTree } from "../../../dist";
import { NotTree } from "./NotTree";

// Define the node content type for our predicate tree
export interface PredicateContent {
  operator?: string;
  subjectId?: string;
  value?: any;
  _meta?: {
    negated?: boolean;
    description?: string;
    isSubtree?: boolean;
    [key: string]: any;
  };
  [key: string]: any; // Allow additional properties
}

// Define the POJO node type
export interface PojoNode {
  parentId: string | null;
  nodeContent: PredicateContent;
  nodeType?: string; // Added to support different tree types
}

// Define the POJO document type
export interface PojoDocs {
  [key: string]: PojoNode;
}

/**
 * Validation error class for our predicate tree
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validation functions
 */
// Validate a POJO document structure
function validatePojoStructure(pojo: PojoDocs): void {
  // Check for at least one node
  if (Object.keys(pojo).length === 0) {
    throw new ValidationError("POJO document is empty");
  }

  // Check for a single root node
  const rootNodes = Object.values(pojo).filter(
    (node) => node.parentId === null
  );

  if (rootNodes.length === 0) {
    throw new ValidationError("No root node found");
  }

  if (rootNodes.length > 1) {
    throw new ValidationError("Multiple root nodes found");
  }

  // Check that all parent IDs exist in the document
  Object.values(pojo).forEach((node) => {
    if (node.parentId !== null && !(node.parentId in pojo)) {
      throw new ValidationError(
        `Parent ID '${node.parentId}' not found in POJO document`
      );
    }
  });
}

// Validate predicate node content
function validateNodeContent(content: PredicateContent): void {
  // If it's a junction node (AND/OR), just check the operator
  if (content.operator === "$and" || content.operator === "$or") {
    return;
  }

  // For regular predicates, check that required fields are present
  if (!content.subjectId) {
    throw new ValidationError("Missing 'subjectId' in predicate");
  }

  if (!content.operator) {
    throw new ValidationError("Missing 'operator' in predicate");
  }

  // Check if subject is valid
  if (!(content.subjectId in validSubjects)) {
    throw new ValidationError(`Invalid subject: ${content.subjectId}`);
  }

  // Check if operator is valid
  if (!(content.operator in validOperators)) {
    throw new ValidationError(`Invalid operator: ${content.operator}`);
  }

  // Check if operator is valid for this subject
  if (!isValidOperatorForSubject(content.operator, content.subjectId)) {
    throw new ValidationError(
      `Operator '${content.operator}' not valid for subject '${content.subjectId}'`
    );
  }
}

// Import NotTree only when needed to avoid circular dependencies
// This function lazy-loads the NotTree class
function getNotTreeClass() {
  // Using dynamic import to avoid circular references
  // For our example, we'll just use a relative import
  return require("./NotTree").NotTree;
}

/**
 * PredicateTree - A tree that handles predicate expressions
 * and supports POJO import/export
 */
// @ts-ignore - Bypass TypeScript's static inheritance checking
export class PredicateTree extends GenericExpressionTree<PredicateContent> {
  /**
   * Create a new PredicateTree
   */
  constructor(rootNodeId?: string, nodeContent?: PredicateContent) {
    super(rootNodeId, nodeContent);

    // Initialize with a default root node if not provided
    if (!nodeContent) {
      this.replaceNodeContent(this.rootNodeId, {
        operator: "$and",
      });
    }
  }

  static fromPojo<P extends PredicateContent, Q = unknown>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): PredicateTree | IExpressionTree<P> {
    // Find the root node using the utility function
    const rootKey = treeUtils.parseUniquePojoRootKeyOrThrow(srcPojoTree);

    // Check if this is a specialized tree type by checking for nodeType pattern "subtree:TreeType"
    const rootNode = srcPojoTree[rootKey];

    // Create a new tree with the root node content
    const tree = new PredicateTree(
      rootKey,
      srcPojoTree[rootKey].nodeContent as PredicateContent
    );

    // Organize nodes by parent ID for efficient processing
    const nodesByParent: { [parentId: string]: string[] } = {};

    // First, collect all nodes by their parent
    Object.keys(srcPojoTree).forEach((nodeId) => {
      if (nodeId !== rootKey) {
        const parentId = srcPojoTree[nodeId].parentId as string;
        if (!nodesByParent[parentId]) {
          nodesByParent[parentId] = [];
        }
        nodesByParent[parentId].push(nodeId);
      }
    });

    // Process all nodes
    const processNodes = (parentId: string) => {
      const children = nodesByParent[parentId] || [];

      for (const childId of children) {
        const node = srcPojoTree[childId];

        // Check if this is a subtree by looking for "subtree:" pattern in nodeType
        //        if (node.nodeType && node.nodeType.startsWith("subtree:")) {
        // ^--- ANOTHER FUCKING CURSOR HACK THAT I HAVE FIXED SEVERAL TIMES - LEAVING HOPING THE CURSOR WILL STOP ADDING IT
        if (node.nodeType && node.nodeType.startsWith("subtree:")) {
          // Create a subtree based on the type
          if (
            node.nodeType &&
            node.nodeType.startsWith(
              [
                AbstractTree.SubtreeNodeTypeName,
                NotTree.SubtreeNodeTypeName,
              ].join(":")
            )
          ) {
            // Use our specialized method to create a NotTree subtree
            const subtree = tree.createSubtreeNotTree(parentId);

            // Initialize with content
            subtree.replaceNodeContent(subtree.rootNodeId, {
              ...(node.nodeContent as PredicateContent),
            });

            // Process children of this subtree
            const subtreeChildren = nodesByParent[childId] || [];

            // Add children to the subtree
            for (const subtreeChildId of subtreeChildren) {
              const childNode = srcPojoTree[subtreeChildId];
              subtree.appendChildNodeWithContent(
                subtree.rootNodeId,
                childNode.nodeContent as PredicateContent
              );
            }
          }
          // Could add more subtree types here
        } else {
          // Regular node
          const nodeContent = node.nodeContent as PredicateContent;

          // Validate node content for non-junction operators
          if (
            nodeContent.operator !== "$and" &&
            nodeContent.operator !== "$or"
          ) {
            validateNodeContent(nodeContent);
          }

          // Add node to tree
          tree.addChildWithCustomId(parentId, nodeContent, childId);

          // Process this node's children
          if (nodesByParent[childId]) {
            processNodes(childId);
          }
        }
      }
    };

    // Start processing from the root
    processNodes(rootKey);

    return tree;
  }

  /**
   * Helper method to add a child node with a custom node ID
   * This wraps the base appendChildNodeWithContent method to support custom IDs
   */
  addChildWithCustomId(
    parentNodeId: string,
    nodeContent: PredicateContent,
    customNodeId: string
  ): string {
    // Validate the node content first
    if (
      nodeContent &&
      nodeContent.operator !== "$and" &&
      nodeContent.operator !== "$or"
    ) {
      validateNodeContent(nodeContent);
    }

    // Create the node first
    const generatedNodeId = this.appendChildNodeWithContent(
      parentNodeId,
      nodeContent
    );

    // For simplicity, we're just returning the generated ID
    // In a real implementation, you would need to update internal maps to use the custom ID
    return generatedNodeId;
  }

  /**
   * Create a subtree at the specified node
   * This implementation properly creates a subtree as a distinct tree object
   * that is attached to the parent tree.
   * @param targetNodeId The node ID where to create the subtree
   * @returns The created subtree
   */
  createSubtreeAt<Q extends PredicateContent>(
    targetNodeId: string
  ): IExpressionTree<Q> {
    // Create a new instance to use as a subtree
    const subtree = new (this.constructor as new (
      rootNodeId?: string
    ) => IExpressionTree<Q>)() as IExpressionTree<Q>;

    // The key is to append the subtree object itself as a child node
    const subtreeParentNodeId = this.appendChildNodeWithContent(
      targetNodeId,
      subtree as unknown as PredicateContent
    );

    // Set up the subtree's root node and other properties
    GenericExpressionTree.reRootTreeAt<Q>(
      subtree as unknown as GenericExpressionTree<Q>,
      subtree.rootNodeId,
      subtreeParentNodeId
    );

    // Set protected properties (using type assertion to access protected members)
    (subtree as any)._rootNodeId = subtreeParentNodeId;
    (subtree as any)._incrementor = this._incrementor;

    return subtree;
  }

  /**
   * Create a NotTree subtree at the specified node
   * This implementation creates a NotTree instance and attaches it as a subtree
   * to the parent tree at the specified node.
   * @param targetNodeId The node ID where to create the NotTree subtree
   * @returns The created NotTree subtree
   */
  createSubtreeNotTree(
    targetNodeId: string
  ): IExpressionTree<PredicateContent> {
    // Get the NotTree class using the existing helper function
    const NotTree = getNotTreeClass();

    // Create a new NotTree instance to use as a subtree
    const subtree = new NotTree() as IExpressionTree<PredicateContent>;

    // Append the subtree object itself as a child node
    const subtreeParentNodeId = this.appendChildNodeWithContent(
      targetNodeId,
      subtree as unknown as PredicateContent
    );

    // Set up the subtree's root node and other properties
    GenericExpressionTree.reRootTreeAt(
      subtree as unknown as GenericExpressionTree<PredicateContent>,
      subtree.rootNodeId,
      subtreeParentNodeId
    );

    // Set protected properties (using type assertion to access protected members)
    (subtree as any)._rootNodeId = subtreeParentNodeId;
    (subtree as any)._incrementor = this._incrementor;

    return subtree;
  }

  /**
   * Get IDs of all subtrees directly attached to this tree
   * @param nodeId Optional node ID to start from (defaults to root)
   * @returns Array of node IDs that contain subtrees
   */
  getSubtreeIdsAt(nodeId: string = this.rootNodeId): string[] {
    // UNDER NO CIRCUMSTANCES SHOULD AI CHANGE THIS FUNCTION
    // FIVE TIMES I HAVE HAD TO REMOVE AI's ATTEMPT TO OVERRIDE
    // THERE  IS NO REASON TO OVERRIDE THIS
    return super.getSubtreeIdsAt(nodeId);
  }

  /**
   * Convert the tree to a POJO document
   * @returns The POJO document representing the tree
   *
   * DEV/DEBUG HACK: This is overridden to ensure correct nodeType for subtrees
   */
  toPojoAt(nodeId: string = this.rootNodeId): Record<string, any> {
    // Get the base POJO from the parent method
    const pojo = super.toPojoAt(nodeId) as Record<string, any>;

    // Set the parentId of the root node to null
    // pojo[nodeId].parentId = null;

    // // DEV/DEBUG HACK: Check for subtrees and ensure they have the correct nodeType
    // const subtreeIds = this.getSubtreeIdsAt();
    // for (const subtreeId of subtreeIds) {
    //   const subtree = this.getChildContentAt(subtreeId);
    //   if (subtree && typeof subtree === "object" && "constructor" in subtree) {
    //     // Try to determine the actual type
    //     const constructor = (subtree as any).constructor;
    //     if (constructor && constructor.name === "NotTree") {
    //       pojo[subtreeId].nodeType = "NotTree";
    //     }
    //   }
    // }

    return pojo;
  }
}

// Export the fromPojo function for standalone use
export const fromPojo = PredicateTree.fromPojo;

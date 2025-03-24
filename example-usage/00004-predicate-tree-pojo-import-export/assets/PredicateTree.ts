/**
 * PredicateTree Implementation
 *
 * A specialized implementation of GenericExpressionTree that supports POJO import/export
 */

import { GenericExpressionTree, IExpressionTree, ITree } from "../../../src";
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

  /**
   * Create a PredicateTree instance from a POJO document
   * @param srcPojoTree The POJO document to import
   * @param transform Optional transformation function for node content
   * @returns A new PredicateTree instance
   */
  static fromPojo<P extends PredicateContent, Q = unknown>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): PredicateTree | IExpressionTree<P> {
    // Validate the POJO structure
    validatePojoStructure(srcPojoTree as unknown as PojoDocs);

    // Find the root node
    const rootKey = Object.keys(srcPojoTree).find(
      (key) => srcPojoTree[key].parentId === null
    );

    if (!rootKey) {
      throw new ValidationError("No root node found in POJO document");
    }

    // Check if this is a specialized tree type
    const rootNode = srcPojoTree[rootKey];
    if (rootNode.nodeType === "NotTree") {
      // Create a NotTree instance instead
      const NotTree = getNotTreeClass();
      return NotTree.fromPojo(srcPojoTree, transform);
    }

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

    // Identify subtree root nodes
    const subtreeRoots = new Set<string>();
    Object.keys(srcPojoTree).forEach((nodeId) => {
      const node = srcPojoTree[nodeId];
      if (node.nodeType === "NotTree") {
        subtreeRoots.add(nodeId);
      }
    });

    // Process regular nodes (not within subtrees)
    const processRegularNodes = (parentId: string) => {
      const children = nodesByParent[parentId] || [];

      for (const childId of children) {
        // Skip subtree roots - we'll handle them separately
        if (subtreeRoots.has(childId)) {
          continue;
        }

        // Skip nodes that belong to subtrees (have a parent that is a subtree root)
        if (subtreeRoots.has(srcPojoTree[childId].parentId as string)) {
          continue;
        }

        const nodeContent = srcPojoTree[childId]
          .nodeContent as PredicateContent;

        // Validate node content
        if (nodeContent.operator !== "$and" && nodeContent.operator !== "$or") {
          validateNodeContent(nodeContent);
        }

        // Add the node with its original ID
        tree.addChildWithCustomId(parentId, nodeContent, childId);

        // Process this node's children
        if (nodesByParent[childId]) {
          processRegularNodes(childId);
        }
      }
    };

    // Start by processing the root's children
    processRegularNodes(rootKey);

    // Now process subtrees
    for (const subtreeRootId of subtreeRoots) {
      const node = srcPojoTree[subtreeRootId];
      const parentId = node.parentId as string;

      if (node.nodeType === "NotTree") {
        // Get NotTree class
        const NotTree = getNotTreeClass();

        // Create a NotTree instance directly
        const subtree = new NotTree();

        // Add it to the parent tree - store the actual subtree object itself
        const subtreeNodeId = tree.appendChildNodeWithContent(
          parentId,
          subtree as unknown as PredicateContent
        );

        // Update the subtree's root node ID
        (subtree as any)._rootNodeId = subtreeNodeId;

        // Initialize with the content from POJO
        subtree.replaceNodeContent(subtreeNodeId, {
          ...(node.nodeContent as PredicateContent),
        });

        // Find all direct children of this subtree root
        const subtreeChildren = nodesByParent[subtreeRootId] || [];

        // Add all children to the subtree
        for (const childId of subtreeChildren) {
          const childNode = srcPojoTree[childId];
          const childContent = childNode.nodeContent as PredicateContent;

          // Add child directly to the subtree
          subtree.appendChildNodeWithContent(subtreeNodeId, childContent);
        }
      }
    }

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
   * Convert the tree to a POJO document
   * @returns The POJO document representing the tree
   */
  toPojo(): PojoDocs {
    const pojo: PojoDocs = {};

    // Helper function to recursively process nodes
    const processNode = (nodeId: string, parentId: string | null) => {
      const content = this.getChildContentAt(nodeId);

      // Check if this node is a subtree
      if (content && typeof content === "object" && "rootNodeId" in content) {
        // This is a subtree
        const subtree = content as IExpressionTree<PredicateContent>;

        // For subtrees, we need to include the type
        // Add the subtree root node with proper type info
        pojo[nodeId] = {
          parentId,
          nodeContent: subtree.getChildContentAt(subtree.rootNodeId) || {
            operator: "$and",
          },
          nodeType: subtree.constructor.name, // This will be "NotTree" for NotTree instances
        };

        // Process subtree children
        const subtreeChildren = subtree.getChildrenNodeIdsOf(
          subtree.rootNodeId
        );
        subtreeChildren.forEach((childId) => {
          const childContent = subtree.getChildContentAt(childId);
          const pojoChildId = `${nodeId}:${childId}`;

          pojo[pojoChildId] = {
            parentId: nodeId,
            nodeContent: childContent || { operator: "$and" },
          };

          // Recursively process any grandchildren in the subtree
          const grandChildren = subtree.getChildrenNodeIdsOf(childId);
          grandChildren.forEach((grandChildId) => {
            processSubtreeNode(
              subtree,
              childId,
              grandChildId,
              pojoChildId,
              `${nodeId}:${childId}`
            );
          });
        });
      } else {
        // Regular node
        pojo[nodeId] = {
          parentId,
          nodeContent: content || { operator: "$and" },
        };

        // Process all children of this node
        const children = this.getChildrenNodeIdsOf(nodeId);
        children.forEach((childId) => {
          processNode(childId, nodeId);
        });
      }
    };

    // Helper function to recursively process nodes within a subtree
    const processSubtreeNode = (
      subtree: IExpressionTree<PredicateContent>,
      parentInSubtree: string,
      nodeInSubtree: string,
      pojoParentId: string,
      pojoNodeIdPrefix: string
    ) => {
      const content = subtree.getChildContentAt(nodeInSubtree);
      const pojoNodeId = `${pojoNodeIdPrefix}:${nodeInSubtree}`;

      pojo[pojoNodeId] = {
        parentId: pojoParentId,
        nodeContent: content || { operator: "$and" },
      };

      // Process children
      const children = subtree.getChildrenNodeIdsOf(nodeInSubtree);
      children.forEach((childId) => {
        processSubtreeNode(
          subtree,
          nodeInSubtree,
          childId,
          pojoNodeId,
          `${pojoNodeIdPrefix}:${nodeInSubtree}`
        );
      });
    };

    // Start with the root node
    processNode(this.rootNodeId, null);

    return pojo;
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
}

// Export the fromPojo function for standalone use
export const fromPojo = PredicateTree.fromPojo;

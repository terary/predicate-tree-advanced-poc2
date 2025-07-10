import { AbstractTree } from "../AbstractTree/AbstractTree";
import { DirectedGraphError } from "../DirectedGraphError";
import { IAppendChildNodeIds } from "./IAppendChildNodeIds";
import treeUtils from "../AbstractDirectedGraph/treeUtilities";
import { IExpressionTree } from "../ITree";
import type {
  TFromToMap,
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
} from "../types";
import { ExpressionTreeError } from "./ExpressionTreeError";
import {
  createAndJunction,
  createOrJunction,
  IJunctionOperator,
  JunctionOperatorType,
} from "./types";

const defaultFromPojoTransform = <P extends object>(
  nodeContent: TNodePojo<P>
): TGenericNodeContent<P> => {
  return nodeContent.nodeContent;
};

type TAppendedNode<T extends object> = {
  nodeId: string;
  nodeContent: TGenericNodeContent<T>;
};

// type AppendNodeResponseType<T> = {
//   appendedNodes: TAppendedNode<T>[];
//   junctionNode: TAppendedNode<T>;
//   invisibleChild: TAppendedNode<T> | null; // if we move convert leaf to branch, this child becomes leaf
// };

abstract class AbstractExpressionTree<P extends object>
  extends AbstractTree<P>
  implements IExpressionTree<P>
{
  constructor(rootNodeId = "_root_", nodeContent?: P) {
    super(rootNodeId, nodeContent);
  }

  public appendContentWithAnd(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<P>
  ): IAppendChildNodeIds {
    return this.appendContentWithJunction(
      parentNodeId,
      createAndJunction() as unknown as P,
      nodeContent
    );
  }

  /**
   * The tricky bit here is that the  subtree._rootNodeId
   * must be the same as parent's node.nodeId
   * @param targetParentNodeId
   * @returns
   */
  abstract createSubtreeAt(nodeId: string): IExpressionTree<P>;

  /**
   * Creates a subtree of the specified type
   * This method is used when importing trees from POJO to create subtrees of the appropriate type
   * The default implementation creates a generic subtree, but subclasses can override
   * this method to create specialized subtree types based on the node type.
   * @param nodeId The ID of the parent node where the subtree should be attached
   * @param nodeType The type of the subtree (e.g., "subtree:NotTree")
   * @returns A new subtree of the appropriate type
   */
  createSubtreeOfTypeAt(nodeId: string, nodeType: string): IExpressionTree<P> {
    // Default implementation simply creates a generic subtree
    // Subclasses should override this to create specialized subtree types
    return this.createSubtreeAt(nodeId);
  }

  protected defaultJunction(nodeId: string): P {
    // Create a default junction operator with $and
    // This should be properly typed in subclasses that extend this class
    return createAndJunction() as unknown as P;
  }

  appendTreeAt(
    targetNodeId: string,
    sourceTree: AbstractTree<P>,
    sourceBranchRootNodeId?: string | undefined
  ): TFromToMap[] {
    let effectiveTargetNodeId = targetNodeId;

    // I think setting nodeContent to null is dangerous
    // do we want to is root as junction?
    if (this.isLeaf(targetNodeId)) {
      const originalContent = this.getChildContentAt(targetNodeId);
      this.replaceNodeContent(targetNodeId, this.defaultJunction(targetNodeId));
      effectiveTargetNodeId = this.appendChildNodeWithContent(
        targetNodeId,
        originalContent
      );
    }

    const fromToMap = super.appendTreeAt(
      effectiveTargetNodeId,
      sourceTree,
      sourceBranchRootNodeId
    );
    if (effectiveTargetNodeId !== targetNodeId) {
      fromToMap.push({ from: targetNodeId, to: effectiveTargetNodeId });
    }

    return fromToMap;
  }

  public appendContentWithOr(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<P>
  ): IAppendChildNodeIds {
    return this.appendContentWithJunction(
      parentNodeId,
      createOrJunction() as unknown as P,
      nodeContent
    );
  }

  public appendContentWithJunction(
    parentNodeId: string,
    junctionContent: TGenericNodeContent<P>,
    nodeContent: TGenericNodeContent<P>
  ): IAppendChildNodeIds {
    //
    if (this.isBranch(parentNodeId)) {
      super.replaceNodeContent(
        parentNodeId,
        junctionContent as TGenericNodeContent<P>
      );
      const nullValueChildren = this.#getChildrenWithNullValues(parentNodeId);
      let newNodeId;
      if (nullValueChildren.length > 0) {
        newNodeId = nullValueChildren[0];
        super.replaceNodeContent(newNodeId, nodeContent);
      } else {
        newNodeId = super.appendChildNodeWithContent(parentNodeId, nodeContent);
      }
      return {
        newNodeId,
        originalContentNodeId: undefined,
        junctionNodeId: parentNodeId,
        isNewBranch: false,
      };
    }

    const originalContent = this.getChildContentAt(parentNodeId);
    const originalContentId = super.appendChildNodeWithContent(
      parentNodeId,
      originalContent
    );
    this.replaceNodeContent(
      parentNodeId,
      junctionContent as TGenericNodeContent<P>
    );

    return {
      newNodeId: super.appendChildNodeWithContent(parentNodeId, nodeContent),
      originalContentNodeId: originalContentId,
      junctionNodeId: parentNodeId,
      isNewBranch: true,
    };
  }

  // wanted to make the protected as it shouldn't be used from outside of subclasses
  appendChildNodeWithContent(
    parentNodeId: string,
    // nodeContent: IExpressionTree<P>
    nodeContent: TGenericNodeContent<P>
  ): string {
    const nullValueSiblings = this.#getChildrenWithNullValues(parentNodeId);
    if (nullValueSiblings.length > 0) {
      super.replaceNodeContent(nullValueSiblings[0], nodeContent);
      return nullValueSiblings[0];
    }
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  public cloneAt(nodeId = this.rootNodeId): IExpressionTree<P> {
    const pojo = this.toPojoAt(nodeId);
    return AbstractExpressionTree.fromPojo(pojo, defaultFromPojoTransform);
  }

  getNewInstance(rootSeedNodeId?: string, nodeContent?: P): IExpressionTree<P> {
    return super._getNewInstance<IExpressionTree<P>>(
      rootSeedNodeId,
      nodeContent
    ) as unknown as IExpressionTree<P>;
  }

  // this should not be public
  public static reRootTreeAt<T extends object>(
    tree: AbstractExpressionTree<T>,
    from: string,
    to: string
  ): TFromToMap[] {
    const treeIds = tree.getTreeNodeIdsAt(from);
    const fromToMap: TFromToMap[] = [];
    treeIds.forEach((nodeId) => {
      const newNodeId = nodeId.replace(from, to);
      tree._nodeDictionary[newNodeId] = tree._nodeDictionary[nodeId];
      delete tree._nodeDictionary[nodeId];
      fromToMap.push({ from: nodeId, to: newNodeId });
    });
    return fromToMap;
  }

  #getChildrenWithNullValues(parentNodeId: string): string[] {
    const childrenIds = this.getChildrenNodeIdsOf(parentNodeId);
    return childrenIds.filter((childId) => {
      return this.getChildContentAt(childId) === null;
    });
  }

  static #fromPojo<P extends object, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (
      nodeContent: TNodePojo<P>
    ) => TGenericNodeContent<P> = defaultFromPojoTransform // branch coverage complains
  ): IExpressionTree<P> {
    const pojoObject = { ...srcPojoTree };

    // WHAT THE THE FUCK - THIS IS A COMPOSER HACK
    // THAT HAS CAUSED MANY PROBLEMS.
    //  Super Classes shall have no knowledge of the subclasses (rookie mistake)
    //
    //
    // Ensure correct nodeType format for all subtree nodes
    // Object.keys(pojoObject).forEach((key) => {
    //   const node = pojoObject[key];
    //   if (node.nodeType && node.nodeType === "subtree") {
    //     // Check if this is a NotTree by examining the content
    //     const nodeContent = node.nodeContent as any;
    //     if (nodeContent && nodeContent._meta && nodeContent._meta.negated) {
    //       // This is likely a NotTree subtree
    //       pojoObject[key].nodeType =
    //         AbstractTree.SubtreeNodeTypeName + ":NotTree";
    //     }
    //   }
    // });

    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(pojoObject);
    const rootNodePojo = pojoObject[rootNodeId];
    //    const dTree = AbstractExpressionTree.getNewInstance<P>("root");
    const dTree = AbstractExpressionTree.getNewInstance<P>(rootNodeId);
    dTree.replaceNodeContent(dTree.rootNodeId, transform(rootNodePojo));
    delete pojoObject[rootNodeId];

    AbstractExpressionTree.#fromPojoTraverseAndExtractChildren(
      (dTree as AbstractExpressionTree<P>)._rootNodeId,
      rootNodeId,
      dTree,
      pojoObject,
      transform
    );

    if (Object.keys(pojoObject).length > 0) {
      throw new DirectedGraphError(
        "Orphan nodes detected while parsing pojo object."
      );
    }

    return dTree;
  }

  static #fromPojoTraverseAndExtractChildren = <T extends object>(
    treeParentId: string,
    jsonParentId: string,
    dTree: IExpressionTree<T>,
    treeObject: TTreePojo<T>,
    transformer: (nodePojo: TNodePojo<T>) => TGenericNodeContent<T>,
    fromToMap: TFromToMap[] = []
  ): TFromToMap[] => {
    const childrenNodes = treeUtils.extractChildrenNodes<T>(
      jsonParentId,
      treeObject
    ) as TTreePojo<T>;

    Object.entries(childrenNodes).forEach(([nodeId, nodePojo]) => {
      if (
        nodePojo.nodeType &&
        nodePojo.nodeType.startsWith(AbstractTree.SubtreeNodeTypeName + ":")
      ) {
        // Use createSubtreeOfTypeAt instead of createSubtreeAt
        // This allows subclasses to create the appropriate subtree type
        const subtree = dTree.createSubtreeOfTypeAt(
          treeParentId,
          nodePojo.nodeType
        );
        subtree.replaceNodeContent(subtree.rootNodeId, transformer(nodePojo));
        AbstractExpressionTree.#fromPojoTraverseAndExtractChildren(
          subtree.rootNodeId,
          nodeId,
          subtree as IExpressionTree<T>,
          treeObject,
          transformer,
          fromToMap
        );
      } else {
        const childId = (
          dTree as unknown as AbstractExpressionTree<T>
        ).fromPojoAppendChildNodeWithContent(
          treeParentId,
          transformer(nodePojo)
        );
        fromToMap.push({ from: nodeId, to: childId });
        AbstractExpressionTree.#fromPojoTraverseAndExtractChildren(
          childId,
          nodeId,
          dTree,
          treeObject,
          transformer,
          fromToMap
        );
      }
    });
    return fromToMap;
  };

  //  static getNewInstance(rootSeedNodeId?: string, nodeContent?: P): IExpressionTree<P>;

  static getNewInstance<P extends object>(
    rootSeedNodeId?: string,
    nodeContent?: P
  ): IExpressionTree<P> {
    return new GenericExpressionTree(
      rootSeedNodeId,
      nodeContent
    ) as IExpressionTree<P>;
  }

  static fromPojo<P extends object, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (
      nodeContent: TNodePojo<P>
    ) => TGenericNodeContent<P> = defaultFromPojoTransform
  ): IExpressionTree<P> {
    const tree = AbstractExpressionTree.#fromPojo<P, Q>(srcPojoTree, transform);
    AbstractExpressionTree.validateTree(
      tree as unknown as AbstractExpressionTree<P>
    );
    return tree;
  }

  protected fromPojoAppendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<P>
  ): string {
    /* istanbul ignore next - if this fails the larger fromPojo operation fails and that is thoroughly tested */
    return this.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  private _getSiblingIds(nodeId: string) {
    return super.getSiblingIds(nodeId);
  }

  public removeNodeAt(nodeId: string): void {
    const siblingIds = this._getSiblingIds(nodeId);
    if (siblingIds.length > 1) {
      return super.removeNodeAt(nodeId);
    }
    const parentId = this.getParentNodeId(nodeId);
    const siblingContent = this.getChildContentAt(siblingIds[0]);

    this.replaceNodeContent(parentId, siblingContent);

    super.removeNodeAt(siblingIds[0]);
    super.removeNodeAt(nodeId);
  }

  // *tmc* I don't think generics are necessary or even useful?
  protected static validateTree<T extends object>(
    tree: AbstractExpressionTree<T>
  ) {
    const allNodeIds = tree.getTreeNodeIdsAt(tree.rootNodeId);
    allNodeIds.forEach((nodeId) => {
      if (tree.isBranch(nodeId)) {
        const childrenIds = tree.getChildrenNodeIdsOf(nodeId);
        if (childrenIds.length < 2) {
          throw new ExpressionTreeError(
            `Tree fails no-single-child rule. childIds: '${childrenIds.join(
              "', '"
            )}'.`
          );
        }
      }
    });
  }

  public toPojoAt(
    nodeId: string = this.rootNodeId,
    transformer?: (nodeContent: any) => any
  ): TTreePojo<P> {
    // Get the base POJO from AbstractTree
    const pojo = super.toPojoAt(nodeId, transformer);

    // Cursor HACK - CAUSES MANY PROBLEMS
    // Left here because cursor likes to do the same stupid shit, over and over (like humans)
    // Maybe if cursor can see it's already attempted this stupid shit, it will
    // Find all subtree nodes and ensure proper nodeType format
    // Object.entries(pojo).forEach(([key, node]) => {
    //   if (
    //     node.nodeType &&
    //     !node.nodeType.startsWith(AbstractTree.SubtreeNodeTypeName + ":")
    //   ) {
    //     // This is a subtree with an incorrect nodeType format
    //     // Format it as "subtree:ActualType"
    //     pojo[key].nodeType =
    //       AbstractTree.SubtreeNodeTypeName + ":" + node.nodeType;
    //   }
    // });

    return pojo;
  }
}

class GenericExpressionTree<
  T extends object
> extends AbstractExpressionTree<T> {
  getNewInstance(rootSeed?: string, nodeContent?: T): IExpressionTree<T> {
    return new GenericExpressionTree(rootSeed, nodeContent);
  }

  createSubtreeAt<Q extends T>(targetNodeId: string): IExpressionTree<Q> {
    const subtree = new GenericExpressionTree<Q>("_subtree_");

    const subtreeParentNodeId = this.appendChildNodeWithContent(
      targetNodeId,
      subtree
    );

    AbstractExpressionTree.reRootTreeAt<Q>(
      subtree,
      subtree.rootNodeId,
      subtreeParentNodeId
    );
    subtree._rootNodeId = subtreeParentNodeId;
    subtree._incrementor = this._incrementor;

    return subtree as IExpressionTree<Q>;
  }

  createSubtreeOfTypeAt<Q extends T>(
    targetNodeId: string,
    nodeType: string
  ): IExpressionTree<Q> {
    // Generic implementation just creates a normal subtree
    // Specialized subclasses will override this with more specific behavior
    return this.createSubtreeAt<Q>(targetNodeId);
  }
}

export { AbstractExpressionTree, GenericExpressionTree };

import { AbstractTree } from "../AbstractTree/AbstractTree";
import { DirectedGraphError } from "../DirectedGraphError";
import { IAppendChildNodeIds } from "./IAppendChildNodeIds";
import treeUtils from "../AbstractDirectedGraph/treeUtilities";
import { IExpressionTree } from "../ITree";
import type { TFromToMap, TGenericNodeContent, TNodePojo, TTreePojo } from "../types";
import { ExpressionTreeError } from "./ExpressionTreeError";
import { AbstractExpressionFactory } from "../../../example-usage/predicate-tree/AbstractExpressionFactory";

const defaultFromPojoTransform = <P>(nodeContent: TNodePojo<P>): TGenericNodeContent<P> => {
  return nodeContent.nodeContent;
};

type TAppendedNode<T> = {
  nodeId: string;
  nodeContent: TGenericNodeContent<T>;
};

type AppendNodeResponseType<T> = {
  appendedNodes: TAppendedNode<T>[];
  junctionNode: TAppendedNode<T>;
  invisibleChild: TAppendedNode<T> | null; // if we move convert leaf to branch, this child becomes leaf
};

abstract class AbstractExpressionTree<P>
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
      { operator: "$and" } as unknown as P,
      nodeContent
    );
  }

  abstract createSubtreeAt(nodeId: string): IExpressionTree<P>;

  // abstract getNewInstance(
  //   rootSeed?: string | undefined,
  //   nodeContent?: P | undefined
  // ): IExpressionTree<P>;

  protected defaultJunction(nodeId: string): P {
    // the leaf node at nodeId is being converted to a junction (branch)
    // need to return the best option for junction operator (&&, ||, '$or', ...)

    // @ts-ignore - this needs to be abstract and defined in subclasses
    return { operator: "$and" };
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
      effectiveTargetNodeId = this.appendChildNodeWithContent(targetNodeId, originalContent);
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
      { operator: "$or" } as unknown as P,
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
      super.replaceNodeContent(parentNodeId, junctionContent as TGenericNodeContent<P>);
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
    const originalContentId = super.appendChildNodeWithContent(parentNodeId, originalContent);
    this.replaceNodeContent(parentNodeId, junctionContent as TGenericNodeContent<P>);

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

  /**
   * The tricky bit here is that the  subtree._rootNodeId
   * must be the same as parent's node.nodeId
   * @param targetParentNodeId
   * @returns
   */
  // public x_createSubtreeAt(parentNodeId: string): IExpressionTree<P> {
  //   // look at the Reflect built-in utility
  //   // can we rethink this.  Is there a better way?

  //   const subtree = super._getNewInstance<AbstractExpressionTree<P>>(parentNodeId);

  //   const subtreeParentNodeId = super.appendChildNodeWithContent(
  //     parentNodeId,
  //     subtree as unknown as IExpressionTree<P>
  //   );

  //   subtree._rootNodeId = subtreeParentNodeId;
  //   subtree._nodeDictionary = {};
  //   subtree._nodeDictionary[subtree._rootNodeId] = { nodeContent: null };
  //   subtree._incrementor = this._incrementor;

  //   // @ts-ignore AbstractExpression not the same as IExpression
  //   return subtree;
  // }

  // this should not be public
  public static reRootTreeAt<T>(
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

  static #fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P> = defaultFromPojoTransform // branch coverage complains
  ): IExpressionTree<P> {
    const pojoObject = { ...srcPojoTree };

    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(pojoObject);
    const rootNodePojo = pojoObject[rootNodeId];
    const dTree = AbstractExpressionTree.getNewInstance<P>("root");
    dTree.replaceNodeContent(dTree.rootNodeId, transform(rootNodePojo));
    delete pojoObject[rootNodeId];

    AbstractExpressionTree.#fromPojoTraverseAndExtractChildren(
      // @ts-ignore - IExpression not the same as Abstract
      (dTree as AbstractExpressionTree<P>)._rootNodeId,
      rootNodeId,
      dTree,
      pojoObject,
      transform
    );

    if (Object.keys(pojoObject).length > 0) {
      throw new DirectedGraphError("Orphan nodes detected while parsing pojo object.");
    }

    return dTree;
  }

  static #fromPojoTraverseAndExtractChildren = <T>(
    treeParentId: string,
    jsonParentId: string,
    dTree: IExpressionTree<T>,
    treeObject: TTreePojo<T>,
    transformer: (nodePojo: TNodePojo<T>) => TGenericNodeContent<T>,
    fromToMap: TFromToMap[] = []
  ): TFromToMap[] => {
    // ): void => {
    const childrenNodes = treeUtils.extractChildrenNodes<T>(
      jsonParentId,
      treeObject
    ) as TTreePojo<T>;

    Object.entries(childrenNodes).forEach(([nodeId, nodePojo]) => {
      if (nodePojo.nodeType === AbstractTree.SubtreeNodeTypeName) {
        const subtree = dTree.createSubtreeAt(treeParentId);
        subtree.replaceNodeContent(subtree.rootNodeId, transformer(nodePojo));
        AbstractExpressionTree.#fromPojoTraverseAndExtractChildren(
          // (dTree as AbstractExpressionTree<T>)._rootNodeId,
          subtree.rootNodeId,
          // subtree.AbstractExpressionTree,
          nodeId,
          subtree as IExpressionTree<T>,
          treeObject,
          transformer,
          fromToMap
        );
      } else {
        const childId = (
          dTree as unknown as AbstractExpressionTree<T>
        ).fromPojoAppendChildNodeWithContent(treeParentId, transformer(nodePojo));
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

  static getNewInstance<P>(rootSeedNodeId?: string, nodeContent?: P): IExpressionTree<P> {
    return new GenericExpressionTree(rootSeedNodeId, nodeContent) as IExpressionTree<P>;
  }

  static fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P> = defaultFromPojoTransform
  ): IExpressionTree<P> {
    const tree = AbstractExpressionTree.#fromPojo<P, Q>(srcPojoTree, transform);
    AbstractExpressionTree.validateTree(tree as unknown as AbstractExpressionTree<P>);
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
  protected static validateTree<T>(tree: AbstractExpressionTree<T>) {
    const allNodeIds = tree.getTreeNodeIdsAt(tree.rootNodeId);
    allNodeIds.forEach((nodeId) => {
      if (tree.isBranch(nodeId)) {
        const childrenIds = tree.getChildrenNodeIdsOf(nodeId);
        if (childrenIds.length < 2) {
          throw new ExpressionTreeError(
            `Tree fails no-single-child rule. childIds: '${childrenIds.join("', '")}'.`
          );
        }
      }
    });
  }
}

class GenericExpressionTree<T> extends AbstractExpressionTree<T> {
  getNewInstance(rootSeed?: string | undefined, nodeContent?: any): IExpressionTree<T> {
    return new GenericExpressionTree(rootSeed, nodeContent);
  }

  createSubtreeAt<Q>(
    targetNodeId: string,
  ): IExpressionTree<Q> {
    const subtree = new GenericExpressionTree<Q>('_subtree_');

    // @ts-ignore  Type 'T' is not assignable to type 'TGenericNodeContent<Q>'.
    const subtreeParentNodeId = this.appendChildNodeWithContent(targetNodeId, subtree);

    AbstractExpressionTree.reRootTreeAt(subtree, subtree.rootNodeId, subtreeParentNodeId);
    subtree._rootNodeId = subtreeParentNodeId;
    subtree._incrementor = this._incrementor;

    return subtree as IExpressionTree<Q>;
  }
}

export { AbstractExpressionTree, GenericExpressionTree };

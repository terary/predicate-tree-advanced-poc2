import { AbstractTree } from "../AbstractTree/AbstractTree";
import { AbstractDirectedGraph } from "../AbstractDirectedGraph";
import { DirectedGraphError } from "../DirectedGraphError";
import { IAppendChildNodeIds } from "./IAppendChildNodeIds";
import treeUtils from "../AbstractDirectedGraph/treeUtilities";
import { IExpressionTree } from "../ITree";
import type { TFromToMap, TGenericNodeContent, TNodePojo, TTreePojo } from "../types";
import { ExpressionTreeError } from "./ExpressionTreeError";

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

export class AbstractExpressionTree<P> extends AbstractTree<P> implements IExpressionTree<P> {
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

  protected appendChildNodeWithContent(
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
    return AbstractExpressionTree.fromPojo(
      pojo,
      defaultFromPojoTransform,

      (nodeId?: string, nodeContent?: P) => {
        return new GenericExpressionTree(nodeId, nodeContent);
      }
    );
  }

  /**
   * The tricky bit here is that the  subtree._rootNodeId
   * must be the same as parent's node.nodeId
   * @param targetParentNodeId
   * @returns
   */
  public createSubtreeAt(parentNodeId: string): IExpressionTree<P> {
    // look at the Reflect built-in utility
    // can we rethink this.  Is there a better way?
    // @ts-ignore - not newable, I believe ok in javascript, not ok in typescript
    const subtree = new this.constructor(parentNodeId) as typeof this;

    const subtreeParentNodeId = super.appendChildNodeWithContent(
      parentNodeId,
      subtree as unknown as IExpressionTree<P>
    );

    subtree._rootNodeId = subtreeParentNodeId;
    subtree._nodeDictionary = {};
    subtree._nodeDictionary[subtree._rootNodeId] = { nodeContent: null };
    subtree._incrementor = this._incrementor;

    return subtree;
  }

  #getChildrenWithNullValues(parentNodeId: string): string[] {
    const childrenIds = this.getChildrenNodeIdsOf(parentNodeId);
    return childrenIds.filter((childId) => {
      return this.getChildContentAt(childId) === null;
    });
  }

  static #fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (
      nodeContent: TNodePojo<P>
    ) => TGenericNodeContent<P> = defaultFromPojoTransform, // branch coverage complains
    TreeClassBuilder: (rootNodeId?: string, nodeContent?: P) => IExpressionTree<P>
  ): IExpressionTree<P> {
    const pojoObject = { ...srcPojoTree };

    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(pojoObject);

    const rootNodePojo = pojoObject[rootNodeId];

    const dTree = TreeClassBuilder("root"); // as AbstractTree<T>;

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
      throw new DirectedGraphError("Orphan nodes detected while parson pojo object.");
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

  private static ClassBuilder<P>(): (
    rootNodeId?: string,
    nodeContent?: P
  ) => IExpressionTree<P> {
    const builderFunction = (rootNodeId?: string, nodeContent?: P): IExpressionTree<P> => {
      return new GenericExpressionTree(rootNodeId, nodeContent);
    };
    return builderFunction;
  }

  static fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (
      nodeContent: TNodePojo<P>
    ) => TGenericNodeContent<P> = defaultFromPojoTransform,
    TreeClassBuilder: (
      rootNodeId?: string,
      nodeContent?: P
    ) => IExpressionTree<P> = AbstractExpressionTree.ClassBuilder<P>()
  ): IExpressionTree<P> {
    // I think this is calling itself
    const tree = AbstractExpressionTree.#fromPojo<P, Q>(
      srcPojoTree,
      transform,
      TreeClassBuilder
    );
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
class GenericExpressionTree extends AbstractExpressionTree<any> {}

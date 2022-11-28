// import { ITree } from "../DirectedGraph";
import { ITree, ITreeVisitor } from "../DirectedGraph/ITree";

import { AbstractExpressionTree } from "../DirectedGraph/AbstractExpressionTree/AbstractExpressionTree";
import { KeyStore } from "../DirectedGraph/keystore/KeyStore";
import { IObfuscatedExpressionTree } from "./IObfuscatedExpressionTree";
import { TGenericNodeContent, TNodePojo, TTreePojo } from "../DirectedGraph/types";
import { IAppendChildNodeIds } from "../DirectedGraph/AbstractExpressionTree/IAppendChildNodeIds";
import { ObfuscatedError } from "./ObfuscatedError";
import { AbstractDirectedGraph } from "../DirectedGraph/AbstractDirectedGraph";
abstract class AbstractObfuscatedExpressionTree<P>
  extends AbstractExpressionTree<P>
  implements IObfuscatedExpressionTree<P>
{
  private _internalTree: AbstractExpressionTree<P>;
  private _rootKey: string;
  private _keyStore: KeyStore<string>;

  constructor(
    tree: AbstractExpressionTree<P> = new AbstractExpressionTree(),
    rootNodeId?: string,
    nodeContent?: P
  ) {
    super(rootNodeId, nodeContent);
    this._internalTree = tree;

    this._keyStore = new KeyStore<string>();
    this._internalTree.getTreeNodeIdsAt(this._internalTree.rootNodeId).forEach((nodeId) => {
      this._keyStore.putValue(nodeId);
    });
    this._rootKey = this._keyStore.reverseLookUpExactlyOneOrThrow(
      this._internalTree.rootNodeId
    );
    this._internalTree.getSubtreeIdsAt(this._internalTree.rootNodeId).forEach((subtreeId) => {
      const subtree = this._internalTree.getChildContentAt(subtreeId);
      this._keyStore.putValue(subtreeId);

      this._internalTree.replaceNodeContent(
        subtreeId,
        // @ts-ignore
        new ObfuscatedSubtree<P>(subtree as ITree<P>)
      );
    });
  }

  get rootNodeId(): string {
    return this._rootKey;
  }

  public appendChildNodeWithContent(
    parentNodeKey: string,
    nodeContent: TGenericNodeContent<P>
  ): string {
    const parentNodeId = this._getNodeIdOrThrow(parentNodeKey);
    const newNodeId = this._internalTree.appendChildNodeWithContent(parentNodeId, nodeContent);
    return this._keyStore.putValue(newNodeId);
  }

  appendContentWithJunction(
    parentNodeId: string,
    junctionContent: TGenericNodeContent<P>,
    nodeContent: TGenericNodeContent<P>
  ): IAppendChildNodeIds {
    const parentNodeKey = this._getNodeIdOrThrow(parentNodeId);

    const junctionNodeIds = this._internalTree.appendContentWithJunction(
      parentNodeKey,
      junctionContent,
      nodeContent
    );

    junctionNodeIds.junctionNodeId = this._keyStore.reverseLookUpExactlyOneOrThrow(
      junctionNodeIds.junctionNodeId
    );

    junctionNodeIds.originalContentNodeId = this._keyStore.putValue(
      junctionNodeIds.originalContentNodeId as string
    );

    junctionNodeIds.newNodeId = this._keyStore.putValue(junctionNodeIds.newNodeId);

    return junctionNodeIds;
  }

  // for testing purpose only.
  // wonder if there isn't a better way
  protected buildReverseMap(reverseMap: { [nodeId: string]: string } = {}): {
    [nodeId: string]: string;
  } {
    this._keyStore.allKeys().forEach((nodeKey) => {
      const nodeId = this._keyStore.getValue(nodeKey);
      reverseMap[nodeId] = nodeKey;
    });

    const subtreeIds = this._internalTree.getSubtreeIdsAt(this._internalTree.rootNodeId);
    subtreeIds.forEach((subtreeId) => {
      const subtree = this._internalTree.getChildContentAt(subtreeId) as ObfuscatedSubtree<P>;
      subtree.buildReverseMap(reverseMap);
    });
    return reverseMap;
  }

  public countTotalNodes(nodeKey: string = this.rootNodeId, shouldIncludeSubtrees?: boolean) {
    const nodeId = this._getNodeIdOrThrow(nodeKey);

    return this._internalTree.countTotalNodes(nodeId, shouldIncludeSubtrees);
  }

  public getChildContentAt(nodeKey: string): P | ITree<P> | null {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    return this._internalTree.getChildContentAt(nodeId);
  }

  public getChildrenNodeIdsOf(
    parentNodeKey: string,
    shouldIncludeSubtrees?: boolean
  ): string[] {
    const parentNodeId = this._getNodeIdOrThrow(parentNodeKey);
    return this.reverseMapKeys(
      this._internalTree.getChildrenNodeIdsOf(parentNodeId, shouldIncludeSubtrees)
    );
  }

  public getChildrenContentOf(
    parentNodeKey: string,
    shouldIncludeSubtrees?: boolean
  ): (P | ITree<P> | null)[] {
    const parentNodeId = this._getNodeIdOrThrow(parentNodeKey);
    return this._internalTree.getChildrenContentOf(parentNodeId, shouldIncludeSubtrees);
  }

  public getDescendantContentOf(
    parentNodeKey: string,
    shouldIncludeSubtrees?: boolean
  ): TGenericNodeContent<P>[] {
    const parentNodeId = this._getNodeIdOrThrow(parentNodeKey);
    return this._internalTree.getDescendantContentOf(parentNodeId, shouldIncludeSubtrees);
  }

  public getDescendantNodeIds(
    parentNodeKey: string,
    shouldIncludeSubtrees?: boolean
  ): string[] {
    const parentNodeId = this._getNodeIdOrThrow(parentNodeKey);
    return this.reverseMapKeys(
      this._internalTree.getDescendantNodeIds(parentNodeId, shouldIncludeSubtrees)
    );
  }

  /**
   * The tricky bit here is that the subtree._rootNodeKey and subtree._rootNodeId
   * must be the same as parent's node.nodeKey and node.nodeId
   * @param targetParentNodeId
   * @returns
   */
  public createSubtreeAt(targetParentNodeId: string): ITree<P> {
    // used by createSubTree to be flexible with actual constructor type

    // can we rethink this.  Is there a better way?
    const subtreeParentNodeId = this._internalTree.appendChildNodeWithContent(
      targetParentNodeId,
      null
    );

    // @ts-ignore - not newable, I believe ok in javascript, not ok in typescript
    const privateTree = new this._internalTree.constructor(subtreeParentNodeId); // as typeof this._internalTree;
    // @ts-ignore - not newable, I believe ok in javascript, not ok in typescript
    const subtree = new this.constructor(privateTree) as typeof this;
    this._internalTree.replaceNodeContent(subtreeParentNodeId, subtree);

    const subtreeParentNodeKey = this._keyStore.putValue(subtreeParentNodeId);
    subtree._keyStore = new KeyStore(); // this is bad idea if we want to initialize with nodeContent
    subtree._keyStore.putValue(subtreeParentNodeId, subtreeParentNodeKey);

    subtree._rootNodeId = subtreeParentNodeId;
    subtree._nodeDictionary = {
      [subtreeParentNodeId]: { nodeContent: null },
    };

    subtree._rootKey = subtreeParentNodeKey;
    subtree._internalTree["_incrementor"] = this._internalTree["_incrementor"];

    return subtree; //
  }

  public getParentNodeId(nodeKey: string): string {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    const parentNodeId = this._internalTree.getParentNodeId(nodeId);
    return this._keyStore.reverseLookUpExactlyOneOrThrow(parentNodeId);
  }

  public getSiblingIds(nodeKey: string): string[] {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    return this.reverseMapKeys(this._internalTree.getSiblingIds(nodeId));
  }

  public getTreeContentAt(
    nodeKey: string = this.rootNodeId,
    shouldIncludeSubtrees?: boolean
  ): TGenericNodeContent<P>[] {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    const mainTreeContent = this._internalTree.getTreeContentAt(nodeId);
    if (!shouldIncludeSubtrees) {
      return mainTreeContent;
    }

    const subtreeIds = this._internalTree.getSubtreeIdsAt();
    subtreeIds.forEach((subtreeId) => {
      const subtree = this._internalTree.getChildContentAt(subtreeId) as ITree<P>;

      /* istanbul ignore next - this should be a non-issue */
      if (subtree !== null) {
        mainTreeContent.push(...subtree.getTreeContentAt());
      }
    });
    return mainTreeContent;
  }

  public getTreeNodeIdsAt(nodeKey: string): string[] {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    return this.reverseMapKeys(this._internalTree.getTreeNodeIdsAt(nodeId));
  }

  private _getNodeId(nodeId: string): string {
    return this._keyStore.getValue(nodeId);
  }

  // protected - for testing only
  _getNodeIdOrThrow(nodeKey: string): string {
    const nodeId = this._getNodeId(nodeKey);
    if (nodeId === undefined) {
      throw new ObfuscatedError(`Failed to find nodeId with key: '${nodeKey}'.`);
    }
    return nodeId;
  }

  public isLeaf(nodeKey: string): boolean {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    return this._internalTree.isLeaf(nodeId);
  }

  public removeNodeAt(nodeKey: string): void {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    super.removeNodeAt.call(this._internalTree, nodeId);
  }

  public replaceNodeContent(nodeKey: string, nodeContent: TGenericNodeContent<P>): void {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    this._internalTree.replaceNodeContent(nodeId, nodeContent);
  }

  protected reverseMapKeys(keys: string[]): string[] {
    return keys.map((nodeId) => {
      return this._keyStore.reverseLookUpExactlyOneOrThrow(nodeId);
    });
  }

  private wrapVisitor(visitor: ITreeVisitor<P>) {
    return {
      includeSubtrees: visitor.includeSubtrees,
      visit: (nodeKey: string, nodeContent: TGenericNodeContent<P>, parentKey: string) => {
        // const nodeKey = this._keyStore.reverseLookUpExactlyOneOrThrow(nodeId);
        // const parentKey = this._keyStore.reverseLookUpExactlyOneOrThrow(parentId);
        visitor.visit(nodeKey, nodeContent, parentKey);
      },
    };
  }

  public toPojoAt(
    nodeKey: string = this.rootNodeId
    //    transformer?: transformToPojoType
  ): TTreePojo<P> {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    return this._internalTree.toPojoAt(nodeId);
  }

  public visitAllAt(
    visitor: ITreeVisitor<P>,
    nodeId: string = this.rootNodeId,
    parentNodeId: string = this.rootNodeId
  ): void {
    const childrenIds = this.getChildrenNodeIdsOf(nodeId, visitor.includeSubtrees);
    const content = this.getChildContentAt(nodeId);
    const wrappedVisitor = this.wrapVisitor(visitor);

    if (visitor.includeSubtrees && content instanceof AbstractObfuscatedExpressionTree) {
      content._internalTree._visitAllAt(wrappedVisitor);
    } else {
      visitor.visit(nodeId, content, parentNodeId);
    }

    childrenIds.forEach((childId) => {
      this.visitAllAt(wrappedVisitor, childId, nodeId);
    });
  }

  public visitLeavesOf(visitor: ITreeVisitor<P>, nodeKey: string = this.rootNodeId): void {
    const wrappedVisitor = this.wrapVisitor(visitor);
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    // this._internalTree.visitLeavesOf(wrappedVisitor, nodeId);

    const childrenIds = this.getDescendantNodeIds(nodeKey, visitor.includeSubtrees);

    const leavesOf = childrenIds.filter((childId) => {
      return this.isLeaf(childId) && !this.isSubtree(childId);
    });

    if (visitor.includeSubtrees) {
      leavesOf.push(...this.getSubtreeIdsAt(nodeKey));
    }

    leavesOf.forEach((leafNodeKey) => {
      const parentKey = this.getParentNodeId(leafNodeKey);
      const content = this.getChildContentAt(leafNodeKey);
      if (content instanceof AbstractObfuscatedExpressionTree) {
        content._internalTree.visitLeavesOf(visitor);
      } else {
        visitor.visit(leafNodeKey, content, parentKey);
      }
    });
  }

  static fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>
    //    transform: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P> = defaultFromPojoTransform
  ): Q {
    //AbstractExpressionTree<P> {
    const tree = AbstractExpressionTree._fromPojo<P, Q>(
      srcPojoTree,
      undefined,
      //    transform,
      AbstractObfuscatedExpressionTree as unknown as () => Q
    );
    AbstractExpressionTree.validateTree(tree as unknown as AbstractExpressionTree<P>);
    return tree as Q;
  }

  public fromPojoAppendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<P>
  ): string {
    const parentNodeKey = this._keyStore.reverseLookUpExactlyOneOrThrow(parentNodeId); //  this._getNodeIdOrThrow(parentNodeKey);

    // this.appendChildNodeWithContent returns Key, not ID
    const newNodeKey = this.appendChildNodeWithContent(parentNodeKey, nodeContent);
    return this._keyStore.getValue(newNodeKey);

    // // I think this isBranch check is unnecessary
    // if (this.isBranch(parentNodeKey)) {
    //   newNodeId = super.appendChildNodeWithContent(parentNodeKey, nodeContent);
    //   return this._keyStore.putValue(newNodeId);
    // }
    // newNodeId = super.appendChildNodeWithContent(parentNodeKey, nodeContent);
    // return this._keyStore.putValue(newNodeId);
  }
}

export { AbstractObfuscatedExpressionTree };
class ObfuscatedSubtree<T> extends AbstractObfuscatedExpressionTree<T> {}

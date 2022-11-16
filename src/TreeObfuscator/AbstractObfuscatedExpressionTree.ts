// import { ITree } from "../DirectedGraph";
import { ITree, ITreeVisitor } from "../DirectedGraph/ITree";

import { AbstractExpressionTree } from "../DirectedGraph/AbstractExpressionTree/AbstractExpressionTree";
import { KeyStore } from "../DirectedGraph/keystore/KeyStore";
import { IObfuscatedExpressionTree } from "./IObfuscatedExpressionTree";
import { TGenericNodeContent, TNodePojo, TTreePojo } from "../DirectedGraph/types";
import { IAppendChildNodeIds } from "../DirectedGraph/AbstractExpressionTree/IAppendChildNodeIds";
import { subtract } from "lodash";
import { CallTracker } from "assert";
import { ObfuscatedError } from "./ObfuscatedError";
abstract class AbstractObfuscatedExpressionTree<P>
  extends AbstractExpressionTree<P>
  implements IObfuscatedExpressionTree<P>
{
  private _internalTree: AbstractExpressionTree<P>;
  private _rootKey: string;
  private _keyStore: KeyStore<string>;

  constructor(tree: AbstractExpressionTree<P> = new AbstractExpressionTree()) {
    super();
    this._internalTree = tree;

    this._keyStore = new KeyStore<string>();
    this._internalTree.getTreeNodeIdsAt(this._internalTree.rootNodeId).forEach((nodeId) => {
      this._keyStore.putValue(nodeId);
    });
    this._rootKey = this._keyStore.reverseLookUpExactlyOneOrThrow(
      this._internalTree.rootNodeId
    );
    this._internalTree.getSubgraphIdsAt(this._internalTree.rootNodeId).forEach((subtreeId) => {
      // maybe instead of getSubgraphIdsAt, just shouldIncludeSubtree above?
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

    if (junctionNodeIds.originalContentNodeId !== undefined) {
      junctionNodeIds.originalContentNodeId = this._keyStore.putValue(
        junctionNodeIds.originalContentNodeId
      );
    }

    junctionNodeIds.newNodeId = this._keyStore.putValue(junctionNodeIds.newNodeId);

    return junctionNodeIds;
  }

  // for testing purpose only.
  // wonder if there isn't a better way
  protected buildReverseMap(reverseMap: { [nodeId: string]: string } = {}): {
    [nodeId: string]: string;
  } {
    this._keyStore.allKeys().forEach((nodeKey) => {
      try {
        const nodeId = this._keyStore.getValue(nodeKey);
        reverseMap[nodeId] = nodeKey;
      } catch (error) {
        reverseMap[nodeKey] = nodeKey;
      }
      // const nodeId = this._keyStore.reverseLookUpExactlyOneOrThrow(nodeKey);
      // reverseMap[nodeId] = nodeKey;
    });

    const subtreeIds = this._internalTree.getSubgraphIdsAt(this._internalTree.rootNodeId);
    subtreeIds.forEach((subtreeId) => {
      const subtree = this._internalTree.getChildContentAt(subtreeId) as ObfuscatedSubtree<P>;
      subtree.buildReverseMap(reverseMap);
    });
    return reverseMap;
  }

  public countTotalNodes(nodeKey: string = this.rootNodeId) {
    // const nodeId = this._getNodeIdOrThrow(nodeKey);
    return this.getTreeNodeIdsAt(nodeKey).length;
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

  public getSiblingIds(nodeKey: string): string[] {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    return this.reverseMapKeys(this._internalTree.getSiblingIds(nodeId));
  }

  public getTreeContentAt(
    nodeKey: string,
    shouldIncludeSubtrees?: boolean
  ): TGenericNodeContent<P>[] {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    return this._internalTree.getTreeContentAt(nodeId);
  }

  public getTreeNodeIdsAt(nodeKey: string): string[] {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    return this.reverseMapKeys(this._internalTree.getTreeNodeIdsAt(nodeId));
  }

  private _getNodeId(nodeId: string): string {
    return this._keyStore.getValue(nodeId);
  }

  private _getNodeIdOrThrow(nodeKey: string): string {
    const nodeId = this._getNodeId(nodeKey);
    if (nodeId === undefined) {
      throw new ObfuscatedError(`Failed to find nodeId with key: ${nodeKey}.`);
    }
    return nodeId;
  }

  public removeNodeAt(nodeKey: string): void {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    const removeNode = super.removeNodeAt.bind(this._internalTree, nodeId);
    removeNode();
    // const siblingIds = this._internalTree.getSiblingIds(nodeId);
    // is caller or bind?
    // you are duplicating work because the base class cant call these methods
    // need a hardDelete that bypasses the two-child rule
    // if (siblingIds.length > 1) {
    //   return super.removeNodeAt(nodeId);
    // }
    // const parentId = this.getParentNodeId(nodeId);
    // const siblingContent = this.getChildContentAt(siblingIds[0]);

    // this.replaceNodeContent(parentId, siblingContent);

    // super.removeNodeAt(siblingIds[0]);
    // super.removeNodeAt(nodeId);
  }

  protected reverseMapKeys(keys: string[]): string[] {
    // not sure this is necessary
    return keys.map((nodeId) => {
      return this._keyStore.reverseLookUpExactlyOneOrThrow(nodeId);
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

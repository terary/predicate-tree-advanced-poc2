import { IExpressionTree, ITree, ITreeVisitor } from "../ITree";

import { AbstractExpressionTree } from "../AbstractExpressionTree/AbstractExpressionTree";
import { KeyStore } from "../keystore/KeyStore";
import { IObfuscatedExpressionTree } from "./IObfuscatedExpressionTree";
import { IAppendChildNodeIds } from "../AbstractExpressionTree/IAppendChildNodeIds";
import { ObfuscatedError } from "./ObfuscatedError";
import type { TFromToMap, TGenericNodeContent, TNodePojo, TTreePojo } from "../types";
import { AbstractTree } from "../AbstractTree/AbstractTree";
abstract class AbstractObfuscatedExpressionTree<P>
  extends AbstractExpressionTree<P>
  implements IObfuscatedExpressionTree<P>
{
  //
  protected _internalTree: AbstractExpressionTree<P>;
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

  protected appendChildNodeWithContent(
    parentNodeKey: string,
    nodeContent: TGenericNodeContent<P>
  ): string {
    const parentNodeId = this._getNodeIdOrThrow(parentNodeKey);

    // should do it like this
    const newNodeId = this._internalTree["appendChildNodeWithContent"](
      parentNodeId,
      nodeContent
    );

    return this._keyStore.putValue(newNodeId);
  }

  private static appendTreeAt<T>(
    targetTree: AbstractObfuscatedExpressionTree<T>,
    targetNodeKey: string,
    sourceTree: AbstractTree<T>,
    sourceBranchRootNodeId?: string | undefined
  ): TFromToMap[] {
    const targetNodeId = targetTree._getNodeIdOrThrow(targetNodeKey);
    const fromToMapping = targetTree._internalTree.appendTreeAt(
      targetNodeId,
      sourceTree instanceof AbstractObfuscatedExpressionTree
        ? sourceTree._internalTree
        : sourceTree,
      // sourceTree,
      sourceBranchRootNodeId
    );

    // consider doing this for source tree if instanceOf Obfuscate
    return fromToMapping.map(({ from, to }) => {
      return {
        from,
        to: targetTree._keyStore.putValue(to),
      };
    });
  }

  public appendTreeAt(
    targetNodeKey: string,
    sourceTree: AbstractTree<P>,
    sourceBranchRootNodeId?: string | undefined
  ): TFromToMap[] {
    return AbstractObfuscatedExpressionTree.appendTreeAt(
      this,
      targetNodeKey,
      sourceTree,
      sourceBranchRootNodeId
    );
  }

  appendContentWithJunction(
    parentNodeKey: string,
    junctionContent: TGenericNodeContent<P>,
    nodeContent: TGenericNodeContent<P>
  ): IAppendChildNodeIds {
    const parentNodeId = this._getNodeIdOrThrow(parentNodeKey);

    if (this.isBranch(parentNodeKey)) {
      const affectedNodeIds = this._internalTree.appendContentWithJunction(
        parentNodeId,
        junctionContent,
        nodeContent
      );
      return {
        isNewBranch: false,
        newNodeId: this._keyStore.putValue(affectedNodeIds.newNodeId),
        junctionNodeId: parentNodeKey,
      };
    }

    const junctionNodeIds = this._internalTree.appendContentWithJunction(
      parentNodeId,
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

  public cloneAt(nodeKey: string): AbstractExpressionTree<P> {
    // probably don't want class definition
    // class GenericObfuscatedExpressionTree extends AbstractObfuscatedExpressionTree<P> {}

    const nodeId = this._getNodeIdOrThrow(nodeKey);

    const cloneInternalTree = this._internalTree.cloneAt(nodeId);
    return new GenericObfuscatedExpressionTree<P>(cloneInternalTree);
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
  public createSubtreeAt(targetParentNodeId: string): IExpressionTree<P> {
    // used by createSubTree to be flexible with actual constructor type

    // can we rethink this.  Is there a better way?
    const subtreeParentNodeId = this._internalTree["appendChildNodeWithContent"](
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
        visitor.visit(nodeKey, nodeContent, parentKey);
      },
    };
  }

  public toPojoAt(nodeKey: string = this.rootNodeId, transformer?: Function): TTreePojo<P> {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    const mainTreePojo = this._internalTree.toPojoWithoutSubtreesAt(nodeId);
    const subtreeIds = this._internalTree.getSubtreeIdsAt();

    subtreeIds.forEach((subtreeId) => {
      const subtree = this._internalTree.getChildContentAt(subtreeId);
      if (subtree instanceof ObfuscatedSubtree) {
        // maybe this guard isn't a great idea, how subclasses deal with this?
        Object.entries(subtree.toPojoAtFromParent()).forEach(
          ([subtreeNodeId, subtreeNodeContent]) => {
            mainTreePojo[subtreeNodeId] = subtreeNodeContent;
          }
        );
      }
    });

    return AbstractObfuscatedExpressionTree.obfuscatePojo(mainTreePojo);
  }

  private static obfuscatePojo(pojo: TTreePojo<any>): TTreePojo<any> {
    // I *think* because toPojo also calls toPojo of subtree
    // the result is the subtree gets pojo'd independently
    // which goofs everything.

    // this hack takes a pojo and obfuscate.
    // ideally toPojo would obfuscate
    const obfusPojo = { ...pojo };
    const keyStore = new KeyStore<string>();

    // first pass - keys
    Object.keys(obfusPojo).forEach((nodeId) => {
      const nodeKey = keyStore.putValue(nodeId);
      obfusPojo[nodeKey] = { ...obfusPojo[nodeId] };
      delete obfusPojo[nodeId];
    });

    // second pass - update parentNodeId
    Object.entries(obfusPojo).forEach(([nodeKey, node]) => {
      obfusPojo[nodeKey].parentId = keyStore.reverseLookUpExactlyOneOrThrow(
        obfusPojo[nodeKey].parentId
      );
    });

    return obfusPojo;
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
      content._internalTree.visitAllAt(wrappedVisitor);
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
  static fromPojo<P, Q>(srcPojoTree: TTreePojo<P>): Q {
    const tree = AbstractExpressionTree.fromPojo<P, AbstractExpressionTree<P>>(srcPojoTree);
    AbstractExpressionTree.validateTree(tree);

    const newObfuscatedTree = new GenericObfuscatedExpressionTree<P>(tree);
    return newObfuscatedTree as unknown as Q;
  }

  protected fromPojoAppendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<P>
  ): string {
    const parentNodeKey = this._keyStore.reverseLookUpExactlyOneOrThrow(parentNodeId);
    const newNodeKey = this.appendChildNodeWithContent(parentNodeKey, nodeContent);
    return this._keyStore.getValue(newNodeKey);
  }
}

export { AbstractObfuscatedExpressionTree };
class GenericObfuscatedExpressionTree<P> extends AbstractObfuscatedExpressionTree<P> {}
class ObfuscatedSubtree<T> extends AbstractObfuscatedExpressionTree<T> {
  public toPojoAtFromParent(
    nodeKey = this.rootNodeId,
    transformer?: <T>(nodeContent: T) => TNodePojo<T>
  ): TTreePojo<T> {
    const nodeId = this._getNodeIdOrThrow(nodeKey);
    return this._internalTree.toPojoAt(nodeId, transformer);
  }
}

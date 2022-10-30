import { ITree, ITreeVisitor } from "../DirectedGraph/ITree";
import { TGenericNodeType, TTreePojo } from "../DirectedGraph/types";
import { TGenericNodeContent } from "../DirectedGraph/types";
import { KeyStore } from "../DirectedGraph/keystore/KeyStore";
import { AbstractDirectedGraph } from "../DirectedGraph/AbstractDirectedGraph";

class TreeObfuscator<T> implements ITree<T> {
  protected _internalTree: ITree<T>; // makes sense to make this read only
  protected _keyMap = new KeyStore<string>(); // storing objects such a bad idea? opens the door to infidelity
  private _rootNodeKey: string;
  constructor(internalTree: ITree<T>) {
    this._internalTree = internalTree;
    this._rootNodeKey = this._keyMap.putValue(this._internalTree.rootNodeId);
  }

  get rootNodeId() {
    return this._rootNodeKey;
  }

  appendChildNodeWithContent(
    treeParentKey: string,
    nodeContent: TGenericNodeContent<T>
  ): string {
    const treeParentId = this.getNodeIdOrThrow(treeParentKey);

    const nodeId = this._internalTree.appendChildNodeWithContent(treeParentId, nodeContent);
    return this._keyMap.putValue(nodeId);
  }

  cloneAt(nodeKey: string): ITree<T> {
    const nodeId = this.getNodeIdOrThrow(nodeKey);
    return this._internalTree.cloneAt(nodeId);
  }

  countGreatestDepthOf(nodeKey?: string): number {
    const nodeId = this.getNodeIdOrThrow(nodeKey || this.rootNodeId);

    return this._internalTree.countGreatestDepthOf(nodeId);
  }

  countLeavesOf(nodeKey?: string): number {
    const nodeId = this.getNodeIdOrThrow(nodeKey || this.rootNodeId);
    return this._internalTree.countLeavesOf(nodeId);
  }

  countDescendantsOf(nodeKey?: string): number {
    const nodeId = this.getNodeIdOrThrow(nodeKey || this.rootNodeId);
    return this._internalTree.countDescendantsOf(nodeId);
  }

  countTotalNodes(nodeKey?: string): number {
    const nodeId = this.getNodeIdOrThrow(nodeKey || this.rootNodeId);
    return this._internalTree.countTotalNodes(nodeId);
  }

  createSubGraphAt(nodeKey: string): ITree<T> {
    const nodeId = this.getNodeIdOrThrow(nodeKey);
    return this._internalTree.createSubGraphAt(nodeId);
  }

  private getNodeId(nodeKey: string): string {
    return this._keyMap.getValue(nodeKey);
    // if (nodeId === undefined) {
    //   throw new Error(
    //     `CHANGE THIS - obfus getNodeIdOrThrow: nodeId '${nodeId}', nodeKey: '${nodeKey}'`
    //   );
    // }
    // return nodeId;
  }

  protected getNodeIdOrThrow(nodeKey: string): string {
    // const nodeId = this._keyMap.getValue(nodeKey);
    const nodeId = this.getNodeId(nodeKey);
    if (nodeId === undefined) {
      throw new Error(
        `CHANGE THIS - obfus getNodeIdOrThrow: nodeId '${nodeId}', nodeKey: '${nodeKey}'`
      );
    }
    return nodeId;
  }

  public getNodeAt(nodeKey: string): TGenericNodeType<T> | undefined {
    const nodeId = this.getNodeId(nodeKey);
    return this._internalTree.getNodeAt(nodeId);
  }

  getChildContent(nodeKey: string): TGenericNodeContent<T> {
    const nodeId = this.getNodeId(nodeKey);
    if (nodeId) {
      return this._internalTree.getChildContent(nodeId);
    }
    return null;
  }

  getChildrenContent(nodeKey: string): TGenericNodeContent<T>[] {
    const nodeId = this.getNodeId(nodeKey);
    if (nodeId) {
      return this._internalTree.getChildrenContent(nodeId);
    }
    return [];
  }

  getChildrenNodeIds(nodeKey: string): string[] {
    const nodeId = this.getNodeIdOrThrow(nodeKey);
    return this._internalTree
      .getChildrenNodeIds(nodeId)
      .map((nodeId) => this.reverseLookUpExactlyOneOrThrow(nodeId));
    // return this._internalTree.getChildrenNodeIds(nodeId);
  }

  getDescendantContent(nodeKey: string): TGenericNodeContent<T>[] {
    const nodeId = this.getNodeId(nodeKey);
    if (nodeId) {
      return this._internalTree.getDescendantContent(nodeId);
    }
    return [];
  }

  getParentNodeId(nodeKey: string): string {
    const nodeId = this.getNodeIdOrThrow(nodeKey);
    return this._internalTree.getParentNodeId(nodeId);
  }

  getSiblingIds(nodeKey: string): string[] {
    const nodeId = this.getNodeIdOrThrow(nodeKey);
    return this._internalTree
      .getSiblingIds(nodeId)
      .map((nodeId) => this.reverseLookUpExactlyOneOrThrow(nodeId));
  }

  getSubgraphIdsAt(nodeKey: string): string[] {
    const nodeId = this.getNodeIdOrThrow(nodeKey);
    return this._internalTree
      .getSubgraphIdsAt(nodeId)
      .map((nodeId) => this.reverseLookUpExactlyOneOrThrow(nodeId));
  }

  getTreeContentAt(nodeKey: string): TGenericNodeContent<T>[] {
    const nodeId = this._keyMap.getValue(nodeKey);
    if (nodeId === undefined) {
      return [];
    }
    return this._internalTree.getTreeContentAt(nodeId);
  }

  getTreeNodeIdsAt(nodeKey: string): string[] {
    const nodeId = this.getNodeIdOrThrow(nodeKey);
    return this._internalTree
      .getTreeNodeIdsAt(nodeId)
      .map((nodeId) => this.reverseLookUpExactlyOneOrThrow(nodeId));
  }

  isBranch(nodeKey: string): boolean {
    const nodeId = this.getNodeIdOrThrow(nodeKey);
    return this._internalTree.isBranch(nodeId);
  }

  isLeaf(nodeKey: string): boolean {
    const nodeId = this.getNodeIdOrThrow(nodeKey);
    return this._internalTree.isLeaf(nodeId);
  }

  isRoot(nodeKey: string): boolean {
    const nodeId = this.getNodeIdOrThrow(nodeKey);
    return this._internalTree.isRoot(nodeId);
  }

  isSubtree(nodeKey: string): boolean {
    const nodeId = this.getNodeIdOrThrow(nodeKey);
    return this._internalTree.isSubtree(nodeId);
  }

  move(srcNodeKey: string, tarNodeKey: string): { from: string; to: string }[] {
    const srcNodeId = this.getNodeIdOrThrow(srcNodeKey);
    const tarNodeId = this.getNodeIdOrThrow(tarNodeKey);
    const moveList = this._internalTree.move(srcNodeId, tarNodeId);
    this.moveKeys(moveList);
    return moveList;
  }

  moveChildren(srcNodeKey: string, tarNodeKey: string): { from: string; to: string }[] {
    const srcNodeId = this.getNodeIdOrThrow(srcNodeKey);
    const tarNodeId = this.getNodeIdOrThrow(tarNodeKey);
    const moveList = this._internalTree.moveChildren(srcNodeId, tarNodeId);
    this.moveKeys(moveList);
    return moveList;
  }

  private moveKeys(moveList: { from: string; to: string }[]): void {
    moveList.forEach(({ from, to }) => {
      const key = this.reverseLookUpExactlyOneOrThrow(from);
      this._keyMap.replaceValue(to, key);
    });
  }

  public removeNodeAt(
    nodeKey: string,
    unregisterInvisibleChild: (nodeId: string) => void = (nodeId: string) => {}
  ): void {
    const nodeId = this.getNodeIdOrThrow(nodeKey);
    this._internalTree.removeNodeAt(nodeId);
    this._keyMap.removeKey(nodeKey);
  }

  replaceNodeContent(nodeKey: string, nodeContent: TGenericNodeContent<T>): void {
    const nodeId = this.getNodeIdOrThrow(nodeKey);
    this._internalTree.replaceNodeContent(nodeId, nodeContent);
  }

  private reverseLookUpExactlyOneOrThrow(nodeKey: string): string {
    const possibleNodeIds = this._keyMap.reverseLookUp(nodeKey);
    if (possibleNodeIds.length === 1) {
      return possibleNodeIds[0];
    }
    throw new Error("REPLACE ME - failed to get exactly 1, reverse lookup");
  }

  toPojo(): TTreePojo<T> {
    return this._internalTree.toPojo();
  }

  toPojoAt(nodeKey?: string): TTreePojo<T> {
    const nodeId = this.getNodeIdOrThrow(nodeKey || this.rootNodeId);
    return this._internalTree.toPojoAt(nodeId);
  }

  visitAllAt(visitor: ITreeVisitor<T>, nodeKey?: string, parentNodeKey?: string): void {
    const nodeId = this.getNodeIdOrThrow(nodeKey || this.rootNodeId);
    const parentNodeId = this.getNodeIdOrThrow(parentNodeKey || this.rootNodeId);
    return this._internalTree.visitAllAt(visitor, nodeId, parentNodeId);
  }

  visitLeavesOf(visitor: ITreeVisitor<T>, nodeKey?: string, parentNodeKey?: string): void {
    const nodeId = this.getNodeIdOrThrow(nodeKey || this.rootNodeId);
    const parentNodeId = this.getNodeIdOrThrow(parentNodeKey || this.rootNodeId);
    return this._internalTree.visitAllAt(visitor, nodeId, parentNodeId);
  }
}

export { TreeObfuscator };

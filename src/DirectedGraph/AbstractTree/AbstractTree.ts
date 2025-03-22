import { DirectedGraphError } from "../DirectedGraphError";
import { Incrementor } from "../Incrementor";
import { ITree, ITreeVisitor } from "../ITree";
import type {
  TNodePojo,
  TTreePojo,
  TGenericNodeContent,
  TGenericNodeType,
  TFromToMap,
} from "../types";
import { KeyStore } from "../keystore/KeyStore";

const defaultToPojoTransformer = <T>(nodeContent: T) => {
  return nodeContent as unknown as TNodePojo<T>;
};

const makeChildrenRegExp = (nodeId: string, delim: string) => {
  return new RegExp("^" + nodeId + delim + "[\\d]+$");
};

const makeDescendantRegExp = (nodeId: string, delim: string, options = "") => {
  return new RegExp("^" + nodeId + delim, options);
};

type transformToPojoType = typeof defaultToPojoTransformer;
abstract class AbstractTree<T extends object> implements ITree<T> {
  static EmptyNode = null;
  static SubtreeNodeTypeName = "subtree";
  static SHOULD_INCLUDE_SUBTREES = true;
  protected _nodeDictionary: {
    [nodeId: string]: TGenericNodeType<T>;
  } = {};

  private _nodeKeyDelimiter = ":";
  protected _rootNodeId: string;
  protected _incrementor = new Incrementor();

  constructor(rootNodeId = "_root_", nodeContent?: T) {
    this._rootNodeId = rootNodeId;
    if (nodeContent === undefined) {
      this.#setNodeContentByNodeId(this._rootNodeId, AbstractTree.EmptyNode);
    } else {
      this._nodeDictionary[this._rootNodeId] = { nodeContent };
    }
  }

  /**
   * Appends a new child node with the provided content to a specified parent node.
   *
   * This method creates a new node in the tree, assigns it the given content,
   * and makes it a child of the specified parent node. The node ID is automatically
   * generated.  The returned nodeId can be used in local scope to build up the expression.
   * The tree manages content and may move it around.  Although the nodeId may remain valid
   * the content may get changed so nodeIds are considered temporal.
   *
   * @param parentNodeId - The ID of the parent node to which the new child node will be attached
   * @param nodeContent - The content to be stored in the new child node. Can be null, an object of type T, or another ITree<T>
   * @returns The ID of the newly created child node
   */
  public appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<T>
  ): string {
    return this.#appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  #appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<T>
  ): string {
    const childNodeId = this.#getNextChildNodeId(parentNodeId);
    this._nodeDictionary[childNodeId] = { nodeContent };
    return childNodeId;
  }

  appendTreeAt(
    targetNodeId: string = this.rootNodeId,
    sourceTree: AbstractTree<T>,
    sourceBranchRootNodeId?: string
  ): TFromToMap[] {
    return AbstractTree.appendTree<T>(
      this,
      sourceTree,
      targetNodeId,
      sourceBranchRootNodeId
    );
  }

  protected static appendTree<P extends object>(
    targetTree: AbstractTree<P>,
    sourceTree: AbstractTree<P>,
    targetNodeId: string,
    sourceBranchRootNodeId?: string
  ): TFromToMap[] {
    const sourceRoot = sourceBranchRootNodeId || sourceTree.rootNodeId;
    const sourceNodeIds = sourceTree.#getTreeNodeIdsAt(sourceRoot);
    const replaceRegExp = new RegExp(sourceRoot, "g");
    const uniqueToken = sourceTree._rootNodeId == sourceTree._rootNodeId;
    const fromToMap = sourceNodeIds.map((sourceNodeId: string) => {
      const to = sourceNodeId.replace(
        replaceRegExp,
        targetNodeId + ":treeAppend"
      );
      return {
        from: sourceNodeId,
        to,
      };
    });

    fromToMap.forEach(({ from, to }) => {
      if (to in targetTree._nodeDictionary) {
        // this error has to be changed
        throw new Error(`ID COLLISION offending node: "${to}".`);
      }
      targetTree._nodeDictionary[to] = sourceTree._nodeDictionary[from]; //sourceTree.getChildContentAt(from);
      targetTree.#getNextChildNodeId("ANY"); // need to keep this counting
    });
    return fromToMap;
  }

  abstract cloneAt(nodeId: string): ITree<T>;

  public countDescendantsOf(parentNodeId: string = this.rootNodeId) {
    this.#nodeIdExistsOrThrow(parentNodeId);
    return this.getDescendantNodeIds(parentNodeId).length;
  }

  /**
   * Returns greatest distance between nodeId and furthest leaf.
   * If node is leaf returns 1.
   * Hence depth:
   *  sub-root | child | grandchild
   *       1      2          3
   *  * same philosophy as length
   * @param nodeKey
   * @returns {number} greatest depth of given node and its furthest leaf.
   */
  public countGreatestDepthOf(subTreeRootNodeId: string = this.rootNodeId) {
    this.#getChildContentOrThrow(subTreeRootNodeId);
    let greatestDepth = 1;

    const descendantKeys = this.getDescendantNodeIds(subTreeRootNodeId);
    if (descendantKeys.length === 0) {
      return greatestDepth;
    }

    const subTreeDepthOffset = this.getBranchDepth(subTreeRootNodeId);
    for (let nodeKey of descendantKeys) {
      const depth = this.getBranchDepth(nodeKey) - subTreeDepthOffset + 1;
      if (depth > greatestDepth) {
        greatestDepth = depth;
      }
    }

    return greatestDepth;
  }

  public countLeavesOf(nodeId = this.rootNodeId) {
    const descendantKeys = this.getDescendantNodeIds(nodeId);
    return descendantKeys.filter((descendKey) => {
      return this.getDescendantNodeIds(descendKey).length === 0;
    }).length;
  }

  public countTotalNodes(
    nodeId: string = this.rootNodeId,
    shouldIncludeSubtrees = true
  ) {
    let totalNodes = this.#getTreeNodeIdsAt(nodeId).length;

    if (!shouldIncludeSubtrees) {
      return totalNodes;
    }

    this.getSubtreeIdsAt(nodeId).forEach((subtreeId) => {
      const subtree = this.getChildContentAt(subtreeId) as ITree<T>;
      totalNodes += subtree.countTotalNodes();
    });

    return totalNodes;
  }

  private filterIds(filterFn: (key: string) => boolean) {
    return Object.keys(this._nodeDictionary).filter(filterFn);
  }

  /**
   * Returns distance between nodeKey and root + 1
   * Hence depth:
   *  root | child | grandchild
   *   1      2          3
   *  * same philosophy as length
   * @param nodeId
   * @returns {number} depth of branch (distance between nodeId and root)
   */
  protected getBranchDepth(nodeId: string): number {
    const regExp = new RegExp(this._nodeKeyDelimiter, "g");
    return (nodeId.match(regExp) || []).length + 1; // this is safe because no tree can be rootless
  }

  private nodeIdExists(nodeId: string): boolean {
    return this._nodeDictionary[nodeId] !== undefined;
  }

  #nodeIdExistsOrThrow(nodeId: string): boolean {
    if (this.nodeIdExists(nodeId)) {
      return true;
    }
    throw new DirectedGraphError(
      `Tried to retrieve node that does not exist. nodeId: "${nodeId}".`
    );
  }

  #getChildContentOrThrow(nodeId: string) {
    if (this._nodeDictionary[nodeId] === undefined) {
      throw new DirectedGraphError(
        `Tried to retrieve node that does not exist. nodeId: "${nodeId}".`
      );
    }
    return this.#getChildContent(nodeId);
  }

  public getChildContentAt(nodeId: string): ITree<T> | T | null {
    return this.#getChildContent(nodeId);
  }

  #getChildContent(nodeId: string): ITree<T> | T | null {
    // node should ALWAYS have nodeContent
    // should NEVER be null
    // nodeContent can be set to null

    if (this._nodeDictionary[nodeId] === undefined) {
      return AbstractTree.EmptyNode;
    }

    return this._nodeDictionary[nodeId].nodeContent;
  }

  getNodeIdsWithNodeContent(
    matcherFn: (nodeContent: T) => boolean,
    shouldIncludeSubtrees?: boolean //*tmc* what about subtrees ?
  ): string[] {
    const allNodeIds = this.getTreeNodeIdsAt(this.rootNodeId);

    return allNodeIds.filter((nodeId) => {
      if (this.isSubtree(nodeId) || this.getChildContentAt(nodeId) === null) {
        return false; // *tmc* for the time being, we look only at natural tree elements (no subtree).
      }
      const content = this.getChildContentAt(nodeId);
      return matcherFn(content as T);
    });
  }

  public getChildrenNodeIdsOf(
    parentNodeId: string,
    shouldIncludeSubtrees = false
  ): string[] {
    return this.#getChildrenNodeIds(parentNodeId, shouldIncludeSubtrees);
  }

  #getChildrenNodeIds(
    parentNodeId: string,
    shouldIncludeSubtrees = false
  ): string[] {
    const childRegExp = makeChildrenRegExp(
      parentNodeId,
      this._nodeKeyDelimiter
    );
    if (shouldIncludeSubtrees) {
      return this.filterIds((nodeId) => childRegExp.test(nodeId));
    } else {
      return this.filterIds(
        (nodeId) => childRegExp.test(nodeId) && !this.isSubtree(nodeId)
      );
    }
  }

  public getCountTotalNodes() {
    return Object.keys(this._nodeDictionary).length;
  }

  #getContentItems(nodeIds: string[]): (ITree<T> | T | null)[] {
    return nodeIds.map((childNodeId) => {
      const content = this.#getChildContent(childNodeId);
      if (content instanceof AbstractTree) {
        const subtreeRootNodeId = (content as AbstractTree<any>).rootNodeId;
        return (content as AbstractTree<any>).#getChildContent(
          subtreeRootNodeId
        );
      }
      return content;
    });
  }

  public getChildrenContentOf(
    parentNodeId: string,
    shouldIncludeSubtrees = false
  ): (ITree<T> | T | null)[] {
    const childrenNodeIds = this.#getChildrenNodeIds(
      parentNodeId,
      shouldIncludeSubtrees
    );
    return this.#getContentItems(childrenNodeIds);
  }

  public getDescendantContentOf(
    parentNodeId: string,
    shouldIncludeSubtrees = false
  ): TGenericNodeContent<T>[] {
    this.#nodeIdExistsOrThrow(parentNodeId);
    const descendantIds = this.getDescendantNodeIds(
      parentNodeId,
      shouldIncludeSubtrees
    );
    const descendantContent: TGenericNodeContent<T>[] = [];

    descendantIds.forEach((key) => {
      const nodeContent = this.#getChildContent(key);
      if (nodeContent instanceof AbstractTree) {
        const nodeContentAsAbstract = nodeContent as AbstractTree<T>;

        const content = nodeContentAsAbstract.getTreeContentAt(
          nodeContentAsAbstract.rootNodeId,
          shouldIncludeSubtrees
        );
        descendantContent.push(
          ...content
          //...nodeContentAsAbstract.getTreeContentAt(nodeContentAsAbstract.rootNodeId, true)
        );
      } else {
        descendantContent.push(nodeContent);
      }
    });

    return descendantContent;
  }

  public getDescendantNodeIds(
    parentNodeId: string,
    shouldIncludeSubtrees = false
  ): string[] {
    const descendantsRegExp = makeDescendantRegExp(
      parentNodeId,
      this._nodeKeyDelimiter
    );

    if (shouldIncludeSubtrees) {
      return this.filterIds((nodeId) => descendantsRegExp.test(nodeId));
    } else {
      return this.filterIds(
        (nodeId) => descendantsRegExp.test(nodeId) && !this.isSubtree(nodeId)
      );
    }
  }

  protected _getNewInstance<P>(rootSeedNodeId?: string, nodeContent?: T): P {
    // return new this.constructor();
    return Reflect.construct(this.constructor, [
      rootSeedNodeId,
      nodeContent,
    ]) as P;
  }

  #getNextChildNodeId(parentNodeId: string) {
    const childNodeId = [parentNodeId, this._incrementor.next].join(
      this._nodeKeyDelimiter
    );
    return childNodeId;
  }

  public getParentNodeId(nodeId: string): string {
    return this.#getParentNodeId(nodeId);
  }

  #getParentNodeId(nodeId: string): string {
    if (nodeId === this._rootNodeId) {
      return this._rootNodeId;
    }

    if (!nodeId) {
      throw new DirectedGraphError(
        `Could not derive parent nodeId from '${nodeId}'.`
      );
    }

    let parentNodeId = "";
    parentNodeId = nodeId
      .split(this._nodeKeyDelimiter)
      .slice(0, -1)
      .join(this._nodeKeyDelimiter);

    if (parentNodeId === "") {
      throw new DirectedGraphError(
        `Could not derive parent nodeId from '${nodeId}'.`
      );
    }

    return parentNodeId;
  }

  public getSiblingIds(nodeId: string): string[] {
    if (this.isRoot(nodeId)) {
      // parent of root is root, which causes this method to act oddly
      return [];
    }

    const parentNodeId = this.#getParentNodeId(nodeId);
    const childrenIds = this.#getChildrenNodeIds(parentNodeId);

    const index = childrenIds.indexOf(nodeId);
    /* istanbul ignore next - likely unnecessary check */
    if (index > -1) {
      // only splice array when item is found, and it should always be found.
      childrenIds.splice(index, 1);
    }

    return childrenIds;
  }

  public getSubtreeIdsAt(nodeId: string = this.rootNodeId) {
    const allNodeIds = this.getDescendantNodeIds(nodeId, true);
    const self = this;
    return allNodeIds.filter((nodeId: string) => {
      return self.isSubtree(nodeId);
    });
  }

  public getTreeContentAt(
    nodeId: string = this.rootNodeId,
    shouldIncludeSubtrees = false
  ) {
    if (this.nodeIdExists(nodeId)) {
      const descendContent = this.getDescendantContentOf(
        nodeId,
        shouldIncludeSubtrees
      );
      descendContent.push(this.getChildContentAt(nodeId));
      return descendContent;
    }
    return [];
  }

  public getTreeNodeIdsAt(nodeId: string) {
    return this.#getTreeNodeIdsAt(nodeId);
  }

  #getTreeNodeIdsAt(nodeId: string) {
    const childRegExp = makeDescendantRegExp(nodeId, "");
    return this.filterIds(
      (nodeId) => childRegExp.test(nodeId) && !this.isSubtree(nodeId)
    );
  }

  public isBranch(nodeId: string): boolean {
    return this.getDescendantNodeIds(nodeId).length > 0;
  }

  public isLeaf(nodeId: string): boolean {
    return this.#isLeaf(nodeId);
  }

  #isLeaf(nodeId: string): boolean {
    return this.getDescendantNodeIds(nodeId).length === 0;
  }

  public isRoot(nodeId: string): boolean {
    return nodeId === this._rootNodeId;
  }

  public isSubtree(nodeId: string): boolean {
    return this.getChildContentAt(nodeId) instanceof AbstractTree;
  }

  /**
   * sourceNode becomes child of targetNode
   * children of sourceNode become grandchildren of target
   * @param sourceNodeId
   * @param targetNodeId
   */
  public move(
    sourceNodeId: string,
    targetNodeId: string
  ): { from: string; to: string }[] {
    const newChildId = this.#getNextChildNodeId(targetNodeId);

    const subtreeIds = this.#getTreeNodeIdsAt(sourceNodeId);

    const mapFromTo = subtreeIds.map((descKey) => {
      return { from: descKey, to: descKey.replace(sourceNodeId, newChildId) };
    });

    mapFromTo.forEach(({ from, to }) => {
      this.#moveNode(from, to);
    });

    return mapFromTo;
  }

  /**
   * children of sourceNode become children of targetNode.
   * sourceNode becomes childless
   * @param sourceNodeId
   * @param targetNodeId
   */
  public moveChildren(
    sourceNodeId: string,
    targetNodeId: string
  ): { from: string; to: string }[] {
    // *tmc* - does this make sense to be public?  I think there is no use case for it
    // also it doesn't seem to be used by this class
    const descendantKeys = this.getDescendantNodeIds(sourceNodeId);

    const mapFromTo = descendantKeys.map((descKey) => {
      return { from: descKey, to: descKey.replace(sourceNodeId, targetNodeId) };
    });

    mapFromTo.forEach(({ from, to }) => {
      this.#moveNode(from, to);
    });
    return mapFromTo;
  }

  #moveNode(fromNodeId: string, toNodeId: string) {
    // *tmc* think "#moveNode" is not very good name
    this.#setNodeContentByNodeId(toNodeId, this.#getChildContent(fromNodeId));
    this.removeSingleNode(fromNodeId);
  }

  public removeNodeAt(nodeId: string): void {
    if (this.isRoot(nodeId)) {
      throw new DirectedGraphError("Can not remove root node.");
    }
    const treeIds = this.#getTreeNodeIdsAt(nodeId);
    treeIds.forEach((childId) => {
      this.removeSingleNode(childId); // using this?
    });
  }

  public removeSingleNode(nodeId: string): void {
    delete this._nodeDictionary[nodeId];
  }

  public replaceNodeContent(
    nodeId: string,
    nodeContent: TGenericNodeContent<T>
  ): void {
    this.#replaceNodeContent(nodeId, nodeContent);
  }

  #replaceNodeContent(
    nodeId: string,
    nodeContent: TGenericNodeContent<T>
  ): void {
    if (this.isRoot(nodeId) && nodeContent instanceof AbstractTree) {
      throw new DirectedGraphError(`Can not replace root with subtree.`);
    }

    this._nodeDictionary[nodeId] = { nodeContent };
  }

  get rootNodeId() {
    return this._rootNodeId;
  }

  #setNodeContentByNodeId(nodeId: string, nodeContent: TGenericNodeContent<T>) {
    this._nodeDictionary[nodeId] = { nodeContent };
  }

  public visitAllAt(
    visitor: ITreeVisitor<T>,
    nodeId: string = this.rootNodeId
  ): void {
    const parentNodeId = nodeId;
    this.#visitAllAt(visitor, nodeId, parentNodeId);
  }

  #visitAllAt(
    visitor: ITreeVisitor<T>,
    nodeId: string = this._rootNodeId,
    parentNodeId: string = this._rootNodeId
  ): void {
    const childrenIds = this.#getChildrenNodeIds(
      nodeId,
      visitor.includeSubtrees
    );
    const content = this.#getChildContent(nodeId);

    if (visitor.includeSubtrees && content instanceof AbstractTree) {
      content.#visitAllAt(visitor);
    } else {
      // this.visitNode(visitor, nodeId, content, parentNodeId);
      visitor.visit(nodeId, content, parentNodeId);
    }

    childrenIds.forEach((childId) => {
      this.#visitAllAt(visitor, childId, nodeId);
    });
  }

  public visitLeavesOf(
    visitor: ITreeVisitor<T>,
    nodeId: string = this._rootNodeId
  ): void {
    this.#visitLeavesOf(visitor, nodeId);
  }

  #visitLeavesOf(
    visitor: ITreeVisitor<T>,
    nodeId: string = this._rootNodeId
  ): void {
    const childrenIds = this.getDescendantNodeIds(
      nodeId,
      visitor.includeSubtrees
    );

    const leavesOf = childrenIds.filter((childId) => {
      return this.#isLeaf(childId);
    });
    leavesOf.forEach((nodeId) => {
      const parentId = this.getParentNodeId(nodeId);
      const content = this.#getChildContent(nodeId);
      if (content instanceof AbstractTree) {
        content.#visitLeavesOf(visitor);
      } else {
        visitor.visit(nodeId, content, parentId);
      }
    });
  }

  static obfuscatePojo<P>(pojo: TTreePojo<P>): TTreePojo<P> {
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

  public toPojoAt(
    nodeId: string = this.rootNodeId,
    transformer?: transformToPojoType
  ): TTreePojo<T> {
    return this.#toPojo(nodeId, nodeId, transformer);
  }

  #toPojo(
    currentNodeId: string,
    parentNodeId: string,
    transformTtoPojo: transformToPojoType = defaultToPojoTransformer,
    workingPojoDocument: TTreePojo<T> = {}
  ): TTreePojo<T> {
    const nodeContent = this.getChildContentAt(currentNodeId) as T;

    if (nodeContent instanceof AbstractTree) {
      const subtreePojo = nodeContent.toPojoAt(nodeContent.rootNodeId);
      Object.entries(subtreePojo).forEach(([nodeId, nodeContent]) => {
        workingPojoDocument[nodeId] = nodeContent;
      });

      workingPojoDocument[currentNodeId] = {
        nodeType: AbstractTree.SubtreeNodeTypeName,
        nodeContent: nodeContent.getChildContentAt(nodeContent.rootNodeId),
        parentId: parentNodeId,
      };
    } else {
      workingPojoDocument[currentNodeId] = {
        parentId: parentNodeId,
        nodeContent: transformTtoPojo(nodeContent) as unknown as T,
      };

      const children = this.#getChildrenNodeIds(
        currentNodeId,
        AbstractTree.SHOULD_INCLUDE_SUBTREES
      );

      children.forEach((childId) => {
        this.#toPojo(
          childId,
          currentNodeId,
          transformTtoPojo,
          workingPojoDocument
        );
      });
    }

    return workingPojoDocument;
  }
}

export { AbstractTree };

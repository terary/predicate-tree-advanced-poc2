import treeUtils from "./treeUtilities";
import { DirectedGraphError } from "../DirectedGraphError";
import { Incrementor } from "../Incrementor";
import { ITree, ITreeVisitor } from "../ITree";
import type { TNodePojo, TTreePojo, TGenericNodeContent, TGenericNodeType } from "../types";
import { KeyStore } from "../keystore/KeyStore";

const defaultToPojoTransformer = <T>(nodeContent: T) => {
  return nodeContent as unknown as TNodePojo<T>;
};

const defaultFromPojoTransform = <T>(nodeContent: TNodePojo<T>): TGenericNodeContent<T> => {
  return nodeContent.nodeContent;
};

const makeChildrenRegExp = (nodeId: string, delim: string) => {
  return new RegExp("^" + nodeId + delim + "[\\d]+$");
};

const makeDescendantRegExp = (nodeId: string, delim: string, options = "") => {
  return new RegExp("^" + nodeId + delim, options);
};

type transformToPojoType = typeof defaultToPojoTransformer;
abstract class AbstractDirectedGraph<T> implements ITree<T> {
  static EmptyNode = null;
  static SubtreeNodeTypeName = "subtree";
  static SHOULD_INCLUDE_SUBTREES = true;
  protected _nodeDictionary: {
    [nodeId: string]: TGenericNodeType<T>;
  } = {};

  private _nodeKeyDelimiter = ":";
  protected _rootNodeId;
  protected _incrementor = new Incrementor();

  constructor(rootNodeId = "_root_", nodeContent?: T) {
    this._rootNodeId = rootNodeId;
    if (nodeContent === undefined) {
      this.#setNodeContentByNodeId(this._rootNodeId, AbstractDirectedGraph.EmptyNode);
    } else {
      this._nodeDictionary[this._rootNodeId] = { nodeContent };
    }
  }

  public appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<T>
  ): string {
    return this.#appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  protected fromPojoAppendChildNodeWithContent(
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

  public cloneAt(nodeId: string): ITree<T> {
    const pojo = this.toPojoAt(nodeId);
    return AbstractDirectedGraph.fromPojo(pojo, defaultFromPojoTransform);
  }

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

  public countTotalNodes(nodeId: string = this.rootNodeId, shouldIncludeSubtrees = true) {
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
      return AbstractDirectedGraph.EmptyNode;
    }

    return this._nodeDictionary[nodeId].nodeContent;
  }

  public getChildrenNodeIdsOf(parentNodeId: string, shouldIncludeSubtrees = false): string[] {
    return this.#getChildrenNodeIds(parentNodeId, shouldIncludeSubtrees);
  }

  #getChildrenNodeIds(parentNodeId: string, shouldIncludeSubtrees = false): string[] {
    const childRegExp = makeChildrenRegExp(parentNodeId, this._nodeKeyDelimiter);
    if (shouldIncludeSubtrees) {
      return this.filterIds((nodeId) => childRegExp.test(nodeId));
    } else {
      return this.filterIds((nodeId) => childRegExp.test(nodeId) && !this.isSubtree(nodeId));
    }
  }

  public getCountTotalNodes() {
    return Object.keys(this._nodeDictionary).length;
  }

  #getContentItems(nodeIds: string[]): (ITree<T> | T | null)[] {
    return nodeIds.map((childNodeId) => {
      const content = this.#getChildContent(childNodeId);
      if (content instanceof AbstractDirectedGraph) {
        const subtreeRootNodeId = (content as AbstractDirectedGraph<any>).rootNodeId;
        return (content as AbstractDirectedGraph<any>).#getChildContent(subtreeRootNodeId);
      }
      return content;
    });
  }

  public getChildrenContentOf(
    parentNodeId: string,
    shouldIncludeSubtrees = false
  ): (ITree<T> | T | null)[] {
    const childrenNodeIds = this.#getChildrenNodeIds(parentNodeId, shouldIncludeSubtrees);
    return this.#getContentItems(childrenNodeIds);
  }

  public getDescendantContentOf(
    parentNodeId: string,
    shouldIncludeSubtrees = false
  ): TGenericNodeContent<T>[] {
    this.#nodeIdExistsOrThrow(parentNodeId);
    const descendantIds = this.getDescendantNodeIds(parentNodeId, shouldIncludeSubtrees);
    const descendantContent: TGenericNodeContent<T>[] = [];

    descendantIds.forEach((key) => {
      const nodeContent = this.#getChildContent(key);
      if (nodeContent instanceof AbstractDirectedGraph) {
        const nodeContentAsAbstract = nodeContent as AbstractDirectedGraph<T>;
        descendantContent.push(
          ...nodeContentAsAbstract.getTreeContentAt(nodeContentAsAbstract.rootNodeId)
        );
      } else {
        descendantContent.push(nodeContent);
      }
    });

    return descendantContent;
  }

  public getDescendantNodeIds(parentNodeId: string, shouldIncludeSubtrees = false): string[] {
    const descendantsRegExp = makeDescendantRegExp(parentNodeId, this._nodeKeyDelimiter);

    if (shouldIncludeSubtrees) {
      return this.filterIds((nodeId) => descendantsRegExp.test(nodeId));
    } else {
      return this.filterIds(
        (nodeId) => descendantsRegExp.test(nodeId) && !this.isSubtree(nodeId)
      );
    }
  }

  #getNextChildNodeId(parentNodeId: string) {
    const childNodeId = [parentNodeId, this._incrementor.next].join(this._nodeKeyDelimiter);
    return childNodeId;
  }

  /**
   * The tricky bit here is that the  subtree._rootNodeId
   * must be the same as parent's node.nodeId
   * @param targetParentNodeId
   * @returns
   */
  public createSubtreeAt(parentNodeId: string): ITree<T> {
    // can we rethink this.  Is there a better way?
    // @ts-ignore - not newable, I believe ok in javascript, not ok in typescript
    const subtree = new this.constructor(parentNodeId) as typeof this;

    const subtreeParentNodeId = this.#appendChildNodeWithContent(
      parentNodeId,
      subtree as unknown as ITree<T>
    );

    subtree._rootNodeId = subtreeParentNodeId;
    subtree._nodeDictionary = {};
    subtree._nodeDictionary[subtree._rootNodeId] = { nodeContent: null };
    subtree._incrementor = this._incrementor;

    return subtree;
  }

  public getParentNodeId(nodeId: string): string {
    return this.#getParentNodeId(nodeId);
  }

  #getParentNodeId(nodeId: string): string {
    if (nodeId === this._rootNodeId) {
      return this._rootNodeId;
    }

    if (!nodeId) {
      throw new DirectedGraphError(`Could not derive parent nodeId from '${nodeId}'.`);
    }

    let parentNodeId = "";
    parentNodeId = nodeId
      .split(this._nodeKeyDelimiter)
      .slice(0, -1)
      .join(this._nodeKeyDelimiter);

    if (parentNodeId === "") {
      throw new DirectedGraphError(`Could not derive parent nodeId from '${nodeId}'.`);
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

  public getTreeContentAt(nodeId: string = this.rootNodeId, shouldIncludeSubtrees = false) {
    if (this.nodeIdExists(nodeId)) {
      const descendContent = this.getDescendantContentOf(nodeId, shouldIncludeSubtrees);
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
    return this.filterIds((nodeId) => childRegExp.test(nodeId) && !this.isSubtree(nodeId));
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
    return this.getChildContentAt(nodeId) instanceof AbstractDirectedGraph;
  }

  /**
   * sourceNode becomes child of targetNode
   * children of sourceNode become grandchildren of target
   * @param sourceNodeId
   * @param targetNodeId
   */
  public move(sourceNodeId: string, targetNodeId: string): { from: string; to: string }[] {
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
      throw new Error("CUSTOM ERROR - can not remove root node");
    }
    const treeIds = this.#getTreeNodeIdsAt(nodeId);
    treeIds.forEach((childId) => {
      this.removeSingleNode(childId); // using this?
    });
  }

  public removeSingleNode(nodeId: string): void {
    delete this._nodeDictionary[nodeId];
  }

  public replaceNodeContent(nodeId: string, nodeContent: TGenericNodeContent<T>): void {
    this.#replaceNodeContent(nodeId, nodeContent);
  }

  #replaceNodeContent(nodeId: string, nodeContent: TGenericNodeContent<T>): void {
    if (this.isRoot(nodeId) && nodeContent instanceof AbstractDirectedGraph) {
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

  public visitAllAt(visitor: ITreeVisitor<T>, nodeId: string = this.rootNodeId): void {
    const parentNodeId = nodeId;
    this.#visitAllAt(visitor, nodeId, parentNodeId);
  }

  #visitAllAt(
    visitor: ITreeVisitor<T>,
    nodeId: string = this._rootNodeId,
    parentNodeId: string = this._rootNodeId
  ): void {
    const childrenIds = this.#getChildrenNodeIds(nodeId, visitor.includeSubtrees);
    const content = this.#getChildContent(nodeId);

    if (visitor.includeSubtrees && content instanceof AbstractDirectedGraph) {
      content.#visitAllAt(visitor);
    } else {
      // this.visitNode(visitor, nodeId, content, parentNodeId);
      visitor.visit(nodeId, content, parentNodeId);
    }

    childrenIds.forEach((childId) => {
      this.#visitAllAt(visitor, childId, nodeId);
    });
  }

  public visitLeavesOf(visitor: ITreeVisitor<T>, nodeId: string = this._rootNodeId): void {
    this.#visitLeavesOf(visitor, nodeId);
  }

  #visitLeavesOf(visitor: ITreeVisitor<T>, nodeId: string = this._rootNodeId): void {
    const childrenIds = this.getDescendantNodeIds(nodeId, visitor.includeSubtrees);

    const leavesOf = childrenIds.filter((childId) => {
      return this.#isLeaf(childId);
    });
    leavesOf.forEach((nodeId) => {
      const parentId = this.getParentNodeId(nodeId);
      const content = this.#getChildContent(nodeId);
      if (content instanceof AbstractDirectedGraph) {
        content.#visitLeavesOf(visitor);
      } else {
        visitor.visit(nodeId, content, parentId);
      }
    });
  }

  static #fromPojoTraverseAndExtractChildren = <T>(
    treeParentId: string,
    jsonParentId: string,
    dTree: ITree<T>,
    treeObject: TTreePojo<T>,
    transformer: (nodePojo: TNodePojo<T>) => TGenericNodeContent<T>
  ): void => {
    const childrenNodes = treeUtils.extractChildrenNodes<T>(jsonParentId, treeObject);

    Object.entries(childrenNodes).forEach(([nodeId, nodePojo]) => {
      if (nodePojo.nodeType === AbstractDirectedGraph.SubtreeNodeTypeName) {
        const subtree = dTree.createSubtreeAt(treeParentId);
        subtree.replaceNodeContent(subtree.rootNodeId, transformer(nodePojo));
        AbstractDirectedGraph.#fromPojoTraverseAndExtractChildren(
          subtree.rootNodeId,
          nodeId,
          subtree as ITree<T>,
          treeObject,
          transformer
        );
      } else {
        const childId = (dTree as AbstractDirectedGraph<T>).fromPojoAppendChildNodeWithContent(
          treeParentId,
          transformer(nodePojo)
        );
        AbstractDirectedGraph.#fromPojoTraverseAndExtractChildren(
          childId,
          nodeId,
          dTree,
          treeObject,
          transformer
        );
      }
    });
  };

  public static fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P> = defaultFromPojoTransform
  ): Q {
    return AbstractDirectedGraph.#fromPojo<P, Q>(
      srcPojoTree,
      transform,
      AbstractDirectedGraph as unknown as () => Q
    ) as unknown as Q;
  }

  static #fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (
      nodeContent: TNodePojo<P>
    ) => TGenericNodeContent<P> = defaultFromPojoTransform, // branch coverage complains
    TreeClass: () => Q
  ): Q {
    const pojoObject = { ...srcPojoTree };

    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(pojoObject);

    const rootNodePojo = pojoObject[rootNodeId];

    // @ts-ignore - expression is not newable, I think ok in js, not ts
    const dTree = new TreeClass<P>(); // as AbstractDirectedGraph<T>;

    dTree.replaceNodeContent(dTree.rootNodeId, transform(rootNodePojo));
    delete pojoObject[rootNodeId];

    AbstractDirectedGraph.#fromPojoTraverseAndExtractChildren(
      dTree._rootNodeId,
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

    if (nodeContent instanceof AbstractDirectedGraph) {
      const subtreePojo = nodeContent.toPojoAt(nodeContent.rootNodeId);
      Object.entries(subtreePojo).forEach(([nodeId, nodeContent]) => {
        workingPojoDocument[nodeId] = nodeContent;
      });

      workingPojoDocument[currentNodeId] = {
        nodeType: AbstractDirectedGraph.SubtreeNodeTypeName,
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
        AbstractDirectedGraph.SHOULD_INCLUDE_SUBTREES
      );

      children.forEach((childId) => {
        this.#toPojo(childId, currentNodeId, transformTtoPojo, workingPojoDocument);
      });
    }

    return workingPojoDocument;
  }
}

export { AbstractDirectedGraph };

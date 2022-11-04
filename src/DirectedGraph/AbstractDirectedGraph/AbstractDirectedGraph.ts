import treeUtils from "./treeUtilities";
import { DirectedGraphError } from "../DirectedGraphError";
import { Incrementor } from "../Incrementor";
import { ITree, ITreeVisitor } from "../ITree";
import type { TNodePojo, TTreePojo, TGenericNodeContent, TGenericNodeType } from "../types";

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
// type InternalNodeType<T> = {
//   nodeContent: T | null | ITree<T>;
// };

// type TGenericNodeContent<T> = null | T | ITree<T>;
// type TGenericNodeType<T> = {
//   nodeContent: TGenericNodeContent<T>;
// };

abstract class AbstractDirectedGraph<T> implements ITree<T> {
  static EmptyNode = null;
  static SubGraphNodeTypeName = "subtree";

  protected _nodeDictionary: {
    [nodeId: string]: TGenericNodeType<T>;
  } = {};

  private _nodeKeyDelimiter = ":";
  protected _rootNodeId;
  protected _incrementor = new Incrementor();

  constructor(rootNodeId = "_root_", nodeContent?: T) {
    this._rootNodeId = rootNodeId;
    if (nodeContent === undefined) {
      this.setNodeContentByNodeId(this._rootNodeId, AbstractDirectedGraph.EmptyNode);
    } else {
      this._nodeDictionary[this._rootNodeId] = { nodeContent };
    }
  }

  // should be private
  public appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<T>
  ): string {
    const nodeId = this._appendChildNodeWithContent(parentNodeId, nodeContent);
    return nodeId;
  }

  public fromPojoAppendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<T>
  ): string {
    return this._appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  protected _appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<T>
  ): string {
    const childNodeId = this.getNextChildNodeId(parentNodeId);
    this._nodeDictionary[childNodeId] = { nodeContent };
    return childNodeId;
  }

  public cloneAt(nodeId: string): ITree<T> {
    const pojo = this.toPojoAt(nodeId);
    return AbstractDirectedGraph.fromPojo(
      pojo,
      defaultFromPojoTransform,
      AbstractDirectedGraph
    );
  }

  public countDescendantsOf(parentNodeId: string = this.rootNodeId) {
    this.nodeIdExistsOrThrow(parentNodeId);
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
    // const subTreeRootKey = this._getNodeKeyByIdOrThrow(subTreeRootId);
    this.getChildContentOrThrow(subTreeRootNodeId);
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

  public countTotalNodes(nodeId: string = this.rootNodeId) {
    return this._getTreeNodeIdsAt(nodeId).length;
  }

  public createSubGraphAt(rootNodeId: string): ITree<T> {
    return AbstractDirectedGraph.createSubgraphAt(rootNodeId, this);
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

  private nodeIdExistsOrThrow(nodeId: string): boolean {
    if (this.nodeIdExists(nodeId)) {
      return true;
    }
    throw new DirectedGraphError(
      `Tried to retrieve node that does not exist. nodeId: "${nodeId}".`
    );
  }

  private getChildContentOrThrow(nodeId: string) {
    if (this._nodeDictionary[nodeId] === undefined) {
      throw new DirectedGraphError(
        `Tried to retrieve node that does not exist. nodeId: "${nodeId}".`
      );
    }
    return this._getChildContent(nodeId);
  }

  public getChildContentAt(nodeId: string): ITree<T> | T | null {
    // alias because extended class will redefine (eg use Key, not Id)
    return this._getChildContent(nodeId);
  }

  private _getChildContent(nodeId: string): ITree<T> | T | null {
    // node should ALWAYS have nodeContent
    // should NEVER be null
    // nodeContent can be set to null

    if (this._nodeDictionary[nodeId] === undefined) {
      return AbstractDirectedGraph.EmptyNode;
    }

    return this._nodeDictionary[nodeId].nodeContent;
  }

  public getChildrenNodeIdsOf(parentNodeId: string, shouldIncludeSubtrees = false): string[] {
    return this._getChildrenNodeIds(parentNodeId, shouldIncludeSubtrees);
  }

  private _getChildrenNodeIds(parentNodeId: string, shouldIncludeSubtrees = false): string[] {
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

  // private getContentItems(nodeIds: string[]): (ITree<T> | T | null)[] {
  //   return this._getContentItems(nodeIds);
  // }

  private _getContentItems(nodeIds: string[]): (ITree<T> | T | null)[] {
    return nodeIds.map((childNodeId) => {
      const content = this._getChildContent(childNodeId);
      if (content instanceof AbstractDirectedGraph) {
        const subtreeRootNodeId = (content as AbstractDirectedGraph<any>).rootNodeId;
        return (content as AbstractDirectedGraph<any>)._getChildContent(subtreeRootNodeId);
      }

      return content;
      // return this._getChildContent(childNodeId);
    });
  }

  public getChildrenContentOf(
    parentNodeId: string,
    shouldIncludeSubtrees = false
  ): (ITree<T> | T | null)[] {
    let childrenNodeIds = this._getChildrenNodeIds(parentNodeId, shouldIncludeSubtrees);
    return this._getContentItems(childrenNodeIds);
  }

  public getDescendantContentOf(
    parentNodeId: string,
    shouldIncludeSubtrees = false
  ): TGenericNodeContent<T>[] {
    this.nodeIdExistsOrThrow(parentNodeId);
    const descendantIds = this.getDescendantNodeIds(parentNodeId, shouldIncludeSubtrees);
    const descendantContent: TGenericNodeContent<T>[] = [];

    descendantIds.forEach((key) => {
      const nodeContent = this._getChildContent(key);
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

  //
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

  protected getNextChildNodeId(parentNodeId: string) {
    const childNodeId = [parentNodeId, this._incrementor.next].join(this._nodeKeyDelimiter);
    return childNodeId;
  }

  private getNewInstance(rootNodeId: string) {
    // used by createSubGraph to be flexible with actual constructor type

    // can we rethink this.  Is there a better way?
    // @ts-ignore - not newable, I believe ok in javascript, not ok in typescript
    return new this.constructor(rootNodeId) as typeof this;
  }

  public getParentNodeId(nodeId: string): string {
    return this._getParentNodeId(nodeId);
  }

  private _getParentNodeId(nodeId: string): string {
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

    const parentNodeId = this._getParentNodeId(nodeId);
    const childrenIds = this._getChildrenNodeIds(parentNodeId);

    const index = childrenIds.indexOf(nodeId);
    /* istanbul ignore next - likely unnecessary check */
    if (index > -1) {
      // only splice array when item is found, and it should always be found.
      childrenIds.splice(index, 1);
    }

    return childrenIds;
  }

  public getSubgraphIdsAt(nodeId: string = this.rootNodeId) {
    const allNodeIds = this.getDescendantNodeIds(nodeId, true);
    const self = this;
    return allNodeIds.filter((nodeId: string) => {
      return self.isSubtree(nodeId);
    });
  }

  public getTreeContentAt(nodeId: string, shouldIncludeSubtrees = false) {
    if (this.nodeIdExists(nodeId)) {
      const descendContent = this.getDescendantContentOf(nodeId, shouldIncludeSubtrees);
      descendContent.push(this.getChildContentAt(nodeId));
      return descendContent;
    }
    return [];
  }

  public getTreeNodeIdsAt(nodeId: string) {
    return this._getTreeNodeIdsAt(nodeId);
  }

  public _getTreeNodeIdsAt(nodeId: string, shouldIncludeSubtrees = false) {
    // doesn't make sense to 'shouldIncludeSubtrees' subtree ids are not valid
    // in parent tree
    const childRegExp = makeDescendantRegExp(nodeId, "");
    return this.filterIds((nodeId) => childRegExp.test(nodeId) && !this.isSubtree(nodeId));
  }

  public isBranch(nodeId: string): boolean {
    return this.getDescendantNodeIds(nodeId).length > 0;
  }

  public isLeaf(nodeId: string): boolean {
    return this._isLeaf(nodeId);
  }

  private _isLeaf(nodeId: string): boolean {
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
    const newChildId = this.getNextChildNodeId(targetNodeId);

    const subtreeIds = this._getTreeNodeIdsAt(sourceNodeId);

    const mapFromTo = subtreeIds.map((descKey) => {
      return { from: descKey, to: descKey.replace(sourceNodeId, newChildId) };
    });

    mapFromTo.forEach(({ from, to }) => {
      this.moveNode(from, to);
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
    const descendantKeys = this.getDescendantNodeIds(sourceNodeId);

    const mapFromTo = descendantKeys.map((descKey) => {
      return { from: descKey, to: descKey.replace(sourceNodeId, targetNodeId) };
    });

    mapFromTo.forEach(({ from, to }) => {
      this.moveNode(from, to);
    });
    return mapFromTo;
  }

  private moveNode(fromNodeId: string, toNodeId: string) {
    // *tmc* think "moveNode" is not very good name
    this.setNodeContentByNodeId(toNodeId, this._getChildContent(fromNodeId));
    // this.removeNodeContent(fromNodeId);
    this.removeSingleNode(fromNodeId);
  }

  public removeNodeAt(nodeId: string): void {
    if (this.isRoot(nodeId)) {
      throw new Error("CUSTOM ERROR - can not remove root node");
    }
    const treeIds = this._getTreeNodeIdsAt(nodeId);
    treeIds.forEach((childId) => {
      this.removeSingleNode(childId); // using this?
    });
  }

  public removeSingleNode(nodeId: string): void {
    delete this._nodeDictionary[nodeId];
  }

  public replaceNodeContent(nodeId: string, nodeContent: TGenericNodeContent<T>): void {
    this._replaceNodeContent(nodeId, nodeContent);
  }

  protected _replaceNodeContent(nodeId: string, nodeContent: TGenericNodeContent<T>): void {
    if (this.isRoot(nodeId) && nodeContent instanceof AbstractDirectedGraph) {
      throw new DirectedGraphError(`Can not replace root with subgraph.`);
    }

    this._nodeDictionary[nodeId] = { nodeContent };
  }

  get rootNodeId() {
    return this._rootNodeId;
  }

  protected setNodeContentByNodeId(nodeId: string, nodeContent: TGenericNodeContent<T>) {
    this._nodeDictionary[nodeId] = { nodeContent };
  }

  public visitAllAt(visitor: ITreeVisitor<T>, nodeId: string = this.rootNodeId): void {
    const parentNodeId = nodeId;
    this._visitAllAt(visitor, nodeId, parentNodeId);
  }

  public _visitAllAt(
    visitor: ITreeVisitor<T>,
    nodeId: string = this._rootNodeId,
    parentNodeId: string = this._rootNodeId
  ): void {
    const childrenIds = this.getChildrenNodeIdsOf(nodeId, visitor.includeSubtrees);
    const content = this._getChildContent(nodeId); // .getContentAt(nodeId);

    if (visitor.includeSubtrees && content instanceof AbstractDirectedGraph) {
      content._visitAllAt(visitor);
    } else {
      visitor.visit(nodeId, content, parentNodeId);
    }

    childrenIds.forEach((childId) => {
      this._visitAllAt(visitor, childId, nodeId);
    });
  }

  public visitLeavesOf(visitor: ITreeVisitor<T>, nodeId: string = this._rootNodeId): void {
    this._visitLeavesOf(visitor, nodeId);
  }

  public _visitLeavesOf(visitor: ITreeVisitor<T>, nodeId: string = this._rootNodeId): void {
    const childrenIds = this.getDescendantNodeIds(nodeId, visitor.includeSubtrees);

    const leavesOf = childrenIds.filter((childId) => {
      return this._isLeaf(childId);
    });
    leavesOf.forEach((nodeId) => {
      const parentId = this.getParentNodeId(nodeId);
      const content = this._getChildContent(nodeId);
      if (content instanceof AbstractDirectedGraph) {
        content._visitLeavesOf(visitor);
      } else {
        visitor.visit(nodeId, content, parentId);
      }
    });
  }

  protected static createSubgraphAt<T>(
    nodeId: string,
    parentGraph: AbstractDirectedGraph<T>
  ): ITree<T> {
    const subgraph = parentGraph.getNewInstance(nodeId);
    const subgraphParentNodeId = parentGraph._appendChildNodeWithContent(
      nodeId,
      subgraph as unknown as ITree<T>
    );

    subgraph._rootNodeId = subgraphParentNodeId;
    subgraph._nodeDictionary = {};
    subgraph._nodeDictionary[subgraph._rootNodeId] = { nodeContent: null };
    subgraph._incrementor = parentGraph._incrementor;

    return subgraph as unknown as ITree<T>;
  }

  private static fromPojoTraverseAndExtractChildren = <T>(
    treeParentId: string,
    jsonParentId: string,
    dTree: ITree<T>,
    treeObject: TTreePojo<T>,
    transformer: (nodePojo: TNodePojo<T>) => TGenericNodeContent<T>
  ): void => {
    const childrenNodes = treeUtils.extractChildrenNodes<T>(jsonParentId, treeObject);

    Object.entries(childrenNodes).forEach(([nodeId, nodePojo]) => {
      if (nodePojo.nodeType === AbstractDirectedGraph.SubGraphNodeTypeName) {
        const subtree = dTree.createSubGraphAt(treeParentId);
        subtree.replaceNodeContent(subtree.rootNodeId, transformer(nodePojo));
        AbstractDirectedGraph.fromPojoTraverseAndExtractChildren(
          subtree.rootNodeId,
          nodeId,
          subtree as ITree<T>,
          treeObject,
          transformer
        );
      } else {
        const childId = dTree.fromPojoAppendChildNodeWithContent(
          treeParentId,
          transformer(nodePojo)
        );
        AbstractDirectedGraph.fromPojoTraverseAndExtractChildren(
          childId,
          nodeId,
          dTree,
          treeObject,
          transformer
        );
      }
    });
  };

  static fromPojo<T>(
    srcPojoTree: TTreePojo<T>,
    transform = defaultFromPojoTransform,
    TreeClass: Function // () => ITree<T>
  ): ITree<T> {
    const pojoObject = { ...srcPojoTree };

    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(pojoObject);

    const rootNodePojo = pojoObject[rootNodeId];

    // @ts-ignore - expression is not newable, I think ok in js, not ts
    const dTree = new TreeClass<T>(); // as AbstractDirectedGraph<T>;

    dTree.replaceNodeContent(dTree.rootNodeId, transform(rootNodePojo));
    delete pojoObject[rootNodeId];

    AbstractDirectedGraph.fromPojoTraverseAndExtractChildren(
      dTree.rootNodeId, // rootNodeId -
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

  public toPojo(): TTreePojo<T> {
    return this._toPojo();
  }

  public toPojoAt(nodeId: string, transformer?: transformToPojoType): TTreePojo<T> {
    return this._toPojo(nodeId, nodeId, transformer);
  }

  protected _toPojo(
    currentNodeId = this.rootNodeId,
    parentNodeId = this.rootNodeId,

    transformTtoPojo: transformToPojoType = defaultToPojoTransformer,
    workingPojoDocument: TTreePojo<T> = {}
  ): TTreePojo<T> {
    const nodeContent = this._getChildContent(currentNodeId) as T;

    if (nodeContent instanceof AbstractDirectedGraph) {
      // here insert the subtree record
      const subtreePojo = nodeContent.toPojo();
      Object.entries(subtreePojo).forEach(([nodeId, nodeContent]) => {
        workingPojoDocument[nodeId] = nodeContent;
      });

      workingPojoDocument[currentNodeId] = {
        nodeType: AbstractDirectedGraph.SubGraphNodeTypeName,
        nodeContent: nodeContent.getChildContentAt(nodeContent.rootNodeId),
        parentId: parentNodeId,
      };
    } else {
      workingPojoDocument[currentNodeId] = {
        parentId: parentNodeId,
        nodeContent: transformTtoPojo(nodeContent) as unknown as T,
      };

      const children = this._getChildrenNodeIds(currentNodeId);
      children.forEach((childId) => {
        this._toPojo(childId, currentNodeId, transformTtoPojo, workingPojoDocument);
      });
    }

    return workingPojoDocument;
  }
}

export { AbstractDirectedGraph };

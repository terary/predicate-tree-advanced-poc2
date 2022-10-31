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
    this.existsOrThrow(parentNodeId);
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
    // return Object.keys(this._nodeDictionary).length;
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

  private existsOrThrow(nodeId: string): boolean {
    if (this._nodeDictionary[nodeId] === undefined) {
      throw new DirectedGraphError(
        `Tried to retrieve node that does not exist. nodeId: "${nodeId}".`
      );
    }
    return true;
  }

  private getChildContentOrThrow(nodeId: string) {
    if (this._nodeDictionary[nodeId] === undefined) {
      throw new DirectedGraphError(
        `Tried to retrieve node that does not exist. nodeId: "${nodeId}".`
      );
    }
    return this._getChildContent(nodeId);
  }

  public getChildContent(nodeId: string): ITree<T> | T | null {
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

  public getChildrenNodeIds(parentNodeId: string): string[] {
    return this._getChildrenNodeIds(parentNodeId);
  }

  private _getChildrenNodeIds(parentNodeId: string): string[] {
    const childRegExp = makeChildrenRegExp(parentNodeId, this._nodeKeyDelimiter);
    return this.filterIds((key) => childRegExp.test(key));
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
      //
      return content;
      // return this._getChildContent(childNodeId);
    });
  }

  public getChildrenContent(parentNodeId: string): (ITree<T> | T | null)[] {
    const childrenNodeIds = this._getChildrenNodeIds(parentNodeId);
    return this._getContentItems(childrenNodeIds);
  }

  public getDescendantContent(parentNodeId: string): TGenericNodeContent<T>[] {
    this.existsOrThrow(parentNodeId);
    const descendantContent: TGenericNodeContent<T>[] = [];
    const descendantsRegExp = makeDescendantRegExp(parentNodeId, this._nodeKeyDelimiter);
    const descendantIds = this.filterIds((key) => descendantsRegExp.test(key));
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
  public getDescendantNodeIds(parentNodeId: string): string[] {
    const descendantsRegExp = makeDescendantRegExp(parentNodeId, this._nodeKeyDelimiter);
    const descendantNodeIds = this.filterIds((key) => descendantsRegExp.test(key));
    return descendantNodeIds;
  }

  protected getNextChildNodeId(parentNodeId: string) {
    const childNodeId = [parentNodeId, this._incrementor.next].join(this._nodeKeyDelimiter);
    return childNodeId;
  }

  private getNewInstance(rootNodeId: string) {
    // used by createSubGraph to be flexible with actual constructor type

    // @ts-ignore - function not constructable
    // can we rethink this.  Is there a better way?
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
      // because root points to itself
      return [];
    }

    const parentNodeId = this._getParentNodeId(nodeId);
    const childrenIds = this._getChildrenNodeIds(parentNodeId);

    const index = childrenIds.indexOf(nodeId);
    if (index > -1) {
      // only splice array when item is found
      childrenIds.splice(index, 1); // 2nd parameter means remove one item only
    }

    return childrenIds;
  }

  public getSubgraphIdsAt(nodeId: string) {
    const allNodeIds = this.getTreeNodeIdsAt(nodeId);
    const self = this;
    return allNodeIds.filter((nodeId: string) => {
      return self.isSubtree(nodeId);
    });
  }

  public getTreeContentAt(nodeId: string) {
    const treeIds = this._getTreeNodeIdsAt(nodeId);
    return this._getContentItems(treeIds);
  }

  public getTreeNodeIdsAt(nodeId: string) {
    return this._getTreeNodeIdsAt(nodeId);
    // const childRegExp = makeDescendantRegExp(nodeId, "");
    // return this.filterIds((key) => childRegExp.test(key));
  }

  public _getTreeNodeIdsAt(nodeId: string) {
    const childRegExp = makeDescendantRegExp(nodeId, "");
    return this.filterIds((key) => childRegExp.test(key));
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
    return this.getChildContent(nodeId) instanceof AbstractDirectedGraph;
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
    this.removeNodeContent(fromNodeId);
  }

  /**
   * sourceNode becomes targetNode
   * @param sourceNodeId
   * @param targetNodeId
   */
  public moveTree(sourceNodeId: string, targetNodeId: string): { from: string; to: string }[] {
    const parentId = this.getParentNodeId(targetNodeId);
    const newChildId = parentId;
    const subtreeIds = this.getTreeNodeIdsAt(sourceNodeId);
    const killList = this.getDescendantNodeIds(targetNodeId);

    const mapFromTo = subtreeIds.map((descKey) => {
      return { from: descKey, to: descKey.replace(sourceNodeId, newChildId) };
    });

    const mapFromToMap = subtreeIds.map((descKey) => {
      return { [descKey]: descKey.replace(sourceNodeId, newChildId) };
    });

    mapFromTo.forEach(({ from, to }) => {
      this.moveNode(from, to);
    });

    killList.forEach((killChild) => {
      this.removeNode(killChild);
    });

    //    this.removeNode(targetNodeId);

    return mapFromTo;
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

  /**
   * @deprecated
   */
  public removeNode(nodeId: string): void {
    this.removeNodeAt(nodeId);
    // const treeIds = this._getTreeNodeIdsAt(nodeId);
    // treeIds.forEach((childId) => {
    //   this.removeSingleNode(childId); // using this?
    // });
  }

  public removeSingleNode(nodeId: string): void {
    delete this._nodeDictionary[nodeId];
  }

  /**
   * @deprecate - use removeNode
   * @param nodeId
   */
  protected removeNodeContent(nodeId: string): void {
    this.removeSingleNode(nodeId);

    // this always removed node, not just nodeContent (nodeContent=null)
    // not sure if this is useful or not.
    // *tmc* remove this function
    // delete this._nodeDictionary[nodeId];
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
    const childrenIds = this.getChildrenNodeIds(nodeId);
    const content = this._getChildContent(nodeId); // .getContentAt(nodeId);

    if (visitor.includeSubtrees && content instanceof AbstractDirectedGraph) {
      content._visitAllAt(visitor);
    } else if (!visitor.includeSubtrees && content instanceof AbstractDirectedGraph) {
      // just ignore it
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
    const childrenIds = this.getDescendantNodeIds(nodeId);

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

  private static traverseAndExtractChildren = <T>(
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
        AbstractDirectedGraph.traverseAndExtractChildren(
          subtree.rootNodeId,
          nodeId,
          subtree as ITree<T>,
          treeObject,
          transformer
        );
      } else {
        const childId = dTree.appendChildNodeWithContent(treeParentId, transformer(nodePojo));
        AbstractDirectedGraph.traverseAndExtractChildren(
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

    // @ts-ignore - new' expression, whose target lacks a construct signature, implicitly has an 'any' type.
    const dTree = new TreeClass<T>(); // as AbstractDirectedGraph<T>;

    dTree.replaceNodeContent(dTree.rootNodeId, transform(rootNodePojo));
    // dTree._replaceNodeContent(dTree._rootNodeId, transform(rootNodePojo));
    delete pojoObject[rootNodeId];

    AbstractDirectedGraph.traverseAndExtractChildren(
      dTree.rootNodeId, // rootNodeId -
      // rootNodeId,
      // dTree.rootNodeId === rootNodeId ? dTree.rootNodeId : rootNodeId,
      // dTree._rootNodeId,
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

      const content = nodeContent.getChildContent(nodeContent.rootNodeId);
      workingPojoDocument[currentNodeId] = {
        nodeType: AbstractDirectedGraph.SubGraphNodeTypeName,
        nodeContent: nodeContent.getChildContent(nodeContent.rootNodeId),
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

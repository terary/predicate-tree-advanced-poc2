import treeUtils from "./treeUtilities";

import { DirectedGraphError } from "../DirectedGraphError";
import { AbstractTree } from "../AbstractTree/AbstractTree";
import { ITree, IDirectedGraph, ITreeVisitor } from "../ITree";
import type { TNodePojo, TTreePojo, TGenericNodeContent } from "../types";

const defaultFromPojoTransform = <T>(nodeContent: TNodePojo<T>): TGenericNodeContent<T> => {
  return nodeContent.nodeContent;
};
abstract class AbstractDirectedGraph<T> extends AbstractTree<T> implements IDirectedGraph<T> {
  public appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<T>
  ): string {
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  public cloneAt(nodeId: string): ITree<T> {
    const pojo = this.toPojoAt(nodeId);
    return AbstractDirectedGraph.fromPojo(pojo, defaultFromPojoTransform);
  }

  /**
   * The tricky bit here is that the  subtree._rootNodeId
   * must be the same as parent's node.nodeId
   * @param targetParentNodeId
   * @returns
   */
  public createSubtreeAt<Q>(parentNodeId: string): IDirectedGraph<T> {
    // can we rethink this.  Is there a better way?
    // @ts-ignore - not newable, I believe ok in javascript, not ok in typescript
    const subtree = new this.constructor(parentNodeId) as typeof this;

    const subtreeParentNodeId = super.appendChildNodeWithContent(
      parentNodeId,
      subtree as unknown as ITree<T>
    );

    subtree._rootNodeId = subtreeParentNodeId;
    subtree._nodeDictionary = {};
    subtree._nodeDictionary[subtree._rootNodeId] = { nodeContent: null };
    subtree._incrementor = this._incrementor;

    return subtree;
  }

  protected fromPojoAppendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<T>
  ): string {
    return this.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  static #fromPojoTraverseAndExtractChildren = <T>(
    treeParentId: string,
    jsonParentId: string,
    dTree: IDirectedGraph<T>,
    treeObject: TTreePojo<T>,
    transformer: (nodePojo: TNodePojo<T>) => TGenericNodeContent<T>
  ): void => {
    const childrenNodes = treeUtils.extractChildrenNodes<T>(
      jsonParentId,
      treeObject
    ) as TTreePojo<T>;

    Object.entries(childrenNodes).forEach(([nodeId, nodePojo]) => {
      if (nodePojo.nodeType === AbstractTree.SubtreeNodeTypeName) {
        const subtree = dTree.createSubtreeAt(treeParentId);
        subtree.replaceNodeContent(subtree.rootNodeId, transformer(nodePojo));
        AbstractDirectedGraph.#fromPojoTraverseAndExtractChildren(
          subtree.rootNodeId,
          nodeId,
          subtree as IDirectedGraph<T>,
          treeObject,
          transformer
        );
      } else {
        const childId = (
          dTree as unknown as AbstractDirectedGraph<T>
        ).fromPojoAppendChildNodeWithContent(treeParentId, transformer(nodePojo));

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
    const dTree = new TreeClass<P>(); // as AbstractTree<T>;

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
}

export { AbstractDirectedGraph };

import treeUtils from "./treeUtilities";

import { DirectedGraphError } from "../DirectedGraphError";
import { AbstractTree } from "../AbstractTree/AbstractTree";
import { ITree, IDirectedGraph, ITreeVisitor } from "../ITree";
import type {
  TNodePojo,
  TTreePojo,
  TGenericNodeContent,
  TFromToMap,
} from "../types";

const defaultFromPojoTransform = <T extends object>(
  nodeContent: TNodePojo<T>
): TGenericNodeContent<T> => {
  return nodeContent.nodeContent;
};

abstract class AbstractDirectedGraph<T extends object>
  extends AbstractTree<T>
  implements IDirectedGraph<T>
{
  public appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<T>
  ): string {
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  public cloneAt(nodeId: string): IDirectedGraph<T> {
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

  static #fromPojoTraverseAndExtractChildren = <T extends object>(
    treeParentId: string,
    jsonParentId: string,
    dTree: IDirectedGraph<T>,
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
        AbstractDirectedGraph.#fromPojoTraverseAndExtractChildren(
          subtree.rootNodeId,
          nodeId,
          subtree as IDirectedGraph<T>,
          treeObject,
          transformer,
          fromToMap
        );
      } else {
        const childId = (
          dTree as unknown as AbstractDirectedGraph<T>
        ).fromPojoAppendChildNodeWithContent(
          treeParentId,
          transformer(nodePojo)
        );
        fromToMap.push({ from: nodeId, to: childId });
        AbstractDirectedGraph.#fromPojoTraverseAndExtractChildren(
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

  protected static getNewInstance<P extends object>(
    rootSeedNodeId?: string,
    nodeContent?: P
  ) {
    // class GenericDirectedGraph extends AbstractDirectedGraph<P> {}

    return new GenericDirectedGraph(rootSeedNodeId, nodeContent);
  }

  public static fromPojo<P extends object, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (
      nodeContent: TNodePojo<P>
    ) => TGenericNodeContent<P> = defaultFromPojoTransform
    //    TreeClassBuilder?: (rootNodeId?: string, nodeContent?: P) => IDirectedGraph<P>
  ): IDirectedGraph<P> {
    return AbstractDirectedGraph.#fromPojo<P, Q>(srcPojoTree, transform);
  }

  static #fromPojo<P extends object, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (
      nodeContent: TNodePojo<P>
    ) => TGenericNodeContent<P> = defaultFromPojoTransform // branch coverage complains
  ): IDirectedGraph<P> {
    const pojoObject = { ...srcPojoTree };

    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(pojoObject);

    const rootNodePojo = pojoObject[rootNodeId];

    // const dTree = TreeClassBuilder("root"); // as AbstractTree<T>;
    const dTree = AbstractDirectedGraph.getNewInstance<P>();
    dTree.replaceNodeContent(dTree.rootNodeId, transform(rootNodePojo));
    delete pojoObject[rootNodeId];

    AbstractDirectedGraph.#fromPojoTraverseAndExtractChildren(
      (dTree as AbstractDirectedGraph<P>)._rootNodeId,
      rootNodeId,
      dTree,
      pojoObject,
      transform
    );

    if (Object.keys(pojoObject).length > 0) {
      throw new DirectedGraphError(
        "Orphan nodes detected while parsing pojo object."
      );
    }
    return dTree;
  }
}
class GenericDirectedGraph<P extends object>
  extends AbstractDirectedGraph<P>
  implements IDirectedGraph<P> {}

export { AbstractDirectedGraph, GenericDirectedGraph };

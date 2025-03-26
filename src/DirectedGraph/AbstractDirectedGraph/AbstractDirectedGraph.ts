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
   * Creates a subtree at the specified node.
   * The subtree will have the same node id as its parent node in the original tree.
   * @param parentNodeId - The ID of the node where the subtree will be created
   * @returns The created subtree with proper typing
   */
  public createSubtreeAt(parentNodeId: string): IDirectedGraph<T> {
    // Create a new instance of the same class
    const subtree = new (this.constructor as new (
      rootNodeId?: string
    ) => AbstractDirectedGraph<T>)(parentNodeId);

    const subtreeParentNodeId = super.appendChildNodeWithContent(
      parentNodeId,
      subtree as ITree<T>
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
      if (
        nodePojo &&
        nodePojo.nodeType && // 'startswith' may lead to issues and it will create 'default' subtree
        nodePojo.nodeType.startsWith(AbstractTree.SubtreeNodeTypeName)
      ) {
        // if (nodePojo.nodeType === AbstractTree.SubtreeNodeTypeName) {
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

  protected static getNewInstance<T extends object>(
    rootSeedNodeId?: string,
    nodeContent?: T
  ) {
    // class GenericDirectedGraph extends AbstractDirectedGraph<P> {}

    return new GenericDirectedGraph(rootSeedNodeId, nodeContent);
  }

  public static fromPojo<T extends object, Q>(
    srcPojoTree: TTreePojo<T>,
    transform: (
      nodeContent: TNodePojo<T>
    ) => TGenericNodeContent<T> = defaultFromPojoTransform
    //    TreeClassBuilder?: (rootNodeId?: string, nodeContent?: P) => IDirectedGraph<P>
  ): IDirectedGraph<T> {
    return AbstractDirectedGraph.#fromPojo<T, Q>(srcPojoTree, transform);
  }

  static #fromPojo<T extends object, Q>(
    srcPojoTree: TTreePojo<T>,
    transform: (
      nodeContent: TNodePojo<T>
    ) => TGenericNodeContent<T> = defaultFromPojoTransform // branch coverage complains
  ): IDirectedGraph<T> {
    const pojoObject = { ...srcPojoTree };

    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(pojoObject);

    const rootNodePojo = pojoObject[rootNodeId];

    // const dTree = TreeClassBuilder("root"); // as AbstractTree<T>;
    const dTree = AbstractDirectedGraph.getNewInstance<T>();
    dTree.replaceNodeContent(dTree.rootNodeId, transform(rootNodePojo));
    delete pojoObject[rootNodeId];

    AbstractDirectedGraph.#fromPojoTraverseAndExtractChildren(
      (dTree as AbstractDirectedGraph<T>)._rootNodeId,
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
class GenericDirectedGraph<T extends object>
  extends AbstractDirectedGraph<T>
  implements IDirectedGraph<T> {}

export { AbstractDirectedGraph, GenericDirectedGraph };

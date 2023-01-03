import { AbstractExpressionTree } from "../../src";
import treeUtils from "../../src/DirectedGraph/AbstractDirectedGraph/treeUtilities";
import { DirectedGraphError } from "../../src/DirectedGraph";
import { IExpressionTree } from "../../src/DirectedGraph/ITree";
import { AddressTree } from "./JsPredicateTree/AddressTree";
import { TPredicateTypes, TPredicateNodeTypesOrNull } from "./types";
import type {
  TFromToMap,
  // TGenericNodeContent,
  TNodePojo,
  TTreePojo,
} from "../../src/DirectedGraph/types";
import { AbstractTree } from "../../src/DirectedGraph/AbstractTree/AbstractTree";
import { JsPredicateTree } from "./JsPredicateTree/JsPredicateTree";

const defaultFromPojoTransform = <P>(
  nodeContent: TNodePojo<P>
): TPredicateNodeTypesOrNull => {
  return nodeContent.nodeContent as unknown as TPredicateNodeTypesOrNull;
};

abstract class AbstractExpressionFactory extends AbstractExpressionTree<TPredicateTypes> {
  static createExpressionTree(
    rootSeedNodeId?: string,
    nodeContent?: TPredicateNodeTypesOrNull
  ): IExpressionTree<TPredicateTypes> {
    const { operator } =
      nodeContent && "operator" in nodeContent
        ? nodeContent
        : { operator: "_ANY_" };
    switch (operator) {
      case "$addressTree":
        // @ts-ignore - some how this is inherit ITree, ???
        return AddressTree.getNewInstance<TPredicateNodeTypesOrNull>(
          rootSeedNodeId,
          nodeContent
        );

      default:
        return new JsPredicateTree(rootSeedNodeId, nodeContent);
    }
  }

  private static createSubtreeFromPojo(
    srcPojoTree: TTreePojo<TPredicateTypes>,
    rootPojoKey: string,
    parentNodePojo: TNodePojo<TPredicateTypes>,
    rootSeedNodeId?: string,
    transform?: (
      nodeContent: TNodePojo<TPredicateTypes> // is this Q necessary?
    ) => TPredicateNodeTypesOrNull
  ): IExpressionTree<TPredicateTypes> | null {
    const { nodeContent } = parentNodePojo as any; // transform
    const operator =
      "operator" in nodeContent ? nodeContent.operator : "_NO_OP_";

    // this should be done by parent class?
    parentNodePojo.parentId = rootPojoKey;
    srcPojoTree[rootPojoKey] = parentNodePojo;
    switch (operator) {
      case "$addressTree":
        // @ts-ignore - types just broken
        return AddressTree.fromPojo<TPredicateTypes, AddressTree>(
          srcPojoTree,
          transform
        ) as IExpressionTree<TPredicateTypes>;

      default:
        return JsPredicateTree.fromPojo<TPredicateTypes, JsPredicateTree>(
          srcPojoTree
        );
    }

    return null;
  }

  static getNewInstance<P extends object>(
    rootSeedNodeId?: string,
    nodeContent?: P
  ): IExpressionTree<P>;
  static getNewInstance(
    rootSeedNodeId?: string,
    nodeContent?: TPredicateNodeTypesOrNull
  ): IExpressionTree<TPredicateTypes> {
    return AbstractExpressionFactory.createExpressionTree(
      rootSeedNodeId,
      nodeContent // as unknown as TPredicateTypes
    ) as unknown as IExpressionTree<TPredicateTypes>;
  }

  static createSubtreeAt(
    targetTree: AbstractExpressionFactory,
    targetNodeId: string,
    subtreeRootNodeContent: AbstractExpressionFactory | null
  ): IExpressionTree<TPredicateTypes> {
    const subtree =
      subtreeRootNodeContent ??
      (targetTree.getNewInstance() as AbstractExpressionFactory);
    const subtreeParentNodeId = targetTree.appendChildNodeWithContent(
      targetNodeId,
      subtree
    );

    AbstractExpressionTree.reRootTreeAt(
      subtree,
      subtree.rootNodeId,
      subtreeParentNodeId
    );
    subtree._rootNodeId = subtreeParentNodeId;
    subtree._incrementor = targetTree._incrementor;

    return subtree as IExpressionTree<TPredicateTypes>;
  }

  static fromPojo<P extends object, Q>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => P
  ): IExpressionTree<P>;
  static fromPojo(
    srcPojoTree: TTreePojo<TPredicateTypes>,
    transform?: (
      nodeContent: TNodePojo<TPredicateTypes>
    ) => TPredicateNodeTypesOrNull
  ): IExpressionTree<TPredicateTypes> {
    return AbstractExpressionFactory.#fromPojo(srcPojoTree, transform);
  }

  static #fromPojo(
    srcPojoTree: TTreePojo<TPredicateTypes>,
    transform: (
      nodeContent: TNodePojo<TPredicateTypes>
    ) => TPredicateNodeTypesOrNull = defaultFromPojoTransform // branch coverage complains
  ): IExpressionTree<TPredicateTypes> {
    const pojoObject = { ...srcPojoTree };

    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(pojoObject);
    const rootNodePojo = pojoObject[rootNodeId];
    const dTree = AbstractExpressionFactory.getNewInstance("root");

    dTree.replaceNodeContent(dTree.rootNodeId, transform(rootNodePojo));
    delete pojoObject[rootNodeId];

    AbstractExpressionFactory.#fromPojoTraverseAndExtractChildren(
      // @ts-ignore - _rootNodeId is visible only to AbstractExpressionTree
      (dTree as AbstractExpressionTree<P>)._rootNodeId,
      rootNodeId,
      // @ts-ignore P is not assignable to TPredicateType
      dTree,
      pojoObject,
      transform
    );

    if (Object.keys(pojoObject).length > 0) {
      throw new DirectedGraphError(
        "Orphan nodes detected while parson pojo object."
      );
    }

    return dTree as IExpressionTree<TPredicateTypes>;
  }

  static #fromPojoTraverseAndExtractChildren(
    treeParentId: string,
    jsonParentId: string,
    dTree: IExpressionTree<TPredicateTypes>,
    treeObject: TTreePojo<TPredicateTypes>,
    transformer: (
      nodePojo: TNodePojo<TPredicateTypes>
    ) => TPredicateNodeTypesOrNull,
    fromToMap: TFromToMap[] = []
  ): TFromToMap[] {
    const childrenNodes = treeUtils.extractChildrenNodes<TPredicateTypes>(
      jsonParentId,
      treeObject
    ) as TTreePojo<TPredicateTypes>;

    Object.entries(childrenNodes).forEach(([nodeId, nodePojo]) => {
      if (nodePojo.nodeType === AbstractTree.SubtreeNodeTypeName) {
        const yTree = AbstractExpressionFactory.createSubtreeFromPojo(
          treeObject,
          nodeId,
          nodePojo,
          "_subtree_",
          transformer
        );
        AbstractExpressionFactory.createSubtreeAt(
          // @ts-ignore - dTree not IExpressionTree
          dTree,
          treeParentId,
          yTree
        );
      } else {
        const childId = (dTree as unknown as AbstractExpressionFactory)
          // @ts-ignore - transformer
          .fromPojoAppendChildNodeWithContent(
            treeParentId,
            transformer(nodePojo)
          );

        fromToMap.push({ from: nodeId, to: childId });
        AbstractExpressionFactory.#fromPojoTraverseAndExtractChildren(
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
  }
}

export { AbstractExpressionFactory };

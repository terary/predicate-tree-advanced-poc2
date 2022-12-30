import { AbstractExpressionTree } from "../../src";
import { GenericExpressionTree } from "../../src/DirectedGraph/AbstractExpressionTree/AbstractExpressionTree";
import { ExpressionTreeError } from "../../src/DirectedGraph/AbstractExpressionTree/ExpressionTreeError";
import treeUtils from "../../src/DirectedGraph/AbstractDirectedGraph/treeUtilities";
import { DirectedGraphError } from "../../src/DirectedGraph";
import { IExpressionTree } from "../../src/DirectedGraph/ITree";
import { AddressTree } from "./JsPredicateTree/AddressTree";
import { TPredicateNodeTypes, TPredicateTypes } from "./types";
import type {
  TFromToMap,
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
} from "../../src/DirectedGraph/types";
import { AbstractTree } from "../../src/DirectedGraph/AbstractTree/AbstractTree";
import { JsPredicateTree } from "./JsPredicateTree/JsPredicateTree";

const defaultFromPojoTransform = <P>(nodeContent: TNodePojo<P>): TGenericNodeContent<P> => {
  return nodeContent.nodeContent;
};

abstract class AbstractExpressionFactory extends AbstractExpressionTree<TPredicateTypes> {
  static createExpressionTree(
    rootSeedNodeId?: string,
    nodeContent?: TPredicateTypes
  ): IExpressionTree<TPredicateTypes> {
    const { operator } = nodeContent ? nodeContent : { operator: "_ANY_" };
    switch (operator) {
      case "$addressTree":
        return AddressTree.getNewInstance_typed(rootSeedNodeId, nodeContent);
        break;

      default:
        return new JsPredicateTree(rootSeedNodeId, nodeContent);
        break;
    }
  }

  private static createSubtreeFromPojo<TPredicateTypes>(
    srcPojoTree: TTreePojo<TPredicateTypes>,
    rootPojoKey: string,
    parentNodePojo: TNodePojo<TPredicateTypes>,
    rootSeedNodeId?: string,
    transform?: (
      nodeContent: TNodePojo<TPredicateTypes>
    ) => TGenericNodeContent<TPredicateTypes>
  ): IExpressionTree<TPredicateTypes> {
    const { nodeContent } = parentNodePojo as any; // transform
    const operator = "operator" in nodeContent ? nodeContent.operator : "_NO_OP_";

    // this should be done by parent class?
    parentNodePojo.parentId = rootPojoKey;
    // const parentNode = { ...srcPojoTree, ...{ [rootPojoKey]: parentNodePojo } };
    srcPojoTree[rootPojoKey] = parentNodePojo;
    switch (operator) {
      case "$addressTree":
        // @ts-ignore
        const a = AddressTree.fromPojo<TPredicateTypes, AddressTree>(srcPojoTree, transform);
        // @ts-ignore
        return a as IExpressionTree<TPredicateTypes>;
        // return AddressTree.getNewInstance_typed(rootSeedNodeId, nodeContent);
        break;

      default:
        // @ts-ignore
        return new JsPredicateTree.fromPojo(parentNode);
        break;
    }
    // @ts-ignore
    return null;
  }

  static getNewInstance(
    rootSeedNodeId?: string | undefined,
    nodeContent?: TPredicateTypes | undefined
  ): IExpressionTree<TPredicateTypes> {
    return AbstractExpressionFactory.createExpressionTree(rootSeedNodeId, nodeContent);
  }

  static createSubtreeAt<Q = GenericExpressionTree>(
    targetTree: AbstractExpressionFactory,
    targetNodeId: string,
    subtreeRootNodeContent: TPredicateTypes
  ): Q {
    const subtree = AbstractExpressionFactory.getNewInstance_typed(
      targetNodeId,
      subtreeRootNodeContent
    );
    AbstractExpressionTree.createSubtreeAt_x(
      targetTree,
      targetNodeId,
      subtree as AbstractExpressionTree<TPredicateTypes>
    );
    return subtree as unknown as Q;
  }

  static getNewInstance_typed(
    rootSeedNodeId?: string,
    nodeContent?: TPredicateTypes
  ): IExpressionTree<TPredicateTypes> {
    return new GenericExpressionTree(
      rootSeedNodeId,
      nodeContent
    ) as unknown as IExpressionTree<TPredicateTypes>;
  }

  static fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): IExpressionTree<P> {
    return AbstractExpressionFactory.#fromPojo(srcPojoTree, transform);
  }

  static #fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P> = defaultFromPojoTransform // branch coverage complains
  ): IExpressionTree<P> {
    const pojoObject = { ...srcPojoTree };

    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(pojoObject);
    const rootNodePojo = pojoObject[rootNodeId];
    const dTree = AbstractExpressionFactory.getNewInstance("root");

    // 'P' is not assignable to type 'TGenericNodeContent<TPredicateTypes>'
    // 'P' is not assignable to type 'ITree<TPredicateTypes>'
    // @ts-ignore
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
      throw new DirectedGraphError("Orphan nodes detected while parson pojo object.");
    }

    // @ts-ignore - not an IExpressionTree
    return dTree;
  }

  static #fromPojoTraverseAndExtractChildren = <T>(
    treeParentId: string,
    jsonParentId: string,
    dTree: IExpressionTree<T>,
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
        // const subtree = dTree.createSubtreeAt(treeParentId);
        const yTree = AbstractExpressionFactory.createSubtreeFromPojo(
          treeObject,
          nodeId,
          nodePojo,
          "_subtree_",
          transformer
        );
        const xTree = AbstractExpressionFactory.createExpressionTree(
          treeParentId,
          // @ts-ignore - nodePojo
          nodePojo.nodeContent
        );
        const subtree = AbstractExpressionFactory.createSubtreeAt_x(
          // @ts-ignore - dTree not IExpressionTree
          dTree,
          treeParentId,
          yTree
          // xTree
        );
        console.log("What");
        // //@ts-ignore -transformer
        // subtree.replaceNodeContent(subtree.rootNodeId, transformer(nodePojo));

        // AbstractExpressionFactory.#fromPojoTraverseAndExtractChildren(
        //   // (dTree as AbstractExpressionTree<T>)._rootNodeId,
        //   subtree.rootNodeId,
        //   // subtree.AbstractExpressionTree,
        //   nodeId,
        //   // @ts-ignore IExpression<T>
        //   subtree as IExpressionTree<T>,
        //   treeObject,
        //   transformer,
        //   fromToMap
        // );
      } else {
        const childId = (dTree as unknown as AbstractExpressionFactory)
          // @ts-ignore - transformer
          .fromPojoAppendChildNodeWithContent(treeParentId, transformer(nodePojo));

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
  };
}

export { AbstractExpressionFactory };

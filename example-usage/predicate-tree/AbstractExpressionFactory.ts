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
        // return AddressTree.fromPojo(AddressTree.defaultTreePojo())

        return AddressTree.getNewInstance(rootSeedNodeId, nodeContent);
        // return AddressTree.getNewInstance_typed(rootSeedNodeId, nodeContent);
        break;

      default:
        return new JsPredicateTree(rootSeedNodeId, nodeContent);
        break;
    }
  }

  private static createSubtreeFromPojo<Q>(
    srcPojoTree: TTreePojo<Q>,
    rootPojoKey: string,
    parentNodePojo: TNodePojo<Q>,
    rootSeedNodeId?: string,
    transform?: (
      nodeContent: TNodePojo<Q>
    ) => TGenericNodeContent<Q>
  ): IExpressionTree<Q> {
    const { nodeContent } = parentNodePojo as any; // transform
    const operator = "operator" in nodeContent ? nodeContent.operator : "_NO_OP_";

    // this should be done by parent class?
    parentNodePojo.parentId = rootPojoKey;
    srcPojoTree[rootPojoKey] = parentNodePojo;
    switch (operator) {
      case "$addressTree":
        `
        Conversion of type 'AddressTree' to type 'IExpressionTree<Q>' may be a mistake because 
        neither type sufficiently overlaps with the other. If this was intentional, 
        convert the expression to 'unknown' first.
        `
        // @ts-ignore
        return AddressTree.fromPojo<TPredicateTypes, AddressTree>(srcPojoTree, transform) as IExpressionTree<Q>;

      default:
        return JsPredicateTree.fromPojo(srcPojoTree);
    }
    // @ts-ignore - null not IExpressionTree<Q>
    return null;
  }

  static getNewInstance<P>(rootSeedNodeId?: string, nodeContent?: P): IExpressionTree<P>;
  static getNewInstance(
    rootSeedNodeId?: string,
    nodeContent?: TPredicateTypes
  ): IExpressionTree<TPredicateTypes> {
    return AbstractExpressionFactory.createExpressionTree(
      rootSeedNodeId,
      nodeContent as unknown as TPredicateTypes
    ) as unknown as IExpressionTree<TPredicateTypes>;
  }

  static createSubtreeAt(
    targetTree: AbstractExpressionFactory,
    targetNodeId: string,
    subtreeRootNodeContent: AbstractExpressionFactory
  ): IExpressionTree<TPredicateTypes> {
    // const subtree = targetTree.getNewInstance() as AbstractExpressionFactory
    const subtree = subtreeRootNodeContent ?? targetTree.getNewInstance() as AbstractExpressionFactory
    const subtreeParentNodeId = targetTree.appendChildNodeWithContent(targetNodeId, subtree);

    AbstractExpressionTree.reRootTreeAt(subtree, subtree.rootNodeId, subtreeParentNodeId);
    subtree._rootNodeId = subtreeParentNodeId;
    subtree._incrementor = targetTree._incrementor;

    return subtree as IExpressionTree<TPredicateTypes>;
    // const subtree = AbstractExpressionFactory.getNewInstance(
    //   targetNodeId,
    //   subtreeRootNodeContent
    // );

    // AbstractExpressionFactory.createSubtreeAt_x(
    // AbstractExpressionFactory.createSubtreeAt(
    //   targetTree,
    //   targetNodeId,
    //   // @ts-ignore - type 'AbstractExpressionTree<TPredicateTypes>' is not assignable to parameter of type 'TPredicateTypes'
    //   subtree as AbstractExpressionTree<TPredicateTypes>
    // );
    // return subtree as unknown as IExpressionTree<TPredicateTypes>;
  }

  static fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): IExpressionTree<P>;
  static fromPojo(
    srcPojoTree: TTreePojo<TPredicateTypes>,
    transform?: (nodeContent: TNodePojo<TPredicateTypes>) => TGenericNodeContent<TPredicateTypes>
  ): IExpressionTree<TPredicateTypes> {
    return AbstractExpressionFactory.#fromPojo(srcPojoTree, transform);
  }

  static #fromPojo(
    srcPojoTree: TTreePojo<TPredicateTypes>,
    transform: (nodeContent: TNodePojo<TPredicateTypes>) => TGenericNodeContent<TPredicateTypes> = defaultFromPojoTransform // branch coverage complains
  ): IExpressionTree<TPredicateTypes> {
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

    return dTree as IExpressionTree<TPredicateTypes>;
  }

  //TPredicateTypes
  static #fromPojoTraverseAndExtractChildren = <TPredicateTypes>(
    treeParentId: string,
    jsonParentId: string,
    dTree: IExpressionTree<TPredicateTypes>,
    treeObject: TTreePojo<TPredicateTypes>,
    transformer: (nodePojo: TNodePojo<TPredicateTypes>) => TGenericNodeContent<TPredicateTypes>,
    fromToMap: TFromToMap[] = []
  ): TFromToMap[] => {

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
        // AbstractExpressionFactory.createSubtreeAt_x(
        AbstractExpressionFactory.createSubtreeAt(
          // @ts-ignore - dTree not IExpressionTree
          dTree,
          treeParentId,
          yTree
        );
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

  // static createSubtreeAt_x(
  static x__createSubtreeAt(
    targetTree: AbstractExpressionFactory,
    targetNodeId: string,
    subtree: AbstractExpressionFactory
  ): AbstractExpressionFactory {

    const subtreeParentNodeId = targetTree.appendChildNodeWithContent(targetNodeId, subtree);

    AbstractExpressionTree.reRootTreeAt(subtree, subtree.rootNodeId, subtreeParentNodeId);
    subtree._rootNodeId = subtreeParentNodeId;
    subtree._incrementor = targetTree._incrementor;

    return subtree;
  }

}

export { AbstractExpressionFactory };

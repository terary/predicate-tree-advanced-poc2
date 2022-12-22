import { AbstractExpressionTree } from "../../../src";
import { GenericExpressionTree } from "../../../src/DirectedGraph/AbstractExpressionTree/AbstractExpressionTree";
import { AbstractTree } from "../../../src/DirectedGraph/AbstractTree/AbstractTree";
import { IExpressionTree } from "../../../src/DirectedGraph/ITree";
import { TPredicateTypes } from "../types";
import { AddressTree } from "./AddressTree";
import { TJsPredicate } from "./types";
class SubtreeFactory {
  private static _instance: SubtreeFactory;
  private constructor() {}

  createSubtreeAt<T>(tree: IExpressionTree<T>, nodeId: string, operator: "$addressTree") {
    const subtree = tree.createSubtreeAt(nodeId);
    const addressTree = AddressTree.getNewInstance(subtree.rootNodeId);
    // @ts-ignore
    tree.replaceNodeContent(subtree.rootNodeId, addressTree);
    return subtree;
    // new AddressTree(rootSeedNodeId)
  }

  static getInstance(): SubtreeFactory {
    if (!SubtreeFactory._instance) {
      SubtreeFactory._instance = new SubtreeFactory();
    }
    return SubtreeFactory._instance;
  }

  static getNewTreeInstance<T>(
    rootSeedNodeId?: string,
    nodeContent?: T,
    operator?: "$addressTree" | "$notTree"
  ): AbstractExpressionTree<TPredicateTypes> {
    switch (operator) {
      case "$addressTree":
        return AddressTree.getNewInstance(
          rootSeedNodeId,
          // @ts-ignore - not T ($addressTree not PredicateType)
          nodeContent
        ) as unknown as AbstractExpressionTree<TPredicateTypes>;

      default:
        return new GenericExpressionTree();
    }
  }
}
export { SubtreeFactory };

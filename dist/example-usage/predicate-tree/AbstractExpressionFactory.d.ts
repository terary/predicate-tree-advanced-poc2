import type { TNodePojo, TTreePojo } from "../../src";
import { AbstractExpressionTree, IExpressionTree } from "../../src";
import { TPredicateTypes, TPredicateNodeTypesOrNull } from "./types";
declare abstract class AbstractExpressionFactory extends AbstractExpressionTree<TPredicateTypes> {
    #private;
    static createExpressionTree(rootSeedNodeId?: string, nodeContent?: TPredicateNodeTypesOrNull): IExpressionTree<TPredicateTypes>;
    private static createSubtreeFromPojo;
    static getNewInstance<P extends object>(rootSeedNodeId?: string, nodeContent?: P): IExpressionTree<P>;
    static createSubtreeAt(targetTree: AbstractExpressionFactory, targetNodeId: string, subtreeRootNodeContent: AbstractExpressionFactory | null): IExpressionTree<TPredicateTypes>;
    static fromPojo<P extends object, Q>(srcPojoTree: TTreePojo<P>, transform?: (nodeContent: TNodePojo<P>) => P): IExpressionTree<P>;
}
export { AbstractExpressionFactory };

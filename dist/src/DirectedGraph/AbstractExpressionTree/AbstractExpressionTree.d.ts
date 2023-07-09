import { AbstractTree } from "../AbstractTree/AbstractTree";
import { IAppendChildNodeIds } from "./IAppendChildNodeIds";
import { IExpressionTree } from "../ITree";
import type { TFromToMap, TGenericNodeContent, TNodePojo, TTreePojo } from "../types";
declare abstract class AbstractExpressionTree<P extends object> extends AbstractTree<P> implements IExpressionTree<P> {
    #private;
    constructor(rootNodeId?: string, nodeContent?: P);
    appendContentWithAnd(parentNodeId: string, nodeContent: TGenericNodeContent<P>): IAppendChildNodeIds;
    /**
     * The tricky bit here is that the  subtree._rootNodeId
     * must be the same as parent's node.nodeId
     * @param targetParentNodeId
     * @returns
     */
    abstract createSubtreeAt(nodeId: string): IExpressionTree<P>;
    protected defaultJunction(nodeId: string): P;
    appendTreeAt(targetNodeId: string, sourceTree: AbstractTree<P>, sourceBranchRootNodeId?: string | undefined): TFromToMap[];
    appendContentWithOr(parentNodeId: string, nodeContent: TGenericNodeContent<P>): IAppendChildNodeIds;
    appendContentWithJunction(parentNodeId: string, junctionContent: TGenericNodeContent<P>, nodeContent: TGenericNodeContent<P>): IAppendChildNodeIds;
    appendChildNodeWithContent(parentNodeId: string, nodeContent: TGenericNodeContent<P>): string;
    cloneAt(nodeId?: string): IExpressionTree<P>;
    getNewInstance(rootSeedNodeId?: string, nodeContent?: P): IExpressionTree<P>;
    static reRootTreeAt<T extends object>(tree: AbstractExpressionTree<T>, from: string, to: string): TFromToMap[];
    static getNewInstance<P extends object>(rootSeedNodeId?: string, nodeContent?: P): IExpressionTree<P>;
    static fromPojo<P extends object, Q>(srcPojoTree: TTreePojo<P>, transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>): IExpressionTree<P>;
    protected fromPojoAppendChildNodeWithContent(parentNodeId: string, nodeContent: TGenericNodeContent<P>): string;
    private _getSiblingIds;
    removeNodeAt(nodeId: string): void;
    protected static validateTree<T extends object>(tree: AbstractExpressionTree<T>): void;
}
declare class GenericExpressionTree<T extends object> extends AbstractExpressionTree<T> {
    getNewInstance(rootSeed?: string, nodeContent?: T): IExpressionTree<T>;
    createSubtreeAt<Q extends T>(targetNodeId: string): IExpressionTree<Q>;
}
export { AbstractExpressionTree, GenericExpressionTree };

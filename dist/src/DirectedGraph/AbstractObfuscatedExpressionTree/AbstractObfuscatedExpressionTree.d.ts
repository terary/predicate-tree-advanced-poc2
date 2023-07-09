import { IExpressionTree, ITree, ITreeVisitor } from "../ITree";
import { AbstractExpressionTree } from "../AbstractExpressionTree/AbstractExpressionTree";
import { IObfuscatedExpressionTree } from "./IObfuscatedExpressionTree";
import { IAppendChildNodeIds } from "../AbstractExpressionTree/IAppendChildNodeIds";
import type { TFromToMap, TGenericNodeContent, TTreePojo } from "../types";
declare abstract class AbstractObfuscatedExpressionTree<P extends object> extends AbstractExpressionTree<P> implements IObfuscatedExpressionTree<P> {
    private _internalTree;
    private _rootKey;
    private _keyStore;
    constructor(tree?: IExpressionTree<P>, rootNodeId?: string, nodeContent?: P);
    get rootNodeId(): string;
    appendChildNodeWithContent(parentNodeKey: string, nodeContent: TGenericNodeContent<P>): string;
    private static appendTreeAt;
    appendTreeAt(targetNodeKey: string, sourceTree: ITree<P>, sourceBranchRootNodeId?: string | undefined): TFromToMap[];
    appendContentWithJunction(parentNodeKey: string, junctionContent: TGenericNodeContent<P>, nodeContent: TGenericNodeContent<P>): IAppendChildNodeIds;
    cloneAt(nodeKey: string): IExpressionTree<P>;
    protected buildReverseMap(reverseMap?: {
        [nodeId: string]: string;
    }): {
        [nodeId: string]: string;
    };
    countTotalNodes(nodeKey?: string, shouldIncludeSubtrees?: boolean): number;
    getChildContentAt(nodeKey: string): P | ITree<P> | null;
    getChildrenNodeIdsOf(parentNodeKey: string, shouldIncludeSubtrees?: boolean): string[];
    getChildrenContentOf(parentNodeKey: string, shouldIncludeSubtrees?: boolean): (P | ITree<P> | null)[];
    getDescendantContentOf(parentNodeKey: string, shouldIncludeSubtrees?: boolean): TGenericNodeContent<P>[];
    getDescendantNodeIds(parentNodeKey: string, shouldIncludeSubtrees?: boolean): string[];
    /**
     * The tricky bit here is that the subtree._rootNodeKey and subtree._rootNodeId
     * must be the same as parent's node.nodeKey and node.nodeId
     * @param targetParentNodeId
     * @returns
     */
    createSubtreeAt(targetParentNodeId: string): IExpressionTree<P>;
    getNewInstance<P extends object>(// the type variable seems misplaced?
    rootNodeId?: string, nodeContent?: P | undefined): IExpressionTree<P>;
    getParentNodeId(nodeKey: string): string;
    getSiblingIds(nodeKey: string): string[];
    getTreeContentAt(nodeKey?: string, shouldIncludeSubtrees?: boolean): TGenericNodeContent<P>[];
    getTreeNodeIdsAt(nodeKey: string): string[];
    private _getNodeId;
    _getNodeIdOrThrow(nodeKey: string): string;
    isLeaf(nodeKey: string): boolean;
    removeNodeAt(nodeKey: string): void;
    replaceNodeContent(nodeKey: string, nodeContent: TGenericNodeContent<P>): void;
    protected reverseMapKeys(keys: string[]): string[];
    private wrapVisitor;
    toPojoAt(nodeKey?: string): TTreePojo<P>;
    static obfuscatePojo(pojo: TTreePojo<any>): TTreePojo<any>;
    visitAllAt(visitor: ITreeVisitor<P>, nodeId?: string, parentNodeId?: string): void;
    visitLeavesOf(visitor: ITreeVisitor<P>, nodeKey?: string): void;
    static fromPojo<P extends object, Q>(srcPojoTree: TTreePojo<P>): Q;
    protected fromPojoAppendChildNodeWithContent(parentNodeId: string, nodeContent: TGenericNodeContent<P>): string;
}
export { AbstractObfuscatedExpressionTree };

import { Incrementor } from "../Incrementor";
import { ITree, ITreeVisitor } from "../ITree";
import type { TNodePojo, TTreePojo, TGenericNodeContent, TGenericNodeType, TFromToMap } from "../types";
declare const defaultToPojoTransformer: <T>(nodeContent: T) => TNodePojo<T>;
declare type transformToPojoType = typeof defaultToPojoTransformer;
declare abstract class AbstractTree<T extends object> implements ITree<T> {
    #private;
    static EmptyNode: null;
    static SubtreeNodeTypeName: string;
    static SHOULD_INCLUDE_SUBTREES: boolean;
    protected _nodeDictionary: {
        [nodeId: string]: TGenericNodeType<T>;
    };
    private _nodeKeyDelimiter;
    protected _rootNodeId: string;
    protected _incrementor: Incrementor;
    constructor(rootNodeId?: string, nodeContent?: T);
    appendChildNodeWithContent(parentNodeId: string, nodeContent: TGenericNodeContent<T>): string;
    appendTreeAt(targetNodeId: string | undefined, sourceTree: AbstractTree<T>, sourceBranchRootNodeId?: string): TFromToMap[];
    protected static appendTree<P extends object>(targetTree: AbstractTree<P>, sourceTree: AbstractTree<P>, targetNodeId: string, sourceBranchRootNodeId?: string): TFromToMap[];
    abstract cloneAt(nodeId: string): ITree<T>;
    countDescendantsOf(parentNodeId?: string): number;
    /**
     * Returns greatest distance between nodeId and furthest leaf.
     * If node is leaf returns 1.
     * Hence depth:
     *  sub-root | child | grandchild
     *       1      2          3
     *  * same philosophy as length
     * @param nodeKey
     * @returns {number} greatest depth of given node and its furthest leaf.
     */
    countGreatestDepthOf(subTreeRootNodeId?: string): number;
    countLeavesOf(nodeId?: string): number;
    countTotalNodes(nodeId?: string, shouldIncludeSubtrees?: boolean): number;
    private filterIds;
    /**
     * Returns distance between nodeKey and root + 1
     * Hence depth:
     *  root | child | grandchild
     *   1      2          3
     *  * same philosophy as length
     * @param nodeId
     * @returns {number} depth of branch (distance between nodeId and root)
     */
    protected getBranchDepth(nodeId: string): number;
    private nodeIdExists;
    getChildContentAt(nodeId: string): ITree<T> | T | null;
    getChildrenNodeIdsOf(parentNodeId: string, shouldIncludeSubtrees?: boolean): string[];
    getCountTotalNodes(): number;
    getChildrenContentOf(parentNodeId: string, shouldIncludeSubtrees?: boolean): (ITree<T> | T | null)[];
    getDescendantContentOf(parentNodeId: string, shouldIncludeSubtrees?: boolean): TGenericNodeContent<T>[];
    getDescendantNodeIds(parentNodeId: string, shouldIncludeSubtrees?: boolean): string[];
    protected _getNewInstance<P>(rootSeedNodeId?: string, nodeContent?: T): P;
    getParentNodeId(nodeId: string): string;
    getSiblingIds(nodeId: string): string[];
    getSubtreeIdsAt(nodeId?: string): string[];
    getTreeContentAt(nodeId?: string, shouldIncludeSubtrees?: boolean): TGenericNodeContent<T>[];
    getTreeNodeIdsAt(nodeId: string): string[];
    isBranch(nodeId: string): boolean;
    isLeaf(nodeId: string): boolean;
    isRoot(nodeId: string): boolean;
    isSubtree(nodeId: string): boolean;
    /**
     * sourceNode becomes child of targetNode
     * children of sourceNode become grandchildren of target
     * @param sourceNodeId
     * @param targetNodeId
     */
    move(sourceNodeId: string, targetNodeId: string): {
        from: string;
        to: string;
    }[];
    /**
     * children of sourceNode become children of targetNode.
     * sourceNode becomes childless
     * @param sourceNodeId
     * @param targetNodeId
     */
    moveChildren(sourceNodeId: string, targetNodeId: string): {
        from: string;
        to: string;
    }[];
    removeNodeAt(nodeId: string): void;
    removeSingleNode(nodeId: string): void;
    replaceNodeContent(nodeId: string, nodeContent: TGenericNodeContent<T>): void;
    get rootNodeId(): string;
    visitAllAt(visitor: ITreeVisitor<T>, nodeId?: string): void;
    visitLeavesOf(visitor: ITreeVisitor<T>, nodeId?: string): void;
    static obfuscatePojo<P>(pojo: TTreePojo<P>): TTreePojo<P>;
    toPojoAt(nodeId?: string, transformer?: transformToPojoType): TTreePojo<T>;
}
export { AbstractTree };

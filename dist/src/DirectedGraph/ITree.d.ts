import { TGenericNodeContent, TTreePojo } from "./types";
import { IAppendChildNodeIds } from "../DirectedGraph/AbstractExpressionTree/IAppendChildNodeIds";
import type { TFromToMap } from "./types";
interface ITreeVisitor<T extends object> {
    visit: (nodeId: string, nodeContent: TGenericNodeContent<T>, parentId: string) => void;
    includeSubtrees: boolean;
}
interface ITree<T extends object> {
    rootNodeId: string;
    appendChildNodeWithContent(treeParentId: string, nodeContent: TGenericNodeContent<T>): string;
    appendTreeAt(targetNodeId: string, sourceTree: ITree<T>, sourceBranchRootNodeId?: string | undefined): TFromToMap[];
    countGreatestDepthOf(nodeId?: string): number;
    countLeavesOf(nodeId?: string): number;
    countDescendantsOf(nodeId?: string): number;
    countTotalNodes(nodeId?: string, shouldIncludeSubtrees?: boolean): number;
    getChildContentAt(nodeId: string): TGenericNodeContent<T>;
    getChildrenContentOf(nodeId: string, shouldIncludeSubtrees?: boolean): TGenericNodeContent<T>[];
    getChildrenNodeIdsOf(parentNodeId: string, shouldIncludeSubtrees?: boolean): string[];
    getDescendantContentOf(nodeId: string, shouldIncludeSubtrees?: boolean): TGenericNodeContent<T>[];
    getDescendantNodeIds(parentNodeKey: string, shouldIncludeSubtrees?: boolean): string[];
    getParentNodeId(nodeId: string): string;
    getSiblingIds(nodeId: string): string[];
    getSubtreeIdsAt(nodeId?: string): string[];
    getTreeContentAt(nodeId?: string, shouldIncludeSubtrees?: boolean): TGenericNodeContent<T>[];
    getTreeNodeIdsAt(nodeId: string): string[];
    isBranch(nodeId: string): boolean;
    isLeaf(nodeId: string): boolean;
    isRoot(nodeId: string): boolean;
    isSubtree(nodeId: string): boolean;
    move(srcNodeId: string, targetNodeId: string): TFromToMap[];
    moveChildren(srcNodeId: string, targetNodeId: string): TFromToMap[];
    replaceNodeContent(nodeId: string, nodeContent: TGenericNodeContent<T>): void;
    removeNodeAt(nodeId: string): void;
    toPojoAt(nodeId?: string): TTreePojo<T>;
    visitAllAt(visitor: ITreeVisitor<T>, nodeId?: string, parentNodeId?: string): void;
    visitLeavesOf(visitor: ITreeVisitor<T>, nodeId?: string, parentNodeId?: string): void;
}
interface IExpressionTree<P extends object> extends ITree<P> {
    appendContentWithJunction: (parentNodeId: string, junctionContent: TGenericNodeContent<P>, nodeContent: TGenericNodeContent<P>) => IAppendChildNodeIds;
    cloneAt(nodeId: string): IExpressionTree<P>;
    createSubtreeAt(nodeId: string): IExpressionTree<P>;
    getNewInstance(rootSeed?: string, nodeContent?: P | null): IExpressionTree<P>;
}
interface IDirectedGraph<T extends object> extends ITree<T> {
    appendChildNodeWithContent: (treeParentId: string, nodeContent: TGenericNodeContent<T>) => string;
    cloneAt(nodeId: string): IDirectedGraph<T>;
    createSubtreeAt(nodeId: string): IDirectedGraph<T>;
}
export { IDirectedGraph, IExpressionTree, ITree, ITreeVisitor };

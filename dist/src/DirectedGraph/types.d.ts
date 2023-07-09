import { ITree } from "./ITree";
declare type TGenericNodeContent<T extends object> = null | T | ITree<T>;
declare type TGenericNodeType<T extends object> = {
    nodeContent: TGenericNodeContent<T>;
};
declare function treeVisitor<T>(nodeId: string, nodeContent: T | null, parentId: string): void;
declare type TDirectedTreeVisitor<T> = typeof treeVisitor;
declare type TNodePojo<T> = {
    parentId: string;
    nodeType?: string;
    nodeContent: T;
};
declare type TTreePojo<T> = {
    [nodeId: string]: TNodePojo<T>;
};
declare type NodeType<T> = TNodePojo<T>;
declare type TFromToMap = {
    from: string;
    to: string;
};
export type { NodeType, TDirectedTreeVisitor, TFromToMap, TGenericNodeContent, TGenericNodeType, TNodePojo, TTreePojo, };

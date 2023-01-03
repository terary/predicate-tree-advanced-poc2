import { ITree } from "./ITree";

// TGenericNode* differ from Pojo, in that T maybe instances of things
// whereas pojo is plain objects
type TGenericNodeContent<T extends object> = null | T | ITree<T>;
type TGenericNodeType<T extends object> = {
  nodeContent: TGenericNodeContent<T>;
};

function treeVisitor<T>(
  nodeId: string,
  nodeContent: T | null,
  parentId: string
): void {}

type TDirectedTreeVisitor<T> = typeof treeVisitor;

// if Pojo - then all should be optional? or new type TNodePojoUnsanitized
type TNodePojo<T> = { parentId: string; nodeType?: string; nodeContent: T };
type TTreePojo<T> = { [nodeId: string]: TNodePojo<T> };

type NodeType<T> = TNodePojo<T>;

type TFromToMap = { from: string; to: string };

export type {
  NodeType,
  TDirectedTreeVisitor,
  TFromToMap,
  TGenericNodeContent,
  TGenericNodeType,
  TNodePojo,
  TTreePojo,
};

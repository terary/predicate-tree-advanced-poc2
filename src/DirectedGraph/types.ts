import { ITree } from "./ITree";

/**
 * Discriminated union type for node content
 */
export type NodeContent<T extends object> =
  | { type: "empty"; value: null }
  | { type: "value"; value: T }
  | { type: "subtree"; value: ITree<T> };

/**
 * Legacy type for backward compatibility
 */
type TGenericNodeContent<T extends object> = null | T | ITree<T>;

/**
 * Converts a TGenericNodeContent to a typed NodeContent
 */
function toTypedNodeContent<T extends object>(
  content: TGenericNodeContent<T>
): NodeContent<T> {
  if (content === null) {
    return { type: "empty", value: null };
  } else if (isSubtree(content)) {
    return { type: "subtree", value: content };
  } else {
    return { type: "value", value: content };
  }
}

/**
 * Converts a typed NodeContent to a TGenericNodeContent
 */
function fromTypedNodeContent<T extends object>(
  content: NodeContent<T>
): TGenericNodeContent<T> {
  if (content.type === "empty") {
    return null;
  } else {
    return content.value;
  }
}

type TGenericNodeType<T extends object> = {
  nodeContent: TGenericNodeContent<T>;
};

/**
 * Type guard to check if a node content is null
 */
function isNullNodeContent<T extends object>(
  content: TGenericNodeContent<T>
): content is null {
  return content === null;
}

/**
 * Type guard to check if a node content is a subtree (ITree)
 */
function isSubtree<T extends object>(
  content: TGenericNodeContent<T>
): content is ITree<T> {
  return (
    content !== null && typeof content === "object" && "rootNodeId" in content
  );
}

/**
 * Type guard to check if a node content is a value (not null and not a subtree)
 */
function isValueContent<T extends object>(
  content: TGenericNodeContent<T>
): content is T {
  return content !== null && !isSubtree(content);
}

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

export {
  isNullNodeContent,
  isSubtree,
  isValueContent,
  toTypedNodeContent,
  fromTypedNodeContent,
};

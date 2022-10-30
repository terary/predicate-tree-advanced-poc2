import { TGenericNodeContent, TTreePojo, TGenericNodeType } from "./types";
interface ITreeVisitor<T> {
  visit: (nodeId: string, nodeContent: TGenericNodeContent<T>, parentId: string) => void;
  includeSubtrees: boolean;
}

// type TGenericNodeContent<T> = null | T | ITree<T>;
// type InternalNodeType<T> = {
//   nodeContent: T | null | ITree<T>;
// };

// type TGenericNodeContent<T> = null | T | ITree<T>;
// type TGenericNodeType<T> = {
//   nodeContent: TGenericNodeContent<T>;
// };

interface ITree<T> {
  rootNodeId: string;
  appendChildNodeWithContent: (
    treeParentId: string,
    nodeContent: TGenericNodeContent<T>
  ) => string;
  cloneAt(nodeId: string): ITree<T>;

  countGreatestDepthOf(nodeId?: string): number;
  countLeavesOf(nodeId?: string): number;
  countDescendantsOf(nodeId?: string): number;
  countTotalNodes(nodeId?: string): number;

  createSubGraphAt(nodeId: string): ITree<T>;

  // maybe null
  getChildContent(nodeId: string): TGenericNodeContent<T>;
  getNodeAt(nodeId: string): TGenericNodeType<T> | undefined;
  getChildrenContent(nodeId: string): TGenericNodeContent<T>[];
  getChildrenNodeIds(parentNodeId: string): string[];
  getDescendantContent(nodeId: string): TGenericNodeContent<T>[];
  getParentNodeId(nodeId: string): string;
  getSiblingIds(nodeId: string): string[];
  getSubgraphIdsAt(nodeId: string): string[];
  getTreeContentAt(nodeId: string): TGenericNodeContent<T>[];
  getTreeNodeIdsAt(nodeId: string): string[];

  isBranch(nodeId: string): boolean;
  isLeaf(nodeId: string): boolean;
  isRoot(nodeId: string): boolean;
  isSubtree(nodeId: string): boolean;
  move(srcNodeId: string, targetNodeId: string): { from: string; to: string }[];
  moveChildren(srcNodeId: string, targetNodeId: string): { from: string; to: string }[];
  replaceNodeContent(nodeId: string, nodeContent: TGenericNodeContent<T>): void;
  removeNodeAt(nodeId: string): void;
  toPojo(): TTreePojo<T>;
  toPojoAt(nodeId?: string): TTreePojo<T>;
  visitAllAt(visitor: ITreeVisitor<T>, nodeId?: string, parentNodeId?: string): void;
  visitLeavesOf(visitor: ITreeVisitor<T>, nodeId?: string, parentNodeId?: string): void;
}

export { ITree, ITreeVisitor };

import { TGenericNodeContent, TTreePojo, TGenericNodeType } from "./types";
interface ITreeVisitor<T> {
  visit: (nodeId: string, nodeContent: TGenericNodeContent<T>, parentId: string) => void;
  includeSubtrees: boolean;
}
/*
At/Of convention
Basically At includes
but dTree.getChildContent(dTreeIds["subtree0:root"])
returns the subtree 
is the different here - 
getChildContent[Of] vs  getChildrenContent[At]

if you think of a triangle of 3 dots 
getChild[At] take the top dot.
getChildren[Of] takes the 2 bottom dots
*/

interface ITree<T> {
  rootNodeId: string;

  appendChildNodeWithContent: (
    treeParentId: string,
    nodeContent: TGenericNodeContent<T>
  ) => string; // why use arrow notation?
  cloneAt(nodeId: string): ITree<T>;

  countGreatestDepthOf(nodeId?: string): number;
  countLeavesOf(nodeId?: string): number;
  countDescendantsOf(nodeId?: string): number;
  countTotalNodes(nodeId?: string): number;

  createSubGraphAt(nodeId: string): ITree<T>;
  fromPojoAppendChildNodeWithContent(
    treeParentId: string,
    nodeContent: TGenericNodeContent<T>
  ): string;
  // maybe null
  getChildContentAt(nodeId: string): TGenericNodeContent<T>;
  // getNodeAt(nodeId: string): TGenericNodeType<T> | undefined;
  getChildrenContentOf(
    nodeId: string,
    shouldIncludeSubtrees?: boolean
  ): TGenericNodeContent<T>[];
  getChildrenNodeIdsOf(parentNodeId: string, shouldIncludeSubtrees?: boolean): string[];
  getDescendantContentOf(
    nodeId: string,
    shouldIncludeSubtrees?: boolean
  ): TGenericNodeContent<T>[];
  getParentNodeId(nodeId: string): string;
  getSiblingIds(nodeId: string): string[];
  getSubgraphIdsAt(nodeId: string): string[];
  getTreeContentAt(nodeId: string, shouldIncludeSubtrees?: boolean): TGenericNodeContent<T>[];

  // nodeIds of subtrees doesn't make sense.  Internally the tree is different so
  // subtree nodeIds won't be accessible to parent tree
  getTreeNodeIdsAt(nodeId: string): string[];

  isBranch(nodeId: string): boolean;
  isLeaf(nodeId: string): boolean;
  isRoot(nodeId: string): boolean;
  isSubtree(nodeId: string): boolean;
  move(srcNodeId: string, targetNodeId: string): { from: string; to: string }[];
  moveChildren(srcNodeId: string, targetNodeId: string): { from: string; to: string }[];
  moveTree(srcNodeId: string, targetNodeId: string): { from: string; to: string }[];
  replaceNodeContent(nodeId: string, nodeContent: TGenericNodeContent<T>): void;
  removeNodeAt(nodeId: string): void;
  toPojo(): TTreePojo<T>;
  toPojoAt(nodeId?: string): TTreePojo<T>;
  visitAllAt(visitor: ITreeVisitor<T>, nodeId?: string, parentNodeId?: string): void;
  visitLeavesOf(visitor: ITreeVisitor<T>, nodeId?: string, parentNodeId?: string): void;
}

export { ITree, ITreeVisitor };

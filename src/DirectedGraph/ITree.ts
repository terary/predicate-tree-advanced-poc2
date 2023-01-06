// Clean up imports -- everything should import locally or from '../src', not '../src/dir0/dir1'

const readThis = `
Read this
https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#conditional-type-constraints

`;
`
How do we describe Predicate is Predicate or Null ?
 the or null part is part of the GenericNode 


`;

import { TGenericNodeContent, TTreePojo, TGenericNodeType } from "./types";
import { IAppendChildNodeIds } from "../DirectedGraph/AbstractExpressionTree/IAppendChildNodeIds";
import type { TFromToMap } from "./types";
interface ITreeVisitor<T extends object> {
  visit: (
    nodeId: string,
    nodeContent: TGenericNodeContent<T>,
    parentId: string
  ) => void;
  includeSubtrees: boolean;
}
/*
  Write up somewhere about the difference of 'Of' and 'At'
*/

interface ITree<T extends object> {
  rootNodeId: string;

  appendChildNodeWithContent(
    treeParentId: string,
    nodeContent: TGenericNodeContent<T>
  ): string;

  appendTreeAt(
    targetNodeId: string,
    sourceTree: ITree<T>,
    sourceBranchRootNodeId?: string | undefined
  ): TFromToMap[];

  // should these all be ...At(...)
  countGreatestDepthOf(nodeId?: string): number;
  countLeavesOf(nodeId?: string): number;
  countDescendantsOf(nodeId?: string): number;
  countTotalNodes(nodeId?: string, shouldIncludeSubtrees?: boolean): number;

  // createSubtreeAt(nodeId: string): ITree<T>;

  // fromPojoAppendChildNodeWithContent(
  //   treeParentId: string,
  //   nodeContent: TGenericNodeContent<T>
  // ): string;
  // maybe null

  getChildContentAt(nodeId: string): TGenericNodeContent<T>;
  // getNodeAt(nodeId: string): TGenericNodeType<T> | undefined;
  getChildrenContentOf(
    nodeId: string,
    shouldIncludeSubtrees?: boolean
  ): TGenericNodeContent<T>[];
  getChildrenNodeIdsOf(
    parentNodeId: string,
    shouldIncludeSubtrees?: boolean
  ): string[];
  getDescendantContentOf(
    nodeId: string,
    shouldIncludeSubtrees?: boolean
  ): TGenericNodeContent<T>[];
  getDescendantNodeIds(
    parentNodeKey: string,
    shouldIncludeSubtrees?: boolean
  ): string[];

  getParentNodeId(nodeId: string): string;
  getSiblingIds(nodeId: string): string[];
  getSubtreeIdsAt(nodeId?: string): string[];
  getTreeContentAt(
    nodeId?: string,
    shouldIncludeSubtrees?: boolean
  ): TGenericNodeContent<T>[];

  // nodeIds of subtrees doesn't make sense.  Internally the tree is different so
  // subtree nodeIds won't be accessible to parent tree
  getTreeNodeIdsAt(nodeId: string): string[];

  isBranch(nodeId: string): boolean;
  isLeaf(nodeId: string): boolean;
  isRoot(nodeId: string): boolean;
  isSubtree(nodeId: string): boolean;

  // does 'move*' make sense as public?
  move(srcNodeId: string, targetNodeId: string): TFromToMap[];
  moveChildren(srcNodeId: string, targetNodeId: string): TFromToMap[];

  replaceNodeContent(nodeId: string, nodeContent: TGenericNodeContent<T>): void;
  removeNodeAt(nodeId: string): void;
  // toPojo(): TTreePojo<T>;
  toPojoAt(nodeId?: string): TTreePojo<T>;
  visitAllAt(
    visitor: ITreeVisitor<T>,
    nodeId?: string,
    parentNodeId?: string
  ): void;
  visitLeavesOf(
    visitor: ITreeVisitor<T>,
    nodeId?: string,
    parentNodeId?: string
  ): void;
}

interface IExpressionTree<P extends object> extends ITree<P> {
  appendContentWithJunction: (
    parentNodeId: string,
    junctionContent: TGenericNodeContent<P>,
    nodeContent: TGenericNodeContent<P>
  ) => IAppendChildNodeIds;
  cloneAt(nodeId: string): IExpressionTree<P>;
  createSubtreeAt(nodeId: string): IExpressionTree<P>;
  getNewInstance(rootSeed?: string, nodeContent?: P | null): IExpressionTree<P>;
}

interface IDirectedGraph<T extends object> extends ITree<T> {
  appendChildNodeWithContent: (
    treeParentId: string,
    nodeContent: TGenericNodeContent<T>
  ) => string; // why use arrow notation?
  cloneAt(nodeId: string): IDirectedGraph<T>;

  createSubtreeAt(nodeId: string): IDirectedGraph<T>;

  // toPojo should be here
}

export { IDirectedGraph, IExpressionTree, ITree, ITreeVisitor };

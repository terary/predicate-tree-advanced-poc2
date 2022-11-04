import { AbstractDirectedGraph } from "../AbstractDirectedGraph";
import { ITree } from "../ITree";
import { TGenericNodeContent, TNodePojo, TTreePojo } from "../types";

interface IAppendChildNodeIds {
  newNodeId: string;
  originalContentNodeId?: string; // ONLY set if isNewBranch is true, represents where the content went
  junctionNodeId: string; // this will ALWAYS be the nodeId provided to append*(nodeId)
  isNewBranch: boolean;
}

export class AbstractExpressionTree<OPERAND, JUNCTION> extends AbstractDirectedGraph<
  OPERAND | JUNCTION
> {
  constructor(rootNodeId = "_root_", nodeContent?: OPERAND | JUNCTION) {
    super(rootNodeId, nodeContent);
  }

  public appendContentWithAnd(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<JUNCTION | OPERAND>
  ): IAppendChildNodeIds {
    return this.appendContentWithJunction(
      parentNodeId,
      "&&" as unknown as JUNCTION,
      nodeContent
    );
  }

  public appendContentWithOr(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<JUNCTION | OPERAND>
  ): IAppendChildNodeIds {
    return this.appendContentWithJunction(
      parentNodeId,
      "||" as unknown as JUNCTION,
      nodeContent
    );
  }

  private appendContentWithJunction(
    parentNodeId: string,
    junctionContent: TGenericNodeContent<JUNCTION>,
    nodeContent: TGenericNodeContent<OPERAND | JUNCTION>
  ): IAppendChildNodeIds {
    if (this.isBranch(parentNodeId)) {
      super.replaceNodeContent(
        parentNodeId,
        junctionContent as TGenericNodeContent<OPERAND | JUNCTION>
      );
      return {
        newNodeId: super.appendChildNodeWithContent(parentNodeId, nodeContent),
        originalContentNodeId: undefined,
        junctionNodeId: parentNodeId,
        isNewBranch: false,
      };
      // return super.appendChildNodeWithContent(parentNodeId, nodeContent);
    }

    const originalContent = this.getChildContentAt(parentNodeId);
    const originalContentId = super.appendChildNodeWithContent(parentNodeId, originalContent);
    this.replaceNodeContent(
      parentNodeId,
      junctionContent as TGenericNodeContent<OPERAND | JUNCTION>
    );

    // const newNodeId = super.appendChildNodeWithContent(parentNodeId, nodeContent);
    // return newNodeId;
    return {
      newNodeId: super.appendChildNodeWithContent(parentNodeId, nodeContent),
      originalContentNodeId: originalContentId,
      junctionNodeId: parentNodeId,
      isNewBranch: true,
    };
  }

  public appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<OPERAND | JUNCTION>
  ): string {
    // at this time, only *fromPojo is calling this function.
    // need to move traverse tree logic from utilities to
    // to static methods?
    // return this.appendContentWithAnd(parentNodeId, nodeContent);
    return this.fromPojoAppendChildNodeWithContent(parentNodeId, nodeContent);
  }

  public fromPojoAppendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<OPERAND | JUNCTION>
  ): string {
    if (this.isBranch(parentNodeId)) {
      return super.appendChildNodeWithContent(parentNodeId, nodeContent);
    }
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  static fromPojo<T>(srcPojoTree: TTreePojo<T>): ITree<T> {
    const tree = AbstractDirectedGraph.fromPojo(
      srcPojoTree,
      undefined,
      AbstractExpressionTree
    );
    AbstractExpressionTree.validateTree(tree);
    return tree;
  }

  // *tmc* I don't think generics are necessary or even useful?
  private static validateTree<T>(tree: ITree<T>) {
    const allNodeIds = tree.getTreeNodeIdsAt(tree.rootNodeId);
    allNodeIds.forEach((nodeId) => {
      if (tree.isBranch(nodeId)) {
        const childrenIds = tree.getChildrenNodeIdsOf(nodeId);
        if (childrenIds.length < 2) {
          throw new Error("REPLACE - tree fails no-single-child rule.");
        }
      }
    });
  }
}

import { AbstractDirectedGraph } from "../AbstractDirectedGraph";
import { ITree } from "../ITree";
import { TGenericNodeContent, TNodePojo, TTreePojo } from "../types";

// const defaultFromPojoTransform = <T>(nodeContent: TNodePojo<T>): TGenericNodeContent<T> => {
//   return nodeContent.nodeContent;
// };
const defaultFromPojoTransform = <P>(nodeContent: TNodePojo<P>): TGenericNodeContent<P> => {
  return nodeContent.nodeContent;
};

interface IAppendChildNodeIds {
  newNodeId: string;
  originalContentNodeId?: string; // ONLY set if isNewBranch is true, represents where the content went
  junctionNodeId: string; // this will ALWAYS be the nodeId provided to append*(nodeId)
  isNewBranch: boolean;
}

export class AbstractExpressionTree<P> extends AbstractDirectedGraph<P> {
  constructor(rootNodeId = "_root_", nodeContent?: P) {
    super(rootNodeId, nodeContent);
  }

  public appendContentWithAnd(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<P>
  ): IAppendChildNodeIds {
    return this.appendContentWithJunction(
      parentNodeId,
      { operator: "$and" } as unknown as P,
      nodeContent
    );
  }

  public appendContentWithOr(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<P>
  ): IAppendChildNodeIds {
    return this.appendContentWithJunction(
      parentNodeId,
      { operator: "$or" } as unknown as P,
      nodeContent
    );
  }
  private getChildrenWithNullValues(parentNodeId: string): string[] {
    const childrenIds = this.getChildrenNodeIdsOf(parentNodeId);
    return childrenIds.filter((childId) => {
      return this.getChildContentAt(childId) === null;
    });
  }

  private appendContentWithJunction(
    parentNodeId: string,
    junctionContent: TGenericNodeContent<P>,
    nodeContent: TGenericNodeContent<P>
  ): IAppendChildNodeIds {
    if (this.isBranch(parentNodeId)) {
      super.replaceNodeContent(parentNodeId, junctionContent as TGenericNodeContent<P>);
      const nullValueChildren = this.getChildrenWithNullValues(parentNodeId);
      let newNodeId;
      if (nullValueChildren.length > 0) {
        newNodeId = nullValueChildren[0];
        super.replaceNodeContent(newNodeId, nodeContent);
      } else {
        newNodeId = super.appendChildNodeWithContent(parentNodeId, nodeContent);
      }
      return {
        newNodeId,
        originalContentNodeId: undefined,
        junctionNodeId: parentNodeId,
        isNewBranch: false,
      };
    }

    const originalContent = this.getChildContentAt(parentNodeId);
    const originalContentId = super.appendChildNodeWithContent(parentNodeId, originalContent);
    this.replaceNodeContent(parentNodeId, junctionContent as TGenericNodeContent<P>);

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
    nodeContent: TGenericNodeContent<P>
  ): string {
    // at this time, only *fromPojo is calling this function.
    // need to move traverse tree logic from utilities to
    // to static methods?
    // return this.appendContentWithAnd(parentNodeId, nodeContent);
    return this.fromPojoAppendChildNodeWithContent(parentNodeId, nodeContent);
  }

  public fromPojoAppendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<P>
  ): string {
    if (this.isBranch(parentNodeId)) {
      return super.appendChildNodeWithContent(parentNodeId, nodeContent);
    }
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  static fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P> = defaultFromPojoTransform

    //    transform: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P> = defaultFromPojoTransform
  ): Q {
    //AbstractExpressionTree<P> {
    const tree = AbstractExpressionTree._fromPojo<P, Q>(
      srcPojoTree,
      transform,
      AbstractExpressionTree as unknown as () => Q
    );
    AbstractExpressionTree.validateTree(tree as unknown as AbstractExpressionTree<P>);
    return tree as Q;
  }

  public removeNodeAt(nodeId: string): void {
    const siblingIds = this.getSiblingIds(nodeId);
    if (siblingIds.length > 1) {
      return super.removeNodeAt(nodeId);
    }
    const parentId = this.getParentNodeId(nodeId);
    const siblingContent = this.getChildContentAt(siblingIds[0]);

    this.replaceNodeContent(parentId, siblingContent);

    super.removeNodeAt(siblingIds[0]);
    super.removeNodeAt(nodeId);
  }

  // *tmc* I don't think generics are necessary or even useful?
  protected static validateTree<T>(tree: ITree<T>) {
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

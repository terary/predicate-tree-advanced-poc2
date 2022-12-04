const todo = `
  This class is misnamed.  It has methods like appendContentWith[And | Or]
  which is a logic operation.

  This class in theory should have appendContentWithJunction - only
  And then a subclass which specifies And|Or.

  This will allow this class to be used for arithmetic trees, or other
  forms of trees.

`;

import { AbstractDirectedGraph } from "../AbstractDirectedGraph";
import { ITree } from "../ITree";
import { TGenericNodeContent, TNodePojo, TTreePojo } from "../types";
import { ExpressionTreeError } from "./ExpressionTreeError";
import { IAppendChildNodeIds } from "./IAppendChildNodeIds";
const defaultFromPojoTransform = <P>(nodeContent: TNodePojo<P>): TGenericNodeContent<P> => {
  return nodeContent.nodeContent;
};

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

  public appendContentWithJunction(
    parentNodeId: string,
    junctionContent: TGenericNodeContent<P>,
    nodeContent: TGenericNodeContent<P>
  ): IAppendChildNodeIds {
    if (this.isBranch(parentNodeId)) {
      super.replaceNodeContent(parentNodeId, junctionContent as TGenericNodeContent<P>);
      const nullValueChildren = this.#getChildrenWithNullValues(parentNodeId);
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
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  #getChildrenWithNullValues(parentNodeId: string): string[] {
    const childrenIds = this.getChildrenNodeIdsOf(parentNodeId);
    return childrenIds.filter((childId) => {
      return this.getChildContentAt(childId) === null;
    });
  }

  static fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P> = defaultFromPojoTransform
  ): Q {
    const tree = AbstractDirectedGraph.fromPojo<P, Q>(srcPojoTree, transform);
    AbstractExpressionTree.validateTree(tree as unknown as AbstractExpressionTree<P>);
    return tree as Q;
  }

  protected fromPojoAppendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<P>
  ): string {
    /* istanbul ignore next - if this fails the larger fromPojo operation fails and that is thoroughly tested */
    return this.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  private _getSiblingIds(nodeId: string) {
    return super.getSiblingIds(nodeId);
  }

  public removeNodeAt(nodeId: string): void {
    const siblingIds = this._getSiblingIds(nodeId);
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
          throw new ExpressionTreeError(
            `Tree fails no-single-child rule. childIds: '${childrenIds.join("', '")}'.`
          );
        }
      }
    });
  }
}

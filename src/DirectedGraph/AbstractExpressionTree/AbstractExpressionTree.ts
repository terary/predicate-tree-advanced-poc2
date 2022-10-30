import { AbstractDirectedGraph } from "../AbstractDirectedGraph";
import { ITree } from "../ITree";
import { TGenericNodeContent, TNodePojo, TTreePojo } from "../types";

const junctionOperators = ["&&", "||", "$or", "$and"];

interface IAppendChildNodeIds {
  newNodeId: string;
  originalContentNodeId?: string; // ONLY set if isNewBranch is true, represents where the content went
  junctionNodeId: string; // this will ALWAYS be the nodeId provided to append*(nodeId)
  isNewBranch: boolean;
}
interface IAbstractExpressionTreeOptions<T> {
  isBranchNodeContent?: (nodeContent: T) => boolean;
}
const testIsBranchContent = <T>(nodeContent: TGenericNodeContent<T>) => {
  if (nodeContent instanceof Object) {
    // @ts-ignore
    return junctionOperators.includes(nodeContent?.operator);
  }

  // subtrees?
  return false;
};

export class AbstractExpressionTree<OPERAND, JUNCTION> extends AbstractDirectedGraph<
  OPERAND | JUNCTION
> {
  private _isBranchNodeContent: (nodeContent: OPERAND | JUNCTION) => boolean;
  constructor(
    rootNodeId = "_root_",
    nodeContent?: OPERAND | JUNCTION,
    options: IAbstractExpressionTreeOptions<OPERAND | JUNCTION> = {}
  ) {
    super(rootNodeId, nodeContent);
    this._isBranchNodeContent = options.isBranchNodeContent || testIsBranchContent;
    // this._isJunction = options?.isJunction || isJunction;
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

    const originalContent = this.getChildContent(parentNodeId);
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

  public isBranchNodeContent(nodeContent: TGenericNodeContent<OPERAND | JUNCTION>): boolean {
    // @ts-ignore
    return this._isBranchNodeContent(nodeContent);
  }

  public appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<OPERAND | JUNCTION>
  ): string {
    // at this time, only *fromPojo is calling this function.
    // need to move traverse tree logic from utilities to
    // to static methods?
    return this.appendChildNodeWithContentFromPojo(parentNodeId, nodeContent);
  }

  public appendChildNodeWithContentFromPojo(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<OPERAND | JUNCTION>
  ): string {
    if (this.isBranch(parentNodeId)) {
      return super.appendChildNodeWithContent(parentNodeId, nodeContent);
    }
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);

    // const originalContent = this.getChildContent(parentNodeId);
    // const originalContentId = super.appendChildNodeWithContent(parentNodeId, originalContent);

    // let newNodeId;
    // if (this.isBranchNodeContent(nodeContent)) {
    //   this.replaceNodeContent(parentNodeId, nodeContent);
    //   newNodeId = super.appendChildNodeWithContent(parentNodeId, null);
    // } else {
    //   this.replaceNodeContent(parentNodeId, null);
    //   newNodeId = super.appendChildNodeWithContent(parentNodeId, nodeContent);
    // }
    // this.replaceNodeContent(parentNodeId, null);
    // const newNodeId = super.appendChildNodeWithContent(parentNodeId, nodeContent);
    // return newNodeId;
  }

  static fromPojo<T>(srcPojoTree: TTreePojo<T>): ITree<T> {
    const tree = AbstractDirectedGraph.fromPojo(
      srcPojoTree,
      undefined,
      AbstractExpressionTree
    );

    return tree;
  }
}

import { AbstractTree } from "../AbstractTree/AbstractTree";
import { AbstractDirectedGraph } from "../AbstractDirectedGraph";

import { IAppendChildNodeIds } from "./IAppendChildNodeIds";

import { IExpressionTree } from "../ITree";
import type { TGenericNodeContent, TNodePojo, TTreePojo } from "../types";
import { ExpressionTreeError } from "./ExpressionTreeError";

const defaultFromPojoTransform = <P>(nodeContent: TNodePojo<P>): TGenericNodeContent<P> => {
  return nodeContent.nodeContent;
};

type TAppendedNode<T> = {
  nodeId: string;
  nodeContent: TGenericNodeContent<T>;
};

type AppendNodeResponseType<T> = {
  appendedNodes: TAppendedNode<T>[];
  junctionNode: TAppendedNode<T>;
  invisibleChild: TAppendedNode<T> | null; // if we move convert leaf to branch, this child becomes leaf
};

export class AbstractExpressionTree<P> extends AbstractTree<P> implements IExpressionTree<P> {
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

  public appendBranch(
    parentNodeId: string,
    junctionNodeContent: TGenericNodeContent<P>,
    ...leafNodes: P[]
  ): AppendNodeResponseType<P> {
    `
      if isBranch 
        replace content with junction
        childrenTarget = parentNodeId
      if isLeaf
        preserve originalContent
        replace content with junction
        childrenTarget = parentNodeId
        appendChild(childrenTarget, originalContent)
        appendChild(childrenTarget, null) // no singleChildren - or ONLY if leafs.length ==0
      end-if
    
      appendChildren
    
    `;
    // ------------------------
    let invisibleChild: TAppendedNode<P> | null = null;
    let childrenTarget: string | null = null;

    if (this.isBranch(parentNodeId)) {
      this.replaceNodeContent(parentNodeId, junctionNodeContent);
      childrenTarget = parentNodeId;
    } else if (this.isLeaf(parentNodeId)) {
      //
      const originalContent = this.getChildContentAt(parentNodeId);
      this.replaceNodeContent(parentNodeId, junctionNodeContent);
      childrenTarget = parentNodeId; //
      invisibleChild = {
        nodeId: this.appendChildNodeWithContent(parentNodeId, originalContent),
        nodeContent: originalContent,
      };
    } else {
      throw new Error("THIS AINT DONE YET");
    }
    const junctionNode = {
      nodeContent: this.getChildContentAt(parentNodeId),
      nodeId: parentNodeId,
    };

    //--
    const appendedNodes = leafNodes.map((leafNode) => {
      return {
        nodeId: this.appendChildNodeWithContent(childrenTarget || "_NOT_FOUND_", leafNode),
        nodeContent: leafNode,
      } as TAppendedNode<P>;
    });
    return {
      appendedNodes,
      junctionNode,
      invisibleChild,
    };
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
    //
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

  protected appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<P>
  ): string {
    const nullValueSiblings = this.#getChildrenWithNullValues(parentNodeId);
    if (nullValueSiblings.length > 0) {
      super.replaceNodeContent(nullValueSiblings[0], nodeContent);
      return nullValueSiblings[0];
    }
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  public cloneAt(nodeId: string): AbstractExpressionTree<P> {
    const pojo = this.toPojoAt(nodeId);
    return AbstractDirectedGraph.fromPojo(pojo, defaultFromPojoTransform);
  }

  /**
   * The tricky bit here is that the  subtree._rootNodeId
   * must be the same as parent's node.nodeId
   * @param targetParentNodeId
   * @returns
   */
  public createSubtreeAt(parentNodeId: string): IExpressionTree<P> {
    // can we rethink this.  Is there a better way?
    // @ts-ignore - not newable, I believe ok in javascript, not ok in typescript
    const subtree = new this.constructor(parentNodeId) as typeof this;

    const subtreeParentNodeId = super.appendChildNodeWithContent(
      parentNodeId,
      subtree as unknown as IExpressionTree<P>
    );

    subtree._rootNodeId = subtreeParentNodeId;
    subtree._nodeDictionary = {};
    subtree._nodeDictionary[subtree._rootNodeId] = { nodeContent: null };
    subtree._incrementor = this._incrementor;

    return subtree;
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
  protected static validateTree<T>(tree: AbstractExpressionTree<T>) {
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

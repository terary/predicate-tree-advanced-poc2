import { AbstractTree, TGenericNodeContent } from "../../../src";
import { AbstractDirectedGraph } from "../../../src/DirectedGraph/AbstractDirectedGraph/AbstractDirectedGraph";
// import { TPredicateNodeTypes } from "../types";
import { TPredicateTypes } from "../types";

class LinkedList<T extends object> extends AbstractDirectedGraph<T> {
  private _lastNodeId!: string;

  constructor(rootNodeId?: string, nodeContent?: T) {
    // if this isn't going to be a true LinkList, dont call it a LinkedList
    super(rootNodeId, { operator: "$notTree" } as T);
    if (nodeContent !== undefined) {
      this.appendChildNode(nodeContent);
    }

    // this.setLastNodeId(this._rootNodeId);
  }

  //   make root content 'not'
  //   make all nodes children of root
  public appendChildNode(nodeContent: TGenericNodeContent<T>): string {
    return this.appendChildNodeWithContent(this._lastNodeId, nodeContent);
  }

  public appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<T>
  ): string {
    return super.appendChildNodeWithContent(this.rootNodeId, nodeContent);
    // if (this.getChildContentAt(this.rootNodeId)) {
    //   super.replaceNodeContent(this.rootNodeId, nodeContent);
    //   return this.rootNodeId;
    // } else {
    //   const lastNodeId = super.appendChildNodeWithContent(
    //     this._lastNodeId,
    //     nodeContent
    //   );
    //   this.setLastNodeId(lastNodeId);
    //   return lastNodeId;
    // }
  }

  public getTreeContentAt(
    nodeId?: string,
    shouldIncludeSubtrees?: boolean
  ): TGenericNodeContent<T>[] {
    return super.getTreeContentAt(nodeId, true);
  }

  public removeNodeAt(nodeId: string): void {
    if (this.rootNodeId === nodeId) {
      // throw?
    } else {
      super.removeNodeAt(nodeId);
    }
    // have to move child to parent
    // if nodeId === lastNodeId -> lastNodeId = childId

    // const childIds = this.getChildrenNodeIdsOf(nodeId);

    // if (childIds.length === 1) {
    //   this.move(childIds[0], nodeId);
    // } else if (childIds.length === 0) {
    //   const parentNodeId = this.getParentNodeId(nodeId);
    //   this.removeNodeAt(nodeId);
    //   this.setLastNodeId(parentNodeId);
    // }
  }

  private setLastNodeId(nodeId: string) {
    this._lastNodeId = nodeId;
  }

  get lastNodeId() {
    return this._lastNodeId;
  }
}

class NotTree extends LinkedList<
  TPredicateTypes | AbstractTree<TPredicateTypes>
> {}

// probably better to create file LinkedList
export { NotTree };

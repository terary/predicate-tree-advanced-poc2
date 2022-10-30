import { ITreeVisitor } from "../../DirectedGraph/ITree";
import { TGenericNodeContent } from "../../DirectedGraph/types";

class TestTreeVisitor<T> implements ITreeVisitor<T> {
  public includeSubtrees = true;
  public contentItems: any[] = [];
  public contentItemsExt: any[] = [];
  public rootNodeIds: string[] = [];
  public uniqueVisits: any = {};
  visit(nodeId: string, nodeContent: TGenericNodeContent<T>, parentId: string) {
    this.contentItems.push({ ...nodeContent }); // probably not do this, need to fix tests
    this.contentItemsExt.push({ ...nodeContent, nodeId, parentId });
    if (nodeId === parentId) {
      this.rootNodeIds.push(parentId);
    }
    const uniqueKey = [nodeId, parentId].sort().join(":");
    if (uniqueKey in this.uniqueVisits) {
      this.uniqueVisits[uniqueKey] += 1;
    } else {
      this.uniqueVisits[uniqueKey] = 1;
    }
  }

  get countUniqueVisits() {
    return Object.values(this.uniqueVisits).reduce((prev, cur, curIdx, ary) => {
      return (prev as number) + (cur as number);
    }, 0);
    // return Object.keys(this.uniqueVisits).length;
  }

  get countRootIds() {
    return this.rootNodeIds.length;
  }
}

export { TestTreeVisitor };

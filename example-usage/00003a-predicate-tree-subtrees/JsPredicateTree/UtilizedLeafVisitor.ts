import type { TPredicateNodeTypes, TOperand } from "../types";
import { ITreeVisitor } from "../../../src";
import type { TGenericNodeContent } from "../../../src";

class UtilizedLeafVisitor implements ITreeVisitor<TPredicateNodeTypes> {
  includeSubtrees: boolean = false;
  private _utilizedSubjectIds: { [subjectId: string]: string } = {};
  public visit(
    nodeId: string,
    nodeContent: TGenericNodeContent<TPredicateNodeTypes>,
    parentId: string
  ): void {
    if (nodeContent !== null) {
      const { subjectId, operator, value } = nodeContent as TOperand;
      this._utilizedSubjectIds[subjectId] = subjectId;
    }
  }

  get utilizedSubjectIds(): string[] {
    return Object.keys(this._utilizedSubjectIds).sort();
  }
}
export { UtilizedLeafVisitor };

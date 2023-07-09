import type { TPredicateNodeTypes } from "../types";
import { ITreeVisitor } from "../../../src";
import type { TGenericNodeContent } from "../../../src";
declare class UtilizedLeafVisitor implements ITreeVisitor<TPredicateNodeTypes> {
    includeSubtrees: boolean;
    private _utilizedSubjectIds;
    visit(nodeId: string, nodeContent: TGenericNodeContent<TPredicateNodeTypes>, parentId: string): void;
    get utilizedSubjectIds(): string[];
}
export { UtilizedLeafVisitor };

import { AbstractExpressionTree } from "../../../src";
import type { TSubjectDictionary } from "../types";
import { TPredicateTypes, TPredicateNodeTypesOrNull } from "../types";
import { IExpressionTree } from "../../../src";
declare class JsPredicateTree extends AbstractExpressionTree<TPredicateTypes> {
    constructor(rootSeedNodeId?: string, nodeContent?: TPredicateNodeTypesOrNull);
    getNewInstance(rootSeed?: string, nodeContent?: TPredicateNodeTypesOrNull): IExpressionTree<TPredicateTypes>;
    toFunctionBody(rootNodeId: string | undefined, subjects: TSubjectDictionary): string;
    commentedRecord(subjects: TSubjectDictionary): string;
    protected fromPojoAppendChildNodeWithContent(parentNodeId: string, nodeContent: TPredicateNodeTypesOrNull): string;
    createSubtreeAt(nodeId: string): IExpressionTree<TPredicateTypes>;
}
export { JsPredicateTree };

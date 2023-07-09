import { TGenericNodeContent, TNodePojo, TTreePojo, IExpressionTree } from "../../../src";
import { TPredicateNodeTypesOrNull, TPredicateTypes } from "../types";
import { JsPredicateTree } from "./JsPredicateTree";
import { TSubjectDictionary } from "../types";
declare type TTreeInitiator = <P, Q>(rootSeedNodeId: string, nodeContent: P) => Q;
declare class AddressTree extends JsPredicateTree {
    private _subjectId;
    toFunctionBody(rootNodeId: string | undefined, subjects: TSubjectDictionary): string;
    commentedRecord(subjects: TSubjectDictionary): string;
    getNewInstance(rootSeed?: string, nodeContent?: TPredicateNodeTypesOrNull): IExpressionTree<TPredicateTypes>;
    createSubtreeAt(nodeId: string): IExpressionTree<TPredicateTypes>;
    static getNewInstance<P extends object>(rootSeedNodeId?: string, nodeContent?: P): IExpressionTree<P>;
    protected fromPojoAppendChildNodeWithContent(parentNodeId: string, nodeContent: TGenericNodeContent<TPredicateTypes>): string;
    static subfieldNames(): string[];
    static fromPojo<P extends object, Q>(srcPojoTree: TTreePojo<P>, transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>, instanceBuilder?: TTreeInitiator): Q;
    static defaultTreePojo(rootSeedNodeId?: string): TTreePojo<TPredicateTypes>;
}
export { AddressTree };

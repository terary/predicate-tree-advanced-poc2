import { TGenericNodeContent } from "../types";
import { IAppendChildNodeIds } from "../AbstractExpressionTree/IAppendChildNodeIds";
import { ITree } from "../ITree";
interface IObfuscatedExpressionTree<P extends object> extends ITree<P> {
    appendContentWithJunction(parentNodeId: string, junctionContent: TGenericNodeContent<P>, nodeContent: TGenericNodeContent<P>): IAppendChildNodeIds;
}
export { IObfuscatedExpressionTree };

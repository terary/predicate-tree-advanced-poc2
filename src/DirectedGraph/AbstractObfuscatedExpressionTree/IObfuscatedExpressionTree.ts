import { TGenericNodeContent, TNodePojo, TTreePojo } from "../types";
import { IAppendChildNodeIds } from "../AbstractExpressionTree/IAppendChildNodeIds";
import { ITree, ITreeVisitor } from "../ITree";

interface IObfuscatedExpressionTree<P> extends ITree<P> {
  appendContentWithJunction(
    parentNodeId: string,
    junctionContent: TGenericNodeContent<P>,
    nodeContent: TGenericNodeContent<P>
  ): IAppendChildNodeIds;
}
export { IObfuscatedExpressionTree };

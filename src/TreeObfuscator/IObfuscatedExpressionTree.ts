import { TGenericNodeContent, TNodePojo, TTreePojo } from "../DirectedGraph/types";
import { IAppendChildNodeIds } from "../DirectedGraph/AbstractExpressionTree/IAppendChildNodeIds";
import { ITree, ITreeVisitor } from "../DirectedGraph/ITree";

interface IObfuscatedExpressionTree<P> extends ITree<P> {
  appendContentWithJunction(
    parentNodeId: string,
    junctionContent: TGenericNodeContent<P>,
    nodeContent: TGenericNodeContent<P>
  ): IAppendChildNodeIds;
}
export { IObfuscatedExpressionTree };

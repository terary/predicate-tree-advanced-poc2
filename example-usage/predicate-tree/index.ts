import type { TPredicateNodeTypes } from "./types";
import { AbstractObfuscatedExpressionTree } from "../../src";
import { AbstractExpressionTree } from "../../src/DirectedGraph/AbstractExpressionTree";
import { TGenericNodeContent } from "../../src/DirectedGraph/types";

class InternalExpressionTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
class ObfuscateExpressionTree extends AbstractObfuscatedExpressionTree<TPredicateNodeTypes> {
  public appendContentWithAnd(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<TPredicateNodeTypes>
  ): string {
    return super.appendContentWithJunction(parentNodeId, { operator: "$and" }, nodeContent)
      .newNodeId;
  }
}

const predicateTree = new ObfuscateExpressionTree(new InternalExpressionTree());

predicateTree.replaceNodeContent(predicateTree.rootNodeId, { operator: "$and" });

predicateTree.appendContentWithAnd(predicateTree.rootNodeId, {
  subjectId: "customer.firstname",
  operator: "$eq",
  value: "Flinstone",
});

predicateTree.appendContentWithAnd(predicateTree.rootNodeId, {
  subjectId: "customer.lastname",
  operator: "$eq",
  value: "Fred",
});

const x = predicateTree.toPojoAt();

console.log(predicateTree.toPojoAt());

const predicateTreeToJavaScriptMatcher = (pTree: ObfuscateExpressionTree): Function => {
  pTree.getChildContentAt(pTree.rootNodeId);

  const fnBody = "return true;";

  return new Function("record", fnBody);
};

const matcherFn = predicateTreeToJavaScriptMatcher(predicateTree);

console.log("Iam", {
  matcherFn,
  value: matcherFn(""),
});

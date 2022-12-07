import type {
  TPredicateNodeTypes,
  TPredicateTypes,
  TJunction,
  TOperandOperators,
  TOperand,
} from "./types";
import { AbstractObfuscatedExpressionTree } from "../../src";
import { AbstractExpressionTree, ITreeVisitor } from "../../src";
import type { TGenericNodeContent } from "../../src";
import { IAppendChildNodeIds } from "../../src/DirectedGraph/AbstractExpressionTree/IAppendChildNodeIds";

type TSubjectType = {
  datatype: "string" | "number" | "date";
  label: string;
};

const Subjects: { [subjectId: string]: TSubjectType } = {
  "customer.firstname": {
    datatype: "string",
    label: "First Name",
  },
  "customer.lastname": {
    datatype: "string",
    label: "Last Name",
  },
};

class InternalExpressionTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
class LeafVisitor implements ITreeVisitor<TPredicateNodeTypes> {
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

class ObfuscateExpressionTree extends AbstractObfuscatedExpressionTree<TPredicateNodeTypes> {
  public appendContentWithAnd(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<TPredicateNodeTypes>
  ): string {
    return super.appendContentWithJunction(parentNodeId, { operator: "$and" }, nodeContent)
      .newNodeId;
  }

  public appendContentWithOr(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<TPredicateNodeTypes>
  ): string {
    return super.appendContentWithJunction(parentNodeId, { operator: "$or" }, nodeContent)
      .newNodeId;
  }

  public appendContentWithJunction(
    parentNodeId: string,
    junction: TJunction,
    nodeContent: TGenericNodeContent<TPredicateNodeTypes>
  ): IAppendChildNodeIds {
    return super.appendContentWithJunction(parentNodeId, junction, nodeContent);
  }
}

const predicateTree = new ObfuscateExpressionTree(new InternalExpressionTree());

const flintstonePredicateId = predicateTree.appendContentWithJunction(
  predicateTree.rootNodeId,
  { operator: "$or" },
  {
    value: "Flintstone",
    subjectId: "customer.lastname",
    operator: "$eq",
  }
);
const rubblePredicateId = predicateTree.appendContentWithJunction(
  predicateTree.rootNodeId,
  { operator: "$or" },
  {
    value: "Rubble",
    subjectId: "customer.lastname",
    operator: "$eq",
  }
);

const wilmaPredicateId = predicateTree.appendContentWithAnd(flintstonePredicateId.newNodeId, {
  value: "Wilma",
  subjectId: "customer.firstname",
  operator: "$eq",
});
const fredPredicateId = predicateTree.appendContentWithOr(wilmaPredicateId, {
  value: "Fred",
  subjectId: "customer.firstname",
  operator: "$eq",
});

const bettyPredicateId = predicateTree.appendContentWithAnd(rubblePredicateId.newNodeId, {
  value: "Betty",
  subjectId: "customer.firstname",
  operator: "$eq",
});
const barnyPredicateId = predicateTree.appendContentWithOr(bettyPredicateId, {
  value: "Barney",
  subjectId: "customer.firstname",
  operator: "$eq",
});

const x = predicateTree.toPojoAt();

console.log(predicateTree.toPojoAt());

const junctionOperator = (junction: TJunction) => {
  if (junction.operator === "$and") {
    return "&&";
  }

  if (junction.operator === "$or") {
    return "||";
  }

  throw Error(`Unrecognized junction operator: "${junction.operator}".`);
};

const predicateOperatorToJsOperator = (operator: TOperandOperators) => {
  switch (operator) {
    case "$eq":
      return "===";
    case "$gt":
      return ">";
    case "$gte":
      return ">=";
    case "$lt":
      return "<";
    case "$lte":
      return "<=";
    default:
      return operator;
  }
};

const quoteValue = (nodeContent: TOperand) => {
  const { datatype } = Subjects[nodeContent.subjectId];
  const { value } = nodeContent;
  switch (datatype) {
    case "string":
      return `'${value}'`;
    case "number":
      return value;
    default:
      return value;
  }
};

const TAB = (tabCount: number) => {
  return " ".repeat(tabCount);
};
const traverseTree = (
  rootNodeId: string,
  pTree: AbstractExpressionTree<TPredicateNodeTypes>,
  tabCount = 0
): string => {
  const nodeContent = pTree.getChildContentAt(rootNodeId);

  if (nodeContent instanceof AbstractExpressionTree) {
    return traverseTree(
      nodeContent.rootNodeId,
      nodeContent as AbstractExpressionTree<TPredicateNodeTypes>
    );
  }

  if (pTree.isLeaf(rootNodeId)) {
    const { subjectId, operator, value } = nodeContent as TOperand;
    const quotedValue = quoteValue(nodeContent as TOperand);
    const term = `record['${subjectId}'] ${predicateOperatorToJsOperator(
      operator
    )} ${quotedValue}`;
    return `${term}`;
  }

  const childrenIds = pTree.getChildrenNodeIdsOf(rootNodeId);
  const childrenAsJs = childrenIds.map((childId) => {
    return traverseTree(childId, pTree, tabCount + 1);
  });

  return (
    `(\n${TAB(tabCount)}` +
    childrenAsJs.join(` ${junctionOperator(nodeContent as TJunction)} `) +
    `\n${TAB(tabCount)})`
  );
};

const commentOutObject = (obj: Object): string => {
  const json = JSON.stringify(obj, null, 2);
  return "//" + json.replace(/\n/gi, "\n//");
};

const predicateTreeToJavaScriptMatcher = (pTree: ObfuscateExpressionTree): Function => {
  const leafVisitor = new LeafVisitor();
  pTree.visitLeavesOf(leafVisitor);

  const recordProperties = leafVisitor.utilizedSubjectIds.map((subjectId) => {
    const { datatype } = Subjects[subjectId];
    return `${subjectId}: ${datatype}`;
  });
  const recordShape = {
    record: recordProperties,
  };

  const expression = traverseTree(pTree.rootNodeId, pTree);
  const fnBody = [commentOutObject(recordShape), `\nreturn ${expression}`].join("");

  console.log(fnBody);
  return new Function("record", fnBody);
};
clean up this mess
Then create similar example with subtree


const matcherFn = predicateTreeToJavaScriptMatcher(predicateTree) as Function;
matcherFn.toString();
console.log("Iam", {
  matcherFn: matcherFn.toString(),
  'matcherFn({ "customer.firstname": "Fred", "customer.lastname": "Flintstone" })': matcherFn({
    "customer.firstname": "Fred",
    "customer.lastname": "Flintstone",
  }),
  'matcherFn({ "customer.firstname": "Barney", "customer.lastname": "Rubble" })': matcherFn({
    "customer.firstname": "Barney",
    "customer.lastname": "Rubble",
  }),
  'matcherFn({ "customer.firstname": "Barney", "customer.lastname": "Flintstone" })':
    matcherFn({
      "customer.firstname": "Barney",
      "customer.lastname": "Flintstone",
    }),
});

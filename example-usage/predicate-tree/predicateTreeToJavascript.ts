import type {
  TPredicateNodeTypes,
  TPredicateTypes,
  TJunction,
  TOperandOperators,
  TOperand,
} from "./types";
import { LeafVisitor } from "./LeafVisitor";
import { AbstractObfuscatedExpressionTree } from "../../src";
import { AbstractExpressionTree, ITreeVisitor } from "../../src";
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

const TAB = (tabCount: number) => {
  return " ".repeat(tabCount);
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
const junctionOperator = (junction: TJunction) => {
  if (junction.operator === "$and") {
    return "&&";
  }

  if (junction.operator === "$or") {
    return "||";
  }

  throw Error(`Unrecognized junction operator: "${junction.operator}".`);
};

const buildExpressionFromTree = (
  rootNodeId: string,
  pTree: AbstractExpressionTree<TPredicateNodeTypes>,
  tabCount = 0
): string => {
  const nodeContent = pTree.getChildContentAt(rootNodeId);

  if (nodeContent instanceof AbstractExpressionTree) {
    return buildExpressionFromTree(
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
    return buildExpressionFromTree(childId, pTree, tabCount + 1);
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

const matcherRecordShape = (pTree: AbstractObfuscatedExpressionTree<TPredicateNodeTypes>) => {
  const leafVisitor = new LeafVisitor();
  pTree.visitLeavesOf(leafVisitor);
  const recordProperties = leafVisitor.utilizedSubjectIds.map((subjectId) => {
    const { datatype } = Subjects[subjectId];
    return `${subjectId}: ${datatype}`;
  });
  const recordShape = {
    record: recordProperties,
  };

  return commentOutObject(recordShape);
};

const predicateTreeToJavaScriptMatcher = (
  pTree: AbstractObfuscatedExpressionTree<TPredicateNodeTypes>
): Function => {
  const matcherExpression = buildExpressionFromTree(pTree.rootNodeId, pTree);
  const fnBody = [matcherRecordShape(pTree), `\nreturn ${matcherExpression}`].join("");

  console.log(fnBody);
  return new Function("record", fnBody);
};

export { predicateTreeToJavaScriptMatcher };

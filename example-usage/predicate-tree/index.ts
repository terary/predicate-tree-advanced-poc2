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
import assert from "assert";
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
  // public appendContentWithAnd(
  //   parentNodeId: string,
  //   nodeContent: TGenericNodeContent<TPredicateNodeTypes>
  // ): string {
  //   return super.appendContentWithJunction(parentNodeId, { operator: "$and" }, nodeContent)
  //     .newNodeId;
  // }
  public x_appendContentWithAnd(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<TPredicateNodeTypes>
  ): IAppendChildNodeIds {
    return super.appendContentWithJunction(parentNodeId, { operator: "$and" }, nodeContent);
  }

  // public appendContentWithOr(
  //   parentNodeId: string,
  //   nodeContent: TGenericNodeContent<TPredicateNodeTypes>
  // ): string {
  //   return super.appendContentWithJunction(parentNodeId, { operator: "$or" }, nodeContent)
  //     .newNodeId;
  // }

  public x_appendContentWithOr(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<TPredicateNodeTypes>
  ): IAppendChildNodeIds {
    return super.appendContentWithJunction(parentNodeId, { operator: "$or" }, nodeContent);
  }

  public appendContentWithJunction(
    parentNodeId: string,
    junction: TJunction,
    nodeContent: TGenericNodeContent<TPredicateNodeTypes>
  ): IAppendChildNodeIds {
    return super.appendContentWithJunction(parentNodeId, junction, nodeContent);
  }

  public appendChildNodeWithContent(
    parentNodeKey: string,
    nodeContent: TGenericNodeContent<TPredicateNodeTypes>
  ): string {
    return super.appendChildNodeWithContent(parentNodeKey, nodeContent);
  }
}
`
const [nodes]=  (operator, arg1, arg2)



`;
const predicateTree = new ObfuscateExpressionTree(new InternalExpressionTree());

const flintstoneLastNamePredicate = {
  value: "Flintstone",
  subjectId: "customer.lastname",
  operator: "$eq",
} as TOperand;
const rubbleLastNamePredicate = {
  value: "Rubble",
  subjectId: "customer.lastname",
  operator: "$eq",
} as TOperand;
const wilmaPredicate = {
  value: "Wilma",
  subjectId: "customer.firstname",
  operator: "$eq",
} as TOperand;

const bettyPredicate = {
  value: "Betty",
  subjectId: "customer.firstname",
  operator: "$eq",
} as TOperand;

const barneyPredicate = {
  value: "Barney",
  subjectId: "customer.firstname",
  operator: "$eq",
} as TOperand;
const fredPredicate = {
  value: "Fred",
  subjectId: "customer.firstname",
  operator: "$eq",
} as TOperand;

const flintstoneBranch = predicateTree.appendBranch(
  predicateTree.rootNodeId,
  { operator: "$or" },
  flintstoneLastNamePredicate
);

const flintstoneFirstBranch2 = predicateTree.appendBranch(
  // @ts-ignore
  flintstoneBranch.appendedNodes[0].nodeId,
  { operator: "$and" },
  wilmaPredicate
  // fredPredicate
);
const flintstoneFirstBranch = predicateTree.appendBranch(
  // @ts-ignore
  flintstoneFirstBranch2.appendedNodes[0].nodeId,
  { operator: "$or" },
  // wilmaPredicate,
  fredPredicate
);

//predicateTree.replaceNodeContent(predicateTree.rootNodeId, flintstoneLastNamePredicate);
const rubbleBranch = predicateTree.appendBranch(
  predicateTree.rootNodeId,
  { operator: "$or" },
  rubbleLastNamePredicate
);
const rubbleFirstBranch2 = predicateTree.appendBranch(
  // @ts-ignore
  rubbleBranch.appendedNodes[0].nodeId,
  { operator: "$and" },
  bettyPredicate
  // fredPredicate
);
const rubbleFirstBranch = predicateTree.appendBranch(
  // @ts-ignore
  rubbleFirstBranch2.appendedNodes[0].nodeId,
  { operator: "$or" },
  // wilmaPredicate,
  barneyPredicate
);

// ----------------------------------------------
`
  You know what the tree is supposed to look like
                    ||
              &&            &&
          Ln      ||      Ln    ||
                Fn  Fn        Fn   Fn


walk through and see that its doing that

                `;

const x = predicateTree.toPojoAt();

console.log(JSON.stringify(predicateTree.toPojoAt(), null, 2));

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

const matcherRecordShape = (pTree: ObfuscateExpressionTree) => {
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

const predicateTreeToJavaScriptMatcher = (pTree: ObfuscateExpressionTree): Function => {
  const matcherExpression = buildExpressionFromTree(pTree.rootNodeId, pTree);
  const fnBody = [matcherRecordShape(pTree), `\nreturn ${matcherExpression}`].join("");

  console.log(fnBody);
  return new Function("record", fnBody);
};

const matcherFn = predicateTreeToJavaScriptMatcher(predicateTree) as Function;

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

[
  { "customer.firstname": "Barney", "customer.lastname": "Rubble", shouldBe: true },
  { "customer.firstname": "Betty", "customer.lastname": "Rubble", shouldBe: true },
  { "customer.firstname": "Fred", "customer.lastname": "Flintstone", shouldBe: true },
  { "customer.firstname": "Wilma", "customer.lastname": "Flintstone", shouldBe: true },

  { "customer.firstname": "Betty", "customer.lastname": "Flintstone", shouldBe: false },
  { "customer.firstname": "Wilma", "customer.lastname": "Rubble", shouldBe: false },
].forEach((name) => {
  console.log(`matcher(${JSON.stringify(name)})`, matcherFn(name));
  assert.strictEqual(matcherFn(name), name.shouldBe);
});

import type {
  TPredicateNodeTypes,
  TOperand,
  TPredicateTypes,
  TPredicateTypesJs,
  TJunction,
} from "./types";
import { AbstractExpressionTree } from "../src/DirectedGraph/AbstractExpressionTree/AbstractExpressionTree";
import { ITree } from "../src/DirectedGraph/ITree";
import { ITreeVisitor } from "../src/DirectedGraph/ITree";
import { TGenericNodeContent, TNodePojo, TTreePojo } from "../src/DirectedGraph/types";
import type { TSubject, TSubjectDataTypes, TSubjectDictionary } from "./PredicateTreeJs/type";
import { PredicateTreeJs } from "./PredicateTreeJs/PredicateTreeJs";
class LeafVisitor implements ITreeVisitor<PredicateTree> {
  public includeSubtrees = false;
  public leaves: TOperand[] = [];
  public uniqueSubjects: { [subjectId: string]: TSubject } = {};
  public subjectDictionary: TSubjectDictionary;

  constructor(subjectDictionary: TSubjectDictionary) {
    this.subjectDictionary = subjectDictionary;
  }

  // @ts-ignore nodeContent tree or leaf?
  visit(nodeId: string, nodeContent: TPredicateTypes, parentId: string) {
    const operand = nodeContent as TOperand;
    this.leaves.push(nodeContent as TOperand);
    this.uniqueSubjects[operand.subjectId] = this.subjectDictionary[operand.subjectId];
  }
}

const tree2jsMatcher = (
  tree: ITree<PredicateTree>,
  subjects: TSubjectDictionary
): Function => {
  const leafVisitor = new LeafVisitor(subjects);

  // @ts-ignore - LeafVisitor implements wrong type
  tree.visitLeavesOf(leafVisitor);

  console.log({ leaves: leafVisitor.leaves });

  const recordShape = `
    // record: ${Object.keys(leafVisitor.uniqueSubjects).join(", ")}
  `;

  const source = recordShape + "\n" + "return record";
  return new Function("record", source);
};

class PredicateTree extends AbstractExpressionTree<TPredicateNodeTypes> {
  spillGuts() {
    console.log(this);
    console.log(this._nodeDictionary);
  }
}
// @ts-ignore

const childPredicate0: TOperand = {
  operator: "$lt",
  subjectId: "child_0",
  value: "child_0",
};
const childPredicate1: TOperand = {
  operator: "$gte",
  subjectId: "child_1",
  value: 3,
};

const subjects: TSubjectDictionary = {
  child_0: {
    subjectId: "child_0",
    datatype: "string",
    label: "Child 0",
  },
  child_1: {
    subjectId: "child_1",
    datatype: "number",
    label: "Child 1",
  },
};

const pTree = new PredicateTree();
// pTree.replaceNodeContent(pTree.rootNodeId, rootPredicate);
pTree.appendContentWithAnd(pTree.rootNodeId, childPredicate0);
pTree.appendContentWithAnd(pTree.rootNodeId, childPredicate1);

// const matcher = tree2jsMatcher(pTree as unknown as ITree<PredicateTree>, subjects);
// const src = matcher.toString();
// const matcherOutput = matcher({ x: "x", y: "y" });
// console.log({ matcherOutput });
// console.log(src);

const pojo = pTree.toPojo();
const prettyPrint = true;
const pTreeJs = PredicateTreeJs.fromPojo3(pojo);
console.log({ pTreeJs });
const matcher = pTreeJs.toJsMatcherFunction(subjects, !prettyPrint);

console.log({
  matcher,
  src: matcher.toString(),
  result: matcher({ child_0: "a", child_1: 5 }),
});

console.log(matcher.toString());

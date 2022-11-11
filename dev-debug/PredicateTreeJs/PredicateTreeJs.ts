import type {
  TPredicateNodeTypes,
  TOperand,
  TPredicateTypes,
  TPredicateTypesJs,
  TJunction,
} from "../types";
import { AbstractExpressionTree } from "../../src/DirectedGraph/AbstractExpressionTree/AbstractExpressionTree";
import { AbstractDirectedGraph } from "../../src/DirectedGraph/AbstractDirectedGraph";
import { ITree } from "../../src/DirectedGraph/ITree";
import { ITreeVisitor } from "../../src/DirectedGraph/ITree";
import { TGenericNodeContent, TNodePojo, TTreePojo } from "../../src/DirectedGraph/types";
import type { TSubject, TSubjectDataTypes, TSubjectDictionary } from "./type";
import type { TOperandJs } from "../types";

// TPredicateTypesJs
const defaultFromPojoTransform = <T>(nodeContent: TNodePojo<T>): TGenericNodeContent<T> => {
  const predicate = nodeContent.nodeContent as unknown as TPredicateTypes;
  const nodeContentJs: TPredicateTypesJs = {} as TPredicateTypesJs;
  if (predicate.operator) {
    if (["$and", "$or"].includes(predicate.operator)) {
      nodeContentJs.operator = predicate.operator === "$or" ? "||" : "&&";
    } else {
      nodeContentJs.operator = "<=";
      (nodeContentJs as TOperandJs).subjectId = (predicate as TOperand).subjectId;
      (nodeContentJs as TOperandJs).value = (predicate as TOperand).value;
    }
  } else {
    Object.entries(predicate).forEach(([key, value]) => {
      // @ts-ignore
      nodeContent[key] = value;
    });
  }

  // @ts-ignore
  return nodeContentJs as TGenericNodeContent<T>;
  // return nodeContent.nodeContent;
};

const predicate2jsPredicate = (predicate: TPredicateTypes): TPredicateTypesJs => {
  const { operator } = predicate;
  switch (predicate.operator) {
    case "$and":
      return { operator: "&&" };
    case "$or":
      return { operator: "||" };
    case "$eq":
      return { ...predicate, operator: "==" };
    case "$gt":
      return { ...predicate, operator: ">" };
    case "$gte":
      return { ...predicate, operator: ">=" };
    case "$lt":
      return { ...predicate, operator: "<" };
    case "$lte":
      return { ...predicate, operator: "<=" };
  }
};

const x_defaultFromPojoTransform = <T>(
  nodeContent: TNodePojo<TPredicateTypes>
): TGenericNodeContent<TPredicateTypesJs> => {
  const p = nodeContent.nodeContent;
  return predicate2jsPredicate(p);
  // if (["$and", "$or"].includes(p?.operator)) {
  //   return ["$and", "&&"].includes(p?.operator) ? { operator: "&&" } : { operator: "||" };
  // }
  // return {
  //   operator: "==",
  //   subjectId: (p as TOperand)?.subjectId,
  //   value: (p as TOperand)?.value,
  // };
};

const rootPredicate: TJunction = {
  operator: "$and",
};

const quoteValue = (value: number | string, subject: TSubject): number | string => {
  switch (subject.datatype) {
    case "number":
      return value;
      break;
    case "date":
    case "string":
      return `'${value}'`;
    default:
      return value;
  }
};

class PredicateTreeJs extends AbstractExpressionTree<TPredicateTypesJs> {
  spillGuts() {
    console.log(this);
    console.log(this._nodeDictionary);
  }

  private getLeafNodeContent(): TOperandJs[] {
    const visitor = new LeafVisitor({});

    // @ts-ignore - not assignable 'TGenericNodeContent<TPredicateTypesJs>'
    this.visitLeavesOf(visitor);
    return visitor.leaves;
  }

  _toMatcherExpression(
    childId: string,
    subjects: TSubjectDictionary,
    prettyPrint = false
  ): string {
    if (this.isBranch(childId)) {
      const childrenExpressions = this.getChildrenNodeIdsOf(childId).map((childId) => {
        return this._toMatcherExpression(childId, subjects, prettyPrint);
      });
      const { operator } = this.getChildContentAt(childId) as TOperandJs;
      return "(\n" + childrenExpressions.join(` ${operator} `) + "\n)";
    } else {
      const predicate = this.getChildContentAt(childId) as TOperandJs;
      const value = quoteValue(predicate.value, subjects[predicate.subjectId]);
      return `(record['${predicate.subjectId}'] ${predicate.operator} ${value})\n`;
    }
  }

  private toMatcherExpression(subjects: TSubjectDictionary, prettyPrint = false): string {
    const matcherExpression = this._toMatcherExpression(
      this.rootNodeId,
      subjects,
      prettyPrint
    );

    return matcherExpression;
  }

  toJsMatcherFunction(
    subjects: TSubjectDictionary,
    prettyPrint = false
  ): (record: object) => boolean {
    const leafPredicates = this.getLeafNodeContent();
    const subjectIds: { [subjectId: string]: string } = {};
    leafPredicates.forEach((predicate) => {
      subjectIds[predicate.subjectId] = predicate.subjectId;
    });
    const recordFields =
      "//" +
      Object.keys(subjectIds)
        .sort()
        .map((subjectId) => subjects[subjectId]?.datatype)
        .join("\n//");
    const recordDescription = `
    // expecting:
    // record: {
        ${recordFields}
    // }
    `;

    const functionBody = `
      // ${prettyPrint ? recordDescription : ""}
      return ${this.toMatcherExpression(subjects)};
    `;
    // const matcher = new Function("record", "return 1==2;");

    const matcher = new Function("record", functionBody);

    // is this a reasonable Function as arrow function?
    return matcher as (record: object) => boolean;
  }

  static fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P> = defaultFromPojoTransform
  ): Q {
    const tree = AbstractExpressionTree._fromPojo<P, PredicateTreeJs>(
      srcPojoTree,
      transform,
      PredicateTreeJs as unknown as () => PredicateTreeJs
    );
    AbstractExpressionTree.validateTree(tree as unknown as AbstractExpressionTree<P>);
    return tree as unknown as Q; // PredicateTreeJs;
  }

  static x_fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P> = defaultFromPojoTransform
  ): Q {
    const tree = AbstractExpressionTree._fromPojo<P, Q>(
      srcPojoTree,
      transform,
      AbstractExpressionTree as unknown as () => Q
    );
    AbstractExpressionTree.validateTree(tree as unknown as AbstractExpressionTree<P>);
    return tree as Q;
  }
}

export { PredicateTreeJs };

class LeafVisitor implements ITreeVisitor<PredicateTreeJs> {
  public includeSubtrees = false;
  public leaves: TOperandJs[] = [];
  public uniqueSubjects: { [subjectId: string]: TSubject } = {};
  public subjectDictionary: TSubjectDictionary;

  constructor(subjectDictionary: TSubjectDictionary) {
    this.subjectDictionary = subjectDictionary;
  }

  // @ts-ignore nodeContent tree or leaf?
  visit(nodeId: string, nodeContent: TPredicateTypesJs, parentId: string) {
    const operand = nodeContent as TOperandJs;
    this.leaves.push(nodeContent as TOperandJs);
    this.uniqueSubjects[operand.subjectId] = this.subjectDictionary[operand.subjectId];
  }
}

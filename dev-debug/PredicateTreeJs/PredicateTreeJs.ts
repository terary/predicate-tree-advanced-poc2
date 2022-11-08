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

  // need to unfuck fromPojo
  static fromPojo<P>(
    srcPojoTree: TTreePojo<P>,
    transform = defaultFromPojoTransform
  ): PredicateTreeJs {
    // @ts-ignore
    return AbstractExpressionTree.fromPojoAs(
      srcPojoTree,
      transform,
      AbstractExpressionTree
    ) as PredicateTreeJs;
  }

  static x_fromPojo3<P>(
    srcPojoTree: TTreePojo<P>,
    transform = x_defaultFromPojoTransform
  ): PredicateTreeJs {
    const t = new PredicateTreeJs();

    // const tree = AbstractExpressionTree.fromPojo2(
    const tree = AbstractExpressionTree.fromPojo(
      srcPojoTree,
      // @ts-ignore - transformation typing
      transform
      // undefined,
      // PredicateTreeJs
    );

    // @ts-ignore - incompatible tree types
    // t._nodeDictionary = tree._nodeDictionary;
    // t._incrementor = tree._incrementor;
    return tree as PredicateTreeJs;
    // return tree as AbstractExpressionTree<P>;
  }

  // class PredicateTreeJs extends AbstractExpressionTree<TPredicateTypesJs> {

  // static x_fromPojo<P>(
  //   srcPojoTree: TTreePojo<P>,
  //   transform = defaultFromPojoTransform
  // ): PredicateTreeJs {
  //   return AbstractExpressionTree.fromPojoAs<PredicateTreeJs>(
  //     srcPojoTree,
  //     transform,
  //     PredicateTreeJs
  //   );
  // }
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

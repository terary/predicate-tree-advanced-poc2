import { AbstractExpressionTree } from "./AbstractExpressionTree";
import { DirectedGraphError } from "../DirectedGraphError";
import {
  makePojo3Children9Grandchildren,
  makePojo3Children,
  makePojo2Children1subtree9leaves,
} from "./test-utilities";

// import {
//   WidgetSort,
//   make3Children9GrandchildrenTreeAbstract,
//   make3ChildrenSubgraph2Children,
//   filterPojoContent,
//   WidgetType,
// } from "../test-helpers/test.utilities";

type operatorTypes = "==" | "!=" | "<" | ">";

type TJunction = "||" | "&&";
type TOperand = {
  subjectId: string;
  operator: operatorTypes;
  value: any;
};

class ClassTestAbstractExpressionTree<T> extends AbstractExpressionTree<TOperand, TJunction> {}
describe("AbstractExpressionTree", () => {
  describe(".appendChildNode(nodeId, content)", () => {
    // .appendChildNode(nodeId, content)
    // - currently only useful for .fromPojo
    // use .appendChildNodeWith[Junction](nodeId, content)
    // to get expected behavior (demote children, split node, etc)

    it("Should split leaf into branch.", () => {
      const rootPredicate = {
        subjectId: "customers.root",
        operator: "==" as operatorTypes,
        value: "root",
      };
      const childPredicate0 = {
        subjectId: "customers.child0",
        operator: "==" as operatorTypes,
        value: "child0",
      };
      const childPredicate1 = {
        subjectId: "customers.child1",
        operator: "==" as operatorTypes,
        value: "child1",
      };
      const dTree = new ClassTestAbstractExpressionTree();
      dTree.replaceNodeContent(dTree.rootNodeId, rootPredicate);
      expect(dTree.getCountTotalNodes()).toBe(1);

      dTree.appendChildNodeWithContent(dTree.rootNodeId, childPredicate0);
      dTree.appendChildNodeWithContent(dTree.rootNodeId, childPredicate1);
      //appendContentWithOr
      expect(dTree.getCountTotalNodes()).toBe(3);
    });
  });
  describe(".appendChildNodeWith[Junction](nodeId, content)", () => {
    it("(appendContentWithOr) should have appendChildWithAnd, appendChildWithOr,", () => {
      const rootPredicate = {
        subjectId: "customers.root",
        operator: "==" as operatorTypes,
        value: "root",
      };
      const childPredicate0 = {
        subjectId: "customers.child0",
        operator: "==" as operatorTypes,
        value: "child0",
      };
      const childPredicate1 = {
        subjectId: "customers.child1",
        operator: "==" as operatorTypes,
        value: "child1",
      };

      const dTree = new ClassTestAbstractExpressionTree();
      dTree.replaceNodeContent(dTree.rootNodeId, rootPredicate);
      expect(dTree.getCountTotalNodes()).toBe(1);

      dTree.appendContentWithOr(dTree.rootNodeId, childPredicate0);
      dTree.appendContentWithOr(dTree.rootNodeId, childPredicate1);
      //appendContentWithOr
      expect(dTree.getCountTotalNodes()).toBe(4);

      `
      appendChildWithJunction(nodeId, [junctionOperator], exp0, exp1, ...)
        The rules will be
          - if nodeId is leaf, create branch (as current), set junction to given junction
          - if nodeId is branch, overwrite junction operator with given operator

          Should consider *not* exposes appendChildWithContent
      `;
    });
    it("(appendContentWithAnd)should have appendChildWithAnd, appendChildWithOr,", () => {
      const rootPredicate = {
        subjectId: "customers.root",
        operator: "==" as operatorTypes,
        value: "root",
      };
      const childPredicate0 = {
        subjectId: "customers.child0",
        operator: "==" as operatorTypes,
        value: "child0",
      };
      const childPredicate1 = {
        subjectId: "customers.child1",
        operator: "==" as operatorTypes,
        value: "child1",
      };

      const dTree = new ClassTestAbstractExpressionTree();
      dTree.replaceNodeContent(dTree.rootNodeId, rootPredicate);
      expect(dTree.getCountTotalNodes()).toBe(1);

      dTree.appendContentWithAnd(dTree.rootNodeId, childPredicate0);
      dTree.appendContentWithAnd(dTree.rootNodeId, childPredicate1);
      expect(dTree.getChildContent(dTree.rootNodeId)).toEqual("&&");
      //appendContentWithOr
      expect(dTree.getCountTotalNodes()).toBe(4);

      `
      appendChildWithJunction(nodeId, [junctionOperator], exp0, exp1, ...)
        The rules will be
          - if nodeId is leaf, create branch (as current), set junction to given junction
          - if nodeId is branch, overwrite junction operator with given operator

          Should consider *not* exposes appendChildWithContent
      `;
    });
    it("(appendContentWith(And|Or))should have appendChildWithAnd, appendChildWithOr,", () => {
      const rootPredicate = {
        subjectId: "customers.root",
        operator: "==" as operatorTypes,
        value: "root",
      };
      const childPredicate0 = {
        subjectId: "customers.child0",
        operator: "==" as operatorTypes,
        value: "child0",
      };
      const childPredicate1 = {
        subjectId: "customers.child1",
        operator: "==" as operatorTypes,
        value: "child1",
      };

      //      appendContentWithOr
      const dTree = new ClassTestAbstractExpressionTree();
      expect(dTree.getChildContent(dTree.rootNodeId)).toBeNull();

      dTree.replaceNodeContent(dTree.rootNodeId, rootPredicate);
      expect(dTree.getChildContent(dTree.rootNodeId)).toStrictEqual(rootPredicate);

      dTree.appendContentWithAnd(dTree.rootNodeId, childPredicate0);
      expect(dTree.getChildContent(dTree.rootNodeId)).toEqual("&&");

      dTree.appendContentWithOr(dTree.rootNodeId, childPredicate1);
      expect(dTree.getChildContent(dTree.rootNodeId)).toEqual("||");

      // and back-again
      dTree.appendContentWithAnd(dTree.rootNodeId, childPredicate0);
      expect(dTree.getChildContent(dTree.rootNodeId)).toEqual("&&");

      expect(dTree.getCountTotalNodes()).toBe(5);
    });
    it("(appendContentWith(And|Or))should have appendChildWithAnd, appendChildWithOr,", () => {
      const rootPredicate = {
        subjectId: "customers.root",
        operator: "==" as operatorTypes,
        value: "root",
      };
      const childPredicate_0 = {
        subjectId: "customers.child0",
        operator: "==" as operatorTypes,
        value: "child0",
      };
      const childPredicate_1 = {
        subjectId: "customers.child1",
        operator: "==" as operatorTypes,
        value: "child1",
      };
      const childPredicate_1_0 = {
        subjectId: "customers.child1_0",
        operator: "==" as operatorTypes,
        value: "child1_0",
      };
      const childPredicate_1_1 = {
        subjectId: "customers.child1_1",
        operator: "==" as operatorTypes,
        value: "child1_1",
      };
      const childPredicate_1_2 = {
        subjectId: "customers.child1_2",
        operator: "==" as operatorTypes,
        value: "child1_2",
      };
      const childPredicate_2 = {
        subjectId: "customers.child2",
        operator: "==" as operatorTypes,
        value: "child2",
      };

      //      appendContentWithOr
      const dTree = new ClassTestAbstractExpressionTree();
      dTree.replaceNodeContent(dTree.rootNodeId, rootPredicate);
      const childId_0 = dTree.appendContentWithAnd(dTree.rootNodeId, childPredicate_0);
      const childId_1 = dTree.appendContentWithOr(dTree.rootNodeId, childPredicate_1);
      const childId_2 = dTree.appendContentWithOr(dTree.rootNodeId, childPredicate_2);
      const childId_1_0 = dTree.appendContentWithOr(childId_1.newNodeId, childPredicate_1_0);
      const childId_1_1 = dTree.appendContentWithOr(childId_1.newNodeId, childPredicate_1_1);
      const childId_1_2 = dTree.appendContentWithOr(childId_1.newNodeId, childPredicate_1_2);

      // and back-again

      expect(dTree.getCountTotalNodes()).toBe(9);
    });
  });
  describe(".fromPojo", () => {
    it("Should create a tree from Plain Ole Javascript Object.", () => {
      const pojo = makePojo3Children9Grandchildren();
      // const pojo = makePojo3Children();

      const dTree = ClassTestAbstractExpressionTree.fromPojo(pojo);
      const x = dTree.countTotalNodes();
      expect(dTree.countTotalNodes()).toEqual(13);
    });
    it("Should support subtrees.", () => {
      const pojo = makePojo2Children1subtree9leaves();

      const dTree = ClassTestAbstractExpressionTree.fromPojo(pojo);
      const x = dTree.countTotalNodes();
      const childrenIds = dTree.getChildrenNodeIds(dTree.rootNodeId);
      expect(dTree.getChildContent(childrenIds[0])).toStrictEqual({ operator: "$or" });

      const subtreeIds = dTree.getSubgraphIdsAt(dTree.rootNodeId);
      const subtree = dTree.getChildContent(
        subtreeIds[0]
      ) as unknown as ClassTestAbstractExpressionTree<TJunction | TOperand>;

      expect(dTree.countTotalNodes()).toEqual(10);
      expect(subtree.countTotalNodes()).toEqual(4);
    });
  });
});

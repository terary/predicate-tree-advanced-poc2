import { AbstractExpressionTree } from "./AbstractExpressionTree";
import type { TNodePojo, TTreePojo, TGenericNodeContent, TGenericNodeType } from "../types";

import {
  make3Children2Subtree3Children,
  makePojo3Children9Grandchildren,
  makePojo3Children,
  makePojo2Children1subtree9leaves,
  SortPredicateTest,
} from "./test-utilities";
import type {
  TJunction,
  TOperand,
  TOperandOperators,
  TPredicateNodeTypes,
  TPredicateTypes,
} from "./types";
`
the single subtree node idea wont work, nor do we want it to work.

Things like getChildren.. become difficult to understand.

Using subtree for *not* operation will require predicates to go inside the tree,
which makes getChildren a little odd but it's easier understood and implement


`;

import { ITree } from "../ITree";
import { PredicateTreeJs } from "../../../dev-debug/PredicateTreeJs/PredicateTreeJs";
class ClassTestAbstractExpressionTree extends AbstractExpressionTree<TPredicateNodeTypes> {}
describe("AbstractExpressionTree", () => {
  describe(".appendChildNode(nodeId, content)", () => {
    // .appendChildNode(nodeId, content)
    // - currently only useful for .fromPojo
    // use .appendChildNodeWith[Junction](nodeId, content)
    // to get expected behavior (demote children, split node, etc)

    it("Should split leaf into branch.", () => {
      const rootPredicate = {
        subjectId: "customers.root",
        operator: "$eq" as TOperandOperators,
        value: "root",
      };
      const childPredicate0 = {
        subjectId: "customers.child0",
        operator: "$eq" as TOperandOperators,
        value: "child0",
      };
      const childPredicate1 = {
        subjectId: "customers.child1",
        operator: "$eq" as TOperandOperators,
        value: "child1",
      };
      const dTree = new ClassTestAbstractExpressionTree();
      dTree.replaceNodeContent(dTree.rootNodeId, rootPredicate);
      expect(dTree.getCountTotalNodes()).toBe(1);

      dTree.appendChildNodeWithContent(dTree.rootNodeId, childPredicate0);
      dTree.appendChildNodeWithContent(dTree.rootNodeId, childPredicate1);
      //appendContentWithOr
      expect(dTree.getTreeContentAt(dTree.rootNodeId).sort(SortPredicateTest)).toStrictEqual(
        [rootPredicate, childPredicate0, childPredicate1].sort(SortPredicateTest)
      );

      expect(dTree.getCountTotalNodes()).toBe(3);
    });
  });
  describe(".appendChildNodeWith[Junction](nodeId, content)", () => {
    it("(.appendContentWithOr) should have appendChildWithAnd, appendChildWithOr,", () => {
      const rootPredicate = {
        subjectId: "customers.root",
        operator: "$eq" as TOperandOperators,
        value: "root",
      };
      const childPredicate0 = {
        subjectId: "customers.child0",
        operator: "$eq" as TOperandOperators,
        value: "child0",
      };
      const childPredicate1 = {
        subjectId: "customers.child1",
        operator: "$eq" as TOperandOperators,
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
    it("(.appendContentWith[Junction]) should deplore children with null value.", () => {
      const rootPredicate = {
        subjectId: "customers.root",
        operator: "$eq" as TOperandOperators,
        value: "root",
      };
      const childPredicate0 = {
        subjectId: "customers.child0",
        operator: "$eq" as TOperandOperators,
        value: "child0",
      };
      const childPredicate1 = {
        subjectId: "customers.child1",
        operator: "$eq" as TOperandOperators,
        value: "child1",
      };

      const dTree = new ClassTestAbstractExpressionTree();
      dTree.replaceNodeContent(dTree.rootNodeId, rootPredicate);
      expect(dTree.getCountTotalNodes()).toBe(1);

      dTree.appendContentWithOr(dTree.rootNodeId, childPredicate0);

      expect(dTree.getTreeContentAt(dTree.rootNodeId)).toStrictEqual([
        // { operator: "$and" },
        rootPredicate,
        childPredicate0,
        { operator: "$or" },
      ]);

      dTree.appendContentWithOr(dTree.rootNodeId, childPredicate1);
      //appendContentWithOr
      expect(dTree.getCountTotalNodes()).toBe(4);
    });

    `

    does appendContent[Junction, or other], all enforce no single child?


The major thing now is to work out 'fromPojo'  There shouldn't be ....fromPojo2 or fromPojo3 
I think overload works here?
Need to have clearly defined thing 
tree<TTypeA>fromPojo,,,, (transform<TTypeA,TTypeB>()=>TTypeC)



`;

    it("(.appendContentWith[Junction]) should deplore children with null value.", () => {
      const rootPredicate = {
        subjectId: "customers.root",
        operator: "$eq" as TOperandOperators,
        value: "root",
      };
      const childPredicate0 = {
        subjectId: "customers.child0",
        operator: "$eq" as TOperandOperators,
        value: "child0",
      };
      const childPredicate1 = {
        subjectId: "customers.child1",
        operator: "$eq" as TOperandOperators,
        value: "child1",
      };

      const dTree = new ClassTestAbstractExpressionTree();
      dTree.replaceNodeContent(dTree.rootNodeId, rootPredicate);
      expect(dTree.getCountTotalNodes()).toBe(1);

      // set-up
      dTree.appendContentWithOr(dTree.rootNodeId, null);

      // pre-conditions -- null valued node
      expect(dTree.getTreeContentAt(dTree.rootNodeId).sort(SortPredicateTest)).toStrictEqual(
        ([{ operator: "$or" }, null, rootPredicate] as TPredicateNodeTypes[]).sort(
          SortPredicateTest
        )
      );

      // exercise
      dTree.appendContentWithOr(dTree.rootNodeId, childPredicate0);

      //post condition -- replace null valued node
      const x = dTree.getTreeContentAt(dTree.rootNodeId);
      expect(dTree.getTreeContentAt(dTree.rootNodeId).sort(SortPredicateTest)).toStrictEqual(
        ([{ operator: "$or" }, childPredicate0, rootPredicate] as TPredicateNodeTypes[]).sort(
          SortPredicateTest
        )
      );

      dTree.appendContentWithOr(dTree.rootNodeId, childPredicate1);
      //appendContentWithOr
      // expect(dTree.getCountTotalNodes()).toBe(4);
    });
    it("(appendContentWithAnd)should have appendChildWithAnd, appendChildWithOr,", () => {
      const rootPredicate = {
        subjectId: "customers.root",
        operator: "$eq" as TOperandOperators,
        value: "root",
      };
      const childPredicate0 = {
        subjectId: "customers.child0",
        operator: "$eq" as TOperandOperators,
        value: "child0",
      };
      const childPredicate1 = {
        subjectId: "customers.child1",
        operator: "$eq" as TOperandOperators,
        value: "child1",
      };

      const dTree = new ClassTestAbstractExpressionTree();
      dTree.replaceNodeContent(dTree.rootNodeId, rootPredicate);
      expect(dTree.getCountTotalNodes()).toBe(1);

      dTree.appendContentWithAnd(dTree.rootNodeId, childPredicate0);
      dTree.appendContentWithAnd(dTree.rootNodeId, childPredicate1);
      expect(dTree.getChildContentAt(dTree.rootNodeId)).toEqual({ operator: "$and" });
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
        operator: "$eq" as TOperandOperators,
        value: "root",
      };
      const childPredicate0 = {
        subjectId: "customers.child0",
        operator: "$eq" as TOperandOperators,
        value: "child0",
      };
      const childPredicate1 = {
        subjectId: "customers.child1",
        operator: "$eq" as TOperandOperators,
        value: "child1",
      };

      //      appendContentWithOr
      const dTree = new ClassTestAbstractExpressionTree();
      expect(dTree.getChildContentAt(dTree.rootNodeId)).toBeNull();

      dTree.replaceNodeContent(dTree.rootNodeId, rootPredicate);
      expect(dTree.getChildContentAt(dTree.rootNodeId)).toStrictEqual(rootPredicate);

      dTree.appendContentWithAnd(dTree.rootNodeId, childPredicate0);
      expect(dTree.getChildContentAt(dTree.rootNodeId)).toEqual({ operator: "$and" });

      dTree.appendContentWithOr(dTree.rootNodeId, childPredicate1);
      expect(dTree.getChildContentAt(dTree.rootNodeId)).toEqual({ operator: "$or" });

      // and back-again
      dTree.appendContentWithAnd(dTree.rootNodeId, childPredicate0);
      expect(dTree.getChildContentAt(dTree.rootNodeId)).toEqual({ operator: "$and" });

      expect(dTree.getCountTotalNodes()).toBe(5);
    });
    it("(appendContentWith(And|Or))should have appendChildWithAnd, appendChildWithOr,", () => {
      const rootPredicate = {
        subjectId: "customers.root",
        operator: "$eq" as TOperandOperators,
        value: "root",
      };
      const childPredicate_0 = {
        subjectId: "customers.child0",
        operator: "$eq" as TOperandOperators,
        value: "child0",
      };
      const childPredicate_1 = {
        subjectId: "customers.child1",
        operator: "$eq" as TOperandOperators,
        value: "child1",
      };
      const childPredicate_1_0 = {
        subjectId: "customers.child1_0",
        operator: "$eq" as TOperandOperators,
        value: "child1_0",
      };
      const childPredicate_1_1 = {
        subjectId: "customers.child1_1",
        operator: "$eq" as TOperandOperators,
        value: "child1_1",
      };
      const childPredicate_1_2 = {
        subjectId: "customers.child1_2",
        operator: "$eq" as TOperandOperators,
        value: "child1_2",
      };
      const childPredicate_2 = {
        subjectId: "customers.child2",
        operator: "$eq" as TOperandOperators,
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
      const pojo = makePojo3Children9Grandchildren() as TTreePojo<TPredicateTypes>;

      const dTree = ClassTestAbstractExpressionTree.fromPojo<
        TPredicateTypes,
        AbstractExpressionTree<TPredicateTypes>
      >(pojo);
      expect(dTree.countTotalNodes()).toEqual(13);
    });
    it("Should support subtrees.", () => {
      const pojo = makePojo2Children1subtree9leaves();
      const { content: OO } = makePojo2Children1subtree9leaves;
      const dTree = ClassTestAbstractExpressionTree.fromPojo<
        TPredicateTypes,
        AbstractExpressionTree<TPredicateTypes>
        // @ts-ignore - pojo  type definition
      >(pojo);
      const childrenIds = dTree.getChildrenNodeIdsOf(dTree.rootNodeId);
      expect(dTree.getChildContentAt(childrenIds[0])).toStrictEqual({ operator: "$or" });

      const subtreeIds = dTree.getSubtreeIdsAt(dTree.rootNodeId);
      const subtree = dTree.getChildContentAt(
        subtreeIds[0]
      ) as unknown as ClassTestAbstractExpressionTree;

      const x = (dTree.getTreeContentAt(dTree.rootNodeId) as TPredicateTypes[]).sort(
        SortPredicateTest
      );
      expect(
        (dTree.getTreeContentAt(dTree.rootNodeId) as TPredicateTypes[]).sort(SortPredicateTest)
      ).toStrictEqual(
        (
          [
            { operator: "$and" },
            { operator: "$or" },
            { operator: "$or" },
            OO["child_0_0"],
            OO["child_0_1"],
            OO["child_0_2"],
            OO["child_2_0"],
            OO["child_2_1"],
            OO["child_2_2"],
          ] as TPredicateTypes[]
        ).sort(SortPredicateTest)
      );
      expect(
        (subtree.getTreeContentAt(subtree.rootNodeId) as TPredicateTypes[]).sort(
          SortPredicateTest
        )
      ).toStrictEqual(
        (
          [
            { operator: "$or" },
            OO["child_1_0"],
            OO["child_1_1"],
            OO["child_1_2"],
          ] as TPredicateTypes[]
        ).sort(SortPredicateTest)
      );

      expect(dTree.countTotalNodes()).toEqual(13);
      expect(subtree.countTotalNodes()).toEqual(4);
    });
    it("Should validate/throw error if pojo contains tree that is invalid", () => {
      const pojo = makePojo3Children9Grandchildren();
      // @ts-ignore - can only delete optional
      delete pojo["child_0_0"];
      // @ts-ignore - can only delete optional
      delete pojo["child_0_1"];

      const willThrow = () => {
        ClassTestAbstractExpressionTree.fromPojo(pojo);
      };
      expect(willThrow).toThrow(Error);
    });
  });
  describe(".removeNodeAt", () => {
    it("Should remove single node if not single child, elevate single child.", () => {
      const dTree = new ClassTestAbstractExpressionTree();

      const {
        dTreeIds,
        // dTree: dTree as ITree<TPredicateTypes>,
        subtree0,
        subtree1,
        originalWidgets: OO,
      } = make3Children2Subtree3Children(dTree as AbstractExpressionTree<TPredicateTypes>);

      // pre conditions
      expect(
        dTree.getTreeContentAt(dTreeIds["child_0"]).sort(SortPredicateTest)
      ).toStrictEqual(
        [OO["child_0"], OO["child_0_0"], OO["child_0_1"], OO["child_0_2"]].sort(
          SortPredicateTest
        )
      );
      expect(dTree.countTotalNodes()).toBe(21);

      // exercise 1, has 2 or more siblings
      dTree.removeNodeAt(dTreeIds["child_0_0"]);

      // post conditions 1
      expect(dTree.countTotalNodes()).toBe(20);
      expect(
        dTree.getTreeContentAt(dTreeIds["child_0"]).sort(SortPredicateTest)
      ).toStrictEqual(
        [OO["child_0"], OO["child_0_1"], OO["child_0_2"]].sort(SortPredicateTest)
      );

      // exercise 2 - only 1 sibling
      dTree.removeNodeAt(dTreeIds["child_0_1"]);

      // post conditions 2
      expect(dTree.countTotalNodes()).toBe(18);
      expect(
        dTree.getTreeContentAt(dTreeIds["child_0"]).sort(SortPredicateTest)
      ).toStrictEqual([OO["child_0_2"]].sort(SortPredicateTest));
    });
  });
});

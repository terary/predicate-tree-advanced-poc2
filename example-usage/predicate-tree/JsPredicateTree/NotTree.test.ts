import { NotTree } from "./NotTree";
import {
  TJunction,
  TOperand,
  TPredicateTypes,
  TPredicateNodeTypesOrNull,
} from "../types";
import { AddressTree } from "./AddressTree";
import { GenericExpressionTree } from "../../../src";

describe("NotTree", () => {
  describe("appendChildNodeWithContent/removeNodeAt", () => {
    it("Should append/remove child nodes (simple nodes).", () => {
      const linkedList = new NotTree();
      const child_0 = {
        subjectId: "child_0",
        operator: "$eq",
        value: "child_0",
      } as TPredicateTypes;
      const child_1 = {
        subjectId: "child_1",
        operator: "$eq",
        value: "child_1",
      } as TPredicateTypes;
      const child_2 = {
        subjectId: "child_2",
        operator: "$eq",
        value: "child_2",
      } as TPredicateTypes;
      const childId_0 = linkedList.appendChildNode(child_0);
      const childId_1 = linkedList.appendChildNode(child_1);
      const childId_2 = linkedList.appendChildNode(child_2);

      // exercise 1

      expect(linkedList.getTreeContentAt(linkedList.rootNodeId)).toStrictEqual([
        child_0,
        child_1,
        child_2,
        { operator: "$notTree" },
      ]);
    });
    it("Should append/remove child nodes (complex).", () => {

      One issue here is - what if client code does appendNodeId(...) on one of the children (it ruin the structure)?
      I think we have to override all of parents?


      const linkedList = new NotTree();
      const child_0 = new AddressTree();
      const child_1 = new NotTree();
      const child_2 = new GenericExpressionTree<TPredicateTypes>();

      const child_3 = {
        subjectId: "child_3",
        operator: "$eq",
        value: "child_3",
      } as TPredicateTypes;
      const childId_0 = linkedList.appendChildNode(child_0);
      const childId_1 = linkedList.appendChildNode(child_1);
      const childId_2 = linkedList.appendChildNode(child_2);
      const childId_3 = linkedList.appendChildNode(child_3);

      // exercise 1
      const x = linkedList.getTreeContentAt(linkedList.rootNodeId, true);
      const expected = [
        ...child_0.getTreeContentAt(child_0.rootNodeId),
        ...child_1.getTreeContentAt(child_1.rootNodeId),
        ...child_2.getTreeContentAt(child_2.rootNodeId),
        child_3,
        { operator: "$notTree" },
      ];

      expect(linkedList.getTreeContentAt(linkedList.rootNodeId)).toStrictEqual(
        expected
      );
    });
  });
});

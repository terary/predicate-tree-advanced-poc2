import { ArithmeticTree } from "./ArithmeticTree";

describe("ArithmeticTree", () => {
  it("should create an arithmetic tree", () => {
    const tree = new ArithmeticTree();
    expect(tree).toBeInstanceOf(ArithmeticTree);
  });

  describe("toSqlWhereClauseAt", () => {
    it("should generate SQL for addition operation", () => {
      const tree = new ArithmeticTree();
      tree.replaceNodeContent(tree.rootNodeId, {
        operator: "$add",
        subjectLabel: "Sum",
      });

      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value: 10,
      });

      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value: 20,
      });

      const sql = tree.toSqlWhereClauseAt();
      expect(sql).toEqual("(10) + (20)");
    });

    it("should generate SQL for subtraction operation", () => {
      const tree = new ArithmeticTree();
      tree.replaceNodeContent(tree.rootNodeId, {
        operator: "$subtract",
        subjectLabel: "Difference",
      });

      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value: 30,
      });

      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value: 15,
      });

      const sql = tree.toSqlWhereClauseAt();
      expect(sql).toEqual("(30) - (15)");
    });

    it("should generate SQL for multiplication operation", () => {
      const tree = new ArithmeticTree();
      tree.replaceNodeContent(tree.rootNodeId, {
        operator: "$multiply",
        subjectLabel: "Product",
      });

      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value: 5,
      });

      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value: 6,
      });

      const sql = tree.toSqlWhereClauseAt();
      expect(sql).toEqual("(5) * (6)");
    });

    it("should generate SQL for division operation", () => {
      const tree = new ArithmeticTree();
      tree.replaceNodeContent(tree.rootNodeId, {
        operator: "$divide",
        subjectLabel: "Quotient",
      });

      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value: 100,
      });

      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value: 4,
      });

      const sql = tree.toSqlWhereClauseAt();
      expect(sql).toEqual("(100) / (4)");
    });

    it("should handle column references in SQL generation", () => {
      const tree = new ArithmeticTree();
      tree.replaceNodeContent(tree.rootNodeId, {
        operator: "$add",
        subjectLabel: "Total",
      });

      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value: "price",
      });

      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value: "tax",
      });

      const sql = tree.toSqlWhereClauseAt();
      expect(sql).toEqual("(price) + (tax)");
    });

    it("should handle complex nested expressions", () => {
      const tree = new ArithmeticTree();

      // Root: Addition
      tree.replaceNodeContent(tree.rootNodeId, {
        operator: "$add",
        subjectLabel: "Complex Expression",
      });

      // First child: value 10
      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value: 10,
      });

      // Second child: subtree for multiplication
      const multiplyNodeId = tree.appendChildNodeWithContent(tree.rootNodeId, {
        operator: "$multiply",
      });

      // Children of multiplication node
      tree.appendChildNodeWithContent(multiplyNodeId, {
        value: 5,
      });

      tree.appendChildNodeWithContent(multiplyNodeId, {
        value: 3,
      });
      const subtractNodeId = tree.appendChildNodeWithContent(multiplyNodeId, {
        operator: "$subtract",
      });
      tree.appendChildNodeWithContent(subtractNodeId, {
        value: "1",
      });
      tree.appendChildNodeWithContent(subtractNodeId, {
        value: "2",
      });

      const sql = tree.toSqlWhereClauseAt();
      expect(sql).toEqual("(10) + ((5) * (3) * ((1) - (2)))");
      //   expect(sql).toEqual("(10) + ((5) * (3))");
    });
  });
});

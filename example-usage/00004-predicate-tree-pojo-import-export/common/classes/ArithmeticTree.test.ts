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
  describe("toJavascriptMatcherFunctionAt", () => {
    it("should generate a JavaScript function for addition operation", () => {
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

      const jsFunction = tree.toJavascriptMatcherFunctionAt();
      expect(jsFunction).toContain("function arithmeticMatcher(record)");
      expect(jsFunction).toContain("return (10) + (20);");
    });

    it("should generate a JavaScript function for subtraction operation", () => {
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

      const jsFunction = tree.toJavascriptMatcherFunctionAt();
      expect(jsFunction).toContain("return (30) - (15);");
    });

    it("should generate a JavaScript function for multiplication operation", () => {
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

      const jsFunction = tree.toJavascriptMatcherFunctionAt();
      expect(jsFunction).toContain("return (5) * (6);");
    });

    it("should generate a JavaScript function for division operation", () => {
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

      const jsFunction = tree.toJavascriptMatcherFunctionAt();
      expect(jsFunction).toContain("return (100) / (4);");
    });

    it("should properly handle record properties in JavaScript", () => {
      const tree = new ArithmeticTree();
      tree.replaceNodeContent(tree.rootNodeId, {
        operator: "$add",
        subjectLabel: "Total",
      });

      tree.appendChildNodeWithContent(tree.rootNodeId, {
        subjectId: "price",
        value: "price",
      });

      tree.appendChildNodeWithContent(tree.rootNodeId, {
        subjectId: "tax",
        value: "tax",
      });

      const jsFunction = tree.toJavascriptMatcherFunctionAt();
      expect(jsFunction).toContain(
        "return (record['price']) + (record['tax']);"
      );
    });

    it("should properly handle string literals in JavaScript", () => {
      const tree = new ArithmeticTree();
      tree.replaceNodeContent(tree.rootNodeId, {
        operator: "$add",
        subjectLabel: "Concatenation",
      });

      // No subjectId means it's a string literal, not a record property
      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value: "Hello ",
      });

      tree.appendChildNodeWithContent(tree.rootNodeId, {
        value: "World",
      });

      const jsFunction = tree.toJavascriptMatcherFunctionAt();
      expect(jsFunction).toContain('return ("Hello ") + ("World");');
    });

    it("should handle complex nested expressions in JavaScript", () => {
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

      const jsFunction = tree.toJavascriptMatcherFunctionBodyAt();
      expect(jsFunction).toEqual("(10) + ((5) * (3) * ((1) - (2)))");
    });

    it("should handle errors gracefully", () => {
      const tree = new ArithmeticTree();

      // Create a mock that will throw an error
      const mockBuildJsExpression = jest.spyOn(
        tree as any,
        "buildJsExpression"
      );
      mockBuildJsExpression.mockImplementation(() => {
        throw new Error("Test error");
      });

      const jsFunction = tree.toJavascriptMatcherFunctionAt();
      expect(jsFunction).toContain("function arithmeticMatcher(record)");
      expect(jsFunction).toContain("return /* Error");
      expect(jsFunction).toContain("false;");

      // Clean up
      mockBuildJsExpression.mockRestore();
    });
  });
});

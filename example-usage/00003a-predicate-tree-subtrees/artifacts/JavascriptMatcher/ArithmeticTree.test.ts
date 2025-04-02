import {
  ArithmeticTree,
  ArithmeticTreePredicateContent,
} from "./ArithmeticTree";
import { ITree } from "../../../../src";

describe("ArithmeticTree", () => {
  it("should create a tree with a valid rootNodeId", () => {
    const arithmeticTree = new ArithmeticTree();
    expect(arithmeticTree.rootNodeId).toBeDefined();
    expect(typeof arithmeticTree.rootNodeId).toBe("string");
    expect(arithmeticTree.rootNodeId.length).toBeGreaterThan(0);
  });

  it("should create nodes with proper structure", () => {
    const arithmeticTree = new ArithmeticTree();

    // Add a constant node
    const constantNodeId = arithmeticTree.appendChildNodeWithContent(
      arithmeticTree.rootNodeId,
      {
        constant: 42,
      }
    );

    // Add a field reference node
    const fieldNodeId = arithmeticTree.appendChildNodeWithContent(
      arithmeticTree.rootNodeId,
      {
        subjectId: "age",
      }
    );

    // Check both nodes
    const constantContent = arithmeticTree.getChildContentAt(constantNodeId);
    const fieldContent = arithmeticTree.getChildContentAt(fieldNodeId);

    // Verify content - check that it's not a subtree (ITree) first
    if (constantContent && !("rootNodeId" in constantContent)) {
      expect(constantContent.constant).toBe(42);
    } else {
      fail("Expected constantContent to be a predicate content, not a subtree");
    }

    if (fieldContent && !("rootNodeId" in fieldContent)) {
      expect(fieldContent.subjectId).toBe("age");
    } else {
      fail("Expected fieldContent to be a predicate content, not a subtree");
    }
  });

  describe("Simple Arithmetic Expressions", () => {
    it("should create a matcher function that adds two constants", () => {
      const arithmeticTree = new ArithmeticTree();
      arithmeticTree.replaceNodeContent(arithmeticTree.rootNodeId, {
        arithmeticOperator: "+",
      });

      // Add two constant nodes
      arithmeticTree.appendChildNodeWithContent(arithmeticTree.rootNodeId, {
        constant: 10,
      });
      arithmeticTree.appendChildNodeWithContent(arithmeticTree.rootNodeId, {
        constant: 20,
      });

      // Get the JavaScript expression
      const jsExpression = arithmeticTree.buildJavaScriptMatcherBodyAt();
      expect(jsExpression).toEqual("(10 + 20)");

      // Build matcher function
      const matcher = arithmeticTree.buildMatcherFunction();
      // The matcher should evaluate the expression and return 30
      expect(matcher.isMatch({})).toBe(30);
    });

    it("should create a matcher function that uses record fields", () => {
      const arithmeticTree = new ArithmeticTree();
      arithmeticTree.replaceNodeContent(arithmeticTree.rootNodeId, {
        arithmeticOperator: "*",
      });

      // Add a record field and a constant
      arithmeticTree.appendChildNodeWithContent(arithmeticTree.rootNodeId, {
        subjectId: "quantity",
      });
      arithmeticTree.appendChildNodeWithContent(arithmeticTree.rootNodeId, {
        subjectId: "price",
      });

      // Get the JavaScript expression
      const jsExpression = arithmeticTree.buildJavaScriptMatcherBodyAt();
      expect(jsExpression).toEqual('(record["quantity"] * record["price"])');

      // Build matcher function
      const matcher = arithmeticTree.buildMatcherFunction();
      // Test with a record
      const record = { quantity: 5, price: 10 };
      expect(matcher.isMatch(record)).toBe(50);
    });
  });

  describe("Complex Nested Expressions", () => {
    it("should handle nested arithmetic expressions", () => {
      // Create a complex expression: (price * quantity) + (tax * price)
      const arithmeticTree = new ArithmeticTree();
      arithmeticTree.replaceNodeContent(arithmeticTree.rootNodeId, {
        arithmeticOperator: "+",
      });

      // Create the first part: (price * quantity)
      const multiplyNode1Id = arithmeticTree.appendChildNodeWithContent(
        arithmeticTree.rootNodeId,
        {
          arithmeticOperator: "*",
        }
      );
      arithmeticTree.appendChildNodeWithContent(multiplyNode1Id, {
        subjectId: "price",
      });
      arithmeticTree.appendChildNodeWithContent(multiplyNode1Id, {
        subjectId: "quantity",
      });

      // Create the second part: (tax * price)
      const multiplyNode2Id = arithmeticTree.appendChildNodeWithContent(
        arithmeticTree.rootNodeId,
        {
          arithmeticOperator: "*",
        }
      );
      arithmeticTree.appendChildNodeWithContent(multiplyNode2Id, {
        subjectId: "tax",
      });
      arithmeticTree.appendChildNodeWithContent(multiplyNode2Id, {
        subjectId: "price",
      });

      // Get the JavaScript expression
      const jsExpression = arithmeticTree.buildJavaScriptMatcherBodyAt();
      expect(jsExpression).toEqual(
        '((record["price"] * record["quantity"]) + (record["tax"] * record["price"]))'
      );

      // Build matcher function
      const matcher = arithmeticTree.buildMatcherFunction();
      // Test with a record
      const record = { price: 10, quantity: 2, tax: 0.15 };
      // Expected: (10 * 2) + (0.15 * 10) = 20 + 1.5 = 21.5
      expect(matcher.isMatch(record)).toBe(21.5);
    });
    it("should handle deeply nested arithmetic expressions", () => {
      // Create a complex expression: ((base + extra) * quantity) - discount
      const arithmeticTree = new ArithmeticTree();
      arithmeticTree.replaceNodeContent(arithmeticTree.rootNodeId, {
        arithmeticOperator: "-",
      });

      // Create first branch: ((base + extra) * quantity)
      const multiplyNodeId = arithmeticTree.appendChildNodeWithContent(
        arithmeticTree.rootNodeId,
        {
          arithmeticOperator: "*",
        }
      );

      // Create the nested addition: (base + extra)
      const additionNodeId = arithmeticTree.appendChildNodeWithContent(
        multiplyNodeId,
        {
          arithmeticOperator: "+",
        }
      );
      arithmeticTree.appendChildNodeWithContent(additionNodeId, {
        subjectId: "base",
      });
      arithmeticTree.appendChildNodeWithContent(additionNodeId, {
        subjectId: "extra",
      });

      // Add the quantity to multiply
      arithmeticTree.appendChildNodeWithContent(multiplyNodeId, {
        subjectId: "quantity",
      });

      // Add the discount to subtract
      arithmeticTree.appendChildNodeWithContent(arithmeticTree.rootNodeId, {
        subjectId: "discount",
      });

      // Get the JavaScript expression
      const jsExpression = arithmeticTree.buildJavaScriptMatcherBodyAt();
      expect(jsExpression).toEqual(
        '(((record["base"] + record["extra"]) * record["quantity"]) - record["discount"])'
      );

      // Build matcher function
      const matcher = arithmeticTree.buildMatcherFunction();
      // Test with a record
      const record = { base: 10, extra: 5, quantity: 3, discount: 8 };
      // Expected: ((10 + 5) * 3) - 8 = (15 * 3) - 8 = 45 - 8 = 37
      expect(matcher.isMatch(record)).toBe(37);
    });
  });

  describe("Pojo Transportability", () => {
    it("should preserve matcher behavior across serialization/deserialization", () => {
      // Create a complex expression: (price * quantity) - discount
      const arithmeticTree = new ArithmeticTree();
      arithmeticTree.replaceNodeContent(arithmeticTree.rootNodeId, {
        arithmeticOperator: "-",
      });

      // Create the first part: (price * quantity)
      const multiplyNodeId = arithmeticTree.appendChildNodeWithContent(
        arithmeticTree.rootNodeId,
        {
          arithmeticOperator: "*",
        }
      );
      arithmeticTree.appendChildNodeWithContent(multiplyNodeId, {
        subjectId: "price",
      });
      arithmeticTree.appendChildNodeWithContent(multiplyNodeId, {
        subjectId: "quantity",
      });

      // Add the discount to subtract
      arithmeticTree.appendChildNodeWithContent(arithmeticTree.rootNodeId, {
        subjectId: "discount",
      });

      // Get original matcher function and body
      const originalMatcher = arithmeticTree.buildMatcherFunction();
      const originalMatcherBody = arithmeticTree.buildJavaScriptMatcherBodyAt();

      // Serialize to POJO and create new tree
      const originalPojo = arithmeticTree.toPojoAt();
      const clonedTree = ArithmeticTree.fromPojo(originalPojo);

      // Get cloned matcher function and body
      const clonedMatcher = clonedTree.buildMatcherFunction();
      const clonedMatcherBody = clonedTree.buildJavaScriptMatcherBodyAt();

      // Test string equivalency of the generated JavaScript expressions
      expect(clonedMatcherBody).toEqual(originalMatcherBody);

      // Test sample records to verify identical behavior
      const testRecords = [
        { price: 10, quantity: 2, discount: 5 },
        { price: 20, quantity: 1, discount: 0 },
        { price: 15, quantity: 3, discount: 10 },
      ];

      // Ensure both matchers return the same results for all test records
      testRecords.forEach((record) => {
        expect(clonedMatcher.isMatch(record)).toEqual(
          originalMatcher.isMatch(record)
        );
      });
    });

    it("should generate identical JavaScript expressions after serialization", () => {
      // Create a nested calculation tree
      const arithmeticTree = new ArithmeticTree();
      arithmeticTree.replaceNodeContent(arithmeticTree.rootNodeId, {
        arithmeticOperator: "+",
      });

      // Add a constant
      arithmeticTree.appendChildNodeWithContent(arithmeticTree.rootNodeId, {
        constant: 100,
      });

      // Add a multiplication subtree
      const multiplyNodeId = arithmeticTree.appendChildNodeWithContent(
        arithmeticTree.rootNodeId,
        {
          arithmeticOperator: "*",
        }
      );
      arithmeticTree.appendChildNodeWithContent(multiplyNodeId, {
        subjectId: "rate",
      });
      arithmeticTree.appendChildNodeWithContent(multiplyNodeId, {
        subjectId: "hours",
      });

      // Get original JavaScript expression
      const originalExpression = arithmeticTree.buildJavaScriptMatcherBodyAt();

      // Serialize and deserialize
      const pojo = arithmeticTree.toPojoAt();
      const clonedTree = ArithmeticTree.fromPojo(pojo);

      // Get cloned JavaScript expression
      const clonedExpression = clonedTree.buildJavaScriptMatcherBodyAt();

      // Expressions should be identical
      expect(clonedExpression).toEqual(originalExpression);
      expect(clonedExpression).toEqual(
        '(100 + (record["rate"] * record["hours"]))'
      );
    });
  });
});

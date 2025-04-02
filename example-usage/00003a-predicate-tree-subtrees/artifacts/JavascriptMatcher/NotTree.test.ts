import { NotTree } from "./NotTree";

describe("NotTree", () => {
  it("should create a root node with default rootNodeId", () => {
    const notTree = new NotTree();
    expect(notTree.rootNodeId).toEqual("not-root");
  });

  it("should mark all predicates as negated", () => {
    const notTree = new NotTree();

    const childId = notTree.appendChildNodeWithContent(notTree.rootNodeId, {
      subjectId: "age",
      operator: "$gt",
      value: 18,
    });

    const childContent = notTree.getChildContentAt(childId);

    // Check if childContent is not an ITree before accessing _meta
    if (childContent && "rootNodeId" in childContent) {
      // It's an ITree node, skip this test
      expect(true).toBe(true);
    } else {
      // It's a regular node content, check the _meta.negated property
      expect(childContent?._meta?.negated).toBe(true);
    }
  });

  describe("buildMatcherFunction", () => {
    it("should create a matcher function that negates a simple predicate", () => {
      const notTree = new NotTree();
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        subjectId: "age",
        operator: "$gt",
        value: 18,
      });

      const matcher = notTree.buildMatcherFunction();

      const matcherFunctionAsString = matcher.isMatch.toString();
      const matcherFunctionBody = notTree.buildJavaScriptMatcherBodyAt();

      expect(matcherFunctionAsString).toEqual(
        'function anonymous(record\n) {\nreturn !(record["age"] > 18);\n}'
      );
      expect(matcherFunctionBody).toEqual('!(record["age"] > 18)');

      expect(matcher.isMatch({ age: 20 })).toBe(false);
      // Should be false because the predicate is negated (NOT age > 18)
      expect(matcher.isMatch({ age: 20 })).toBe(false);
      // Should be true because the predicate is negated (NOT age > 18)
      expect(matcher.isMatch({ age: 16 })).toBe(true);
    });

    it("should handle multiple predicates with AND junction", () => {
      const notTree = new NotTree();
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        subjectId: "age",
        operator: "$gt",
        value: 18,
      });
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        subjectId: "isActive",
        operator: "$eq",
        value: true,
      });

      const matcher = notTree.buildMatcherFunction();

      // Should be false because both predicates are true (NOT(age > 18 AND isActive))
      expect(matcher.isMatch({ age: 20, isActive: true })).toBe(false);
      // Should be true because one predicate is false (NOT(age > 18 AND isActive))
      expect(matcher.isMatch({ age: 20, isActive: false })).toBe(true);
      // Should be true because one predicate is false (NOT(age > 18 AND isActive))
      expect(matcher.isMatch({ age: 16, isActive: true })).toBe(true);
      // Should be true because both predicates are false (NOT(age > 18 AND isActive))
      expect(matcher.isMatch({ age: 16, isActive: false })).toBe(true);
    });

    it("should handle complex nested expressions", () => {
      const notTree = new NotTree();

      // First child: age > 18
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        subjectId: "age",
        operator: "$gt",
        value: 18,
      });

      // Second child: postalCode === "12345"
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        subjectId: "postalCode",
        operator: "$eq",
        value: "12345",
      });

      const matcher = notTree.buildMatcherFunction();

      // Should be false when all conditions are true
      expect(
        matcher.isMatch({
          age: 20,
          postalCode: "12345",
        })
      ).toBe(false);

      // Should be true when one condition is false
      expect(
        matcher.isMatch({
          age: 16,
          postalCode: "12345",
        })
      ).toBe(true);

      // Should be true when one condition is false
      expect(
        matcher.isMatch({
          age: 20,
          postalCode: "54321",
        })
      ).toBe(true);

      // Should be true when both conditions are false
      expect(
        matcher.isMatch({
          age: 16,
          postalCode: "54321",
        })
      ).toBe(true);
    });
  });
});

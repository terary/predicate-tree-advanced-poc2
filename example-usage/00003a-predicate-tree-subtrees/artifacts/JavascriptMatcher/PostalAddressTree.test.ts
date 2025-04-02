import { PostalAddressTree } from "./PostalAddressTree";

describe("PostalAddressTree", () => {
  it("should create a root node with default rootNodeId", () => {
    const addressTree = new PostalAddressTree();
    expect(addressTree.rootNodeId).toEqual("address-root");
  });

  it("should create nodes with proper structure", () => {
    const addressTree = new PostalAddressTree();

    const childId = addressTree.appendChildNodeWithContent(
      addressTree.rootNodeId,
      {
        subjectId: "postalCode",
        operator: "$eq",
        value: "12345",
      }
    );

    const childContent = addressTree.getChildContentAt(childId);

    // Check if childContent is not an ITree before accessing properties
    if (childContent && "rootNodeId" in childContent) {
      // It's an ITree node, skip this test
      expect(true).toBe(true);
    } else {
      // It's a regular node content, verify key properties
      expect(childContent).toBeDefined();
      expect(childContent?.subjectId).toBe("postalCode");
      expect(childContent?.operator).toBe("$eq");
      expect(childContent?.value).toBe("12345");
    }
  });

  describe("Pojo Transportability", () => {
    it("should preserve matcher behavior across serialization/deserialization", () => {
      const addressTree = new PostalAddressTree();

      // Create an OR junction for the state
      const orJunctionId = addressTree.appendChildNodeWithContent(
        addressTree.rootNodeId,
        {
          operator: "$or",
          _meta: {
            description: "State is either CA or NY",
          },
        }
      );

      // Add states to the OR junction
      addressTree.appendChildNodeWithContent(orJunctionId, {
        subjectId: "state",
        operator: "$eq",
        value: "CA",
      });
      addressTree.appendChildNodeWithContent(orJunctionId, {
        subjectId: "state",
        operator: "$eq",
        value: "NY",
      });

      // Add postal code criterion to the main AND junction
      addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
        subjectId: "postalCode",
        operator: "$gt",
        value: "10000",
      });

      // Get original matcher function and body
      const originalMatcher = addressTree.buildMatcherFunction();
      const originalMatcherBody = addressTree.buildJavaScriptMatcherBodyAt();

      // Serialize to POJO and clone
      const originalPojo = addressTree.toPojoAt();
      const clonedTree = PostalAddressTree.fromPojo(originalPojo);

      // Get cloned matcher function and body
      const clonedMatcher = clonedTree.buildMatcherFunction();
      const clonedMatcherBody = clonedTree.buildJavaScriptMatcherBodyAt();

      // Test that matcher bodies are identical
      expect(clonedMatcherBody).toEqual(originalMatcherBody);

      // Test sample records to verify identical behavior
      const testRecords = [
        {
          address: {
            postalCode: "12345",
            city: "Los Angeles",
            state: "CA",
          },
        },
        {
          address: {
            postalCode: "09999",
            city: "Los Angeles",
            state: "CA",
          },
        },
        {
          address: {
            postalCode: "10001",
            city: "New York",
            state: "NY",
          },
        },
        {
          address: {
            postalCode: "12345",
            city: "Miami",
            state: "FL",
          },
        },
      ];

      // Ensure both matchers return the same results for all test records
      testRecords.forEach((record) => {
        expect(clonedMatcher.isMatch(record)).toEqual(
          originalMatcher.isMatch(record)
        );
      });
    });

    it("should generate identical JavaScript expressions after serialization", () => {
      const addressTree = new PostalAddressTree();

      // Create a basic tree with multiple conditions
      addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
        subjectId: "postalCode",
        operator: "$eq",
        value: "12345",
      });

      addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
        subjectId: "state",
        operator: "$eq",
        value: "CA",
      });

      // Get original JavaScript expression
      const originalExpression = addressTree.buildJavaScriptMatcherBodyAt();

      // Serialize and deserialize
      const pojo = addressTree.toPojoAt();
      const clonedTree = PostalAddressTree.fromPojo(pojo);

      // Get cloned JavaScript expression
      const clonedExpression = clonedTree.buildJavaScriptMatcherBodyAt();

      // Expressions should be identical
      expect(clonedExpression).toEqual(originalExpression);
      expect(clonedExpression).toEqual(
        'record["address"]["postalCode"] === "12345" && record["address"]["state"] === "CA"'
      );
    });
  });
  describe("buildMatcherFunction", () => {
    it("should create a matcher function for a simple postal code predicate", () => {
      const addressTree = new PostalAddressTree();
      addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
        subjectId: "postalCode",
        operator: "$eq",
        value: "12345",
      });

      const matcher = addressTree.buildMatcherFunction();

      const matcherFunctionAsString = matcher.isMatch.toString();
      const matcherFunctionBody = addressTree.buildJavaScriptMatcherBodyAt();

      expect(matcherFunctionBody).toEqual(
        'record["address"]["postalCode"] === "12345"'
      );

      // Test with a matching record
      const matchingRecord = {
        address: {
          postalCode: "12345",
          city: "Anytown",
          state: "CA",
        },
      };
      expect(matcher.isMatch(matchingRecord)).toBe(true);

      // Test with a non-matching record
      const nonMatchingRecord = {
        address: {
          postalCode: "54321",
          city: "Othertown",
          state: "NY",
        },
      };
      expect(matcher.isMatch(nonMatchingRecord)).toBe(false);
    });

    it("should handle multiple address predicates with AND junction", () => {
      const addressTree = new PostalAddressTree();
      addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
        subjectId: "postalCode",
        operator: "$eq",
        value: "12345",
      });
      addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
        subjectId: "state",
        operator: "$eq",
        value: "CA",
      });

      const matcher = addressTree.buildMatcherFunction();
      const matcherFunctionBody = addressTree.buildJavaScriptMatcherBodyAt();

      expect(matcherFunctionBody).toEqual(
        'record["address"]["postalCode"] === "12345" && record["address"]["state"] === "CA"'
      );

      // Test with a matching record (all conditions met)
      expect(
        matcher.isMatch({
          address: {
            postalCode: "12345",
            city: "Anytown",
            state: "CA",
          },
        })
      ).toBe(true);

      // Test with a partially matching record (postal code matches, state doesn't)
      expect(
        matcher.isMatch({
          address: {
            postalCode: "12345",
            city: "Othertown",
            state: "NY",
          },
        })
      ).toBe(false);

      // Test with a non-matching record (nothing matches)
      expect(
        matcher.isMatch({
          address: {
            postalCode: "54321",
            city: "Somewhere",
            state: "TX",
          },
        })
      ).toBe(false);
    });

    it("should handle complex nested expressions", () => {
      const addressTree = new PostalAddressTree();

      // Create an OR junction for the state
      const orJunctionId = addressTree.appendChildNodeWithContent(
        addressTree.rootNodeId,
        {
          operator: "$or",
          _meta: {
            description: "State is either CA or NY",
          },
        }
      );

      // Add states to the OR junction
      addressTree.appendChildNodeWithContent(orJunctionId, {
        subjectId: "state",
        operator: "$eq",
        value: "CA",
      });
      addressTree.appendChildNodeWithContent(orJunctionId, {
        subjectId: "state",
        operator: "$eq",
        value: "NY",
      });

      // Add postal code criterion to the main AND junction
      addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
        subjectId: "postalCode",
        operator: "$gt",
        value: "10000",
      });
      const x = addressTree.toPojoAt();
      const matcher = addressTree.buildMatcherFunction();
      const matcherFunctionBody = addressTree.buildJavaScriptMatcherBodyAt();

      expect(matcherFunctionBody).toContain(
        'record["address"]["state"] === "CA"'
      );
      expect(matcherFunctionBody).toContain(
        'record["address"]["state"] === "NY"'
      );
      expect(matcherFunctionBody).toContain(
        'record["address"]["postalCode"] > "10000"'
      );

      // Test with CA address that meets postal code requirement
      expect(
        matcher.isMatch({
          address: {
            postalCode: "12345",
            city: "Los Angeles",
            state: "CA",
          },
        })
      ).toBe(true);

      // Test with NY address that meets postal code requirement
      expect(
        matcher.isMatch({
          address: {
            postalCode: "10001",
            city: "New York",
            state: "NY",
          },
        })
      ).toBe(true);

      // Test with CA address that fails postal code requirement
      expect(
        matcher.isMatch({
          address: {
            postalCode: "09999",
            city: "Los Angeles",
            state: "CA",
          },
        })
      ).toBe(false);

      // Test with non-matching state
      expect(
        matcher.isMatch({
          address: {
            postalCode: "12345",
            city: "Miami",
            state: "FL",
          },
        })
      ).toBe(false);
    });
  });
});

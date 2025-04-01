import { NotTree } from "./NotTree";

describe("NotTree", () => {
  it("should create a root node with default rootNodeId", () => {
    const notTree = new NotTree();

    expect(notTree.rootNodeId).toEqual("not-root");
  });
  it("should be able to seed the rootNodeId ", () => {
    const notTree = new NotTree("_NOT_ROOT_");

    expect(notTree.rootNodeId).toEqual("_NOT_ROOT_");
  });

  describe("toSql", () => {
    it("Should return NOT( child1, child2) as standard negation", () => {
      const notTree = new NotTree("_NOT_ROOT_");
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        _meta: {
          negated: true,
        },
        subjectId: "child1",
        operator: "$eq",
        value: "1",
      });
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        _meta: { negated: true },
        subjectId: "child2",
        operator: "$eq",
        value: "2",
      });

      const sql = notTree.toSqlWhereClauseAt(notTree.rootNodeId, {});

      expect(sql).toEqual("NOT ( child1 = 1 AND child2 = 2 )");
    });

    it("Should distribute negation to individual predicates when shouldDistributeNegation is true", () => {
      const notTree = new NotTree("_NOT_ROOT_");
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        _meta: {
          negated: true,
        },
        subjectId: "child1",
        operator: "$eq",
        value: "1",
      });
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        _meta: { negated: true },
        subjectId: "child2",
        operator: "$eq",
        value: "2",
      });

      const sql = notTree.toSqlWhereClauseAt(notTree.rootNodeId, {
        shouldDistributeNegation: true,
      });

      expect(sql).toEqual("NOT ( child1 != 1 AND child2 != 2 )");
    });
  });

  describe("toJavascriptMatcherFunctionBodyAt", () => {
    it("Should return JavaScript negation with standard operators", () => {
      const notTree = new NotTree("_NOT_ROOT_");
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        _meta: {
          negated: true,
        },
        subjectId: "child1",
        operator: "$eq",
        value: "1",
      });
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        _meta: { negated: true },
        subjectId: "child2",
        operator: "$eq",
        value: "2",
      });

      const jsBody = notTree.toJavascriptMatcherFunctionBodyAt(
        notTree.rootNodeId,
        {}
      );

      expect(jsBody).toEqual(
        '!( record["child1"] === 1 && record["child2"] === 2 )'
      );
    });

    it("Should distribute negation to individual predicates when shouldDistributeNegation is true", () => {
      const notTree = new NotTree("_NOT_ROOT_");
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        _meta: {
          negated: true,
        },
        subjectId: "child1",
        operator: "$eq",
        value: "1",
      });
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        _meta: { negated: true },
        subjectId: "child2",
        operator: "$eq",
        value: "2",
      });

      const jsBody = notTree.toJavascriptMatcherFunctionBodyAt(
        notTree.rootNodeId,
        {
          shouldDistributeNegation: true,
        }
      );

      expect(jsBody).toEqual(
        '!( record["child1"] !== 1 && record["child2"] !== 2 )'
      );
    });

    it("Should use a custom record name when provided", () => {
      const notTree = new NotTree("_NOT_ROOT_");
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        _meta: {
          negated: true,
        },
        subjectId: "child1",
        operator: "$eq",
        value: "1",
      });

      const jsBody = notTree.toJavascriptMatcherFunctionBodyAt(
        notTree.rootNodeId,
        {
          recordName: "item",
        }
      );

      expect(jsBody).toEqual('!( item["child1"] === 1 )');
    });
  });

  describe("toJavascriptMatcherFunctionAt", () => {
    it("Should return a complete JavaScript function", () => {
      const notTree = new NotTree("_NOT_ROOT_");
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        _meta: {
          negated: true,
        },
        subjectId: "child1",
        operator: "$eq",
        value: "1",
      });

      const jsFunction = notTree.toJavascriptMatcherFunctionAt(
        notTree.rootNodeId,
        {}
      );

      const expected = `function matchesCondition(record) {
  return !( record["child1"] === 1 );
}`;
      expect(jsFunction).toEqual(expected);
    });

    it("Should use custom function name and record name when provided", () => {
      const notTree = new NotTree("_NOT_ROOT_");
      notTree.appendChildNodeWithContent(notTree.rootNodeId, {
        _meta: {
          negated: true,
        },
        subjectId: "child1",
        operator: "$eq",
        value: "1",
      });

      const jsFunction = notTree.toJavascriptMatcherFunctionAt(
        notTree.rootNodeId,
        {
          functionName: "isNegated",
          recordName: "data",
        }
      );

      const expected = `function isNegated(data) {
  return !( data["child1"] === 1 );
}`;
      expect(jsFunction).toEqual(expected);
    });
  });
});

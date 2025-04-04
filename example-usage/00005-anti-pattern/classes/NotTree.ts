/**
 * NotTree.ts
 *
 * This file defines a NotTree, which is a specialized Predicate Tree that
 * negates predicates. It serves as an example of a subtree with custom behavior.
 */

class GenericExpressionTreeAntiPattern {}
type PredicateContent = any;
type ISqlWhereClause = any;
type TOperandOperator = any;
type TPredicateOperator = any;
type IJavascriptMatcherFunction = any;

// Extend the PredicateContent interface to include _meta
export interface NotTreePredicateContent extends PredicateContent {
  operator?: TPredicateOperator;
  _meta?: {
    negated?: boolean;
    description?: string;
    isSubtree?: boolean;
    [key: string]: any;
  };
}

/**
 * NotTree - A tree that negates predicates
 *
 * When this tree is attached as a subtree, all predicates inside it
 * will be negated in their meaning.
 */
// @ts-ignore - Bypass TypeScript's static inheritance checking
export class NotTreeAntiPattern
  extends GenericExpressionTreeAntiPattern
  implements ISqlWhereClause, IJavascriptMatcherFunction
{
  public SubtreeNodeTypeName: string = "NotTree";

  /**
   * Get a negated operator string for a standard operator
   */
  getNegatedOperator(operator: TPredicateOperator): string {
    // Map of operators to their negated versions
    const negatedOperators: Record<string, string> = {
      $eq: "$ne",
      $ne: "$eq",
      $gt: "$lte",
      $gte: "$lt",
      $lt: "$gte",
      $lte: "$gt",
      $in: "$nin",
      $nin: "$in",
    };

    return negatedOperators[operator] || `NOT(${operator})`;
  }

  /**
   * Constant for the subtree node type
   * This ensures that the nodeType is consistent across all uses
   */
  public static SubtreeNodeTypeName: string = "NotTree";

  get rootNodeId(): string {
    return "ANTI_PATTERN";
  }

  getChildContentAt(childId: string): NotTreePredicateContent {
    return {
      subjectId: "ANTI_PATTERN",
      operator: "$eq",
      value: "ANTI_PATTERN",
    };
  }

  getChildrenNodeIdsOf(nodeId: string): string[] {
    return ["ANTI_PATTERN"];
  }

  /**
   * ANTI PATTERN: - Uses nodeContent to determine tree walking logic.
   *
   * The tree stores/categorizes node content into: isRoot, isSubtree, isLeaf, isBranch
   * Client code should never need the know the content to determine branch/children/leaf etc
   *
   * It's reasonable to examine node content to perform a specialized action (create SQL statement or write javascript)
   * But for walking the tree its best to use the provided methods.
   *
   *
   */
  toSqlWhereClauseAt(
    nodeId: string = this.rootNodeId,
    withOptions: { shouldDistributeNegation?: boolean } = {}
  ): string {
    // Get all children from the root node
    const childrenIds = this.getChildrenNodeIdsOf(this.rootNodeId);

    if (childrenIds.length === 0) {
      return "";
    }

    // Build SQL predicates for each child
    const sqlPredicates = [];

    for (const childId of childrenIds) {
      // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****
      // This is a bit of of an anti-pattern.
      // In this case its works because our tree is only root + children (no other descendants)
      // In most case we will have to deal with recursing into the tree and we'll have subtrees to deal with
      // Hence, this iterative pattern is a bad idea.
      // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****

      const content = this.getChildContentAt(childId);

      // Skip if content is null or it's a subtree
      if (
        !content ||
        (typeof content === "object" && "rootNodeId" in content)
      ) {
        // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****
        // WE have tools to determine a subtree - we should never rely on
        // content examination.
        // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****
        // -
        // -
        // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****
        // Subtrees should always be dealt with.  We ignore them sometimes but rarely for
        // things like toSomething - in which case, we either accept a 'shouldIncludeSubtrees' or
        // we default to include them.
        // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****

        continue;
      }

      // Cast to the expected type
      const predicate = content as NotTreePredicateContent;

      // Skip if missing required fields
      if (!predicate.subjectId || !predicate.operator) {
        continue;
      }

      // Get the appropriate operator based on the negation strategy
      let sqlOperator: string;

      if (withOptions.shouldDistributeNegation) {
        // Use negated operators when distributing negation
        sqlOperator = this.getNegatedSqlOperator(
          predicate.operator as TOperandOperator
        );
      } else {
        // Use normal operators when wrapping with NOT
        sqlOperator = this.getSqlOperator(
          predicate.operator as TOperandOperator
        );
      }

      // Format the value
      let sqlValue = predicate.value;
      if (typeof predicate.value === "string") {
        // If it can be converted to a number, don't use quotes
        if (!isNaN(Number(predicate.value))) {
          sqlValue = predicate.value;
        } else {
          sqlValue = `'${predicate.value}'`;
        }
      }

      // Build the SQL predicate
      const sqlPredicate = `${predicate.subjectId} ${sqlOperator} ${sqlValue}`;
      sqlPredicates.push(sqlPredicate);
    }

    if (sqlPredicates.length === 0) {
      return "";
    }

    // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****
    // `return NOT ( ${sqlPredicates.join(" AND ")} )`;
    // doesn't make a lot of sense if following traditional pattern.
    // the root should be set (in our case $and or $or).  It should naturally
    // unfold and there should be no join.. Join is valid for iterative solutions
    // but not necessary for recursive solutions.
    // *** DO NOT REMOVE THIS COMMENT (ANTI-PATTERN) ****

    // Apply negation based on the strategy
    if (withOptions.shouldDistributeNegation) {
      // When distributing negation, each predicate is already negated,
      // so we still wrap with NOT to create a double negation that cancels out
      return `NOT ( ${sqlPredicates.join(" AND ")} )`;
    } else {
      // When not distributing, we simply wrap all predicates with NOT
      return `NOT ( ${sqlPredicates.join(" AND ")} )`;
    }
  }

  /**
   * Get the appropriate SQL operator (non-negated version)
   */
  private getSqlOperator(operator: TOperandOperator): string {
    const operatorMap: Record<TOperandOperator, string> = {
      $eq: "=",
      $ne: "!=",
      $gt: ">",
      $gte: ">=",
      $lt: "<",
      $lte: "<=",
      $in: "IN",
      $nin: "NOT IN",
    };

    return operatorMap[operator] || operator;
  }

  /**
   * Get the negated SQL operator for a standard operator
   */
  private getNegatedSqlOperator(operator: TOperandOperator): string {
    const negatedOperatorMap: Record<TOperandOperator, string> = {
      $eq: "!=",
      $ne: "=",
      $gt: "<=",
      $gte: "<",
      $lt: ">=",
      $lte: ">",
      $in: "NOT IN",
      $nin: "IN",
    };

    return negatedOperatorMap[operator] || `NOT ${operator}`;
  }
}

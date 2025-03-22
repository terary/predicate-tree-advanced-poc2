/**
 * NotTree.ts
 *
 * This file defines a NotTree, which is a specialized Predicate Tree that
 * negates predicates. It serves as an example of a subtree with custom behavior.
 */

import { GenericExpressionTree, IExpressionTree } from "../../../src";

/**
 * Definition of predicate content structure
 */
export interface PredicateContent {
  subject?: string;
  operator?: string;
  value?: any;
  _meta?: {
    negated?: boolean;
    description?: string;
    isSubtree?: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * NotTree - A tree that negates predicates
 *
 * When this tree is attached as a subtree, all predicates inside it
 * will be negated in their meaning.
 */
export class NotTree extends GenericExpressionTree<PredicateContent> {
  /**
   * Create a new NotTree with a negated AND root
   */
  constructor() {
    super();

    // Initialize with a root node that has $and operator (which will be negated)
    this.replaceNodeContent(this.rootNodeId, {
      operator: "$and",
      _meta: {
        negated: true,
        description: "NOT group (all predicates inside are negated)",
      },
    });
  }

  /**
   * Override the append child method to ensure all predicates are marked as negated
   */
  appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: PredicateContent
  ): string {
    // Mark this predicate as negated
    const contentWithMeta = {
      ...nodeContent,
      _meta: {
        ...(nodeContent._meta || {}),
        negated: true,
      },
    };

    // Use the parent class method to append the child
    return super.appendChildNodeWithContent(parentNodeId, contentWithMeta);
  }

  /**
   * Get a negated operator string for a standard operator
   */
  getNegatedOperator(operator: string): string {
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
   * Format operator for human-readable output
   */
  formatOperator(operator: string, negated: boolean = false): string {
    // Map of operators to human-readable strings
    const operatorMap: Record<string, string> = {
      $eq: "=",
      $ne: "!=",
      $gt: ">",
      $gte: ">=",
      $lt: "<",
      $lte: "<=",
      $in: "IN",
      $nin: "NOT IN",
      $and: "AND",
      $or: "OR",
    };

    // Get the human-readable version of the operator
    let readableOperator = operatorMap[operator] || operator;

    // Apply negation if needed
    if (negated) {
      if (operator === "$eq") return "!=";
      if (operator === "$ne") return "=";
      if (operator === "$gt") return "<=";
      if (operator === "$gte") return "<";
      if (operator === "$lt") return ">=";
      if (operator === "$lte") return ">";
      if (operator === "$in") return "NOT IN";
      if (operator === "$nin") return "IN";
      if (operator === "$and") return "OR"; // De Morgan's law
      if (operator === "$or") return "AND"; // De Morgan's law
      return `NOT ${readableOperator}`;
    }

    return readableOperator;
  }

  /**
   * Format a value for human-readable output
   */
  formatValue(value: any): string {
    if (value === null || value === undefined) {
      return "null";
    }

    if (typeof value === "string") {
      return `'${value}'`;
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Convert the tree to a human-readable string representation
   * @param nodeId The node ID to start from (defaults to root node)
   * @returns A human-readable string representation of the tree
   */
  toHumanReadableString(nodeId: string = this.rootNodeId): string {
    const nodeContent = this.getChildContentAt(nodeId) as PredicateContent;

    // If this is an empty node
    if (!nodeContent) {
      return "";
    }

    // Check if this is a junction node ($and, $or)
    if (nodeContent.operator === "$and" || nodeContent.operator === "$or") {
      // Get all child nodes
      const childIds = this.getChildrenNodeIdsOf(nodeId);

      // If there are no children, return empty string
      if (childIds.length === 0) {
        return "";
      }

      // Generate string representation for each child
      const childStrings = childIds.map((childId) =>
        this.toHumanReadableString(childId)
      );

      // Filter out empty strings
      const filteredStrings = childStrings.filter((str) => str !== "");

      // If there are no non-empty child strings, return empty string
      if (filteredStrings.length === 0) {
        return "";
      }

      // Join the child strings with the operator
      const isNegated = nodeContent._meta?.negated === true;
      const operatorStr = this.formatOperator(nodeContent.operator, isNegated);

      // Return the joined string with parentheses
      return filteredStrings.length === 1
        ? filteredStrings[0]
        : `(${filteredStrings.join(` ${operatorStr} `)})`;
    }

    // This is a predicate node
    if (nodeContent.subject && nodeContent.operator) {
      const isNegated = nodeContent._meta?.negated === true;
      const operatorStr = this.formatOperator(nodeContent.operator, isNegated);
      const valueStr = this.formatValue(nodeContent.value);

      return `${nodeContent.subject} ${operatorStr} ${valueStr}`;
    }

    // If we get here, it's some other type of node
    return JSON.stringify(nodeContent);
  }

  /**
   * Convert the tree to a JavaScript expression string
   * @param nodeId The node ID to start from (defaults to root node)
   * @returns A JavaScript expression representing the tree
   */
  toJavascriptExpression(nodeId: string = this.rootNodeId): string {
    const nodeContent = this.getChildContentAt(nodeId) as PredicateContent;

    // If this is an empty node
    if (!nodeContent) {
      return "";
    }

    // Check if this is a junction node ($and, $or)
    if (nodeContent.operator === "$and" || nodeContent.operator === "$or") {
      // Get all child nodes
      const childIds = this.getChildrenNodeIdsOf(nodeId);

      // If there are no children, return empty string
      if (childIds.length === 0) {
        return "";
      }

      // Generate JavaScript expression for each child
      const childExpressions = childIds
        .map((childId) => this.toJavascriptExpression(childId))
        .filter((expr) => expr !== "");

      // If there are no expressions, return empty string
      if (childExpressions.length === 0) {
        return "";
      }

      // Apply appropriate JavaScript logical operator
      const isNegated = nodeContent._meta?.negated === true;
      const jsOperator = isNegated
        ? nodeContent.operator === "$and"
          ? "||"
          : "&&"
        : nodeContent.operator === "$and"
        ? "&&"
        : "||";

      // Return the JavaScript expression with parentheses
      return childExpressions.length === 1
        ? childExpressions[0]
        : `(${childExpressions.join(` ${jsOperator} `)})`;
    }

    // This is a predicate node
    if (nodeContent.subject && nodeContent.operator) {
      const isNegated = nodeContent._meta?.negated === true;

      // Map operators to JavaScript comparison operators
      const getJsOperator = (op: string, negated: boolean) => {
        const operatorMap: Record<string, { normal: string; negated: string }> =
          {
            $eq: { normal: "===", negated: "!==" },
            $ne: { normal: "!==", negated: "===" },
            $gt: { normal: ">", negated: "<=" },
            $gte: { normal: ">=", negated: "<" },
            $lt: { normal: "<", negated: ">=" },
            $lte: { normal: "<=", negated: ">" },
            $in: { normal: ".includes", negated: "!.includes" },
            $nin: { normal: "!.includes", negated: ".includes" },
          };

        return operatorMap[op]
          ? negated
            ? operatorMap[op].negated
            : operatorMap[op].normal
          : op;
      };

      const jsOperator = getJsOperator(nodeContent.operator, isNegated);

      // Format value appropriately for JavaScript
      const jsValue =
        typeof nodeContent.value === "string"
          ? `"${nodeContent.value}"`
          : nodeContent.value;

      // Handle special case for "in" operator
      if (nodeContent.operator === "$in" || nodeContent.operator === "$nin") {
        return `[${jsValue}]${jsOperator}(${nodeContent.subject})`;
      }

      return `${nodeContent.subject} ${jsOperator} ${jsValue}`;
    }

    // If we get here, it's some other type of node
    return "";
  }

  /**
   * Convert the tree to a SQL expression string
   * @param nodeId The node ID to start from (defaults to root node)
   * @returns A SQL expression representing the tree with NOT applied to the whole expression
   */
  toSqlExpression(nodeId: string = this.rootNodeId): string {
    const nodeContent = this.getChildContentAt(nodeId) as PredicateContent;

    // If this is an empty node
    if (!nodeContent) {
      return "";
    }

    // Check if this is a junction node ($and, $or)
    if (nodeContent.operator === "$and" || nodeContent.operator === "$or") {
      // Get all child nodes
      const childIds = this.getChildrenNodeIdsOf(nodeId);

      // If there are no children, return empty string
      if (childIds.length === 0) {
        return "";
      }

      // Generate SQL expression for each child
      const childExpressions = childIds
        .map((childId) => this.toSqlExpression(childId))
        .filter((expr) => expr !== "");

      // If there are no expressions, return empty string
      if (childExpressions.length === 0) {
        return "";
      }

      // For SQL, we apply NOT to the entire expression for negated junctions
      const isNegated = nodeContent._meta?.negated === true;
      const sqlOperator = nodeContent.operator === "$and" ? "AND" : "OR";

      const expression =
        childExpressions.length === 1
          ? childExpressions[0]
          : `(${childExpressions.join(` ${sqlOperator} `)})`;

      // If negated, wrap the entire expression with NOT
      return isNegated ? `NOT ${expression}` : expression;
    }

    // This is a predicate node
    if (nodeContent.subject && nodeContent.operator) {
      // Don't consider individual predicate negation here - we use NOT for the whole expression

      // Map operators to SQL comparison operators
      const getSqlOperator = (op: string) => {
        const operatorMap: Record<string, string> = {
          $eq: "=",
          $ne: "!=",
          $gt: ">",
          $gte: ">=",
          $lt: "<",
          $lte: "<=",
          $in: "IN",
          $nin: "NOT IN",
        };

        return operatorMap[op] || op;
      };

      const sqlOperator = getSqlOperator(nodeContent.operator);

      // Format value appropriately for SQL
      const sqlValue =
        typeof nodeContent.value === "string"
          ? `'${nodeContent.value}'`
          : nodeContent.value;

      // Handle special case for "in" operator
      if (nodeContent.operator === "$in" || nodeContent.operator === "$nin") {
        return `${nodeContent.subject} ${sqlOperator} (${sqlValue})`;
      }

      return `${nodeContent.subject} ${sqlOperator} ${sqlValue}`;
    }

    // If we get here, it's some other type of node
    return "";
  }

  /**
   * Convert the tree to a SQL expression string with negation applied to individual predicates
   * @param nodeId The node ID to start from (defaults to root node)
   * @returns A SQL expression representing the tree with negation applied to individual predicates
   */
  toSqlExpressionIsNegated(nodeId: string = this.rootNodeId): string {
    const nodeContent = this.getChildContentAt(nodeId) as PredicateContent;

    // If this is an empty node
    if (!nodeContent) {
      return "";
    }

    // Check if this is a junction node ($and, $or)
    if (nodeContent.operator === "$and" || nodeContent.operator === "$or") {
      // Get all child nodes
      const childIds = this.getChildrenNodeIdsOf(nodeId);

      // If there are no children, return empty string
      if (childIds.length === 0) {
        return "";
      }

      // Generate SQL expression for each child
      const childExpressions = childIds
        .map((childId) => this.toSqlExpressionIsNegated(childId))
        .filter((expr) => expr !== "");

      // If there are no expressions, return empty string
      if (childExpressions.length === 0) {
        return "";
      }

      // Apply De Morgan's law for negated junctions
      const isNegated = nodeContent._meta?.negated === true;
      const sqlOperator = isNegated
        ? nodeContent.operator === "$and"
          ? "OR"
          : "AND"
        : nodeContent.operator === "$and"
        ? "AND"
        : "OR";

      return childExpressions.length === 1
        ? childExpressions[0]
        : `(${childExpressions.join(` ${sqlOperator} `)})`;
    }

    // This is a predicate node
    if (nodeContent.subject && nodeContent.operator) {
      const isNegated = nodeContent._meta?.negated === true;

      // Map operators to SQL comparison operators with negation handling
      const getSqlOperator = (op: string, negated: boolean) => {
        const operatorMap: Record<string, { normal: string; negated: string }> =
          {
            $eq: { normal: "=", negated: "!=" },
            $ne: { normal: "!=", negated: "=" },
            $gt: { normal: ">", negated: "<=" },
            $gte: { normal: ">=", negated: "<" },
            $lt: { normal: "<", negated: ">=" },
            $lte: { normal: "<=", negated: ">" },
            $in: { normal: "IN", negated: "NOT IN" },
            $nin: { normal: "NOT IN", negated: "IN" },
          };

        return operatorMap[op]
          ? negated
            ? operatorMap[op].negated
            : operatorMap[op].normal
          : op;
      };

      const sqlOperator = getSqlOperator(nodeContent.operator, isNegated);

      // Format value appropriately for SQL
      const sqlValue =
        typeof nodeContent.value === "string"
          ? `'${nodeContent.value}'`
          : nodeContent.value;

      // Handle special case for "in" operators
      if (nodeContent.operator === "$in" || nodeContent.operator === "$nin") {
        return `${nodeContent.subject} ${sqlOperator} (${sqlValue})`;
      }

      return `${nodeContent.subject} ${sqlOperator} ${sqlValue}`;
    }

    // If we get here, it's some other type of node
    return "";
  }

  /**
   * Override createSubtreeAt to ensure subtrees within this NotTree
   * also maintain the negation behavior
   */
  createSubtreeAt<Q extends PredicateContent>(
    targetNodeId: string
  ): IExpressionTree<Q> {
    // Create a new NotTree subtree instead of a generic one
    const subtree = new NotTree() as unknown as IExpressionTree<Q>;

    // Handle the attachment using parent implementation logic
    const subtreeParentNodeId = this.appendChildNodeWithContent(targetNodeId, {
      operator: "$and",
      _meta: {
        negated: true,
        description: "Nested NOT group",
      },
    } as unknown as PredicateContent);

    // Reroot and configure the subtree
    GenericExpressionTree.reRootTreeAt<Q>(
      subtree as unknown as GenericExpressionTree<Q>,
      subtree.rootNodeId,
      subtreeParentNodeId
    );

    // Access protected properties with type casting to avoid errors
    (subtree as any)._rootNodeId = subtreeParentNodeId;
    (subtree as any)._incrementor = this._incrementor;

    return subtree;
  }
}

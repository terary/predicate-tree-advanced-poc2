/**
 * Logic Expression Tree Implementation
 *
 * This class implements a simple logic expression tree that can contain subtrees.
 * It represents our outer tree in the example, which will contain a NotTree as a subtree.
 */

import { GenericExpressionTree } from "../../../src";
import { simpleSubjectDictionary, validOperators } from "./subjectDictionary";
import { PredicateContent } from "./NotTree";

/**
 * Validation error class for our logic tree
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * LogicExpressionTree.ts
 *
 * This file defines a Logic Expression Tree, which is a predicate tree
 * capable of expressing logical conditions and containing subtrees.
 */

/**
 * LogicExpressionTree - A tree that handles logical expressions
 * with support for subtrees
 */
export class LogicExpressionTree extends GenericExpressionTree<PredicateContent> {
  /**
   * Create a new LogicExpressionTree with an AND root
   */
  constructor() {
    super();

    // Initialize with a root node that has $and operator
    this.replaceNodeContent(this.rootNodeId, {
      operator: "$and",
    });
  }

  /**
   * Validate that a predicate is valid according to our rules
   */
  validatePredicate(predicate: PredicateContent): boolean {
    // Skip validation for junction operators
    if (predicate.operator === "$and" || predicate.operator === "$or") {
      return true;
    }

    // Check if subject exists in our dictionary
    if (predicate.subject && !this.validateSubject(predicate.subject)) {
      throw new ValidationError(`Invalid subject: ${predicate.subject}`);
    }

    // Check if operator is valid
    if (predicate.operator && !this.validateOperator(predicate.operator)) {
      throw new ValidationError(`Invalid operator: ${predicate.operator}`);
    }

    return true;
  }

  /**
   * Validate subject against our dictionary
   */
  validateSubject(subject: string): boolean {
    return subject in simpleSubjectDictionary;
  }

  /**
   * Validate operator against our allowed set
   */
  validateOperator(operator: string): boolean {
    return operator in validOperators;
  }

  /**
   * Override appendChildNodeWithContent to add validation
   */
  appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: PredicateContent
  ): string {
    // Validate predicate before adding
    if (nodeContent) {
      this.validatePredicate(nodeContent);
    }

    // Call parent method to add the node
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  /**
   * Format operator for human-readable output
   */
  formatOperator(operator: string): string {
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

    return operatorMap[operator] || operator;
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
      const childStrings = childIds.map((childId) => {
        const childContent = this.getChildContentAt(
          childId
        ) as PredicateContent;

        // Special handling for subtrees with negation (NotTree)
        if (
          childContent &&
          typeof childContent === "object" &&
          "_meta" in childContent &&
          childContent._meta?.negated === true
        ) {
          // Get the children of this subtree node
          const subChildIds = this.getChildrenNodeIdsOf(childId);

          if (subChildIds.length > 0) {
            // Process each predicate in the NotTree
            const negatedPredicates = subChildIds
              .map((subChildId) => {
                const subContent = this.getChildContentAt(
                  subChildId
                ) as PredicateContent;
                if (subContent && subContent.subject && subContent.operator) {
                  // Apply negation to the operator
                  let opStr = subContent.operator;
                  if (opStr === "$eq") opStr = "!=";
                  else if (opStr === "$ne") opStr = "=";
                  else if (opStr === "$gt") opStr = "<=";
                  else if (opStr === "$gte") opStr = "<";
                  else if (opStr === "$lt") opStr = ">=";
                  else if (opStr === "$lte") opStr = ">";
                  else opStr = `NOT(${this.formatOperator(opStr)})`;

                  return `${subContent.subject} ${opStr} ${this.formatValue(
                    subContent.value
                  )}`;
                }
                return "";
              })
              .filter((str) => str !== "");

            if (negatedPredicates.length > 0) {
              // If we're dealing with an AND root in the NotTree, the negation
              // transforms it to OR according to De Morgan's laws
              const joinOp = childContent.operator === "$and" ? "OR" : "AND";
              return `NOT(${negatedPredicates.join(` ${joinOp} `)})`;
            }
          }
        }

        // Regular processing for normal nodes
        return this.toHumanReadableString(childId);
      });

      // Filter out empty strings
      const filteredStrings = childStrings.filter((str) => str !== "");

      // If there are no non-empty child strings, return empty string
      if (filteredStrings.length === 0) {
        return "";
      }

      // Join the child strings with the operator
      const operatorStr = this.formatOperator(nodeContent.operator);

      // Return the joined string with parentheses
      return filteredStrings.length === 1
        ? filteredStrings[0]
        : `(${filteredStrings.join(` ${operatorStr} `)})`;
    }

    // This is a predicate node
    if (nodeContent.subject && nodeContent.operator) {
      const operatorStr = this.formatOperator(nodeContent.operator);
      const valueStr = this.formatValue(nodeContent.value);

      return `${nodeContent.subject} ${operatorStr} ${valueStr}`;
    }

    // If we get here, it's some other type of node
    return JSON.stringify(nodeContent);
  }

  /**
   * Attach a subtree to this tree
   */
  attachSubtree(
    parentNodeId: string,
    subtree: GenericExpressionTree<PredicateContent>
  ): string {
    console.log("  - Creating subtree attachment point...");

    // Use the core createSubtreeAt method to properly attach the subtree
    const newSubtree = this.createSubtreeAt(parentNodeId);
    const subtreeNodeId = newSubtree.rootNodeId;

    console.log("  - Transferring content from source subtree...");

    // Copy the root node content from the source subtree
    const rootContent = subtree.getChildContentAt(subtree.rootNodeId);
    if (rootContent) {
      newSubtree.replaceNodeContent(newSubtree.rootNodeId, rootContent);
    }

    // Copy all children from source subtree to the new subtree
    const sourceChildren = subtree.getChildrenNodeIdsOf(subtree.rootNodeId);
    for (const childId of sourceChildren) {
      const childContent = subtree.getChildContentAt(childId);
      if (childContent) {
        newSubtree.appendChildNodeWithContent(
          newSubtree.rootNodeId,
          childContent
        );
      }
    }

    console.log(`  - Subtree attached at node ${subtreeNodeId}`);

    return subtreeNodeId;
  }

  /**
   * Export the tree with all subtrees included - uses the standard toPojoAt
   * since subtrees are now properly part of the tree structure
   */
  exportWithSubtrees(): any {
    return this.toPojoAt(this.rootNodeId);
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
        .map((childId) => {
          const childContent = this.getChildContentAt(
            childId
          ) as PredicateContent;

          // Special handling for subtrees with negation (NotTree)
          if (
            childContent &&
            typeof childContent === "object" &&
            "_meta" in childContent &&
            childContent._meta?.negated === true
          ) {
            // For subtrees, we need to process their predicates within the context
            // of the subtree's implementation
            // For this example, we'll handle NotTree specifically

            // Get the children of this subtree node
            const subChildIds = this.getChildrenNodeIdsOf(childId);

            if (subChildIds.length > 0) {
              // Process each predicate in the subtree using JavaScript operators
              const subExpressions = subChildIds
                .map((subChildId) => {
                  const subContent = this.getChildContentAt(
                    subChildId
                  ) as PredicateContent;

                  if (subContent && subContent.subject && subContent.operator) {
                    // Apply negation to JavaScript operators
                    const jsOperator = this.getJavascriptOperator(
                      subContent.operator,
                      true // always negate for NotTree subtree
                    );

                    const jsValue =
                      typeof subContent.value === "string"
                        ? `"${subContent.value}"`
                        : subContent.value;

                    return `${subContent.subject} ${jsOperator} ${jsValue}`;
                  }
                  return "";
                })
                .filter((expr) => expr !== "");

              if (subExpressions.length > 0) {
                // Join with appropriate JavaScript operator based on NotTree's logic
                const joinOp = childContent.operator === "$and" ? "||" : "&&"; // Negated using De Morgan's laws
                return `(${subExpressions.join(` ${joinOp} `)})`;
              }
            }
            return "";
          }

          // Regular processing for normal nodes
          return this.toJavascriptExpression(childId);
        })
        .filter((expr) => expr !== "");

      // If there are no expressions, return empty string
      if (childExpressions.length === 0) {
        return "";
      }

      // Apply appropriate JavaScript logical operator
      const jsOperator = nodeContent.operator === "$and" ? "&&" : "||";

      // Return the JavaScript expression with parentheses
      return childExpressions.length === 1
        ? childExpressions[0]
        : `(${childExpressions.join(` ${jsOperator} `)})`;
    }

    // This is a predicate node
    if (nodeContent.subject && nodeContent.operator) {
      const jsOperator = this.getJavascriptOperator(
        nodeContent.operator,
        false
      );

      // Format value appropriately for JavaScript
      const jsValue =
        typeof nodeContent.value === "string"
          ? `"${nodeContent.value}"`
          : nodeContent.value;

      // Handle special case for "in" operator
      if (nodeContent.operator === "$in" || nodeContent.operator === "$nin") {
        return `[${jsValue}].includes(${nodeContent.subject})`;
      }

      return `${nodeContent.subject} ${jsOperator} ${jsValue}`;
    }

    // If we get here, it's some other type of node
    return "";
  }

  /**
   * Get the appropriate JavaScript operator
   */
  private getJavascriptOperator(operator: string, negated: boolean): string {
    const operatorMap: Record<string, { normal: string; negated: string }> = {
      $eq: { normal: "===", negated: "!==" },
      $ne: { normal: "!==", negated: "===" },
      $gt: { normal: ">", negated: "<=" },
      $gte: { normal: ">=", negated: "<" },
      $lt: { normal: "<", negated: ">=" },
      $lte: { normal: "<=", negated: ">" },
      $in: { normal: ".includes", negated: "!.includes" },
      $nin: { normal: "!.includes", negated: ".includes" },
    };

    return operatorMap[operator]
      ? negated
        ? operatorMap[operator].negated
        : operatorMap[operator].normal
      : operator;
  }

  /**
   * Convert the tree to a SQL expression string
   * @param nodeId The node ID to start from (defaults to root node)
   * @returns A SQL expression representing the tree with NOT applied to the whole subtree expressions
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
        .map((childId) => {
          const childContent = this.getChildContentAt(
            childId
          ) as PredicateContent;

          // Special handling for subtrees with negation (NotTree)
          if (
            childContent &&
            typeof childContent === "object" &&
            "_meta" in childContent &&
            childContent._meta?.negated === true
          ) {
            // For NotTree subtrees in SQL, we wrap the entire subtree expression with NOT

            // Get the children of this subtree node
            const subChildIds = this.getChildrenNodeIdsOf(childId);

            if (subChildIds.length > 0) {
              // Process each predicate in the subtree
              const subExpressions = subChildIds
                .map((subChildId) => {
                  const subContent = this.getChildContentAt(
                    subChildId
                  ) as PredicateContent;

                  if (subContent && subContent.subject && subContent.operator) {
                    // Don't apply negation to individual predicates in this approach
                    const sqlOperator = this.getSqlOperator(
                      subContent.operator,
                      false
                    );

                    const sqlValue =
                      typeof subContent.value === "string"
                        ? `'${subContent.value}'`
                        : subContent.value;

                    return `${subContent.subject} ${sqlOperator} ${sqlValue}`;
                  }
                  return "";
                })
                .filter((expr) => expr !== "");

              if (subExpressions.length > 0) {
                // Join with appropriate SQL operator based on original NotTree's logic
                const joinOp = childContent.operator === "$and" ? "AND" : "OR";
                // Apply NOT to the entire subexpression
                return `NOT (${subExpressions.join(` ${joinOp} `)})`;
              }
            }
            return "";
          }

          // Regular processing for normal nodes
          return this.toSqlExpression(childId);
        })
        .filter((expr) => expr !== "");

      // If there are no expressions, return empty string
      if (childExpressions.length === 0) {
        return "";
      }

      // Apply SQL logical operator
      const sqlOperator = nodeContent.operator === "$and" ? "AND" : "OR";

      // Return the SQL expression with parentheses
      return childExpressions.length === 1
        ? childExpressions[0]
        : `(${childExpressions.join(` ${sqlOperator} `)})`;
    }

    // This is a predicate node
    if (nodeContent.subject && nodeContent.operator) {
      const sqlOperator = this.getSqlOperator(nodeContent.operator, false);

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
   * Get the appropriate SQL operator
   */
  private getSqlOperator(operator: string, negated: boolean): string {
    const operatorMap: Record<string, { normal: string; negated: string }> = {
      $eq: { normal: "=", negated: "!=" },
      $ne: { normal: "!=", negated: "=" },
      $gt: { normal: ">", negated: "<=" },
      $gte: { normal: ">=", negated: "<" },
      $lt: { normal: "<", negated: ">=" },
      $lte: { normal: "<=", negated: ">" },
      $in: { normal: "IN", negated: "NOT IN" },
      $nin: { normal: "NOT IN", negated: "IN" },
    };

    return operatorMap[operator]
      ? negated
        ? operatorMap[operator].negated
        : operatorMap[operator].normal
      : operator;
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
        .map((childId) => {
          const childContent = this.getChildContentAt(
            childId
          ) as PredicateContent;

          // Special handling for subtrees with negation (NotTree)
          if (
            childContent &&
            typeof childContent === "object" &&
            "_meta" in childContent &&
            childContent._meta?.negated === true
          ) {
            // For this approach, we negate individual predicates and apply De Morgan's law

            // Get the children of this subtree node
            const subChildIds = this.getChildrenNodeIdsOf(childId);

            if (subChildIds.length > 0) {
              // Process each predicate in the subtree
              const subExpressions = subChildIds
                .map((subChildId) => {
                  const subContent = this.getChildContentAt(
                    subChildId
                  ) as PredicateContent;

                  if (subContent && subContent.subject && subContent.operator) {
                    // Apply negation to individual operators
                    const sqlOperator = this.getSqlOperator(
                      subContent.operator,
                      true
                    );

                    const sqlValue =
                      typeof subContent.value === "string"
                        ? `'${subContent.value}'`
                        : subContent.value;

                    return `${subContent.subject} ${sqlOperator} ${sqlValue}`;
                  }
                  return "";
                })
                .filter((expr) => expr !== "");

              if (subExpressions.length > 0) {
                // Apply De Morgan's law for the junction
                const joinOp = childContent.operator === "$and" ? "OR" : "AND";
                return `(${subExpressions.join(` ${joinOp} `)})`;
              }
            }
            return "";
          }

          // Regular processing for normal nodes
          return this.toSqlExpressionIsNegated(childId);
        })
        .filter((expr) => expr !== "");

      // If there are no expressions, return empty string
      if (childExpressions.length === 0) {
        return "";
      }

      // Apply SQL logical operator
      const sqlOperator = nodeContent.operator === "$and" ? "AND" : "OR";

      // Return the SQL expression with parentheses
      return childExpressions.length === 1
        ? childExpressions[0]
        : `(${childExpressions.join(` ${sqlOperator} `)})`;
    }

    // This is a predicate node
    if (nodeContent.subject && nodeContent.operator) {
      const sqlOperator = this.getSqlOperator(nodeContent.operator, false);

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
}

/**
 * ValidatedPredicateTree
 *
 * A specialized predicate tree that validates predicates against a subject dictionary
 * before adding them to the tree.
 */

import { GenericExpressionTree } from "../../../src";

// Type for our predicate node content
export type PredicateContent = {
  subject?: string;
  operator?: string;
  value?: any;
};

// Type for subject dictionary entries
export type TSubjectDataTypes =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "object"
  | "array";

export type TSubjectType = {
  datatype: TSubjectDataTypes;
  label?: string;
  shape?: Record<string, TSubjectType>;
  itemType?: string;
};

// Type for our subject dictionary
export type TSubjectDictionary = {
  [subjectId: string]: TSubjectType;
};

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ValidatedPredicateTree extends GenericExpressionTree<PredicateContent> {
  private subjectDictionary: TSubjectDictionary;

  constructor(subjectDictionary: TSubjectDictionary) {
    super();
    this.subjectDictionary = subjectDictionary;
  }

  /**
   * Get the root node ID
   */
  getRootNodeId(): string {
    return this.rootNodeId;
  }

  /**
   * Export the entire tree as a POJO (Plain Old JavaScript Object)
   */
  toPojo(): any {
    return this.toPojoAt(this.rootNodeId);
  }

  /**
   * Validates a predicate against the subject dictionary
   */
  validatePredicate(predicate: PredicateContent): boolean {
    // Skip validation for junction operators - they don't have subjects
    if (predicate.operator === "$and" || predicate.operator === "$or") {
      return true;
    }

    // Check if subject exists
    if (!predicate.subject) {
      throw new ValidationError("Predicate must have a subject");
    }

    // Check if subject exists in dictionary
    const subjectEntry = this.subjectDictionary[predicate.subject];
    if (!subjectEntry) {
      throw new ValidationError(`Unknown subject: ${predicate.subject}`);
    }

    // Validate operator
    if (!predicate.operator) {
      throw new ValidationError("Predicate must have an operator");
    }

    // Validate value type matches subject data type
    if (predicate.value !== undefined && predicate.value !== null) {
      // Simple type checking based on subject's datatype
      switch (subjectEntry.datatype) {
        case "string":
          if (typeof predicate.value !== "string") {
            throw new ValidationError(
              `Value for ${predicate.subject} must be a string`
            );
          }
          break;
        case "number":
          if (typeof predicate.value !== "number") {
            throw new ValidationError(
              `Value for ${predicate.subject} must be a number`
            );
          }
          break;
        case "boolean":
          if (typeof predicate.value !== "boolean") {
            throw new ValidationError(
              `Value for ${predicate.subject} must be a boolean`
            );
          }
          break;
        case "date":
          // Accept both Date objects and date strings
          if (
            !(predicate.value instanceof Date) &&
            isNaN(Date.parse(predicate.value))
          ) {
            throw new ValidationError(
              `Value for ${predicate.subject} must be a valid date`
            );
          }
          break;
        // For object and array types, we could add more complex validation here
      }
    }

    return true;
  }

  /**
   * Override appendChildNodeWithContent to add validation
   */
  appendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: PredicateContent
  ): string {
    // Validate the predicate before adding to tree
    if (nodeContent) {
      this.validatePredicate(nodeContent);
    }

    // Call the parent method once validation passes
    return super.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  /**
   * Override replaceNodeContent to add validation
   */
  replaceNodeContent(nodeId: string, nodeContent: PredicateContent): void {
    // Validate the predicate before replacing content
    if (nodeContent) {
      this.validatePredicate(nodeContent);
    }

    // Call the parent method once validation passes
    super.replaceNodeContent(nodeId, nodeContent);
  }
}

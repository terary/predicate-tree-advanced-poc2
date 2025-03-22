/**
 * subjectDictionary.ts
 *
 * This file defines a simple subject dictionary for the example.
 * The subject dictionary provides information about the fields
 * that can be used in predicates.
 */

/**
 * Interface for subject dictionary entries
 */
export interface SubjectDictionaryEntry {
  dataType: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  examples?: any[];
}

/**
 * A dictionary of valid operators
 */
export const validOperators = {
  $eq: "equals",
  $ne: "not equals",
  $gt: "greater than",
  $gte: "greater than or equal to",
  $lt: "less than",
  $lte: "less than or equal to",
  $in: "in array",
  $nin: "not in array",
  $regex: "matches regex pattern",
  $and: "logical AND",
  $or: "logical OR",
  $nor: "logical NOR (not OR)",
  $nand: "logical NAND (not AND)",
  $subtree: "subtree attachment point",
};

/**
 * A simple subject dictionary for our examples
 */
export const simpleSubjectDictionary: Record<string, SubjectDictionaryEntry> = {
  // String field
  A: {
    dataType: "string",
    description: "A simple string field",
    examples: ["example", "test", "sample"],
  },

  // Number field
  B: {
    dataType: "number",
    description: "A simple number field",
    examples: [10, 20, 30],
  },

  // Boolean field
  C: {
    dataType: "boolean",
    description: "A simple boolean field",
    examples: [true, false],
  },
};

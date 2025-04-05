/**
 * subjectDictionary.ts
 *
 * This file defines a subject dictionary for the object identity example.
 * The subject dictionary provides information about the fields
 * that can be used in predicates for identifying objects.
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
 * A subject dictionary for object identity examples
 */
export const objectIdentitySubjectDictionary: Record<
  string,
  SubjectDictionaryEntry
> = {
  // Object identity fields
  objectId: {
    dataType: "string",
    description: "Unique identifier for an object",
    examples: ["123", "456", "789"],
  },

  type: {
    dataType: "string",
    description: "Type of the object",
    examples: ["Person", "Vehicle", "Building"],
  },

  // Person-related fields
  name: {
    dataType: "string",
    description: "Name of a person",
    examples: ["John", "Mary", "Bob"],
  },

  age: {
    dataType: "number",
    description: "Age of a person",
    examples: [18, 25, 35],
  },

  // Additional fields that could be used
  createdAt: {
    dataType: "string",
    description: "ISO date string of when the object was created",
    examples: ["2023-01-01T00:00:00Z", "2023-06-15T12:30:45Z"],
  },

  isActive: {
    dataType: "boolean",
    description: "Whether the object is active",
    examples: [true, false],
  },
};

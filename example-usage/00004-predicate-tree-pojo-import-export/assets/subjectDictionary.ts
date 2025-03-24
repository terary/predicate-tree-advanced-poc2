/**
 * Subject Dictionary
 *
 * Defines valid operators and subjects for our predicate tree
 */

interface OperatorInfo {
  label: string;
  type: string;
}

interface SubjectInfo {
  type: string;
  label: string;
}

/**
 * Valid operators that can be used in predicates
 */
export const validOperators: Record<string, OperatorInfo> = {
  $eq: { label: "equals", type: "comparison" },
  $ne: { label: "not equals", type: "comparison" },
  $gt: { label: "greater than", type: "comparison" },
  $gte: { label: "greater than or equal", type: "comparison" },
  $lt: { label: "less than", type: "comparison" },
  $lte: { label: "less than or equal", type: "comparison" },
  $in: { label: "in", type: "collection" },
  $nin: { label: "not in", type: "collection" },
  $contains: { label: "contains", type: "string" },
  $startsWith: { label: "starts with", type: "string" },
  $endsWith: { label: "ends with", type: "string" },
  $and: { label: "AND", type: "junction" },
  $or: { label: "OR", type: "junction" },
};

/**
 * Subject fields that can be used in predicates
 */
export const validSubjects: Record<string, SubjectInfo> = {
  lastName: { type: "string", label: "Last Name" },
  firstName: { type: "string", label: "First Name" },
  age: { type: "number", label: "Age" },
  address: { type: "string", label: "Address" },
  department: { type: "string", label: "Department" },
  yearsOfExperience: { type: "number", label: "Years of Experience" },
  role: { type: "string", label: "Role" },
};

/**
 * Check if the operator is valid for the given subject
 */
export function isValidOperatorForSubject(
  operator: string,
  subject: string
): boolean {
  if (!validOperators[operator] || !validSubjects[subject]) {
    return false;
  }

  const operatorType = validOperators[operator].type;
  const subjectType = validSubjects[subject].type;

  // String-specific operators
  if (operatorType === "string" && subjectType !== "string") {
    return false;
  }

  // Collection operators can work with arrays
  if (
    operatorType === "collection" &&
    !["string", "number"].includes(subjectType)
  ) {
    return false;
  }

  // Junction operators don't apply to subjects directly
  if (operatorType === "junction") {
    return false;
  }

  return true;
}

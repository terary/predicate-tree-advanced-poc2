/**
 * Base interface for all matcher functions
 */
export interface IMatcher {
  isMatch: (record: any) => boolean;
}

/**
 * Interface for tree nodes that can generate JavaScript matcher functions
 */
export interface IJavaScriptMatchable {
  buildMatcherFunction: () => IMatcher;
}

/**
 * Record type for demonstration with our matchers
 */
export type TRecord = {
  firstName: string;
  lastName: string;
  age: number;
  isActive: boolean;
  birthdate: Date;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
};

// Define the allowed operator types
export type TOperandOperator =
  | "$eq"
  | "$ne"
  | "$gt"
  | "$gte"
  | "$lt"
  | "$lte"
  | "$in"
  | "$nin";

export type TJunctionOperator = "$and" | "$or";
export type TPredicateOperator = TOperandOperator | TJunctionOperator;

/**
 * Interface for predicate content in tree nodes
 */
export interface PredicateContent {
  operator?: TPredicateOperator;
  subjectId?: string;
  value?: any;
  _meta?: {
    negated?: boolean;
    description?: string;
    isSubtree?: boolean;
    [key: string]: any;
  };
  [key: string]: any; // Allow additional properties
}

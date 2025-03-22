import { AbstractExpressionFactory } from "./AbstractExpressionFactory";
import { JsPredicateTree } from "./JsPredicateTree/JsPredicateTree";
import {
  TPredicateTypes,
  TSubjectDictionary,
  TPredicateNodeTypes,
} from "./types";
import { TTreePojo } from "../../src";
import {
  predicateOperatorToJsOperator,
  predicateJunctionToJsOperator,
} from "./JsPredicateTree/helperFunctions";

/**
 * Matcher class that builds a matching function from a predicate tree POJO
 * and evaluates if input data matches the predicate conditions
 */
class Matcher {
  private _predicateTree: JsPredicateTree;
  private _subjects: TSubjectDictionary;
  private _matcherFunction: Function | null = null;

  /**
   * Create a new Matcher instance
   *
   * @param predicatePojo - The predicate tree POJO structure
   * @param subjects - Dictionary of subjects with their data types
   */
  constructor(
    predicatePojo: TTreePojo<TPredicateTypes>,
    subjects: TSubjectDictionary
  ) {
    this._subjects = subjects;

    // Create the predicate tree from the POJO
    this._predicateTree = AbstractExpressionFactory.fromPojo(
      predicatePojo
    ) as JsPredicateTree;

    // Build the matcher function
    this._buildMatcherFunction();
  }

  /**
   * Build the JavaScript function that will evaluate the predicate tree
   */
  private _buildMatcherFunction(): void {
    try {
      // Get the function body from the predicate tree
      const rawFunctionBody = this._predicateTree.toFunctionBody(
        this._predicateTree.rootNodeId,
        this._subjects
      );

      // Create a function that takes a record parameter and evaluates the predicate
      const functionString = `
        return function(record) {
          try {
            // Helper functions that should be available in the function scope
            const predicateOperatorToJsOperator = ${predicateOperatorToJsOperator.toString()};
            const predicateJunctionToJsOperator = ${predicateJunctionToJsOperator.toString()};
            
            // Convert operators in the function body
            const functionBody = "${rawFunctionBody}"
              .replace(/\\$eq/g, "===")
              .replace(/\\$gt/g, ">")
              .replace(/\\$gte/g, ">=")
              .replace(/\\$lt/g, "<")
              .replace(/\\$lte/g, "<=")
              .replace(/\\$and/g, "&&")
              .replace(/\\$or/g, "||")
              .replace(/\\$addressTree/g, "&&"); // Handle addressTree subtree
            
            // Evaluate the function body
            return eval(functionBody);
          } catch (error) {
            console.error("Error evaluating predicate:", error);
            return false;
          }
        }
      `;

      // Create the function using Function constructor
      this._matcherFunction = new Function(functionString)();
    } catch (error) {
      console.error("Error building matcher function:", error);
      this._matcherFunction = null;
    }
  }

  /**
   * Check if the provided data matches the predicate conditions
   *
   * @param data - The data to check against the predicate
   * @returns true if the data matches, false otherwise
   */
  public matches(data: Record<string, any>): boolean {
    if (!this._matcherFunction) {
      console.error("Matcher function not built successfully");
      return false;
    }

    try {
      return this._matcherFunction(data);
    } catch (error) {
      console.error("Error during matching:", error);
      return false;
    }
  }

  /**
   * Get the commented record shape for debugging
   *
   * @returns A string representation of the expected record shape
   */
  public getRecordShape(): string {
    // Get the basic record shape
    const basicShape = this._predicateTree.commentedRecord(this._subjects);

    // Add the address fields in the proper format
    const enhancedShape = basicShape.replace(
      '//  "record": [',
      '//  "record": [\n' +
        '//    "customer.address.address1: string",\n' +
        '//    "customer.address.address2: string",\n' +
        '//    "customer.address.address3: string",\n' +
        '//    "customer.address.countryCode: string",\n' +
        '//    "customer.address.postalCode: string",\n' +
        '//    "customer.address.specialInstructions: string",'
    );

    return enhancedShape;
  }

  /**
   * Get the underlying predicate tree
   */
  public get predicateTree(): JsPredicateTree {
    return this._predicateTree;
  }
}

/**
 * Create a matcher from a predicate tree POJO and subject dictionary
 *
 * @param predicatePojo - The predicate tree POJO structure
 * @param subjects - Dictionary of subjects with their data types
 * @returns A new Matcher instance
 */
function createMatcher(
  predicatePojo: TTreePojo<TPredicateNodeTypes>,
  subjects: TSubjectDictionary
): Matcher {
  return new Matcher(
    predicatePojo as unknown as TTreePojo<TPredicateTypes>,
    subjects
  );
}

export { Matcher, createMatcher };

/*
    Because these examples are within the same project as the library I want to manage
    what the example imports.  Ideally, "examples" becomes its own project and 100% independent 
    of the codebase.
 */

// Core library imports
export { AbstractExpressionTree, GenericExpressionTree } from "../../src";
export type { TTreePojo } from "../../src";

// Example assets
export { subjectDictionary } from "./assets/subjectDictionary";
export { predicateTreePojo } from "./assets/treePojo";

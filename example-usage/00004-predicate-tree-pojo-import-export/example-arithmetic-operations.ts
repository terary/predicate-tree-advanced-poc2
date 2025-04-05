/**
 * Arithmetic Tree Examples
 *
 * This file demonstrates how to use the ArithmeticTree class for
 * representing and calculating arithmetic expressions, as well as
 * importing and exporting them as POJO.
 */

import * as fs from "fs";
import * as path from "path";
import {
  ArithmeticTree,
  createArithmeticTree,
  ArithmeticPojoDocs,
} from "./common/classes/ArithmeticTree";

// Set up paths for samples and outputs
const assetsDir = path.join(__dirname, "common/pojo");
const outputsDir = path.join(__dirname, "outputs");

// Ensure outputs directory exists
if (!fs.existsSync(outputsDir)) {
  fs.mkdirSync(outputsDir);
}

/**
 * Demonstrate creating and using arithmetic trees
 */
export function demonstrateArithmeticTree(): void {
  console.log("\n===== DEMONSTRATING ARITHMETIC TREE =====");

  const aTree = new ArithmeticTree("arithmetic-tree-root", {
    operator: "$add",
    subjectLabel: "Arithmetic Tree Root",
  });

  aTree.appendChildNodeWithContent(aTree.rootNodeId, {
    value: 100,
    subjectLabel: "Constant I",
  });
  aTree.appendChildNodeWithContent(aTree.rootNodeId, {
    value: 101,
    subjectLabel: "Constant II",
  });
  const subtractBranchId = aTree.appendChildNodeWithContent(aTree.rootNodeId, {
    operator: "$subtract",
    subjectLabel: "Subtract  This",
  });
  aTree.appendChildNodeWithContent(subtractBranchId, {
    value: 102,
    subjectLabel: "Constant III",
  });
  aTree.appendChildNodeWithContent(subtractBranchId, {
    value: 103,
    subjectLabel: "Constant IV",
  });

  // ---

  const subtractResult = aTree.evaluate(subtractBranchId);
  const totalResult = aTree.evaluate();

  console.log({ subtractResult, totalResult });

  // ---

  const addResult = aTree.evaluate();
  console.log("Add Result: " + addResult);

  // ---

  // Example 1: Create a simple addition tree
  console.log("\n----- Example 1: Simple Addition -----");
  const additionTree = createArithmeticTree(
    "$add",
    [10, 20, 30, 40],
    "Simple Addition"
  );
  console.log(additionTree.toString()); // Should output: "Simple Addition: 100"

  // Example 2: Create a subtraction tree
  console.log("\n----- Example 2: Subtraction -----");
  const subtractionTree = createArithmeticTree(
    "$subtract",
    [100, 20, 5],
    "Subtraction Example"
  );
  console.log(subtractionTree.toString()); // Should output: "Subtraction Example: 75"

  // Example 3: Create a multiplication tree
  console.log("\n----- Example 3: Multiplication -----");
  const multiplicationTree = createArithmeticTree(
    "$multiply",
    [2, 3, 4],
    "Multiplication Example"
  );
  console.log(multiplicationTree.toString()); // Should output: "Multiplication Example: 24"

  // Example 4: Create a division tree
  console.log("\n----- Example 4: Division -----");
  const divisionTree = createArithmeticTree(
    "$divide",
    [100, 2, 5],
    "Division Example"
  );
  console.log(divisionTree.toString()); // Should output: "Division Example: 10"

  // Example 5: Build a complex expression tree
  console.log("\n----- Example 5: Complex Expression -----");
  const complexTree = new ArithmeticTree(undefined, {
    operator: "$add",
    subjectLabel: "Complex Expression",
  });

  // Add a constant value
  complexTree.appendChildNodeWithContent(complexTree.rootNodeId, {
    value: 100,
    subjectLabel: "Constant",
  });

  // Add a multiplication subtree
  const mulNodeId = complexTree.appendChildNodeWithContent(
    complexTree.rootNodeId,
    {
      operator: "$multiply",
      subjectLabel: "Product Term",
    }
  );

  // Add factors to the multiplication subtree
  complexTree.appendChildNodeWithContent(mulNodeId, {
    value: 5,
    subjectLabel: "Factor 1",
  });

  complexTree.appendChildNodeWithContent(mulNodeId, {
    value: 7,
    subjectLabel: "Factor 2",
  });

  // Add a division subtree
  const divNodeId = complexTree.appendChildNodeWithContent(
    complexTree.rootNodeId,
    {
      operator: "$divide",
      subjectLabel: "Division Term",
    }
  );

  // Add numerator and denominators to the division subtree
  complexTree.appendChildNodeWithContent(divNodeId, {
    value: 100,
    subjectLabel: "Numerator",
  });

  complexTree.appendChildNodeWithContent(divNodeId, {
    value: 2,
    subjectLabel: "Denominator",
  });

  // Evaluate the complex expression
  console.log(`${complexTree.toString()}`); // Should output: "Complex Expression: 185"

  // Example 6: Export to POJO and import back
  console.log("\n----- Example 6: POJO Export/Import -----");

  // Export the complex tree to POJO
  const complexTreePojo = complexTree.toPojoAt();

  // Save to a file
  const pojoFilePath = path.join(outputsDir, "arithmetic-tree.pojo.json");
  fs.writeFileSync(pojoFilePath, JSON.stringify(complexTreePojo, null, 2));
  console.log(`Saved POJO tree to: ${pojoFilePath}`);

  // Import back from POJO
  const importedTree = ArithmeticTree.fromPojo(complexTreePojo);
  console.log("Imported tree result: " + importedTree.toString());

  // Verify the result is the same
  if (complexTree.evaluate() === importedTree.evaluate()) {
    console.log("✅ PASS: POJO export/import preserves calculation results");
  } else {
    console.log("❌ FAIL: POJO export/import changed calculation results");
  }
}

/**
 * Main function to run the arithmetic tree examples
 */
export function runArithmeticTreeExamples(): void {
  console.log("\n==================================================");
  console.log(" Running Arithmetic Tree Examples");
  console.log("==================================================\n");

  // Demonstrate arithmetic tree functionality
  demonstrateArithmeticTree();

  console.log("\nArithmetic Tree Examples Completed");
}

import { SubjectDictionary } from "./subjectDictionary";
import { NotTree } from "./NotTree";
import { TRecord } from "./types";

/**
 * Main entry point for the JavaScript Matcher example
 *
 * This file will demonstrate how to use the predicate trees
 * to build JavaScript matcher functions
 */
console.log("JavaScript Matcher Example");
console.log("=========================");

// Display the subject dictionary for reference
console.log("Subject Dictionary:");
console.log(JSON.stringify(SubjectDictionary, null, 2));

// Create a NotTree example
console.log("\nCreating a NotTree example:");

// Create a NotTree that negates conditions
const notTree = new NotTree();

// Add predicates to the tree
notTree.appendChildNodeWithContent(notTree.rootNodeId, {
  subjectId: "age",
  operator: "$gt",
  value: 18,
});

notTree.appendChildNodeWithContent(notTree.rootNodeId, {
  subjectId: "postalCode",
  operator: "$eq",
  value: "12345",
});

// Create a matcher function from the tree
const matcher = notTree.buildMatcherFunction();

// Test some sample records
const sampleRecords = [
  {
    // Flat record structure with atomic fields
    firstName: "John",
    lastName: "Doe",
    age: 25,
    isActive: true,
    birthdate: new Date("1998-05-15"),
    postalCode: "12345",
    countryCode: "US",
  },
  {
    // Flat record structure with atomic fields
    firstName: "Jane",
    lastName: "Smith",
    age: 17,
    isActive: false,
    birthdate: new Date("2006-03-22"),
    postalCode: "54321",
    countryCode: "US",
  },
];

// Test the matcher against our sample records
console.log(
  "\nTesting the NotTree matcher (NOT(age > 18 AND postalCode === '12345')):"
);
sampleRecords.forEach((record, index) => {
  const isMatch = matcher.isMatch(record);
  console.log(`Record ${index + 1} (${record.firstName} ${record.lastName}):`);
  console.log(`  Age: ${record.age}, Postal Code: ${record.postalCode}`);
  console.log(`  Matches: ${isMatch}`);
  console.log(
    `  Explanation: ${
      isMatch
        ? "Matches because at least one condition fails"
        : "Doesn't match because all conditions are met"
    }`
  );
});

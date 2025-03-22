import { createMatcher } from "./matcher-take1";
import {
  matcherPojo,
  rubblePojo,
  addressTreePojo,
} from "./MatcherPojoWithSubtree";
import { SubjectsSimple } from "./SubjectsExamples";
import * as fs from "fs";
import * as path from "path";

// Create a matcher from our predicate POJO and subjects
// Combine the basic matcher with address tree subtree
const combinedPojo = {
  ...matcherPojo,
  ...rubblePojo,
  ...addressTreePojo,
};

const matcher = createMatcher(combinedPojo as any, SubjectsSimple);

// Example data that should match the Flintstone predicate
const fredFlintstone = {
  "customer.firstname": "Fred",
  "customer.lastname": "Flintstone",
};

// Example data that should match the Rubble predicate
const barneyRubble = {
  "customer.firstname": "Barney",
  "customer.lastname": "Rubble",
};

// Example data that should match the address tree predicate
const flintstoneWithAddress = {
  "customer.firstname": "Fred",
  "customer.lastname": "Flintstone",
  // Address fields that match the structure in SubjectsSimple
  "customer.address": {
    address1: "1285 Sabattus Road",
    address2: "Apt 101",
    address3: "Building C",
    countryCode: "US",
    postalCode: "70777",
    specialInstructions: "Leave under the mat",
  },
};

// Example data that should not match any predicate
const georgeJetson = {
  "customer.firstname": "George",
  "customer.lastname": "Jetson",
};

// Function to test and display match results
function testMatch(name: string, data: Record<string, any>) {
  console.log(`\n--- Testing ${name} ---`);
  const result = matcher.matches(data) ? "PASS" : "FAIL";
  console.log(`match ${name}: ${result}`);
  console.log(`Data:`, JSON.stringify(data));
}

// Test each record
testMatch("Fred Flintstone", fredFlintstone);
testMatch("Barney Rubble", barneyRubble);
testMatch("Fred Flintstone with Address", flintstoneWithAddress);
testMatch("George Jetson", georgeJetson);

// Debug: Output the function body to see what's being evaluated
console.log("\nFunction body:");
console.log(
  matcher.predicateTree.toFunctionBody(
    matcher.predicateTree.rootNodeId,
    SubjectsSimple
  )
);

// Output the expected record shape for debugging
console.log("\nExpected record shape (note: may show flattened paths):");
console.log(matcher.getRecordShape());

// Add a custom comment to explain the structure discrepancy
console.log("\nStructure Explanation:");
console.log(`
The predicate tree is looking for flattened paths like:
  'customer.address.address1'
  'customer.address.address2'
  'customer.address.countryCode'
  etc.

But our SubjectsSimple dictionary has 'customer.address' defined as an object with nested properties.

In the actual data structure we use:
{
  "customer.firstname": "Fred",
  "customer.lastname": "Flintstone",
  "customer.address": {
    address1: "1285 Sabattus Road",
    address2: "Apt 101",
    address3: "Building C",
    countryCode: "US",
    postalCode: "70777",
    specialInstructions: "Leave under the mat"
  }
}

The matcher handles this correctly during evaluation, but the record shape documentation 
shows the flattened paths that the predicate tree is using internally.
`);

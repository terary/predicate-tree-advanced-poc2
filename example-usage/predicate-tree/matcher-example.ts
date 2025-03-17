import { createMatcher } from "./matcher-take1";
import { matcherPojo } from "./MatcherPojoSimple";
import { SubjectsSimple } from "./SubjectsExamples";
import * as fs from "fs";
import * as path from "path";

// Create a matcher from our predicate POJO and subjects
// console.log("MatcherPojo structure:", Object.keys(matcherPojo));
// console.log("SubjectsSimple structure:", Object.keys(SubjectsSimple));

const matcher = createMatcher(matcherPojo, SubjectsSimple);

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
testMatch("George Jetson", georgeJetson);

// Output the expected record shape for debugging
console.log("\nExpected record shape:");
console.log(matcher.getRecordShape());

// Debug: Output the function body to see what's being evaluated
console.log("\nFunction body:");
console.log(
  matcher.predicateTree.toFunctionBody(
    matcher.predicateTree.rootNodeId,
    SubjectsSimple
  )
);

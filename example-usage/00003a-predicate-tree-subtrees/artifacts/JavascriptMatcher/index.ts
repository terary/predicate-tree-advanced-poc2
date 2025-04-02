import { SubjectDictionary } from "./subjectDictionary";
import { NotTree } from "./NotTree";
import { PostalAddressTree } from "./PostalAddressTree";
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
const notTreeMatcher = notTree.buildMatcherFunction();

// Create a PostalAddressTree example
console.log("\nCreating a PostalAddressTree example:");

// Create a PostalAddressTree for address-related conditions
const addressTree = new PostalAddressTree();

// Add address-related predicates to the tree
addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
  subjectId: "postalCode",
  operator: "$eq",
  value: "12345",
});

addressTree.appendChildNodeWithContent(addressTree.rootNodeId, {
  subjectId: "state",
  operator: "$eq",
  value: "CA",
});

// Create a matcher function from the address tree
const addressMatcher = addressTree.buildMatcherFunction();

// Test some sample records
const sampleRecords = [
  {
    // Record with flat fields and nested address structure
    firstName: "John",
    lastName: "Doe",
    age: 25,
    isActive: true,
    birthdate: new Date("1998-05-15"),
    postalCode: "12345", // Flat field for NotTree
    countryCode: "US",
    address: {
      // Nested address for PostalAddressTree
      postalCode: "12345",
      city: "Los Angeles",
      state: "CA",
      street: "123 Main St",
    },
  },
  {
    // Record with flat fields and nested address structure
    firstName: "Jane",
    lastName: "Smith",
    age: 17,
    isActive: false,
    birthdate: new Date("2006-03-22"),
    postalCode: "54321", // Flat field for NotTree
    countryCode: "US",
    address: {
      // Nested address for PostalAddressTree
      postalCode: "54321",
      city: "New York",
      state: "NY",
      street: "456 Elm St",
    },
  },
];

// Test the NotTree matcher against our sample records
console.log(
  "\nTesting the NotTree matcher (NOT(age > 18 AND postalCode === '12345')):"
);
sampleRecords.forEach((record, index) => {
  const isMatch = notTreeMatcher.isMatch(record);
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

// Test the PostalAddressTree matcher against our sample records
console.log(
  "\nTesting the PostalAddressTree matcher (address.postalCode === '12345' AND address.state === 'CA'):"
);
sampleRecords.forEach((record, index) => {
  const isMatch = addressMatcher.isMatch(record);
  console.log(`Record ${index + 1} (${record.firstName} ${record.lastName}):`);
  console.log(
    `  Address: ${record.address.city}, ${record.address.state} ${record.address.postalCode}`
  );
  console.log(`  Matches: ${isMatch}`);
  console.log(
    `  Explanation: ${
      isMatch
        ? "Matches because all address conditions are met"
        : "Doesn't match because at least one address condition fails"
    }`
  );
});

// Demonstrate POJO serialization and deserialization
console.log("\nDemonstrating POJO serialization/deserialization:");

// Serialize the address tree to POJO
const addressTreePojo = addressTree.toPojoAt();
console.log(
  "Serialized POJO structure (keys only):",
  Object.keys(addressTreePojo)
);

// Create a new tree from the serialized POJO
const deserializedAddressTree = PostalAddressTree.fromPojo(addressTreePojo);
console.log("Tree successfully deserialized");

// Create a matcher from the deserialized tree
const deserializedMatcher = deserializedAddressTree.buildMatcherFunction();

// Compare matchers
console.log("\nComparing original and deserialized matchers:");
sampleRecords.forEach((record, index) => {
  const originalResult = addressMatcher.isMatch(record);
  const deserializedResult = deserializedMatcher.isMatch(record);
  console.log(
    `Record ${
      index + 1
    }: Original=${originalResult}, Deserialized=${deserializedResult}`
  );
  console.log(
    `  Results match: ${originalResult === deserializedResult ? "✓" : "✗"}`
  );
});

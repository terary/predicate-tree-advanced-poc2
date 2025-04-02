import { SubjectDictionary } from "./subjectDictionary";
import { NotTree } from "./NotTree";
import { PostalAddressTree } from "./PostalAddressTree";
import { ArithmeticTree } from "./ArithmeticTree";
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

// Create an ArithmeticTree example
console.log("\nCreating an ArithmeticTree example:");

// Create an ArithmeticTree for calculating total price
const arithmeticTree = new ArithmeticTree();
arithmeticTree.replaceNodeContent(arithmeticTree.rootNodeId, {
  arithmeticOperator: "-", // Subtraction for final calculation (price - discount)
});

// Create a subtree for calculating the base price (price * quantity)
const multiplyNode = arithmeticTree.appendChildNodeWithContent(
  arithmeticTree.rootNodeId,
  {
    arithmeticOperator: "*", // Multiplication
  }
);

// Add the price and quantity to the multiplication node
arithmeticTree.appendChildNodeWithContent(multiplyNode, {
  subjectId: "price",
});
arithmeticTree.appendChildNodeWithContent(multiplyNode, {
  subjectId: "quantity",
});

// Add the discount to be subtracted
arithmeticTree.appendChildNodeWithContent(arithmeticTree.rootNodeId, {
  subjectId: "discount",
});

// Display the generated matcher body
console.log(
  "Generated JavaScript expression:",
  arithmeticTree.buildJavaScriptMatcherBodyAt()
);

// Create a matcher function from the arithmetic tree
const arithmeticMatcher = arithmeticTree.buildMatcherFunction();

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
    price: 10,
    quantity: 2,
    discount: 5,
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
    price: 20,
    quantity: 3,
    discount: 10,
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

// Test the ArithmeticTree matcher against our sample records
console.log(
  "\nTesting the ArithmeticTree matcher (price * quantity - discount):"
);
sampleRecords.forEach((record, index) => {
  const result = arithmeticMatcher.isMatch(record);
  console.log(`Record ${index + 1} (${record.firstName} ${record.lastName}):`);
  console.log(
    `  Price: ${record.price}, Quantity: ${record.quantity}, Discount: ${record.discount}`
  );
  console.log(`  Calculation Result: ${result}`);
  console.log(
    `  Explanation: ${record.price} * ${record.quantity} - ${record.discount} = ${result}`
  );
});

// Demonstrate POJO serialization and deserialization for the ArithmeticTree
console.log(
  "\nDemonstrating ArithmeticTree POJO serialization/deserialization:"
);

// Serialize the arithmetic tree to POJO
const arithmeticTreePojo = arithmeticTree.toPojoAt();
console.log(
  "Serialized POJO structure (keys only):",
  Object.keys(arithmeticTreePojo)
);

// Create a new tree from the serialized POJO
const deserializedArithmeticTree = ArithmeticTree.fromPojo(arithmeticTreePojo);
console.log("Tree successfully deserialized");

// Create a matcher from the deserialized tree
const deserializedArithmeticMatcher =
  deserializedArithmeticTree.buildMatcherFunction();

// Compare matchers
console.log("\nComparing original and deserialized arithmetic matchers:");
sampleRecords.forEach((record, index) => {
  const originalResult = arithmeticMatcher.isMatch(record);
  const deserializedResult = deserializedArithmeticMatcher.isMatch(record);
  console.log(
    `Record ${
      index + 1
    }: Original=${originalResult}, Deserialized=${deserializedResult}`
  );
  console.log(
    `  Results match: ${originalResult === deserializedResult ? "✓" : "✗"}`
  );
});

// Demonstrate POJO serialization and deserialization for the AddressTree
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

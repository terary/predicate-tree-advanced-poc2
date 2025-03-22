/**
 * Predicate Tree with Multilingual Subject Dictionary Labels
 *
 * This example demonstrates how to use a subject dictionary with multilingual labels
 * and generate human-readable descriptions of predicates in different languages.
 */

import { GenericExpressionTree } from "../../src";

// Type for subject dictionary entries with multilingual labels
type TSubjectDataTypes =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "object"
  | "array";

// Multilingual label type
type TMultilingualLabel = {
  default: string;
  en: string;
  es: string;
  // Could add more languages as needed
};

// Type for our subject dictionary with labels
type TSubjectType = {
  datatype: TSubjectDataTypes;
  label: TMultilingualLabel;
  shape?: Record<string, TSubjectType>;
  itemType?: string;
};

// Type for our subject dictionary
type TSubjectDictionary = {
  [subjectId: string]: TSubjectType;
};

// Type for our predicate node content
type PredicateContent = {
  subject?: string;
  operator?: string;
  value?: any;
};

// Type for operator dictionary with multilingual descriptions
type TOperatorDictionary = {
  [operatorId: string]: {
    en: string;
    es: string;
  };
};

// Create our subject dictionary with multilingual labels
const labelledSubjectDictionary: TSubjectDictionary = {
  // Customer fields
  "customer.name": {
    datatype: "string",
    label: {
      default: "Customer Name",
      en: "Customer Name",
      es: "Nombre del Cliente",
    },
  },
  "customer.email": {
    datatype: "string",
    label: {
      default: "Email Address",
      en: "Email Address",
      es: "Correo Electrónico",
    },
  },
  "customer.age": {
    datatype: "number",
    label: {
      default: "Age",
      en: "Age",
      es: "Edad",
    },
  },
  "customer.isActive": {
    datatype: "boolean",
    label: {
      default: "Active Status",
      en: "Active Status",
      es: "Estado Activo",
    },
  },
  "customer.signupDate": {
    datatype: "date",
    label: {
      default: "Signup Date",
      en: "Signup Date",
      es: "Fecha de Registro",
    },
  },

  // Product fields
  "product.name": {
    datatype: "string",
    label: {
      default: "Product Name",
      en: "Product Name",
      es: "Nombre del Producto",
    },
  },
  "product.price": {
    datatype: "number",
    label: {
      default: "Price",
      en: "Price",
      es: "Precio",
    },
  },
  "product.inStock": {
    datatype: "boolean",
    label: {
      default: "In Stock",
      en: "In Stock",
      es: "En Existencia",
    },
  },
  "product.category": {
    datatype: "string",
    label: {
      default: "Category",
      en: "Category",
      es: "Categoría",
    },
  },
};

// Define operators with multilingual descriptions
const operatorDictionary: TOperatorDictionary = {
  equals: {
    en: "equals",
    es: "es igual a",
  },
  contains: {
    en: "contains",
    es: "contiene",
  },
  greaterThan: {
    en: "is greater than",
    es: "es mayor que",
  },
  lessThan: {
    en: "is less than",
    es: "es menor que",
  },
  startsWith: {
    en: "starts with",
    es: "comienza con",
  },
  $and: {
    en: "AND",
    es: "Y",
  },
  $or: {
    en: "OR",
    es: "O",
  },
};

// Expected structure for validation
const EXPECTED_CHILD_CONTENT = [
  {
    subject: "customer.name",
    operator: "contains",
    value: "Smith",
  },
  {
    subject: "customer.age",
    operator: "greaterThan",
    value: 30,
  },
  {
    operator: "$or",
  },
];

const EXPECTED_OR_CHILDREN = [
  {
    subject: "product.price",
    operator: "lessThan",
    value: 100,
  },
  {
    subject: "product.category",
    operator: "equals",
    value: "Electronics",
  },
];

/**
 * Formats a value based on its type for human-readable output
 */
function formatValue(value: any): string {
  if (typeof value === "string") {
    return `"${value}"`;
  } else if (value instanceof Date) {
    return value.toLocaleDateString();
  } else {
    return String(value);
  }
}

/**
 * Converts a predicate tree to a human-readable description
 */
function treeToHumanReadableDescription(
  tree: GenericExpressionTree<PredicateContent>,
  language: "en" | "es" = "en"
): string {
  const rootNodeId = tree.rootNodeId;
  const rootContent = tree.getChildContentAt(rootNodeId) as PredicateContent;

  if (!rootContent || !rootContent.operator) {
    return "Empty tree";
  }

  const rootOperator = rootContent.operator;
  const operatorText =
    operatorDictionary[rootOperator]?.[language] || rootOperator;

  // Get all child nodes
  const childIds = tree.getChildrenNodeIdsOf(rootNodeId);
  const predicateDescriptions: string[] = [];

  // Process each child node to create a description
  for (const childId of childIds) {
    const childContent = tree.getChildContentAt(childId) as PredicateContent;

    if (!childContent) continue;

    // If this is a junction node, handle it recursively
    if (childContent.operator === "$and" || childContent.operator === "$or") {
      const subtree = new GenericExpressionTree<PredicateContent>();
      subtree.replaceNodeContent(subtree.rootNodeId, childContent);

      // Copy child nodes to the subtree
      const subChildIds = tree.getChildrenNodeIdsOf(childId);
      for (const subChildId of subChildIds) {
        const subChildContent = tree.getChildContentAt(
          subChildId
        ) as PredicateContent;
        if (subChildContent) {
          subtree.appendChildNodeWithContent(
            subtree.rootNodeId,
            subChildContent
          );
        }
      }

      // Get description from subtree and add parentheses
      const subDesc = treeToHumanReadableDescription(subtree, language);
      predicateDescriptions.push(`(${subDesc})`);
    }
    // Handle leaf predicate nodes
    else if (childContent.subject && childContent.operator) {
      const subject = childContent.subject;
      const subjectInfo = labelledSubjectDictionary[subject];

      if (!subjectInfo) continue;

      const subjectLabel =
        subjectInfo.label[language] || subjectInfo.label.default;
      const operatorLabel =
        operatorDictionary[childContent.operator]?.[language] ||
        childContent.operator;
      const valueText = formatValue(childContent.value);

      predicateDescriptions.push(
        `${subjectLabel} ${operatorLabel} ${valueText}`
      );
    }
  }

  return predicateDescriptions.join(` ${operatorText} `);
}

/**
 * Builds a sample predicate tree
 */
function buildLabelledPredicateTree(): GenericExpressionTree<PredicateContent> {
  console.log("Building a predicate tree with labelled subject dictionary...");

  // Create a generic expression tree
  const tree = new GenericExpressionTree<PredicateContent>();

  // Start with a root AND junction
  const rootId = tree.rootNodeId;
  tree.replaceNodeContent(rootId, { operator: "$and" });
  console.log("✅ Root node created with $and operator");

  // Add some predicates
  tree.appendChildNodeWithContent(rootId, {
    subject: "customer.name",
    operator: "contains",
    value: "Smith",
  });
  console.log("✅ Added customer.name predicate");

  tree.appendChildNodeWithContent(rootId, {
    subject: "customer.age",
    operator: "greaterThan",
    value: 30,
  });
  console.log("✅ Added customer.age predicate");

  // Add a nested OR junction
  const orJunctionId = tree.appendChildNodeWithContent(rootId, {
    operator: "$or",
  });
  console.log("✅ Added $or junction node");

  // Add children to the OR junction
  tree.appendChildNodeWithContent(orJunctionId, {
    subject: "product.price",
    operator: "lessThan",
    value: 100,
  });
  console.log("✅ Added product.price predicate");

  tree.appendChildNodeWithContent(orJunctionId, {
    subject: "product.category",
    operator: "equals",
    value: "Electronics",
  });
  console.log("✅ Added product.category predicate");

  return tree;
}

/**
 * Validates that the tree was built as expected
 */
function validateTreeStructure(
  tree: GenericExpressionTree<PredicateContent>
): boolean {
  console.log("\n===============================================");
  console.log("  VALIDATING TREE STRUCTURE");
  console.log("===============================================");

  const rootNodeId = tree.rootNodeId;
  const rootContent = tree.getChildContentAt(rootNodeId) as PredicateContent;

  // First, check root node content
  if (rootContent?.operator !== "$and") {
    console.error("❌ Root node does not have $and operator");
    return false;
  }

  console.log("✅ Verified root node has $and operator");

  // Get all child nodes of root
  const childNodeIds = tree.getChildrenNodeIdsOf(rootNodeId);

  // Should have 3 children (2 predicates and 1 OR junction)
  if (childNodeIds.length !== 3) {
    console.error(
      `❌ Expected 3 child nodes, but found ${childNodeIds.length}`
    );
    return false;
  }

  console.log("✅ Verified root node has 3 children as expected");

  // Get content of all child nodes
  const childContents = childNodeIds.map(
    (id) => tree.getChildContentAt(id) as PredicateContent
  );

  // Check if child contents match expected structure
  let isValid = true;
  childContents.forEach((content, index) => {
    const expected = EXPECTED_CHILD_CONTENT[index];

    // Compare subject
    if (content.subject !== expected.subject) {
      console.error(
        `❌ Child ${index}: Expected subject "${expected.subject}", got "${content.subject}"`
      );
      isValid = false;
    }

    // Compare operator
    if (content.operator !== expected.operator) {
      console.error(
        `❌ Child ${index}: Expected operator "${expected.operator}", got "${content.operator}"`
      );
      isValid = false;
    }

    // Compare value (only if it exists in expected)
    if (
      expected.value !== undefined &&
      JSON.stringify(content.value) !== JSON.stringify(expected.value)
    ) {
      console.error(
        `❌ Child ${index}: Expected value ${expected.value}, got ${content.value}`
      );
      isValid = false;
    }
  });

  if (isValid) {
    console.log("✅ Verified all root children have correct content");
  }

  // Find the OR junction node
  const orJunctionNode = childContents.find((c) => c.operator === "$or");
  if (!orJunctionNode) {
    console.error("❌ Could not find OR junction node");
    return false;
  }

  const orNodeId = childNodeIds[childContents.indexOf(orJunctionNode)];
  const orChildNodeIds = tree.getChildrenNodeIdsOf(orNodeId);

  // OR junction should have 2 children
  if (orChildNodeIds.length !== 2) {
    console.error(
      `❌ Expected OR junction to have 2 children, but found ${orChildNodeIds.length}`
    );
    return false;
  }

  console.log("✅ Verified OR junction has 2 children as expected");

  // Get content of OR junction children
  const orChildContents = orChildNodeIds.map(
    (id) => tree.getChildContentAt(id) as PredicateContent
  );

  // Check if OR junction child contents match expected structure
  let orChildrenValid = true;
  orChildContents.forEach((content, index) => {
    const expected = EXPECTED_OR_CHILDREN[index];

    // Compare subject
    if (content.subject !== expected.subject) {
      console.error(
        `❌ OR Child ${index}: Expected subject "${expected.subject}", got "${content.subject}"`
      );
      orChildrenValid = false;
    }

    // Compare operator
    if (content.operator !== expected.operator) {
      console.error(
        `❌ OR Child ${index}: Expected operator "${expected.operator}", got "${content.operator}"`
      );
      orChildrenValid = false;
    }

    // Compare value
    if (JSON.stringify(content.value) !== JSON.stringify(expected.value)) {
      console.error(
        `❌ OR Child ${index}: Expected value ${expected.value}, got ${content.value}`
      );
      orChildrenValid = false;
    }
  });

  if (orChildrenValid) {
    console.log("✅ Verified all OR junction children have correct content");
  }

  const allValid = isValid && orChildrenValid;
  if (allValid) {
    console.log(
      "\n✅ VALIDATION SUCCESSFUL: Tree structure matches expected format"
    );
  } else {
    console.error(
      "\n❌ VALIDATION FAILED: Tree structure does not match expected format"
    );
  }

  return allValid;
}

/**
 * Displays predicate tree descriptions in different languages
 */
function displayMultilingualDescriptions(
  tree: GenericExpressionTree<PredicateContent>
) {
  console.log("\n===============================================");
  console.log("  HUMAN-READABLE DESCRIPTIONS");
  console.log("===============================================");

  // Get descriptions in different languages
  const englishDescription = treeToHumanReadableDescription(tree, "en");
  const spanishDescription = treeToHumanReadableDescription(tree, "es");

  console.log("\nEnglish Description:");
  console.log(`➡️ ${englishDescription}`);

  console.log("\nSpanish Description:");
  console.log(`➡️ ${spanishDescription}`);
}

/**
 * Main function to run the example
 */
export function runLabelledPredicateTreeExample(): void {
  console.log("===============================================");
  console.log("  PREDICATE TREE WITH MULTILINGUAL LABELS");
  console.log("===============================================");

  // Build our predicate tree
  const tree = buildLabelledPredicateTree();

  // Show the POJO structure
  console.log("\n===============================================");
  console.log("  EXPORTED POJO STRUCTURE");
  console.log("===============================================");

  const pojo = tree.toPojoAt(tree.rootNodeId);
  console.log(JSON.stringify(pojo, null, 2));

  // Validate the tree structure
  const isValid = validateTreeStructure(tree);

  // Display human-readable descriptions in different languages
  displayMultilingualDescriptions(tree);

  console.log("\n===============================================");
  console.log(
    isValid
      ? "  EXAMPLE COMPLETED SUCCESSFULLY"
      : "  EXAMPLE COMPLETED WITH VALIDATION ERRORS"
  );
  console.log("===============================================");
}

// If this file is run directly
if (require.main === module) {
  runLabelledPredicateTreeExample();
}

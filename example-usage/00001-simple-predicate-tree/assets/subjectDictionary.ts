/**
 * Simple Subject Dictionary for the predicate tree example
 * Defines the data types of fields that can be used in predicates
 *
 *
 * For subject dictionaries, we avoid using dots in the name
 * customer.firstname as it leads to confusion when parsing larger json documents.
 *
 *
 *
 */
export const subjectDictionary = {
  "person:firstname": { dataType: "string" },
  "person:lastname": { dataType: "string" },
  "person:age": { dataType: "number" },
  "person:active": { dataType: "boolean" },
};

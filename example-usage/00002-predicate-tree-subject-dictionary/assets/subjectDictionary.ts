/**
 * Subject Dictionary for Customer and Product Data
 *
 * This dictionary defines the allowed subjects, their data types,
 * and nested structure for validation in predicate trees.
 */

import { TSubjectDictionary, TSubjectType } from "./ValidatedPredicateTree";

// Export the dictionary that contains all of our fields for customers and products
export const customerProductDictionary: TSubjectDictionary = {
  // Customer fields
  "customer.name": {
    datatype: "string",
    label: "Customer Name",
  },
  "customer.email": {
    datatype: "string",
    label: "Email Address",
  },
  "customer.age": {
    datatype: "number",
    label: "Age",
  },
  "customer.isActive": {
    datatype: "boolean",
    label: "Active Status",
  },
  "customer.createdAt": {
    datatype: "date",
    label: "Registration Date",
  },

  // Customer address (object type with nested properties)
  "customer.address": {
    datatype: "object",
    label: "Customer Address",
    shape: {
      street: { datatype: "string", label: "Street" },
      city: { datatype: "string", label: "City" },
      zipCode: { datatype: "string", label: "Zip/Postal Code" },
      country: { datatype: "string", label: "Country" },
    },
  },

  // Customer orders (array type)
  "customer.orders": {
    datatype: "array",
    label: "Customer Orders",
    itemType: "object",
  },

  // Product fields
  "product.id": {
    datatype: "string",
    label: "Product ID",
  },
  "product.name": {
    datatype: "string",
    label: "Product Name",
  },
  "product.price": {
    datatype: "number",
    label: "Price",
  },
  "product.inStock": {
    datatype: "boolean",
    label: "In Stock",
  },
  "product.category": {
    datatype: "string",
    label: "Category",
  },
  "product.createdAt": {
    datatype: "date",
    label: "Creation Date",
  },
};

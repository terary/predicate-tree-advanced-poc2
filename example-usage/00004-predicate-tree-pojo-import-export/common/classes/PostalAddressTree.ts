/**
 * PostalAddressTree Implementation
 *
 * A specialized implementation of GenericExpressionTree for representing postal addresses
 * This is a simplified example tree with a parent node and direct children only
 */

import {
  AbstractExpressionTree,
  GenericExpressionTree,
  IExpressionTree,
  treeUtils,
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
  AbstractTree,
} from "../../../../src";
import { IJavascriptMatcherFunction, ISqlWhereClause } from "./types";

// Define the node content type for our address tree
export interface PostalAddressContent {
  field?: string; // Field name (address1, city, country, etc.)
  value?: string; // The actual value of the field
  description?: string; // Optional description
  [key: string]: any; // Allow additional properties
}

// Define the POJO node type
export interface PostalAddressPojoNode {
  parentId: string | null;
  nodeContent: PostalAddressContent;
  nodeType?: string;
}

// Define the POJO document type
export interface PostalAddressPojoDocs {
  [key: string]: PostalAddressPojoNode;
}

// Interface for trees that can generate SQL expressions
interface ISqlExpressionTree {
  toSqlWhereClauseAt(nodeId: string, options?: any): string;
  rootNodeId: string;
}

// Interface for trees that can generate JavaScript expressions
interface IJavascriptExpressionTree extends IJavascriptMatcherFunction {
  rootNodeId: string;
}

/**
 * Error class for our address tree
 */
export class PostalAddressTreeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PostalAddressTreeError";
  }
}

/**
 * PostalAddressTree - A tree that represents postal addresses with standard fields
 * and supports POJO import/export
 */
// @ts-ignore - Bypass TypeScript's static inheritance checking
export class PostalAddressTree
  extends GenericExpressionTree<PostalAddressContent>
  implements ISqlWhereClause, IJavascriptMatcherFunction
{
  static SubtreeNodeTypeName: string = "PostalAddressTree";
  public SubtreeNodeTypeName: string = "PostalAddressTree";

  /**
   * Create a new PostalAddressTree
   */
  constructor(rootNodeId?: string, nodeContent?: PostalAddressContent) {
    super(rootNodeId, nodeContent);

    // Initialize with a default root node if not provided
    if (!nodeContent) {
      this.replaceNodeContent(this.rootNodeId, {
        field: "address",
        description: "Postal Address",
      });
    }
  }

  /**
   * Get the standard address field names
   */
  static getAddressFields(): string[] {
    return [
      "address1",
      "address2",
      "address3",
      "city",
      "stateOrProvince",
      "postalCode",
      "country",
      "specialInstructions",
    ];
  }

  /**
   * Get the available fields in this address tree
   * Returns an array of all field names that have values
   */
  getAvailableFields(): string[] {
    const childrenIds = this.getChildrenNodeIdsOf(this.rootNodeId);
    const fields: string[] = [];

    childrenIds.forEach((childId) => {
      const content = this.getChildContentAt(childId) as PostalAddressContent;
      if (content && content.field && content.value) {
        fields.push(content.field);
      }
    });

    return fields;
  }

  /**
   * Get a field value by field name
   * @param fieldName The name of the field to retrieve
   * @returns The value of the field or null if not found
   */
  getFieldValue(fieldName: string): string | null {
    const childrenIds = this.getChildrenNodeIdsOf(this.rootNodeId);

    for (const childId of childrenIds) {
      const content = this.getChildContentAt(childId) as PostalAddressContent;
      if (content && content.field === fieldName && content.value) {
        return content.value;
      }
    }

    return null;
  }

  /**
   * Set a field value
   * @param fieldName The name of the field to set
   * @param value The value to set
   * @returns True if the field was set, false if it's not a valid field
   */
  setFieldValue(fieldName: string, value: string): boolean {
    // Check if it's a valid field
    if (!PostalAddressTree.getAddressFields().includes(fieldName)) {
      return false;
    }

    // Check if the field already exists
    const childrenIds = this.getChildrenNodeIdsOf(this.rootNodeId);

    for (const childId of childrenIds) {
      const content = this.getChildContentAt(childId) as PostalAddressContent;
      if (content && content.field === fieldName) {
        // Update existing field
        this.replaceNodeContent(childId, {
          ...content,
          value: value,
        });
        return true;
      }
    }

    // Field doesn't exist yet, create it
    this.appendChildNodeWithContent(this.rootNodeId, {
      field: fieldName,
      value: value,
      description: `${fieldName} field`,
    });

    return true;
  }

  /**
   * Convert to a formatted address string
   * @returns A multi-line string with the formatted address
   */
  toFormattedString(): string {
    const lines: string[] = [];

    // Add fields in the correct order
    const address1 = this.getFieldValue("address1");
    if (address1) lines.push(address1);

    const address2 = this.getFieldValue("address2");
    if (address2) lines.push(address2);

    const address3 = this.getFieldValue("address3");
    if (address3) lines.push(address3);

    // City, State ZIP on one line
    const cityParts: string[] = [];
    const city = this.getFieldValue("city");
    if (city) cityParts.push(city);

    const state = this.getFieldValue("stateOrProvince");
    if (state) cityParts.push(state);

    const postalCode = this.getFieldValue("postalCode");
    if (postalCode) cityParts.push(postalCode);

    if (cityParts.length > 0) {
      lines.push(cityParts.join(", "));
    }

    const country = this.getFieldValue("country");
    if (country) lines.push(country);

    const specialInstructions = this.getFieldValue("specialInstructions");
    if (specialInstructions) lines.push(`Note: ${specialInstructions}`);

    return lines.join("\n");
  }

  /**
   * Create a new address tree from individual field values
   * @param fields Object containing field values
   * @returns A new PostalAddressTree instance
   */
  static createFromFields(fields: Record<string, string>): PostalAddressTree {
    const tree = new PostalAddressTree();

    Object.entries(fields).forEach(([field, value]) => {
      if (PostalAddressTree.getAddressFields().includes(field)) {
        tree.setFieldValue(field, value);
      }
    });

    return tree;
  }

  /**
   * Convert the address to a SQL WHERE clause for matching
   * @param nodeId The node ID to start from (defaults to root node)
   * @param withOptions Options for generation
   * @returns A SQL expression for matching this address
   */
  toSqlWhereClauseAt(
    nodeId: string = this.rootNodeId,
    withOptions: any = {}
  ): string {
    try {
      // For address trees, we'll convert to SQL conditions
      return this.buildSqlExpression(nodeId, withOptions);
    } catch (error) {
      if (error instanceof PostalAddressTreeError) {
        return `/* Error: ${error.message} */`;
      }
      return "/* Error generating SQL */";
    }
  }

  /**
   * Recursively build a SQL expression
   * @param nodeId The node ID to process
   * @returns A SQL string representation of the address match
   */
  private buildSqlExpression(nodeId: string, options: any = {}): string {
    // **  DO NOT REMOVE THIS COMMENT **
    //        IDEAL PATTERN
    // This is the recommend pattern for traversing the tree.
    // Use the existing tools to determine branching 'isLeaf', 'isBranch', isRoot, isSubtree
    // ** IDEAL PATTERN**
    // Theoretically this can be accomplished using visitors to mutate a clone of the tree or
    // use transformers when cloning the tree.  Those are also reasonable approaches.
    //
    //  Iterating over the tree using standard iteration loops is a BAD IDEA.
    //
    // DO NOT REMOVE THIS COMMENT

    const prefix = options.tablePrefix || "";

    // Handle root node
    if (this.isRoot(nodeId)) {
      const childrenIds = this.getChildrenNodeIdsOf(nodeId);

      if (childrenIds.length === 0) {
        return "1=1"; // No conditions
      }

      const conditions = childrenIds
        .map((childId) => this.buildSqlExpression(childId, options))
        .filter((cond) => cond && cond !== "1=1");

      if (conditions.length === 0) {
        return "1=1"; // No non-empty conditions
      }

      return `(${conditions.join(" AND ")})`;
    }

    // Handle leaf nodes (individual address fields)
    if (this.isLeaf(nodeId)) {
      const nodeContent = this.getChildContentAt(
        nodeId
      ) as PostalAddressContent;

      if (!nodeContent.field || !nodeContent.value) {
        return ""; // Skip empty fields
      }

      const fieldName = prefix
        ? `${prefix}.${nodeContent.field}`
        : nodeContent.field;
      return `${fieldName} = '${this.escapeSqlString(nodeContent.value)}'`;
    }

    // Handle subtrees (though we don't expect any in this simple implementation)
    if (this.isSubtree(nodeId)) {
      const subtree = this.getChildContentAt(nodeId);

      if (subtree instanceof GenericExpressionTree) {
        const sqlTree = subtree as unknown as ISqlExpressionTree;
        return sqlTree.toSqlWhereClauseAt(sqlTree.rootNodeId, options);
      }
    }

    // Fallback
    return "1=1";
  }

  /**
   * Escape a string for SQL
   * @param value The string to escape
   * @returns Escaped string
   */
  private escapeSqlString(value: string): string {
    if (!value) return "";
    return value.replace(/'/g, "''");
  }

  /**
   * Convert the address to a JavaScript matcher function
   * @param nodeId The node ID to start from (defaults to root node)
   * @param withOptions Options for generation
   * @returns A JavaScript function as a string
   */
  toJavascriptMatcherFunctionAt(
    nodeId: string = this.rootNodeId,
    withOptions: any = {}
  ): string {
    try {
      const functionBody = this.toJavascriptMatcherFunctionBodyAt(
        nodeId,
        withOptions
      );
      const fnName = withOptions.functionName || "addressMatcher";
      const recordName = withOptions.recordName || "record";

      return `function ${fnName}(${recordName}) {\n  return ${functionBody};\n}`;
    } catch (error) {
      if (error instanceof PostalAddressTreeError) {
        return `/* Error: ${error.message} */\nfunction addressMatcher() { return false; }`;
      }
      return "/* Error generating JavaScript */\nfunction addressMatcher() { return false; }";
    }
  }

  /**
   * Generate just the function body for a JavaScript matcher
   * @param nodeId The node ID to start from (defaults to root node)
   * @param withOptions Options for generation
   * @returns The function body as a string
   */
  toJavascriptMatcherFunctionBodyAt(
    nodeId: string = this.rootNodeId,
    withOptions: any = {}
  ): string {
    try {
      return this.buildJsExpression(nodeId, withOptions);
    } catch (error) {
      if (error instanceof PostalAddressTreeError) {
        return `/* Error: ${error.message} */\nfalse`;
      }
      return "/* Error generating JavaScript */\nfalse";
    }
  }

  /**
   * Recursively build a JavaScript expression
   * @param nodeId The node ID to process
   * @returns A JavaScript string representation of the address match
   */
  private buildJsExpression(nodeId: string, options: any = {}): string {
    // **  DO NOT REMOVE THIS COMMENT **
    //        IDEAL PATTERN
    // This is the recommend pattern for traversing the tree.
    // Use the existing tools to determine branching 'isLeaf', 'isBranch', isRoot, isSubtree
    // ** IDEAL PATTERN**
    // Theoretically this can be accomplished using visitors to mutate a clone of the tree or
    // use transformers when cloning the tree.  Those are also reasonable approaches.
    //
    //  Iterating over the tree using standard iteration loops is a BAD IDEA.
    //
    // DO NOT REMOVE THIS COMMENT

    const prefix = options.objPrefix || "address";
    const recordName = options.recordName || "record";

    // Handle root node
    if (this.isRoot(nodeId)) {
      const childrenIds = this.getChildrenNodeIdsOf(nodeId);

      if (childrenIds.length === 0) {
        return "true"; // No conditions
      }

      const conditions = childrenIds
        .map((childId) => this.buildJsExpression(childId, options))
        .filter((cond) => cond && cond !== "true");

      if (conditions.length === 0) {
        return "true"; // No non-empty conditions
      }

      return `(${conditions.join(" && ")})`;
    }

    // Handle leaf nodes (individual address fields)
    if (this.isLeaf(nodeId)) {
      const nodeContent = this.getChildContentAt(
        nodeId
      ) as PostalAddressContent;

      if (!nodeContent.field || !nodeContent.value) {
        return "true"; // Skip empty fields
      }

      const propPath = prefix
        ? `${recordName}.${prefix}.${nodeContent.field}`
        : `${recordName}.${nodeContent.field}`;
      return `${propPath} === "${this.escapeJsString(nodeContent.value)}"`;
    }

    // Handle subtrees (though we don't expect any in this simple implementation)
    if (this.isSubtree(nodeId)) {
      const subtree = this.getChildContentAt(nodeId);

      if (
        subtree instanceof GenericExpressionTree &&
        "toJavascriptMatcherFunctionBodyAt" in subtree
      ) {
        const jsTree = subtree as unknown as IJavascriptExpressionTree;
        return jsTree.toJavascriptMatcherFunctionBodyAt(
          jsTree.rootNodeId,
          options
        );
      }
    }

    // Fallback
    return "true";
  }

  /**
   * Escape a string for JavaScript
   * @param value The string to escape
   * @returns Escaped string
   */
  private escapeJsString(value: string): string {
    if (!value) return "";
    return value
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r")
      .replace(/\t/g, "\\t");
  }

  /**
   * Import a PostalAddressTree from a POJO
   * @param srcPojoTree The source POJO
   * @param transform Optional transform function
   * @returns A new PostalAddressTree
   */
  static fromPojo<P extends PostalAddressContent>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>
  ): PostalAddressTree {
    const genericTree = AbstractExpressionTree.fromPojo(srcPojoTree, transform);

    const addressTree = new PostalAddressTree();

    // @ts-ignore - Set internal properties from generic tree
    addressTree._incrementor = genericTree._incrementor;
    // @ts-ignore
    addressTree._rootNodeId = genericTree._rootNodeId;
    // @ts-ignore
    addressTree._nodeDictionary = genericTree._nodeDictionary;

    return addressTree;
  }

  /**
   * Create a default POJO representation of an address
   * @returns A POJO document with a default address
   */
  static createDefaultPojo(): TTreePojo<PostalAddressContent> {
    const rootId = "address";
    const pojo: TTreePojo<PostalAddressContent> = {
      [rootId]: {
        parentId: "",
        nodeContent: {
          field: "address",
          description: "Postal Address",
        },
      },
    };

    // Add standard fields
    PostalAddressTree.getAddressFields().forEach((field, index) => {
      pojo[`${rootId}_${index}`] = {
        parentId: rootId,
        nodeContent: {
          field: field,
          value: "",
          description: `${field} field`,
        },
      };
    });

    pojo[rootId].parentId = rootId;
    return pojo;
  }
}

// Export a factory function for standalone use
export const createPostalAddressTree = (
  address: Record<string, string>
): PostalAddressTree => {
  return PostalAddressTree.createFromFields(address);
};

import { AbstractExpressionTree } from "../../../src";
import { GenericExpressionTree } from "../../../src/DirectedGraph/AbstractExpressionTree/AbstractExpressionTree";
import { TGenericNodeContent, TNodePojo, TTreePojo } from "../../../src/DirectedGraph/types";
import { TOperand, TPredicateNodeTypes, TPredicateTypes } from "../types";
import { JsPredicateTree } from "./JsPredicateTree";
import { TJsPredicate, TSubjectDictionary } from "./types";
import { dev_only_export } from "./JsPredicateTree";
import { IDirectedGraph, IExpressionTree, ITree } from "../../../src/DirectedGraph/ITree";
import treeUtils from "../../../src/DirectedGraph/AbstractDirectedGraph/treeUtilities";
import {
  quoteValue,
  predicateJunctionToJsOperator,
  predicateOperatorToJsOperator,
} from "./helperFunctions";
import { AbstractExpressionFactory } from "../AbstractExpressionFactory";
import { TSubject } from "../../../dev-debug/PredicateTreeJs/type";
// class AddressTree extends AbstractExpressionTree<TPredicateTypes> {
type TTreeInitiator = <P, Q>(rootSeedNodeId: string, nodeContent: P) => Q;
const defaultFromPojoTransform = <P>(nodeContent: TNodePojo<P>): TGenericNodeContent<P> => {
  return nodeContent.nodeContent;
};

// class AddressTree extends AbstractExpressionTree<TPredicateTypes> {
class AddressTree extends JsPredicateTree {
  // class AddressTree extends AbstractExpressionFactory {
  private _subjectId!: string;
  private constructor(rootSendNodeId?: string, nodeContent?: TPredicateTypes) {
    super(rootSendNodeId, nodeContent);
  }
  toFunctionBody(rootNodeId: string = this.rootNodeId, subjects: TSubjectDictionary): string {
    const subSubject = subjects[this._subjectId];
    const subjectIds: { [subjectId: string]: any } = {};
    const subfields: { [subjectId: string]: any } = {};
    const logicTerms: string[] = [];
    Object.entries(subSubject).forEach(([subjectId, subject]) => {
      const nodeId = this._rootNodeId + ":" + subjectId;

      const nodeContent = this.getChildContentAt(nodeId) as TOperand;
      if (nodeContent === null) {
        return;
      }

      if (!nodeContent.subjectId) {
        console.log("Found it");
      }
      const term = ` record['${nodeContent.subjectId}'] ${predicateOperatorToJsOperator(
        nodeContent.operator
      )} ${quoteValue(
        // @ts-ignore - .datatype not member of subject
        subject.datatype,
        nodeContent.value
      )}`;
      logicTerms.push(term);
      // subfields[this._rootNodeId + ":" + subjectId] = "x";
      // subjectIds[this._subjectId + ":" + subjectId] = subject;
    });
    return `(${logicTerms.join(" && ")})`;
  }

  commentedRecord(subjects: TSubjectDictionary): string {
    return "";
  }

  getNewInstance(
    rootSeed?: string,
    nodeContent?: TPredicateTypes
  ): IExpressionTree<TPredicateTypes> {
    return new AddressTree(rootSeed, nodeContent);
  }

  static getNewInstance_typed(
    rootSeedNodeId?: string,
    nodeContent?: TPredicateTypes
  ): IExpressionTree<TPredicateTypes> {
    return new AddressTree(rootSeedNodeId, nodeContent) as unknown as AddressTree;
  }

  createSubtreeAt(nodeId: string): IExpressionTree<TPredicateTypes> {
    // *tmc* not a real createSubgraphAt
    return this;
  }

  static getNewInstance<P>(
    rootSeedNodeId = "address",
    nodeContent?: P
  ): IExpressionTree<P> {
    const tree = new AddressTree(rootSeedNodeId, nodeContent as unknown as TPredicateTypes);

    tree._nodeDictionary = {
      [`${rootSeedNodeId}`]: { nodeContent: null },
      [`${rootSeedNodeId}:address1`]: { nodeContent: null },
      [`${rootSeedNodeId}:address2`]: { nodeContent: null },
      [`${rootSeedNodeId}:address3`]: { nodeContent: null },
      [`${rootSeedNodeId}:city`]: { nodeContent: null },
      [`${rootSeedNodeId}:stateOrProvince`]: { nodeContent: null },

      [`${rootSeedNodeId}:postalCode`]: { nodeContent: null },
      [`${rootSeedNodeId}:country`]: { nodeContent: null },
      [`${rootSeedNodeId}:specialInstructions`]: {
        nodeContent: null,
      },
    };
    Object.keys(tree._nodeDictionary).forEach(() => {
      tree._incrementor.next; // need to keep this updated
    });
    tree._incrementor.next; // once for root

    return tree as unknown as IExpressionTree<P>;
  }

  protected fromPojoAppendChildNodeWithContent(
    parentNodeId: string,
    nodeContent: TGenericNodeContent<TPredicateTypes>
  ): string {
    /* istanbul ignore next - if this fails the larger fromPojo operation fails and that is thoroughly tested */
    return this.appendChildNodeWithContent(parentNodeId, nodeContent);
  }

  static subfieldNames() {
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
  static fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (
      nodeContent: TNodePojo<P>
    ) => TGenericNodeContent<P> = defaultFromPojoTransform,
    instanceBuilder: TTreeInitiator = <P, Q>(nodeId?: string, nodeContent?: P) => {
      return new AddressTree(
        nodeId,
        nodeContent as unknown as TPredicateTypes
      ) as unknown as Q;
    }
  ): Q {
    const tree = AddressTree.getNewInstance("subtreeRoot") as AddressTree;
    // should we be cloning the pojo, as to not be destructive
    const pojoRootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(srcPojoTree);
    tree._subjectId = pojoRootNodeId;
    if (!srcPojoTree[pojoRootNodeId] || !srcPojoTree[pojoRootNodeId].nodeContent) {
      throw new Error("No Node Content at root.");
    }
    const { nodeContent } = srcPojoTree[pojoRootNodeId];
    // @ts-ignore - operator not property
    if (!("operator" in nodeContent) || nodeContent!.operator !== "$addressTree") {
      throw new Error(
        "AddressTree requires root node content contain operator=='$addressTree', none found."
      );
    }
    // @ts-ignore
    tree.replaceNodeContent(tree.rootNodeId, nodeContent);

    AddressTree.subfieldNames().forEach((subfieldId) => {
      // consider the key/object structure.  If the key is known, no need to filter for it.
      const regExp = new RegExp("$" + `${pojoRootNodeId}.${subfieldId}^`);
      const pojoNodeIds = Object.keys(srcPojoTree).filter((pojoKey) => {
        return pojoKey === `${pojoRootNodeId}.${subfieldId}`; // regExp.test(pojoKey);
        // return pojoKey.match(regExp);
      });

      // we expect 1 and only 1
      const pojoNodeId = pojoNodeIds.pop();
      if (pojoNodeId) {
        tree.replaceNodeContent(
          `${tree.rootNodeId}:${subfieldId}`,
          // @ts-ignore
          srcPojoTree[pojoNodeId].nodeContent
        );
        delete srcPojoTree[pojoNodeId];
      }
    });
    delete srcPojoTree[pojoRootNodeId];

    return tree as unknown as Q;
  }

  static x2_fromPojo<P, Q>(
    srcPojoTree: TTreePojo<P>,
    transform?: (nodeContent: TNodePojo<P>) => TGenericNodeContent<P>,

    instanceBuilder?: <P, Q>(nodeId?: string, nodeContent?: P) => AbstractExpressionTree<P>
  ): Q {
    const tree = AddressTree.getNewInstance("subtreeRoot");
    // should we be cloning the pojo, as to not be destructive
    const pojoRootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(srcPojoTree);
    if (!srcPojoTree[pojoRootNodeId] || !srcPojoTree[pojoRootNodeId].nodeContent) {
      throw new Error("No Node Content at root.");
    }
    const { nodeContent } = srcPojoTree[pojoRootNodeId];
    // @ts-ignore - operator not property
    if (!("operator" in nodeContent) || nodeContent!.operator !== "$addressTree") {
      throw new Error(
        "AddressTree requires root node content contain operator=='$addressTree', none found."
      );
    }
    //@ts-ignore
    tree.replaceNodeContent(tree.rootNodeId, nodeContent);

    AddressTree.subfieldNames().forEach((subfieldId) => {
      // consider the key/object structure.  If the key is known, no need to filter for it.
      const regExp = new RegExp("$" + `${pojoRootNodeId}.${subfieldId}^`);
      const pojoNodeIds = Object.keys(srcPojoTree).filter((pojoKey) => {
        return pojoKey === `${pojoRootNodeId}.${subfieldId}`; // regExp.test(pojoKey);
        // return pojoKey.match(regExp);
      });

      // we expect 1 and only 1
      const pojoNodeId = pojoNodeIds.pop();
      if (pojoNodeId) {
        tree.replaceNodeContent(
          `${tree.rootNodeId}:${subfieldId}`,
          //@ts-ignore
          srcPojoTree[pojoNodeId].nodeContent
        );
      }
    });

    return tree as unknown as Q;
  }

  static x_buildTree(rootSeedId: string) {
    const pojo = {
      [rootSeedId]: { parentId: `${rootSeedId}`, nodeContent: { operator: "$addressTree" } },
      [`${rootSeedId}:address1`]: {
        parentId: `${rootSeedId}`,
        nodeContent: {
          subjectId: "customer.address1",
          operator: "$eq",
          value: "addr1",
        },
      },
      [`${rootSeedId}:address2`]: {
        parentId: `${rootSeedId}`,
        nodeContent: {
          subjectId: "customer.address2",
          operator: "$eq",
          value: "addr1",
        },
      },
    } as TTreePojo<TJsPredicate>;
    return AddressTree.fromPojo(pojo);
  }

  static defaultTreePojo(rootSeedNodeId = "address"): TTreePojo<TPredicateTypes> {
    return {
      [`${rootSeedNodeId}`]: {
        parentId: `${rootSeedNodeId}`,
        nodeContent: { operator: "$addressTree" },
      },
      [`${rootSeedNodeId}.address1`]: {
        parentId: `${rootSeedNodeId}`,
        nodeContent: {
          operator: "$eq",
          subjectId: "customer.address.address1",
          value: "addr1",
        },
      },
      [`${rootSeedNodeId}.address2`]: {
        parentId: `${rootSeedNodeId}`,
        nodeContent: {
          operator: "$eq",
          subjectId: "customer.address.address2",
          value: "addr2",
        },
      },
      [`${rootSeedNodeId}.address3`]: {
        parentId: `${rootSeedNodeId}`,
        nodeContent: {
          operator: "$eq",
          subjectId: "customer.address.address3",
          value: "addr3",
        },
      },
      [`${rootSeedNodeId}.city`]: {
        parentId: `${rootSeedNodeId}`,
        nodeContent: { operator: "$eq", subjectId: "customer.address.city", value: "city" },
      },
      [`${rootSeedNodeId}.stateOrProvince`]: {
        parentId: `${rootSeedNodeId}`,
        nodeContent: {
          operator: "$eq",
          subjectId: "customer.address.stateOrProvince",
          value: "stateOrProvince",
        },
      },
      [`${rootSeedNodeId}.postalCode`]: {
        parentId: `${rootSeedNodeId}`,
        nodeContent: {
          operator: "$eq",
          subjectId: "customer.address.postalCode",
          value: "postalCode",
        },
      },
      [`${rootSeedNodeId}.country`]: {
        parentId: `${rootSeedNodeId}`,
        nodeContent: {
          operator: "$eq",
          subjectId: "customer.address.postalCode",
          value: "postalCode",
        },
      },
      [`${rootSeedNodeId}.specialInstructions`]: {
        parentId: `${rootSeedNodeId}`,
        nodeContent: {
          operator: "$eq",
          subjectId: "customer.address.specialInstructions",
          value: "specialInstructions",
        },
      },
    };
  }
}

export { AddressTree };

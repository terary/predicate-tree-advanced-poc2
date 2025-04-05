import {
  TGenericNodeContent,
  TNodePojo,
  TTreePojo,
  IExpressionTree,
} from "../../../../src";
import { TOperand, TPredicateNodeTypesOrNull, TPredicateTypes } from "../types";
import { JsPredicateTree } from "./JsPredicateTree";
import { TSubjectDictionary } from "../types";

import treeUtils from "../treeUtilities";
import { quoteValue, predicateOperatorToJsOperator } from "./helperFunctions";

type TTreeInitiator = <P, Q>(rootSeedNodeId: string, nodeContent: P) => Q;

const defaultFromPojoTransform = <P extends object>(
  nodeContent: TNodePojo<P>
): TGenericNodeContent<P> => {
  return nodeContent.nodeContent;
};

class AddressTree extends JsPredicateTree {
  private _subjectId!: string;

  toFunctionBody(
    rootNodeId: string = this.rootNodeId,
    subjects: TSubjectDictionary
  ): string {
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
      const term = ` record['${
        nodeContent.subjectId
      }'] ${predicateOperatorToJsOperator(nodeContent.operator)} ${quoteValue(
        // @ts-ignore - .datatype not member of subject
        subject.datatype,
        nodeContent.value
      )}`;
      logicTerms.push(term);
    });
    return `(${logicTerms.join(" && ")})`;
  }

  commentedRecord(subjects: TSubjectDictionary): string {
    return "";
  }

  getNewInstance(
    rootSeed?: string,
    nodeContent?: TPredicateNodeTypesOrNull
  ): IExpressionTree<TPredicateTypes> {
    return new AddressTree(rootSeed, nodeContent);
  }

  // static x_getNewInstance_typed(
  //   rootSeedNodeId?: string,
  //   nodeContent?: TPredicateTypes
  // ): IExpressionTree<TPredicateTypes> {
  //   return new AddressTree(rootSeedNodeId, nodeContent) as unknown as AddressTree;
  // }

  createSubtreeAt(nodeId: string): IExpressionTree<TPredicateTypes> {
    // *tmc* not a real createSubgraphAt
    return this;
  }

  static getNewInstance<P extends object>(
    rootSeedNodeId = "address",
    nodeContent?: P
  ): IExpressionTree<P> {
    const tree = new AddressTree(
      rootSeedNodeId,
      nodeContent as unknown as TPredicateTypes
    );

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

  static fromPojo<P extends object, Q>(
    srcPojoTree: TTreePojo<P>,
    transform: (
      nodeContent: TNodePojo<P>
    ) => TGenericNodeContent<P> = defaultFromPojoTransform,
    instanceBuilder: TTreeInitiator = <P, Q>(
      nodeId?: string,
      nodeContent?: P
    ) => {
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
    if (
      !srcPojoTree[pojoRootNodeId] ||
      !srcPojoTree[pojoRootNodeId].nodeContent
    ) {
      throw new Error("No Node Content at root.");
    }
    const { nodeContent } = srcPojoTree[pojoRootNodeId];
    if (
      !("operator" in nodeContent) ||
      // @ts-ignore - operator not memember of NonNull<P>
      nodeContent!.operator !== "$addressTree"
    ) {
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

  static defaultTreePojo(
    rootSeedNodeId = "address"
  ): TTreePojo<TPredicateTypes> {
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
        nodeContent: {
          operator: "$eq",
          subjectId: "customer.address.city",
          value: "city",
        },
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

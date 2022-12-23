import { AbstractExpressionTree } from "../../../src";
import { GenericExpressionTree } from "../../../src/DirectedGraph/AbstractExpressionTree/AbstractExpressionTree";
import { TGenericNodeContent, TNodePojo, TTreePojo } from "../../../src/DirectedGraph/types";
import { TPredicateNodeTypes, TPredicateTypes } from "../types";
import { JsPredicateTree } from "./JsPredicateTree";
import { TJsPredicate, TSubjectDictionary } from "./types";
import { dev_only_export } from "./JsPredicateTree";
import { IDirectedGraph, IExpressionTree, ITree } from "../../../src/DirectedGraph/ITree";
import treeUtils from "../../../src/DirectedGraph/AbstractDirectedGraph/treeUtilities";
// class AddressTree extends AbstractExpressionTree<TPredicateTypes> {
type TTreeInitiator = <P, Q>(rootSeedNodeId: string, nodeContent: P) => Q;
const defaultFromPojoTransform = <P>(nodeContent: TNodePojo<P>): TGenericNodeContent<P> => {
  return nodeContent.nodeContent;
};

class AddressTree extends AbstractExpressionTree<TPredicateTypes> {
  private constructor(rootSendNodeId?: string, nodeContent?: TPredicateTypes) {
    super(rootSendNodeId, nodeContent);
  }
  toFunctionBody(rootNodeId: string = this.rootNodeId, subjects: TSubjectDictionary): string {
    return "";
  }
  commentedRecord(subjects: TSubjectDictionary): string {
    return "";
  }

  static x_getNewInstance(
    rootSeedNodeId = "address",
    nodeContent?: TPredicateTypes
  ): AddressTree {
    const tree = new AddressTree(rootSeedNodeId, nodeContent);

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

    return tree;
    // return AddressTree.fromPojo(AddressTree.defaultTreePojo(rootSeedNodeId));
    // return new AddressTree(rootSeedNodeId, nodeContent);
    // return AddressTree.fromPojo<TPredicateTypes, AddressTree>(
    //   AddressTree.treeNodes(),
    //   // undefined,
    //   // @ts-ignore P is not assignable to TPredicateTypes
    //   (subfieldSeedNodeId: string, nodeContent: TPredicateTypes) => {
    //     const seedId = [rootSeedNodeId, subfieldSeedNodeId].join(":");
    //     return new AddressTree(seedId, nodeContent);
    //   }
    // );
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
      }
    });

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

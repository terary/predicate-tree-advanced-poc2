var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AbstractExpressionTree_instances, _a, _AbstractExpressionTree_getChildrenWithNullValues, _AbstractExpressionTree_fromPojo, _AbstractExpressionTree_fromPojoTraverseAndExtractChildren;
import { AbstractTree } from "../AbstractTree/AbstractTree";
import { DirectedGraphError } from "../DirectedGraphError";
import treeUtils from "../AbstractDirectedGraph/treeUtilities";
import { ExpressionTreeError } from "./ExpressionTreeError";
const defaultFromPojoTransform = (nodeContent) => {
    return nodeContent.nodeContent;
};
// type AppendNodeResponseType<T> = {
//   appendedNodes: TAppendedNode<T>[];
//   junctionNode: TAppendedNode<T>;
//   invisibleChild: TAppendedNode<T> | null; // if we move convert leaf to branch, this child becomes leaf
// };
class AbstractExpressionTree extends AbstractTree {
    constructor(rootNodeId = "_root_", nodeContent) {
        super(rootNodeId, nodeContent);
        _AbstractExpressionTree_instances.add(this);
    }
    appendContentWithAnd(parentNodeId, nodeContent) {
        return this.appendContentWithJunction(parentNodeId, { operator: "$and" }, nodeContent);
    }
    defaultJunction(nodeId) {
        // the leaf node at nodeId is being converted to a junction (branch)
        // need to return the best option for junction operator (&&, ||, '$or', ...)
        // This needs to be abstract and defined in subclasses
        // @ts-ignore
        return { operator: "$and" };
    }
    appendTreeAt(targetNodeId, sourceTree, sourceBranchRootNodeId) {
        let effectiveTargetNodeId = targetNodeId;
        // I think setting nodeContent to null is dangerous
        // do we want to is root as junction?
        if (this.isLeaf(targetNodeId)) {
            const originalContent = this.getChildContentAt(targetNodeId);
            this.replaceNodeContent(targetNodeId, this.defaultJunction(targetNodeId));
            effectiveTargetNodeId = this.appendChildNodeWithContent(targetNodeId, originalContent);
        }
        const fromToMap = super.appendTreeAt(effectiveTargetNodeId, sourceTree, sourceBranchRootNodeId);
        if (effectiveTargetNodeId !== targetNodeId) {
            fromToMap.push({ from: targetNodeId, to: effectiveTargetNodeId });
        }
        return fromToMap;
    }
    appendContentWithOr(parentNodeId, nodeContent) {
        return this.appendContentWithJunction(parentNodeId, { operator: "$or" }, nodeContent);
    }
    appendContentWithJunction(parentNodeId, junctionContent, nodeContent) {
        //
        if (this.isBranch(parentNodeId)) {
            super.replaceNodeContent(parentNodeId, junctionContent);
            const nullValueChildren = __classPrivateFieldGet(this, _AbstractExpressionTree_instances, "m", _AbstractExpressionTree_getChildrenWithNullValues).call(this, parentNodeId);
            let newNodeId;
            if (nullValueChildren.length > 0) {
                newNodeId = nullValueChildren[0];
                super.replaceNodeContent(newNodeId, nodeContent);
            }
            else {
                newNodeId = super.appendChildNodeWithContent(parentNodeId, nodeContent);
            }
            return {
                newNodeId,
                originalContentNodeId: undefined,
                junctionNodeId: parentNodeId,
                isNewBranch: false,
            };
        }
        const originalContent = this.getChildContentAt(parentNodeId);
        const originalContentId = super.appendChildNodeWithContent(parentNodeId, originalContent);
        this.replaceNodeContent(parentNodeId, junctionContent);
        return {
            newNodeId: super.appendChildNodeWithContent(parentNodeId, nodeContent),
            originalContentNodeId: originalContentId,
            junctionNodeId: parentNodeId,
            isNewBranch: true,
        };
    }
    // wanted to make the protected as it shouldn't be used from outside of subclasses
    appendChildNodeWithContent(parentNodeId, 
    // nodeContent: IExpressionTree<P>
    nodeContent) {
        const nullValueSiblings = __classPrivateFieldGet(this, _AbstractExpressionTree_instances, "m", _AbstractExpressionTree_getChildrenWithNullValues).call(this, parentNodeId);
        if (nullValueSiblings.length > 0) {
            super.replaceNodeContent(nullValueSiblings[0], nodeContent);
            return nullValueSiblings[0];
        }
        return super.appendChildNodeWithContent(parentNodeId, nodeContent);
    }
    cloneAt(nodeId = this.rootNodeId) {
        const pojo = this.toPojoAt(nodeId);
        return AbstractExpressionTree.fromPojo(pojo, defaultFromPojoTransform);
    }
    getNewInstance(rootSeedNodeId, nodeContent) {
        return super._getNewInstance(rootSeedNodeId, nodeContent);
    }
    // this should not be public
    static reRootTreeAt(tree, from, to) {
        const treeIds = tree.getTreeNodeIdsAt(from);
        const fromToMap = [];
        treeIds.forEach((nodeId) => {
            const newNodeId = nodeId.replace(from, to);
            tree._nodeDictionary[newNodeId] = tree._nodeDictionary[nodeId];
            delete tree._nodeDictionary[nodeId];
            fromToMap.push({ from: nodeId, to: newNodeId });
        });
        return fromToMap;
    }
    //  static getNewInstance(rootSeedNodeId?: string, nodeContent?: P): IExpressionTree<P>;
    static getNewInstance(rootSeedNodeId, nodeContent) {
        return new GenericExpressionTree(rootSeedNodeId, nodeContent);
    }
    static fromPojo(srcPojoTree, transform = defaultFromPojoTransform) {
        const tree = __classPrivateFieldGet(AbstractExpressionTree, _a, "m", _AbstractExpressionTree_fromPojo).call(AbstractExpressionTree, srcPojoTree, transform);
        AbstractExpressionTree.validateTree(tree);
        return tree;
    }
    fromPojoAppendChildNodeWithContent(parentNodeId, nodeContent) {
        /* istanbul ignore next - if this fails the larger fromPojo operation fails and that is thoroughly tested */
        return this.appendChildNodeWithContent(parentNodeId, nodeContent);
    }
    _getSiblingIds(nodeId) {
        return super.getSiblingIds(nodeId);
    }
    removeNodeAt(nodeId) {
        const siblingIds = this._getSiblingIds(nodeId);
        if (siblingIds.length > 1) {
            return super.removeNodeAt(nodeId);
        }
        const parentId = this.getParentNodeId(nodeId);
        const siblingContent = this.getChildContentAt(siblingIds[0]);
        this.replaceNodeContent(parentId, siblingContent);
        super.removeNodeAt(siblingIds[0]);
        super.removeNodeAt(nodeId);
    }
    // *tmc* I don't think generics are necessary or even useful?
    static validateTree(tree) {
        const allNodeIds = tree.getTreeNodeIdsAt(tree.rootNodeId);
        allNodeIds.forEach((nodeId) => {
            if (tree.isBranch(nodeId)) {
                const childrenIds = tree.getChildrenNodeIdsOf(nodeId);
                if (childrenIds.length < 2) {
                    throw new ExpressionTreeError(`Tree fails no-single-child rule. childIds: '${childrenIds.join("', '")}'.`);
                }
            }
        });
    }
}
_a = AbstractExpressionTree, _AbstractExpressionTree_instances = new WeakSet(), _AbstractExpressionTree_getChildrenWithNullValues = function _AbstractExpressionTree_getChildrenWithNullValues(parentNodeId) {
    const childrenIds = this.getChildrenNodeIdsOf(parentNodeId);
    return childrenIds.filter((childId) => {
        return this.getChildContentAt(childId) === null;
    });
}, _AbstractExpressionTree_fromPojo = function _AbstractExpressionTree_fromPojo(srcPojoTree, transform = defaultFromPojoTransform // branch coverage complains
) {
    const pojoObject = Object.assign({}, srcPojoTree);
    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(pojoObject);
    const rootNodePojo = pojoObject[rootNodeId];
    const dTree = AbstractExpressionTree.getNewInstance("root");
    dTree.replaceNodeContent(dTree.rootNodeId, transform(rootNodePojo));
    delete pojoObject[rootNodeId];
    __classPrivateFieldGet(AbstractExpressionTree, _a, "f", _AbstractExpressionTree_fromPojoTraverseAndExtractChildren).call(AbstractExpressionTree, dTree._rootNodeId, rootNodeId, dTree, pojoObject, transform);
    if (Object.keys(pojoObject).length > 0) {
        throw new DirectedGraphError("Orphan nodes detected while parsing pojo object.");
    }
    return dTree;
};
_AbstractExpressionTree_fromPojoTraverseAndExtractChildren = { value: (treeParentId, jsonParentId, dTree, treeObject, transformer, fromToMap = []) => {
        const childrenNodes = treeUtils.extractChildrenNodes(jsonParentId, treeObject);
        Object.entries(childrenNodes).forEach(([nodeId, nodePojo]) => {
            if (nodePojo.nodeType === AbstractTree.SubtreeNodeTypeName) {
                const subtree = dTree.createSubtreeAt(treeParentId);
                subtree.replaceNodeContent(subtree.rootNodeId, transformer(nodePojo));
                __classPrivateFieldGet(AbstractExpressionTree, _a, "f", _AbstractExpressionTree_fromPojoTraverseAndExtractChildren).call(AbstractExpressionTree, 
                // (dTree as AbstractExpressionTree<T>)._rootNodeId,
                subtree.rootNodeId, 
                // subtree.AbstractExpressionTree,
                nodeId, subtree, treeObject, transformer, fromToMap);
            }
            else {
                const childId = dTree.fromPojoAppendChildNodeWithContent(treeParentId, transformer(nodePojo));
                fromToMap.push({ from: nodeId, to: childId });
                __classPrivateFieldGet(AbstractExpressionTree, _a, "f", _AbstractExpressionTree_fromPojoTraverseAndExtractChildren).call(AbstractExpressionTree, childId, nodeId, dTree, treeObject, transformer, fromToMap);
            }
        });
        return fromToMap;
    } };
class GenericExpressionTree extends AbstractExpressionTree {
    getNewInstance(rootSeed, nodeContent) {
        return new GenericExpressionTree(rootSeed, nodeContent);
    }
    createSubtreeAt(targetNodeId) {
        const subtree = new GenericExpressionTree("_subtree_");
        const subtreeParentNodeId = this.appendChildNodeWithContent(targetNodeId, subtree);
        AbstractExpressionTree.reRootTreeAt(subtree, subtree.rootNodeId, subtreeParentNodeId);
        subtree._rootNodeId = subtreeParentNodeId;
        subtree._incrementor = this._incrementor;
        return subtree;
    }
}
export { AbstractExpressionTree, GenericExpressionTree };
//# sourceMappingURL=AbstractExpressionTree.js.map
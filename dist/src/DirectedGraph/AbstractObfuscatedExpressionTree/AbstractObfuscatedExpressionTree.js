import { AbstractExpressionTree, GenericExpressionTree, } from "../AbstractExpressionTree/AbstractExpressionTree";
import { KeyStore } from "../keystore/KeyStore";
import { ObfuscatedError } from "./ObfuscatedError";
import { AbstractTree } from "../AbstractTree/AbstractTree";
class AbstractObfuscatedExpressionTree extends AbstractExpressionTree {
    constructor(tree, rootNodeId, nodeContent) {
        super(rootNodeId, nodeContent);
        // this._internalTree = tree ||  this.getNewInstance<IExpressionTree<P>>();
        this._internalTree =
            tree ||
                AbstractExpressionTree.fromPojo({
                    // @ts-ignore -null not assignable to object (nodeContent)
                    root: { parentId: "root", nodeContent: AbstractTree.EmptyNode },
                }); // I think this is because it's not using GenericNode (null, tree, content)
        this._keyStore = new KeyStore();
        this._internalTree
            .getTreeNodeIdsAt(this._internalTree.rootNodeId)
            .forEach((nodeId) => {
            this._keyStore.putValue(nodeId);
        });
        this._rootKey = this._keyStore.reverseLookUpExactlyOneOrThrow(this._internalTree.rootNodeId);
        this._internalTree
            .getSubtreeIdsAt(this._internalTree.rootNodeId)
            .forEach((subtreeId) => {
            const subtree = this._internalTree.getChildContentAt(subtreeId);
            this._keyStore.putValue(subtreeId);
            this._internalTree.replaceNodeContent(subtreeId, new GenericObfuscatedSubtree(subtree));
        });
    }
    get rootNodeId() {
        return this._rootKey;
    }
    appendChildNodeWithContent(parentNodeKey, nodeContent) {
        const parentNodeId = this._getNodeIdOrThrow(parentNodeKey);
        const newNodeId = this._internalTree["appendChildNodeWithContent"](parentNodeId, nodeContent);
        return this._keyStore.putValue(newNodeId);
    }
    static appendTreeAt(targetTree, targetNodeKey, sourceTree, //IExpressionTree<T>,
    sourceBranchRootNodeId) {
        const targetNodeId = targetTree._getNodeIdOrThrow(targetNodeKey);
        const fromToMapping = targetTree._internalTree.appendTreeAt(targetNodeId, sourceTree instanceof AbstractObfuscatedExpressionTree
            ? sourceTree._internalTree
            : sourceTree, 
        // sourceTree,
        sourceBranchRootNodeId);
        // consider doing this for source tree if instanceOf Obfuscate
        return fromToMapping.map(({ from, to }) => {
            return {
                from,
                to: targetTree._keyStore.putValue(to),
            };
        });
    }
    appendTreeAt(targetNodeKey, sourceTree, sourceBranchRootNodeId) {
        return AbstractObfuscatedExpressionTree.appendTreeAt(this, targetNodeKey, sourceTree, sourceBranchRootNodeId);
    }
    appendContentWithJunction(parentNodeKey, junctionContent, nodeContent) {
        const parentNodeId = this._getNodeIdOrThrow(parentNodeKey);
        if (this.isBranch(parentNodeKey)) {
            const affectedNodeIds = this._internalTree.appendContentWithJunction(parentNodeId, junctionContent, nodeContent);
            return {
                isNewBranch: false,
                newNodeId: this._keyStore.putValue(affectedNodeIds.newNodeId),
                junctionNodeId: parentNodeKey,
            };
        }
        const junctionNodeIds = this._internalTree.appendContentWithJunction(parentNodeId, junctionContent, nodeContent);
        junctionNodeIds.junctionNodeId =
            this._keyStore.reverseLookUpExactlyOneOrThrow(junctionNodeIds.junctionNodeId);
        junctionNodeIds.originalContentNodeId = this._keyStore.putValue(junctionNodeIds.originalContentNodeId);
        junctionNodeIds.newNodeId = this._keyStore.putValue(junctionNodeIds.newNodeId);
        return junctionNodeIds;
    }
    cloneAt(nodeKey) {
        // probably don't want class definition
        // class GenericObfuscatedExpressionTree extends AbstractObfuscatedExpressionTree<P> {}
        const nodeId = this._getNodeIdOrThrow(nodeKey);
        const cloneInternalTree = this._internalTree.cloneAt(nodeId);
        // @ts-ignore - P is not assignable to P | null
        return new GenericObfuscatedExpressionTree(cloneInternalTree);
    }
    // for testing purpose only.
    // wonder if there isn't a better way
    buildReverseMap(reverseMap = {}) {
        this._keyStore.allKeys().forEach((nodeKey) => {
            const nodeId = this._keyStore.getValue(nodeKey);
            reverseMap[nodeId] = nodeKey;
        });
        const subtreeIds = this._internalTree.getSubtreeIdsAt(this._internalTree.rootNodeId);
        subtreeIds.forEach((subtreeId) => {
            const subtree = this._internalTree.getChildContentAt(subtreeId);
            subtree.buildReverseMap(reverseMap);
        });
        return reverseMap;
    }
    countTotalNodes(nodeKey = this.rootNodeId, shouldIncludeSubtrees) {
        const nodeId = this._getNodeIdOrThrow(nodeKey);
        return this._internalTree.countTotalNodes(nodeId, shouldIncludeSubtrees);
    }
    getChildContentAt(nodeKey) {
        const nodeId = this._getNodeIdOrThrow(nodeKey);
        return this._internalTree.getChildContentAt(nodeId);
    }
    getChildrenNodeIdsOf(parentNodeKey, shouldIncludeSubtrees) {
        const parentNodeId = this._getNodeIdOrThrow(parentNodeKey);
        return this.reverseMapKeys(this._internalTree.getChildrenNodeIdsOf(parentNodeId, shouldIncludeSubtrees));
    }
    getChildrenContentOf(parentNodeKey, shouldIncludeSubtrees) {
        const parentNodeId = this._getNodeIdOrThrow(parentNodeKey);
        return this._internalTree.getChildrenContentOf(parentNodeId, shouldIncludeSubtrees);
    }
    getDescendantContentOf(parentNodeKey, shouldIncludeSubtrees) {
        const parentNodeId = this._getNodeIdOrThrow(parentNodeKey);
        return this._internalTree.getDescendantContentOf(parentNodeId, shouldIncludeSubtrees);
    }
    getDescendantNodeIds(parentNodeKey, shouldIncludeSubtrees) {
        const parentNodeId = this._getNodeIdOrThrow(parentNodeKey);
        return this.reverseMapKeys(this._internalTree.getDescendantNodeIds(parentNodeId, shouldIncludeSubtrees));
    }
    /**
     * The tricky bit here is that the subtree._rootNodeKey and subtree._rootNodeId
     * must be the same as parent's node.nodeKey and node.nodeId
     * @param targetParentNodeId
     * @returns
     */
    createSubtreeAt(targetParentNodeId) {
        // used by createSubTree to be flexible with actual constructor type
        // can we rethink this.  Is there a better way?
        const subtreeParentNodeId = this._internalTree["appendChildNodeWithContent"](targetParentNodeId, null);
        const internalTree = this._internalTree.getNewInstance(subtreeParentNodeId); // (subtreeParentNodeId); // as typeof this._internalTree;
        const subtree = this.getNewInstance(subtreeParentNodeId); // as typeof this;
        this._internalTree.replaceNodeContent(subtreeParentNodeId, subtree);
        const subtreeParentNodeKey = this._keyStore.putValue(subtreeParentNodeId);
        subtree._keyStore = new KeyStore(); // this is bad idea if we want to initialize with nodeContent
        subtree._keyStore.putValue(subtreeParentNodeId, subtreeParentNodeKey);
        subtree._rootNodeId = subtreeParentNodeId;
        subtree._nodeDictionary = {
            [subtreeParentNodeId]: { nodeContent: null },
        };
        subtree._rootKey = subtreeParentNodeKey;
        // @ts-ignore - private property doesn't exist on interface
        subtree._internalTree["_incrementor"] = this._internalTree["_incrementor"];
        // @ts-ignore - type P not assignable to P | null | undefined
        return subtree;
    }
    getNewInstance(// the type variable seems misplaced?
    rootNodeId, nodeContent) {
        // class GenericExpressionTree extends AbstractExpressionTree<P> {}
        class GenericObfuscatedExpressionTree extends AbstractObfuscatedExpressionTree {
        }
        const internalTree = new GenericExpressionTree(rootNodeId, nodeContent);
        return new GenericObfuscatedExpressionTree(internalTree);
    }
    getParentNodeId(nodeKey) {
        const nodeId = this._getNodeIdOrThrow(nodeKey);
        const parentNodeId = this._internalTree.getParentNodeId(nodeId);
        return this._keyStore.reverseLookUpExactlyOneOrThrow(parentNodeId);
    }
    getSiblingIds(nodeKey) {
        const nodeId = this._getNodeIdOrThrow(nodeKey);
        return this.reverseMapKeys(this._internalTree.getSiblingIds(nodeId));
    }
    getTreeContentAt(nodeKey = this.rootNodeId, shouldIncludeSubtrees) {
        const nodeId = this._getNodeIdOrThrow(nodeKey);
        const mainTreeContent = this._internalTree.getTreeContentAt(nodeId);
        if (!shouldIncludeSubtrees) {
            return mainTreeContent;
        }
        const subtreeIds = this._internalTree.getSubtreeIdsAt();
        subtreeIds.forEach((subtreeId) => {
            const subtree = this._internalTree.getChildContentAt(subtreeId);
            /* istanbul ignore next - this should be a non-issue */
            if (subtree !== null) {
                mainTreeContent.push(...subtree.getTreeContentAt());
            }
        });
        return mainTreeContent;
    }
    getTreeNodeIdsAt(nodeKey) {
        const nodeId = this._getNodeIdOrThrow(nodeKey);
        return this.reverseMapKeys(this._internalTree.getTreeNodeIdsAt(nodeId));
    }
    _getNodeId(nodeId) {
        return this._keyStore.getValue(nodeId);
    }
    // protected - for testing only
    _getNodeIdOrThrow(nodeKey) {
        const nodeId = this._getNodeId(nodeKey);
        if (nodeId === undefined) {
            throw new ObfuscatedError(`Failed to find nodeId with key: '${nodeKey}'.`);
        }
        return nodeId;
    }
    isLeaf(nodeKey) {
        const nodeId = this._getNodeIdOrThrow(nodeKey);
        return this._internalTree.isLeaf(nodeId);
    }
    removeNodeAt(nodeKey) {
        const nodeId = this._getNodeIdOrThrow(nodeKey);
        super.removeNodeAt.call(this._internalTree, nodeId);
    }
    replaceNodeContent(nodeKey, nodeContent) {
        const nodeId = this._getNodeIdOrThrow(nodeKey);
        this._internalTree.replaceNodeContent(nodeId, nodeContent);
    }
    reverseMapKeys(keys) {
        return keys.map((nodeId) => {
            return this._keyStore.reverseLookUpExactlyOneOrThrow(nodeId);
        });
    }
    wrapVisitor(visitor) {
        return {
            includeSubtrees: visitor.includeSubtrees,
            visit: (nodeKey, nodeContent, parentKey) => {
                visitor.visit(nodeKey, nodeContent, parentKey);
            },
        };
    }
    toPojoAt(nodeKey = this.rootNodeId
    //    transformer?: transformToPojoType
    ) {
        const nodeId = this._getNodeIdOrThrow(nodeKey);
        // this calls directedGraph ? should call AbstractTree?
        // probably need to override the whole toPojo
        const pojo = this._internalTree.toPojoAt(nodeId);
        return AbstractObfuscatedExpressionTree.obfuscatePojo(pojo);
    }
    static obfuscatePojo(pojo) {
        // I *think* because toPojo also calls toPojo of subtree
        // the result is the subtree gets pojo'd independently
        // which goofs everything.
        // this hack takes a pojo and obfuscate.
        // ideally toPojo would obfuscate
        const obfusPojo = Object.assign({}, pojo);
        const keyStore = new KeyStore();
        // first pass - keys
        Object.keys(obfusPojo).forEach((nodeId) => {
            const nodeKey = keyStore.putValue(nodeId);
            obfusPojo[nodeKey] = Object.assign({}, obfusPojo[nodeId]);
            delete obfusPojo[nodeId];
        });
        // second pass - update parentNodeId
        Object.entries(obfusPojo).forEach(([nodeKey, node]) => {
            obfusPojo[nodeKey].parentId = keyStore.reverseLookUpExactlyOneOrThrow(obfusPojo[nodeKey].parentId);
        });
        return obfusPojo;
    }
    visitAllAt(visitor, nodeId = this.rootNodeId, parentNodeId = this.rootNodeId) {
        const childrenIds = this.getChildrenNodeIdsOf(nodeId, visitor.includeSubtrees);
        const content = this.getChildContentAt(nodeId);
        const wrappedVisitor = this.wrapVisitor(visitor);
        if (visitor.includeSubtrees &&
            content instanceof AbstractObfuscatedExpressionTree) {
            content._internalTree.visitAllAt(wrappedVisitor);
        }
        else {
            visitor.visit(nodeId, content, parentNodeId);
        }
        childrenIds.forEach((childId) => {
            this.visitAllAt(wrappedVisitor, childId, nodeId);
        });
    }
    visitLeavesOf(visitor, nodeKey = this.rootNodeId) {
        const wrappedVisitor = this.wrapVisitor(visitor);
        const nodeId = this._getNodeIdOrThrow(nodeKey);
        // this._internalTree.visitLeavesOf(wrappedVisitor, nodeId);
        const childrenIds = this.getDescendantNodeIds(nodeKey, visitor.includeSubtrees);
        const leavesOf = childrenIds.filter((childId) => {
            return this.isLeaf(childId) && !this.isSubtree(childId);
        });
        if (visitor.includeSubtrees) {
            leavesOf.push(...this.getSubtreeIdsAt(nodeKey));
        }
        leavesOf.forEach((leafNodeKey) => {
            const parentKey = this.getParentNodeId(leafNodeKey);
            const content = this.getChildContentAt(leafNodeKey);
            if (content instanceof AbstractObfuscatedExpressionTree) {
                content._internalTree.visitLeavesOf(visitor);
            }
            else {
                visitor.visit(leafNodeKey, content, parentKey);
            }
        });
    }
    static fromPojo(srcPojoTree) {
        // probably don't want class definition
        class GenericObfuscatedExpressionTree extends AbstractObfuscatedExpressionTree {
        }
        const tree = AbstractExpressionTree.fromPojo(srcPojoTree);
        // @ts-ignore - typing
        AbstractExpressionTree.validateTree(tree);
        //@ts-ignore - typing
        const newObfuscatedTree = new GenericObfuscatedExpressionTree(tree);
        return newObfuscatedTree;
    }
    fromPojoAppendChildNodeWithContent(parentNodeId, nodeContent) {
        const parentNodeKey = this._keyStore.reverseLookUpExactlyOneOrThrow(parentNodeId);
        const newNodeKey = this.appendChildNodeWithContent(parentNodeKey, nodeContent);
        return this._keyStore.getValue(newNodeKey);
    }
}
export { AbstractObfuscatedExpressionTree };
class GenericObfuscatedSubtree extends AbstractObfuscatedExpressionTree {
}
class GenericObfuscatedExpressionTree extends AbstractObfuscatedExpressionTree {
}
//# sourceMappingURL=AbstractObfuscatedExpressionTree.js.map
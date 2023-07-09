var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AbstractTree_instances, _AbstractTree_appendChildNodeWithContent, _AbstractTree_nodeIdExistsOrThrow, _AbstractTree_getChildContentOrThrow, _AbstractTree_getChildContent, _AbstractTree_getChildrenNodeIds, _AbstractTree_getContentItems, _AbstractTree_getNextChildNodeId, _AbstractTree_getParentNodeId, _AbstractTree_getTreeNodeIdsAt, _AbstractTree_isLeaf, _AbstractTree_moveNode, _AbstractTree_replaceNodeContent, _AbstractTree_setNodeContentByNodeId, _AbstractTree_visitAllAt, _AbstractTree_visitLeavesOf, _AbstractTree_toPojo;
import { DirectedGraphError } from "../DirectedGraphError";
import { Incrementor } from "../Incrementor";
import { KeyStore } from "../keystore/KeyStore";
const defaultToPojoTransformer = (nodeContent) => {
    return nodeContent;
};
const makeChildrenRegExp = (nodeId, delim) => {
    return new RegExp("^" + nodeId + delim + "[\\d]+$");
};
const makeDescendantRegExp = (nodeId, delim, options = "") => {
    return new RegExp("^" + nodeId + delim, options);
};
class AbstractTree {
    constructor(rootNodeId = "_root_", nodeContent) {
        _AbstractTree_instances.add(this);
        this._nodeDictionary = {};
        this._nodeKeyDelimiter = ":";
        this._incrementor = new Incrementor();
        this._rootNodeId = rootNodeId;
        if (nodeContent === undefined) {
            __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_setNodeContentByNodeId).call(this, this._rootNodeId, AbstractTree.EmptyNode);
        }
        else {
            this._nodeDictionary[this._rootNodeId] = { nodeContent };
        }
    }
    appendChildNodeWithContent(parentNodeId, nodeContent) {
        return __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_appendChildNodeWithContent).call(this, parentNodeId, nodeContent);
    }
    appendTreeAt(targetNodeId = this.rootNodeId, sourceTree, sourceBranchRootNodeId) {
        return AbstractTree.appendTree(this, sourceTree, targetNodeId, sourceBranchRootNodeId);
    }
    static appendTree(targetTree, sourceTree, targetNodeId, sourceBranchRootNodeId) {
        const sourceRoot = sourceBranchRootNodeId || sourceTree.rootNodeId;
        const sourceNodeIds = __classPrivateFieldGet(sourceTree, _AbstractTree_instances, "m", _AbstractTree_getTreeNodeIdsAt).call(sourceTree, sourceRoot);
        const replaceRegExp = new RegExp(sourceRoot, "g");
        const uniqueToken = sourceTree._rootNodeId == sourceTree._rootNodeId;
        const fromToMap = sourceNodeIds.map((sourceNodeId) => {
            const to = sourceNodeId.replace(replaceRegExp, targetNodeId + ":treeAppend");
            return {
                from: sourceNodeId,
                to,
            };
        });
        fromToMap.forEach(({ from, to }) => {
            if (to in targetTree._nodeDictionary) {
                // this error has to be changed
                throw new Error(`ID COLLISION offending node: "${to}".`);
            }
            targetTree._nodeDictionary[to] = sourceTree._nodeDictionary[from]; //sourceTree.getChildContentAt(from);
            __classPrivateFieldGet(targetTree, _AbstractTree_instances, "m", _AbstractTree_getNextChildNodeId).call(targetTree, "ANY"); // need to keep this counting
        });
        return fromToMap;
    }
    countDescendantsOf(parentNodeId = this.rootNodeId) {
        __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_nodeIdExistsOrThrow).call(this, parentNodeId);
        return this.getDescendantNodeIds(parentNodeId).length;
    }
    /**
     * Returns greatest distance between nodeId and furthest leaf.
     * If node is leaf returns 1.
     * Hence depth:
     *  sub-root | child | grandchild
     *       1      2          3
     *  * same philosophy as length
     * @param nodeKey
     * @returns {number} greatest depth of given node and its furthest leaf.
     */
    countGreatestDepthOf(subTreeRootNodeId = this.rootNodeId) {
        __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getChildContentOrThrow).call(this, subTreeRootNodeId);
        let greatestDepth = 1;
        const descendantKeys = this.getDescendantNodeIds(subTreeRootNodeId);
        if (descendantKeys.length === 0) {
            return greatestDepth;
        }
        const subTreeDepthOffset = this.getBranchDepth(subTreeRootNodeId);
        for (let nodeKey of descendantKeys) {
            const depth = this.getBranchDepth(nodeKey) - subTreeDepthOffset + 1;
            if (depth > greatestDepth) {
                greatestDepth = depth;
            }
        }
        return greatestDepth;
    }
    countLeavesOf(nodeId = this.rootNodeId) {
        const descendantKeys = this.getDescendantNodeIds(nodeId);
        return descendantKeys.filter((descendKey) => {
            return this.getDescendantNodeIds(descendKey).length === 0;
        }).length;
    }
    countTotalNodes(nodeId = this.rootNodeId, shouldIncludeSubtrees = true) {
        let totalNodes = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getTreeNodeIdsAt).call(this, nodeId).length;
        if (!shouldIncludeSubtrees) {
            return totalNodes;
        }
        this.getSubtreeIdsAt(nodeId).forEach((subtreeId) => {
            const subtree = this.getChildContentAt(subtreeId);
            totalNodes += subtree.countTotalNodes();
        });
        return totalNodes;
    }
    filterIds(filterFn) {
        return Object.keys(this._nodeDictionary).filter(filterFn);
    }
    /**
     * Returns distance between nodeKey and root + 1
     * Hence depth:
     *  root | child | grandchild
     *   1      2          3
     *  * same philosophy as length
     * @param nodeId
     * @returns {number} depth of branch (distance between nodeId and root)
     */
    getBranchDepth(nodeId) {
        const regExp = new RegExp(this._nodeKeyDelimiter, "g");
        return (nodeId.match(regExp) || []).length + 1; // this is safe because no tree can be rootless
    }
    nodeIdExists(nodeId) {
        return this._nodeDictionary[nodeId] !== undefined;
    }
    getChildContentAt(nodeId) {
        return __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getChildContent).call(this, nodeId);
    }
    getChildrenNodeIdsOf(parentNodeId, shouldIncludeSubtrees = false) {
        return __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getChildrenNodeIds).call(this, parentNodeId, shouldIncludeSubtrees);
    }
    getCountTotalNodes() {
        return Object.keys(this._nodeDictionary).length;
    }
    getChildrenContentOf(parentNodeId, shouldIncludeSubtrees = false) {
        const childrenNodeIds = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getChildrenNodeIds).call(this, parentNodeId, shouldIncludeSubtrees);
        return __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getContentItems).call(this, childrenNodeIds);
    }
    getDescendantContentOf(parentNodeId, shouldIncludeSubtrees = false) {
        __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_nodeIdExistsOrThrow).call(this, parentNodeId);
        const descendantIds = this.getDescendantNodeIds(parentNodeId, shouldIncludeSubtrees);
        const descendantContent = [];
        descendantIds.forEach((key) => {
            const nodeContent = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getChildContent).call(this, key);
            if (nodeContent instanceof AbstractTree) {
                const nodeContentAsAbstract = nodeContent;
                const content = nodeContentAsAbstract.getTreeContentAt(nodeContentAsAbstract.rootNodeId, shouldIncludeSubtrees);
                descendantContent.push(...content
                //...nodeContentAsAbstract.getTreeContentAt(nodeContentAsAbstract.rootNodeId, true)
                );
            }
            else {
                descendantContent.push(nodeContent);
            }
        });
        return descendantContent;
    }
    getDescendantNodeIds(parentNodeId, shouldIncludeSubtrees = false) {
        const descendantsRegExp = makeDescendantRegExp(parentNodeId, this._nodeKeyDelimiter);
        if (shouldIncludeSubtrees) {
            return this.filterIds((nodeId) => descendantsRegExp.test(nodeId));
        }
        else {
            return this.filterIds((nodeId) => descendantsRegExp.test(nodeId) && !this.isSubtree(nodeId));
        }
    }
    _getNewInstance(rootSeedNodeId, nodeContent) {
        // return new this.constructor();
        return Reflect.construct(this.constructor, [
            rootSeedNodeId,
            nodeContent,
        ]);
    }
    getParentNodeId(nodeId) {
        return __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getParentNodeId).call(this, nodeId);
    }
    getSiblingIds(nodeId) {
        if (this.isRoot(nodeId)) {
            // parent of root is root, which causes this method to act oddly
            return [];
        }
        const parentNodeId = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getParentNodeId).call(this, nodeId);
        const childrenIds = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getChildrenNodeIds).call(this, parentNodeId);
        const index = childrenIds.indexOf(nodeId);
        /* istanbul ignore next - likely unnecessary check */
        if (index > -1) {
            // only splice array when item is found, and it should always be found.
            childrenIds.splice(index, 1);
        }
        return childrenIds;
    }
    getSubtreeIdsAt(nodeId = this.rootNodeId) {
        const allNodeIds = this.getDescendantNodeIds(nodeId, true);
        const self = this;
        return allNodeIds.filter((nodeId) => {
            return self.isSubtree(nodeId);
        });
    }
    getTreeContentAt(nodeId = this.rootNodeId, shouldIncludeSubtrees = false) {
        if (this.nodeIdExists(nodeId)) {
            const descendContent = this.getDescendantContentOf(nodeId, shouldIncludeSubtrees);
            descendContent.push(this.getChildContentAt(nodeId));
            return descendContent;
        }
        return [];
    }
    getTreeNodeIdsAt(nodeId) {
        return __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getTreeNodeIdsAt).call(this, nodeId);
    }
    isBranch(nodeId) {
        return this.getDescendantNodeIds(nodeId).length > 0;
    }
    isLeaf(nodeId) {
        return __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_isLeaf).call(this, nodeId);
    }
    isRoot(nodeId) {
        return nodeId === this._rootNodeId;
    }
    isSubtree(nodeId) {
        return this.getChildContentAt(nodeId) instanceof AbstractTree;
    }
    /**
     * sourceNode becomes child of targetNode
     * children of sourceNode become grandchildren of target
     * @param sourceNodeId
     * @param targetNodeId
     */
    move(sourceNodeId, targetNodeId) {
        const newChildId = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getNextChildNodeId).call(this, targetNodeId);
        const subtreeIds = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getTreeNodeIdsAt).call(this, sourceNodeId);
        const mapFromTo = subtreeIds.map((descKey) => {
            return { from: descKey, to: descKey.replace(sourceNodeId, newChildId) };
        });
        mapFromTo.forEach(({ from, to }) => {
            __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_moveNode).call(this, from, to);
        });
        return mapFromTo;
    }
    /**
     * children of sourceNode become children of targetNode.
     * sourceNode becomes childless
     * @param sourceNodeId
     * @param targetNodeId
     */
    moveChildren(sourceNodeId, targetNodeId) {
        // *tmc* - does this make sense to be public?  I think there is no use case for it
        // also it doesn't seem to be used by this class
        const descendantKeys = this.getDescendantNodeIds(sourceNodeId);
        const mapFromTo = descendantKeys.map((descKey) => {
            return { from: descKey, to: descKey.replace(sourceNodeId, targetNodeId) };
        });
        mapFromTo.forEach(({ from, to }) => {
            __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_moveNode).call(this, from, to);
        });
        return mapFromTo;
    }
    removeNodeAt(nodeId) {
        if (this.isRoot(nodeId)) {
            throw new DirectedGraphError("Can not remove root node.");
        }
        const treeIds = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getTreeNodeIdsAt).call(this, nodeId);
        treeIds.forEach((childId) => {
            this.removeSingleNode(childId); // using this?
        });
    }
    removeSingleNode(nodeId) {
        delete this._nodeDictionary[nodeId];
    }
    replaceNodeContent(nodeId, nodeContent) {
        __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_replaceNodeContent).call(this, nodeId, nodeContent);
    }
    get rootNodeId() {
        return this._rootNodeId;
    }
    visitAllAt(visitor, nodeId = this.rootNodeId) {
        const parentNodeId = nodeId;
        __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_visitAllAt).call(this, visitor, nodeId, parentNodeId);
    }
    visitLeavesOf(visitor, nodeId = this._rootNodeId) {
        __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_visitLeavesOf).call(this, visitor, nodeId);
    }
    static obfuscatePojo(pojo) {
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
    toPojoAt(nodeId = this.rootNodeId, transformer) {
        return __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_toPojo).call(this, nodeId, nodeId, transformer);
    }
}
_AbstractTree_instances = new WeakSet(), _AbstractTree_appendChildNodeWithContent = function _AbstractTree_appendChildNodeWithContent(parentNodeId, nodeContent) {
    const childNodeId = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getNextChildNodeId).call(this, parentNodeId);
    this._nodeDictionary[childNodeId] = { nodeContent };
    return childNodeId;
}, _AbstractTree_nodeIdExistsOrThrow = function _AbstractTree_nodeIdExistsOrThrow(nodeId) {
    if (this.nodeIdExists(nodeId)) {
        return true;
    }
    throw new DirectedGraphError(`Tried to retrieve node that does not exist. nodeId: "${nodeId}".`);
}, _AbstractTree_getChildContentOrThrow = function _AbstractTree_getChildContentOrThrow(nodeId) {
    if (this._nodeDictionary[nodeId] === undefined) {
        throw new DirectedGraphError(`Tried to retrieve node that does not exist. nodeId: "${nodeId}".`);
    }
    return __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getChildContent).call(this, nodeId);
}, _AbstractTree_getChildContent = function _AbstractTree_getChildContent(nodeId) {
    // node should ALWAYS have nodeContent
    // should NEVER be null
    // nodeContent can be set to null
    if (this._nodeDictionary[nodeId] === undefined) {
        return AbstractTree.EmptyNode;
    }
    return this._nodeDictionary[nodeId].nodeContent;
}, _AbstractTree_getChildrenNodeIds = function _AbstractTree_getChildrenNodeIds(parentNodeId, shouldIncludeSubtrees = false) {
    const childRegExp = makeChildrenRegExp(parentNodeId, this._nodeKeyDelimiter);
    if (shouldIncludeSubtrees) {
        return this.filterIds((nodeId) => childRegExp.test(nodeId));
    }
    else {
        return this.filterIds((nodeId) => childRegExp.test(nodeId) && !this.isSubtree(nodeId));
    }
}, _AbstractTree_getContentItems = function _AbstractTree_getContentItems(nodeIds) {
    return nodeIds.map((childNodeId) => {
        var _a;
        const content = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getChildContent).call(this, childNodeId);
        if (content instanceof AbstractTree) {
            const subtreeRootNodeId = content.rootNodeId;
            return __classPrivateFieldGet((_a = content), _AbstractTree_instances, "m", _AbstractTree_getChildContent).call(_a, subtreeRootNodeId);
        }
        return content;
    });
}, _AbstractTree_getNextChildNodeId = function _AbstractTree_getNextChildNodeId(parentNodeId) {
    const childNodeId = [parentNodeId, this._incrementor.next].join(this._nodeKeyDelimiter);
    return childNodeId;
}, _AbstractTree_getParentNodeId = function _AbstractTree_getParentNodeId(nodeId) {
    if (nodeId === this._rootNodeId) {
        return this._rootNodeId;
    }
    if (!nodeId) {
        throw new DirectedGraphError(`Could not derive parent nodeId from '${nodeId}'.`);
    }
    let parentNodeId = "";
    parentNodeId = nodeId
        .split(this._nodeKeyDelimiter)
        .slice(0, -1)
        .join(this._nodeKeyDelimiter);
    if (parentNodeId === "") {
        throw new DirectedGraphError(`Could not derive parent nodeId from '${nodeId}'.`);
    }
    return parentNodeId;
}, _AbstractTree_getTreeNodeIdsAt = function _AbstractTree_getTreeNodeIdsAt(nodeId) {
    const childRegExp = makeDescendantRegExp(nodeId, "");
    return this.filterIds((nodeId) => childRegExp.test(nodeId) && !this.isSubtree(nodeId));
}, _AbstractTree_isLeaf = function _AbstractTree_isLeaf(nodeId) {
    return this.getDescendantNodeIds(nodeId).length === 0;
}, _AbstractTree_moveNode = function _AbstractTree_moveNode(fromNodeId, toNodeId) {
    // *tmc* think "#moveNode" is not very good name
    __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_setNodeContentByNodeId).call(this, toNodeId, __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getChildContent).call(this, fromNodeId));
    this.removeSingleNode(fromNodeId);
}, _AbstractTree_replaceNodeContent = function _AbstractTree_replaceNodeContent(nodeId, nodeContent) {
    if (this.isRoot(nodeId) && nodeContent instanceof AbstractTree) {
        throw new DirectedGraphError(`Can not replace root with subtree.`);
    }
    this._nodeDictionary[nodeId] = { nodeContent };
}, _AbstractTree_setNodeContentByNodeId = function _AbstractTree_setNodeContentByNodeId(nodeId, nodeContent) {
    this._nodeDictionary[nodeId] = { nodeContent };
}, _AbstractTree_visitAllAt = function _AbstractTree_visitAllAt(visitor, nodeId = this._rootNodeId, parentNodeId = this._rootNodeId) {
    const childrenIds = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getChildrenNodeIds).call(this, nodeId, visitor.includeSubtrees);
    const content = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getChildContent).call(this, nodeId);
    if (visitor.includeSubtrees && content instanceof AbstractTree) {
        __classPrivateFieldGet(content, _AbstractTree_instances, "m", _AbstractTree_visitAllAt).call(content, visitor);
    }
    else {
        // this.visitNode(visitor, nodeId, content, parentNodeId);
        visitor.visit(nodeId, content, parentNodeId);
    }
    childrenIds.forEach((childId) => {
        __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_visitAllAt).call(this, visitor, childId, nodeId);
    });
}, _AbstractTree_visitLeavesOf = function _AbstractTree_visitLeavesOf(visitor, nodeId = this._rootNodeId) {
    const childrenIds = this.getDescendantNodeIds(nodeId, visitor.includeSubtrees);
    const leavesOf = childrenIds.filter((childId) => {
        return __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_isLeaf).call(this, childId);
    });
    leavesOf.forEach((nodeId) => {
        const parentId = this.getParentNodeId(nodeId);
        const content = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getChildContent).call(this, nodeId);
        if (content instanceof AbstractTree) {
            __classPrivateFieldGet(content, _AbstractTree_instances, "m", _AbstractTree_visitLeavesOf).call(content, visitor);
        }
        else {
            visitor.visit(nodeId, content, parentId);
        }
    });
}, _AbstractTree_toPojo = function _AbstractTree_toPojo(currentNodeId, parentNodeId, transformTtoPojo = defaultToPojoTransformer, workingPojoDocument = {}) {
    const nodeContent = this.getChildContentAt(currentNodeId);
    if (nodeContent instanceof AbstractTree) {
        const subtreePojo = nodeContent.toPojoAt(nodeContent.rootNodeId);
        Object.entries(subtreePojo).forEach(([nodeId, nodeContent]) => {
            workingPojoDocument[nodeId] = nodeContent;
        });
        workingPojoDocument[currentNodeId] = {
            nodeType: AbstractTree.SubtreeNodeTypeName,
            nodeContent: nodeContent.getChildContentAt(nodeContent.rootNodeId),
            parentId: parentNodeId,
        };
    }
    else {
        workingPojoDocument[currentNodeId] = {
            parentId: parentNodeId,
            nodeContent: transformTtoPojo(nodeContent),
        };
        const children = __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_getChildrenNodeIds).call(this, currentNodeId, AbstractTree.SHOULD_INCLUDE_SUBTREES);
        children.forEach((childId) => {
            __classPrivateFieldGet(this, _AbstractTree_instances, "m", _AbstractTree_toPojo).call(this, childId, currentNodeId, transformTtoPojo, workingPojoDocument);
        });
    }
    return workingPojoDocument;
};
AbstractTree.EmptyNode = null;
AbstractTree.SubtreeNodeTypeName = "subtree";
AbstractTree.SHOULD_INCLUDE_SUBTREES = true;
export { AbstractTree };
//# sourceMappingURL=AbstractTree.js.map
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _AbstractExpressionFactory_fromPojo, _AbstractExpressionFactory_fromPojoTraverseAndExtractChildren;
import { AbstractExpressionTree, AbstractTree, DirectedGraphError, } from "../../src";
import treeUtils from "./treeUtilities";
import { AddressTree } from "./JsPredicateTree/AddressTree";
import { JsPredicateTree } from "./JsPredicateTree/JsPredicateTree";
const defaultFromPojoTransform = (nodeContent) => {
    return nodeContent.nodeContent;
};
class AbstractExpressionFactory extends AbstractExpressionTree {
    static createExpressionTree(rootSeedNodeId, nodeContent) {
        const { operator } = nodeContent && "operator" in nodeContent
            ? nodeContent
            : { operator: "_ANY_" };
        switch (operator) {
            case "$addressTree":
                // @ts-ignore - some how this is inherit ITree, ???
                return AddressTree.getNewInstance(rootSeedNodeId, nodeContent);
            default:
                return new JsPredicateTree(rootSeedNodeId, nodeContent);
        }
    }
    static createSubtreeFromPojo(srcPojoTree, rootPojoKey, parentNodePojo, rootSeedNodeId, transform) {
        const { nodeContent } = parentNodePojo; // transform
        const operator = "operator" in nodeContent ? nodeContent.operator : "_NO_OP_";
        // this should be done by parent class?
        parentNodePojo.parentId = rootPojoKey;
        srcPojoTree[rootPojoKey] = parentNodePojo;
        switch (operator) {
            case "$addressTree":
                // @ts-ignore - types just broken
                return AddressTree.fromPojo(srcPojoTree, transform);
            default:
                return JsPredicateTree.fromPojo(srcPojoTree);
        }
        return null;
    }
    static getNewInstance(rootSeedNodeId, nodeContent) {
        return AbstractExpressionFactory.createExpressionTree(rootSeedNodeId, nodeContent // as unknown as TPredicateTypes
        );
    }
    static createSubtreeAt(targetTree, targetNodeId, subtreeRootNodeContent) {
        const subtree = subtreeRootNodeContent !== null && subtreeRootNodeContent !== void 0 ? subtreeRootNodeContent : targetTree.getNewInstance();
        const subtreeParentNodeId = targetTree.appendChildNodeWithContent(targetNodeId, subtree);
        AbstractExpressionTree.reRootTreeAt(subtree, subtree.rootNodeId, subtreeParentNodeId);
        subtree._rootNodeId = subtreeParentNodeId;
        subtree._incrementor = targetTree._incrementor;
        return subtree;
    }
    static fromPojo(srcPojoTree, transform) {
        return __classPrivateFieldGet(AbstractExpressionFactory, _a, "m", _AbstractExpressionFactory_fromPojo).call(AbstractExpressionFactory, srcPojoTree, transform);
    }
}
_a = AbstractExpressionFactory, _AbstractExpressionFactory_fromPojo = function _AbstractExpressionFactory_fromPojo(srcPojoTree, transform = defaultFromPojoTransform // branch coverage complains
) {
    const pojoObject = Object.assign({}, srcPojoTree);
    const rootNodeId = treeUtils.parseUniquePojoRootKeyOrThrow(pojoObject);
    const rootNodePojo = pojoObject[rootNodeId];
    const dTree = AbstractExpressionFactory.getNewInstance("root");
    dTree.replaceNodeContent(dTree.rootNodeId, transform(rootNodePojo));
    delete pojoObject[rootNodeId];
    __classPrivateFieldGet(AbstractExpressionFactory, _a, "m", _AbstractExpressionFactory_fromPojoTraverseAndExtractChildren).call(AbstractExpressionFactory, 
    // @ts-ignore - _rootNodeId is visible only to AbstractExpressionTree
    dTree._rootNodeId, rootNodeId, 
    // @ts-ignore P is not assignable to TPredicateType
    dTree, pojoObject, transform);
    if (Object.keys(pojoObject).length > 0) {
        throw new DirectedGraphError("Orphan nodes detected while parson pojo object.");
    }
    return dTree;
}, _AbstractExpressionFactory_fromPojoTraverseAndExtractChildren = function _AbstractExpressionFactory_fromPojoTraverseAndExtractChildren(treeParentId, jsonParentId, dTree, treeObject, transformer, fromToMap = []) {
    const childrenNodes = treeUtils.extractChildrenNodes(jsonParentId, treeObject);
    Object.entries(childrenNodes).forEach(([nodeId, nodePojo]) => {
        if (nodePojo.nodeType === AbstractTree.SubtreeNodeTypeName) {
            const yTree = AbstractExpressionFactory.createSubtreeFromPojo(treeObject, nodeId, nodePojo, "_subtree_", transformer);
            AbstractExpressionFactory.createSubtreeAt(
            // @ts-ignore - dTree not IExpressionTree
            dTree, treeParentId, yTree);
        }
        else {
            const childId = dTree
                // @ts-ignore - transformer
                .fromPojoAppendChildNodeWithContent(treeParentId, transformer(nodePojo));
            fromToMap.push({ from: nodeId, to: childId });
            __classPrivateFieldGet(AbstractExpressionFactory, _a, "m", _AbstractExpressionFactory_fromPojoTraverseAndExtractChildren).call(AbstractExpressionFactory, childId, nodeId, dTree, treeObject, transformer, fromToMap);
        }
    });
    return fromToMap;
};
export { AbstractExpressionFactory };
//# sourceMappingURL=AbstractExpressionFactory.js.map
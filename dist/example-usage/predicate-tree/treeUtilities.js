import { DirectedGraphError } from "../../src";
const parseCandidateRootNodeId = (treeObject) => {
    const candidateRootIds = [];
    Object.entries(treeObject).forEach(([key, node]) => {
        if (key === node.parentId) {
            candidateRootIds.push(key);
        }
    });
    return candidateRootIds;
};
/**
 * Separate children nodes from given tree.
 * - **WILL REMOVE CHILDREN** from given tree.
 * @param pojoParentId string
 * @param pojo TTreePojo<T>
 * @returns TTreePojo<T>
 */
const extractChildrenNodes = (pojoParentId, pojo) => {
    const children = {};
    Object.entries(pojo).forEach(([nodeKey, node]) => {
        if (node.parentId === pojoParentId) {
            children[nodeKey] = node;
            delete pojo[nodeKey];
        }
    });
    return children;
};
//
const parseUniquePojoRootKeyOrThrow = (pojoDocument) => {
    const candidateRootIds = parseCandidateRootNodeId(pojoDocument);
    if (candidateRootIds.length !== 1) {
        throw new DirectedGraphError(`No distinct root found. There must exist on and only one nodeId === {parentId}. Found ${candidateRootIds.length}.`);
    }
    return candidateRootIds[0];
};
//
export default {
    extractChildrenNodes,
    parseCandidateRootNodeId,
    parseUniquePojoRootKeyOrThrow,
};
//# sourceMappingURL=treeUtilities.js.map
import type { TTreePojo } from "../../src";
import { DirectedGraphError } from "../../src";

const parseCandidateRootNodeId = <T>(treeObject: TTreePojo<T>): string[] => {
  const candidateRootIds: string[] = [];
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
const extractChildrenNodes = <T>(
  pojoParentId: string,
  pojo: TTreePojo<T>
): TTreePojo<T> => {
  const children: TTreePojo<T> = {};
  Object.entries(pojo).forEach(([nodeKey, node]) => {
    if (node.parentId === pojoParentId) {
      children[nodeKey] = node;
      delete pojo[nodeKey];
    }
  });
  return children as TTreePojo<T>;
};

//
const parseUniquePojoRootKeyOrThrow = <T>(pojoDocument: TTreePojo<T>) => {
  const candidateRootIds = parseCandidateRootNodeId(pojoDocument);

  if (candidateRootIds.length !== 1) {
    throw new DirectedGraphError(
      `No distinct root found. There must exist on and only one nodeId === {parentId}. Found ${candidateRootIds.length}.`
    );
  }

  return candidateRootIds[0];
};
//

export default {
  extractChildrenNodes,
  parseCandidateRootNodeId,
  parseUniquePojoRootKeyOrThrow,
};

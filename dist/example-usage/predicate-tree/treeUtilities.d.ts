import type { TTreePojo } from "../../src";
declare const _default: {
    extractChildrenNodes: <T>(pojoParentId: string, pojo: TTreePojo<T>) => TTreePojo<T>;
    parseCandidateRootNodeId: <T_1>(treeObject: TTreePojo<T_1>) => string[];
    parseUniquePojoRootKeyOrThrow: <T_2>(pojoDocument: TTreePojo<T_2>) => string;
};
export default _default;

// any good reason this is not a type
// review how types are export differently than interfaces
// seem to have issues export/import custom types (classes)
// what causes that?
interface IAppendChildNodeIds {
  newNodeId: string;
  originalContentNodeId?: string; // ONLY set if isNewBranch is true, represents where the content went
  junctionNodeId: string; // this will ALWAYS be the nodeId provided to append*(nodeId)
  isNewBranch: boolean;
}

export { IAppendChildNodeIds };

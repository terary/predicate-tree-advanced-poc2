import { PredicateTree } from "../00004-predicate-tree-pojo-import-export/common/classes/PredicateTree";

const pTree = new PredicateTree();

pTree.appendChildNodeWithContent(pTree.rootNodeId, {
  operator: "$and",
});

pTree.appendChildNodeWithContent(pTree.rootNodeId, {
  operator: "$gt",
  subjectId: "age",
  value: 18,
});

pTree.appendChildNodeWithContent(pTree.rootNodeId, {
  operator: "$lt",
  subjectId: "age",
  value: 45,
});

const notTree = pTree.createSubtreeNotTree(pTree.rootNodeId);

notTree.appendChildNodeWithContent(notTree.rootNodeId, {
  operator: "$eq",
  subjectId: "gender",
  value: "female",
});

console.log({
  pTree: JSON.stringify(pTree.toPojoAt(pTree.rootNodeId), null, 2),
});

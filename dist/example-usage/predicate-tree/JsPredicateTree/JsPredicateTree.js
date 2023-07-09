import { AbstractExpressionTree } from "../../../src";
import { UtilizedLeafVisitor } from "./UtilizedLeafVisitor";
import { quoteValue, predicateJunctionToJsOperator, } from "./helperFunctions";
const commentOutObject = (obj) => {
    const json = JSON.stringify(obj, null, 2);
    return "//" + json.replace(/\n/gi, "\n//");
};
class JsPredicateTree extends AbstractExpressionTree {
    //  #_internalTree: IExpressionTree<TJsPredicate>;
    constructor(rootSeedNodeId, nodeContent) {
        super(rootSeedNodeId, nodeContent);
    }
    getNewInstance(rootSeed, nodeContent) {
        return new JsPredicateTree(rootSeed, nodeContent);
    }
    toFunctionBody(rootNodeId = this.rootNodeId, subjects) {
        if (this.isSubtree(rootNodeId)) {
            const subtree = this.getChildContentAt(rootNodeId);
            if (subtree instanceof JsPredicateTree) {
                return subtree.toFunctionBody(subtree.rootNodeId, subjects);
            }
            else {
                return "_MISSING_BRANCH_STRUCTURE_";
            }
        }
        else if (this.isLeaf(rootNodeId)) {
            const { subjectId, operator, value } = this.getChildContentAt(rootNodeId);
            const { datatype } = subjects[subjectId];
            return ` (record['${subjectId}'] ${operator} ${quoteValue(datatype, value)}) `;
        }
        else if (this.isBranch(rootNodeId)) {
            const { operator } = this.getChildContentAt(rootNodeId);
            // @ts-ignore
            return ("(" +
                this.getChildrenNodeIdsOf(rootNodeId, true)
                    .map((childId) => {
                    return this.toFunctionBody(childId, subjects);
                })
                    .join(` ${predicateJunctionToJsOperator(operator)} `) +
                ")");
        }
        else {
            return "Not a leaf, not a branch";
        }
    }
    commentedRecord(subjects) {
        const leafVisitor = new UtilizedLeafVisitor();
        leafVisitor.includeSubtrees = true;
        // @ts-ignore
        this.visitLeavesOf(leafVisitor);
        const flatSubject = `
    Want to use the current form of
      customer.address: {
        address1: {...}
        address2: {...}
        ...
      }

      Will probably want to override in Address .visitLeaves (or whatever)
       that will allow it to fold back on itself {if my parent ===, the subject id . parent.root.address1}.

    need to convert 
      subjects: {
        address: {
          address1,
          address2,
          ...
        }
      }  
    
      to subjects: {
        customer.address.address1
        customer.address.address2
        ...
      }



    `;
        const recordProperties = leafVisitor.utilizedSubjectIds
            .sort()
            .map((subjectId) => {
            if (!(subjectId in subjects) || !("datatype" in subjects[subjectId])) {
                console.log("Found it");
            }
            const { datatype } = subjects[subjectId];
            return `${subjectId}: ${datatype}`;
        });
        const recordShape = {
            record: recordProperties,
        };
        return commentOutObject(recordShape);
    }
    fromPojoAppendChildNodeWithContent(parentNodeId, nodeContent) {
        return super.fromPojoAppendChildNodeWithContent(parentNodeId, nodeContent);
    }
    createSubtreeAt(nodeId) {
        // *tmc* not a real subtree
        return this;
    }
}
export { JsPredicateTree };
//# sourceMappingURL=JsPredicateTree.js.map
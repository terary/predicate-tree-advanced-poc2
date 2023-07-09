class UtilizedLeafVisitor {
    constructor() {
        this.includeSubtrees = false;
        this._utilizedSubjectIds = {};
    }
    visit(nodeId, nodeContent, parentId) {
        if (nodeContent !== null) {
            const { subjectId, operator, value } = nodeContent;
            this._utilizedSubjectIds[subjectId] = subjectId;
        }
    }
    get utilizedSubjectIds() {
        return Object.keys(this._utilizedSubjectIds).sort();
    }
}
export { UtilizedLeafVisitor };
//# sourceMappingURL=UtilizedLeafVisitor.js.map
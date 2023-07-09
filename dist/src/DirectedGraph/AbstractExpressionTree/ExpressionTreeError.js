class ExpressionTreeError extends Error {
    constructor(message) {
        super(message);
        this._code = "ERR_EXPRESSION_TREE";
        this.name = this._code;
    }
    get code() {
        return this._code;
    }
}
export { ExpressionTreeError };
//# sourceMappingURL=ExpressionTreeError.js.map
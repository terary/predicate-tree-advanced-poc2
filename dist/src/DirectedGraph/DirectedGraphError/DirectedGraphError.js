class DirectedGraphError extends Error {
    constructor(message) {
        super(message);
        this._code = "ERR_DIRECTED_GRAPH";
        this.name = this._code;
    }
    get code() {
        return this._code;
    }
}
export { DirectedGraphError };
//# sourceMappingURL=DirectedGraphError.js.map
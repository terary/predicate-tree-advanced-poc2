class ExpressionTreeError extends Error {
  private _code: string;

  constructor(message: string) {
    super(message);
    this._code = "ERR_EXPRESSION_TREE";
    this.name = this._code;
  }

  get code() {
    return this._code;
  }
}

export { ExpressionTreeError };

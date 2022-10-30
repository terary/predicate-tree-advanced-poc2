class DirectedGraphError extends Error {
  private _code: string;

  constructor(message: string) {
    super(message);
    this._code = "ERR_DIRECTED_GRAPH";
    this.name = this._code;
  }

  get code() {
    return this._code;
  }
}

export { DirectedGraphError };

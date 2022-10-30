class KeyStoreError extends Error {
  private _code: string;
  constructor(message: string) {
    super(message);

    this._code = "ERR_KEY_STORE";
    this.name = this._code;
  }

  get code() {
    // https://nodejs.org/api/errors.html#errorcode
    // Error.code is a real thing, using 'name' and 'code'
    return this._code;
  }
}

export { KeyStoreError };

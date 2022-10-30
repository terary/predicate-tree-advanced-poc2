class Incrementor {
  private _counter = 0;
  constructor() {}
  get next() {
    return this._counter++;
  }
}

export { Incrementor };

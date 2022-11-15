import { v4 as uuidv4 } from "uuid";
import { KeyStoreError } from "./KeyStoreError";

let _counter = 0;

const getNextChildNodeId = () => {
  return "k:" + _counter++;
};

/**
 *  KeyStore<string> vs KeyStore<String>
 *  Because javascript does string interning
 *          KeyStore<string>().reverseLookUp([search]) will return keys for all values of "search". This is becasuse
 *          javascript optimizes memory by point two objects with identical string to the same memory addresss
 *
 *          KeyStore<String>().reverseLookUp([search]), expects .putValue(value), value will be new String('value')
 *          so reverse lookup will look for the objest String
 *
 *          if  client code is certain their string values are unique KeysStore<String> vs KeysStore<string> should make no
 *          difference.
 *  see: https://softwareengineering.stackexchange.com/questions/325811/memory-usage-of-javascript-string-type-with-identical-values
 */
class KeyStore<T> {
  private _keyStore: { [key: string]: T };
  constructor() {
    this._keyStore = {};
  }

  allKeys(): string[] {
    return Object.keys(this._keyStore);
  }

  getValue(key: string): T {
    return this._keyStore[key];
  }

  keyExists(key: string): boolean {
    return key in this._keyStore;
  }

  keyExistsOrThrow(key: string) {
    if (!this.keyExists(key)) {
      throw new KeyStoreError(`Key: '${key}' does not exist in store.`);
    }
    return true;
  }

  // putValue(value: T, newKey = getNextChildNodeId()): string {
  putValue(value: T, newKey = uuidv4()): string {
    if (this.keyExists(newKey)) {
      throw new KeyStoreError(
        "Tried to overwrite value, key already exists in store. (use .replaceValue)."
      );
    }
    this._keyStore[newKey] = value;
    return newKey;
  }

  removeKey(key: string) {
    this.keyExistsOrThrow(key);
    delete this._keyStore[key];
  }

  replaceValue(value: T, key: string): void {
    this.keyExistsOrThrow(key);
    this._keyStore[key] = value;
  }

  reverseLookUp(value: T): string[] {
    // this could/should be extended to accept option argument (internalValue) => boolean
    //  so things like (internalValue)=> internalValue == [someValue],
    //  or that would be better for 'search' function?
    return Object.entries(this._keyStore)
      .filter(([key, val]) => {
        return Object.is(value, val);
      })
      .map(([k, v]) => {
        return k;
      });
  }

  reverseLookUpExactlyOneOrThrow(value: T): string {
    const candidates = this.reverseLookUp(value);
    if (candidates.length !== 1) {
      throw new KeyStoreError(
        `Key: '${value}' has ${candidates.length} matches. Can not determine 1:1 mapping.`
      );
    }

    return candidates[0];
  }

  /**
   * @deprecated
   */
  swapValues(key1: string, key2: string): void {
    const value1 = this.getValue(key1);
    const value2 = this.getValue(key2);
    this.replaceValue(value2, key1);
    this.replaceValue(value1, key2);
  }
}

export { KeyStore };

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
declare class KeyStore<T> {
    private _keyStore;
    constructor();
    allKeys(): string[];
    getValue(key: string): T;
    keyExists(key: string): boolean;
    keyExistsOrThrow(key: string): boolean;
    putValue(value: T, newKey?: string): string;
    removeKey(key: string): void;
    replaceValue(value: T, key: string): void;
    reverseLookUp(value: T): string[];
    reverseLookUpExactlyOneOrThrow(value: T): string;
    /**
     * @deprecated
     */
    swapValues(key1: string, key2: string): void;
}
export { KeyStore };

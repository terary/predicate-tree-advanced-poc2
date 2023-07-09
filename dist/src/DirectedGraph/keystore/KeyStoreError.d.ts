declare class KeyStoreError extends Error {
    private _code;
    constructor(message: string);
    get code(): string;
}
export { KeyStoreError };

declare class ObfuscatedError extends Error {
    constructor(message: string);
    get code(): string;
}
export { ObfuscatedError };

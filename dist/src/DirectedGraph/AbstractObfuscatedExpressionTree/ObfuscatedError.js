class ObfuscatedError extends Error {
    constructor(message) {
        super(message);
        this.name = "ObfuscatedError";
    }
    get code() {
        return "ERR_OBFUSCATE_ERROR";
    }
}
export { ObfuscatedError };
//# sourceMappingURL=ObfuscatedError.js.map
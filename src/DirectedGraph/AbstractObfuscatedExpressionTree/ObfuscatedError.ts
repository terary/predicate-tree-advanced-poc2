class ObfuscatedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ObfuscatedError";
  }

  get code() {
    return "ERR_OBFUSCATE_ERROR";
  }
}

export { ObfuscatedError };

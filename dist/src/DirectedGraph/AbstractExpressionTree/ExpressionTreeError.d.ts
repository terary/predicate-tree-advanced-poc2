declare class ExpressionTreeError extends Error {
    private _code;
    constructor(message: string);
    get code(): string;
}
export { ExpressionTreeError };

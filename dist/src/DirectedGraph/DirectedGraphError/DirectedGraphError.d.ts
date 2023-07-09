declare class DirectedGraphError extends Error {
    private _code;
    constructor(message: string);
    get code(): string;
}
export { DirectedGraphError };

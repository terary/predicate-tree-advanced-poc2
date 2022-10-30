import { DirectedGraphError } from "./DirectedGraphError";

describe("DirectedGraphError", () => {
  it("Should have code and name set", () => {
    try {
      throw new DirectedGraphError("This is a test.");
    } catch (error: any) {
      expect(error.message).toEqual("This is a test.");
      expect(error.code).toEqual("ERR_DIRECTED_GRAPH");
      expect(error.name).toEqual("ERR_DIRECTED_GRAPH");
    }
  });
});

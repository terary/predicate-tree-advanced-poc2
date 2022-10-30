import { KeyStoreError } from "./KeyStoreError";

describe("KeyStoreError", () => {
  it("Should have properties: name and code", () => {
    try {
      throw new KeyStoreError("TESTING");
    } catch (error) {
      const e = error as KeyStoreError;
      expect(e.code).toEqual("ERR_KEY_STORE");
      expect(e.name).toEqual(e.code);
    }
  });
});

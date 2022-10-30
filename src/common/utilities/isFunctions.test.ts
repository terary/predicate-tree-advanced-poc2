import { isUUIDv4 } from "./isFunctions";
describe("isFunctions", () => {
  describe("isUUIDv4", () => {
    it("Should return true for strings that look like uuid4", () => {
      expect(isUUIDv4("9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d")).toStrictEqual(true);
    });
    it("Should return false for things that doint look like uuidv4 strings", () => {
      ["9b1deb4d-3b7d-4bad-9bdd-", "9b1deb4d-3b7d-4bad-9bdd", "", 0x9b1deb4d].forEach(
        (value) => {
          expect(isUUIDv4(value)).toStrictEqual(false);
        }
      );
    });
  });
});

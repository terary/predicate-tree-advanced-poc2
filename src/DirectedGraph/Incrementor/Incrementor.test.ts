import { Incrementor } from "./Incrementor";
describe("Incrementor", () => {
  it("Should initialize at 0", () => {
    const i = new Incrementor();
    expect(i.next).toStrictEqual(0);
    expect(i.next).toStrictEqual(1);
    expect(i.next).toStrictEqual(2);
  });
});

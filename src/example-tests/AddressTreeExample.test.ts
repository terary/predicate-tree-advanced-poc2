import { fnBody } from "../test-resources/predicate-tree/index2";
describe("Example, tree with AddressTree", () => {
  it("Should output javascript expression", () => {
    const expectedBody = `(( (record['customer.lastname'] $eq 'Rubble')  && ( (record['customer.firstname'] $eq 'Barney')  ||  (record['customer.firstname'] $eq 'Betty') )) || ( (record['customer.lastname'] $eq 'Flintstone')  && ( (record['customer.firstname'] $eq 'Fred')  ||  (record['customer.firstname'] $eq 'Wilma') )) || ( record['customer.address.address1'] === 'addr1' &&  record['customer.address.address2'] === 'addr2' &&  record['customer.address.address3'] === 'addr3' &&  record['customer.address.postalCode'] === 'postalCode' &&  record['customer.address.specialInstructions'] === 'specialInstructions'))`;
    expect(fnBody).toEqual(expectedBody);
  });
});

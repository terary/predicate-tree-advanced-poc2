import { fnBody } from '../../example-usage/predicate-tree/index2'
describe('Example, tree with AddressTree', () => {
    it('Should output javascript expression', () => {
        const expectedBody = `(( (record['customer.lastname'] $eq 'Rubble')  $and ( (record['customer.firstname'] $eq 'Barney')  $or  (record['customer.firstname'] $eq 'Betty') )) $or ( (record['customer.lastname'] $eq 'Flintstone')  $and ( (record['customer.firstname'] $eq 'Fred')  $or  (record['customer.firstname'] $eq 'Wilma') )) $or ( record['customer.address.address1'] === 'addr1' &&  record['customer.address.address2'] === 'addr2' &&  record['customer.address.address3'] === 'addr3' &&  record['customer.address.postalCode'] === 'postalCode' &&  record['customer.address.specialInstructions'] === 'specialInstructions'))`
        expect(fnBody).toEqual(expectedBody)
    })
})
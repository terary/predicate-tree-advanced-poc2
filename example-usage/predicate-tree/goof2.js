const ageless = `return (
  (
   record['customer.lastname'] === 'Rubble' && (
    record['customer.firstname'] === 'Barney' || record['customer.firstname'] === 'Betty'
    )
   ) || (
   record['customer.lastname'] === 'Flintstone' && (
    record['customer.firstname'] === 'Fred' || record['customer.firstname'] === 'Wilma'
    )
   )
  )
  `;
const fnAgeless = new Function('record', ageless);

const aged = `return (
  (
   record['customer.lastname'] === 'Rubble' && (
    record['customer.firstname'] === 'Barney' || record['customer.firstname'] === 'Betty'
    )
   ) || (
   record['customer.lastname'] === 'Flintstone' && (
    record['customer.firstname'] === 'Fred' || record['customer.firstname'] === 'Wilma'
    )
   ) || (
  record['customer.age'] $ge '3' && record['customer.age'] < '42'
  )
  )
`
const fnAged = new Function('record', aged);
console.log({
   fnAgeless, fnAged
})
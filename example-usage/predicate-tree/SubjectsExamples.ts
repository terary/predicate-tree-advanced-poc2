import type { TJsPredicate, TSubjectDictionary } from "./JsPredicateTree/types";

const SubjectsSimple: TSubjectDictionary = {
  "customer.firstname": {
    datatype: "string",
    label: "First Name",
  },
  "customer.lastname": {
    datatype: "string",
    label: "Last Name",
  },
  "customer.birthdate": {
    datatype: "datetime",
    label: "Birth Date",
  },
  "customer.age": {
    datatype: "datetime",
    label: "Birth Date",
  },
  "customer.address": {
    address1: {
      datatype: "string",
      label: "Street Address",
    },
    address2: {
      datatype: "string",
      label: "Secondary Address",
    },
    address3: {
      datatype: "string",
      label: "Extra Address Line",
    },
    countryCode: {
      datatype: "string",
      label: "Country",
    },
    postalCode: {
      datatype: "string",
      label: "Country",
    },
    specialInstructions: {
      datatype: "string",
      label: "Leave under the mat.",
    },
    datatype: "AddressTree",
    label: "address",
  },

  // type TAddressSubject = {
  //   addressLine1?: TSubjectType;
  //   addressLine2?: TSubjectType;
  //   addressLine3?: TSubjectType;
  //   city?: TSubjectType;
  //   state?: TSubjectType;
  //   postalCode?: TSubjectType;
  //   specialInstructions?: TSubjectType;
  //   countryCode?: TSubjectType;

  //   datatype: "AddressTree";
  //   label: string;
  // };
};

export { SubjectsSimple };

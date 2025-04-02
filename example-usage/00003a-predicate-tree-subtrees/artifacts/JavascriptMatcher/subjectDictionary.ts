import { Dictionary } from "lodash";

export type TDataType =
  | "string"
  | "number"
  | "boolean"
  | "datetime"
  | "AddressTree";

export interface ISubjectType {
  datatype: TDataType;
  label: string;
  subjectId?: string;
}

export type TSubjectDictionary = Dictionary<ISubjectType | any>;

/**
 * Example subject dictionary defining various record fields
 * This will be used to generate JavaScript matcher functions
 */
export const SubjectDictionary: TSubjectDictionary = {
  firstName: {
    datatype: "string",
    label: "First Name",
    subjectId: "first-name",
  },
  lastName: {
    datatype: "string",
    label: "Last Name",
    subjectId: "last-name",
  },
  age: {
    datatype: "number",
    label: "Age",
    subjectId: "age",
  },
  isActive: {
    datatype: "boolean",
    label: "Active Status",
    subjectId: "is-active",
  },
  birthdate: {
    datatype: "datetime",
    label: "Birth Date",
    subjectId: "birth-date",
  },
  addressLine1: {
    datatype: "string",
    label: "Street Address",
    subjectId: "street-address",
  },
  addressLine2: {
    datatype: "string",
    label: "Secondary Address",
    subjectId: "secondary-address",
  },
  city: {
    datatype: "string",
    label: "City",
    subjectId: "city",
  },
  state: {
    datatype: "string",
    label: "State",
    subjectId: "state",
  },
  postalCode: {
    datatype: "string",
    label: "Postal Code",
    subjectId: "postal-code",
  },
  countryCode: {
    datatype: "string",
    label: "Country",
    subjectId: "country-code",
  },
};

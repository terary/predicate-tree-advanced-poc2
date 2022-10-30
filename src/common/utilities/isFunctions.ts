import { regExpUUIDv4 } from "./regular-expressions";
const isUUIDv4 = (value: any): boolean => {
  return regExpUUIDv4.test(value);
};

export { isUUIDv4 };

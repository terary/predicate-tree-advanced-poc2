// type TLogic = {
//   action: "show" | "hide";
//   conditional: "any" | "all";
//   checks: any[]; // *tmc* do not use 'any'
// };

// type TField = {
//   id: string | number;
//   logic: TLogic | undefined | null;
//   [x: string | number | symbol]: unknown;
// };
// export type { TField };
type TConditionTypes = "equals";
type TCheck = {
  field: number | string;
  // condition: TConditionTypes;
  condition: string;
  option: string;
};

// type TPojoDocument = { [fieldId: string | number]: any };
type TPojoDocument = { [fieldId: string]: any };

export type { TPojoDocument, TCheck };

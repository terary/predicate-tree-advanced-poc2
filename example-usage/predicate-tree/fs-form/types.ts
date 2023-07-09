type TConditionTypes = "equals";
type TCheck = {
  field: number | string;
  condition: string;
  option: string;
};

type TPojoDocument = { [fieldId: string]: any };

export type { TPojoDocument, TCheck };

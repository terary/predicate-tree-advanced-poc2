type TSubjectDictionary = { [subjectId: string]: TSubject };
type TSubjectDataTypes = "string" | "number" | "date" | "object";
type TSubject = {
  subjectId: string;
  datatype: TSubjectDataTypes;
  label: string;
};

export type { TSubject, TSubjectDataTypes, TSubjectDictionary };

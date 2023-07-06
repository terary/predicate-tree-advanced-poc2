import type { TPojoDocument, TCheck } from "../fs-form/types";

/**
 * mutates pojo (adds items)
 * @param pojo
 * @param checks
 */
const checksToPojo = (
  pojo: TPojoDocument,
  parentId: string,
  checks: TCheck[]
) => {
  checks.forEach((check) => {
    const { field, condition, option } = check;
    const parentConditional = pojo[parentId].nodeContent.conditional;

    if (pojo[field] !== undefined) {
      if (!Array.isArray(pojo[field].nodeContent.option)) {
        pojo[field].nodeContent.option = {
          [parentConditional]: [pojo[field].nodeContent.option],
        };
      }
      pojo[field].nodeContent.option[parentConditional].push(option);
    } else {
      pojo[field] = {
        parentId: parentId,
        // subjectId -- subject should be? field description? fieldType description?, ??
        nodeContent: { condition, option, subjectId: field, value: option },
      };
    }
  });
};

export { checksToPojo };

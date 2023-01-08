import { useCallback } from "react";
import {
  getCheckboxValue,
  getRadioValue,
  getSelectValue,
  isCheckboxField,
  isRadioField,
  isSelectField,
  typifyFieldValue,
} from "./getFieldValue";
import { FieldValuePrimitive, FormId, HTMLFormField, HTMLFormFieldElement } from "./useForm";
import { formSelector } from "./util";

export type GetValue = (fieldNameOrRefs: string | HTMLFormField) => FieldValuePrimitive;

export const useGetValue = (formId: FormId): GetValue => {
  return useCallback(
    (fieldNameOrRefs: string | HTMLFormField) => {
      const fieldsSelector =
        typeof fieldNameOrRefs === "string"
          ? (Array.from(document.querySelectorAll(`${formSelector(formId)} [name='${fieldNameOrRefs}']`)) as HTMLFormField)
          : fieldNameOrRefs;

      if (!fieldsSelector.length) return undefined;

      if (isCheckboxField(fieldsSelector)) {
        return getCheckboxValue(fieldsSelector[0] as HTMLInputElement);
      }
      if (isRadioField(fieldsSelector)) {
        return getRadioValue(fieldsSelector as HTMLInputElement[]);
      }
      if (isSelectField(fieldsSelector)) {
        return getSelectValue(fieldsSelector[0] as HTMLSelectElement);
      }
      return typifyFieldValue(fieldsSelector[0].value, (fieldsSelector[0] as HTMLFormFieldElement)?.type);
    },
    [formId]
  );
};

import { useCallback } from "react";
import { getCheckboxValue, getFieldValue, getRadioValue, isCheckboxField, isRadioField } from "./getFieldValue";
import { FieldValue, FormId, HTMLFormFieldElement } from "./useForm";
import { formSelector } from "./util";

export type GetValue = (fieldNameOrRefs: string | HTMLFormFieldElement[]) => FieldValue;

export const useGetValue = (formId: FormId): GetValue => {
  return useCallback(
    (fieldNameOrRefs: string | HTMLFormFieldElement[]) => {
      const fieldsSelector =
        typeof fieldNameOrRefs === "string"
          ? (Array.from(
              document.querySelectorAll(`${formSelector(formId)} [name=${fieldNameOrRefs}]`)
            ) as HTMLFormFieldElement[])
          : fieldNameOrRefs;

      if (!fieldsSelector.length) return undefined;

      if (isCheckboxField(fieldsSelector)) {
        return getCheckboxValue(fieldsSelector[0] as HTMLInputElement);
      }
      if (isRadioField(fieldsSelector)) {
        return getRadioValue(fieldsSelector as HTMLInputElement[]);
      }

      return getFieldValue(fieldsSelector[0] as HTMLFormFieldElement);
    },
    [formId]
  );
};

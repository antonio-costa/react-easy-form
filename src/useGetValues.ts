import { useCallback } from "react";
import { FieldGroupValues, HTMLFormField, HTMLFormFieldElement } from "./useForm";
import { useGetValue } from "./useGetValue";

export type GetValues = (fieldPath?: string) => FieldGroupValues;

export const useGetValues = (
  fieldElements: React.MutableRefObject<HTMLFormField>,
  getValue: ReturnType<typeof useGetValue>
): GetValues => {
  return useCallback(
    (fieldPath) => {
      return fieldElements.current.reduce((prevFormValues: FieldGroupValues, field: HTMLFormFieldElement) => {
        if (fieldPath && !field.name.startsWith(fieldPath)) return prevFormValues;

        let temp = prevFormValues;
        field.name.split(".").forEach((path, i, array) => {
          temp = (temp[path] = i === array.length - 1 ? getValue([field]) : temp[path] || {}) as FieldGroupValues;
        });
        return prevFormValues;
      }, {} as FieldGroupValues);
    },
    [fieldElements, getValue]
  );
};

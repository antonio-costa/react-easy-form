import { useCallback } from "react";
import { FieldGroupValues, FormInternalState } from "../useForm";
import { useGetValue } from "./useGetValue";

export type GetValuesOptions = {
  flattenObject?: boolean;
};
export type GetValues = (fieldPath?: string, options?: GetValuesOptions) => FieldGroupValues;
export type UseGetValues = (formState: FormInternalState) => GetValues;
export const useGetValues: UseGetValues = (formState): GetValues => {
  const getValue = useGetValue(formState);
  const { fieldsNames } = formState;
  return useCallback(
    (fieldPath, options) => {
      if (options?.flattenObject) {
        fieldsNames.current.reduce<FieldGroupValues>((prev, fieldName) => {
          prev[fieldName] = getValue(fieldName);
          return prev;
        }, {});
      }

      // return object separated by dot notation
      return fieldsNames.current.reduce((prevFormValues: FieldGroupValues, fieldName) => {
        if (fieldPath && !fieldName.startsWith(fieldPath)) return prevFormValues;

        let temp = prevFormValues;
        fieldName.split(".").forEach((path, i, array) => {
          temp = (temp[path] = i === array.length - 1 ? getValue(fieldName) : temp[path] || {}) as FieldGroupValues;
        });
        return prevFormValues;
      }, {} as FieldGroupValues);
    },
    [fieldsNames, getValue]
  );
};

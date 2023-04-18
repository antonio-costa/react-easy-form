import { useCallback } from "react";
import { FieldGroupValues, FormInternalState } from "../useForm";
import { getNestedValue } from "../util/misc";

export type GetValuesOptions = {
  getFullPath?: boolean;
};
export type GetValues = (fieldPath?: string, options?: GetValuesOptions) => FieldGroupValues | undefined;
export type UseGetValues = (formState: FormInternalState) => GetValues;
export const useGetValues: UseGetValues = (formState): GetValues => {
  const { fieldValues } = formState;
  return useCallback(
    (fieldName, options) => {
      if (!fieldName) return fieldValues.current;

      if (!fieldName.endsWith(".")) {
        throw new Error(
          `[react-easy-form] Field name for getValues must be undefined or end with a "." (got ${fieldName}).`
        );
      }

      return getNestedValue(fieldValues.current, fieldName);
    },
    [fieldValues]
  );
};

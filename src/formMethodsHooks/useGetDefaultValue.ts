import { useCallback } from "react";
import { FieldValuePrimitive, FormInternalState } from "../useForm";

export type GetDefaultValue = (fieldName: string) => FieldValuePrimitive;
export type UseGetDefaultValue = (formState: FormInternalState) => GetDefaultValue;
export const useGetDefaultValue: UseGetDefaultValue = ({ defaultValues }): GetDefaultValue => {
  return useCallback(
    (fieldName) => {
      return defaultValues.current[fieldName];
    },
    [defaultValues]
  );
};

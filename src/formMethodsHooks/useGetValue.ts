import { useCallback } from "react";
import { FieldValuePrimitive, FormInternalState } from "../useForm";
import { getNestedValue } from "../util/misc";

export type GetValue = (fieldNameOrRefs: string) => FieldValuePrimitive;
export type UseGetValue = (formState: FormInternalState) => GetValue;
export const useGetValue: UseGetValue = ({ fieldValues }): GetValue => {
  return useCallback(
    (fieldName: string) => {
      const fieldValue = getNestedValue(fieldValues.current, fieldName);
      if (typeof fieldValue === "object" && !Array.isArray(fieldValue) && fieldValue !== null) {
        throw new Error("[react-easy-form] Trying to access value of an object.");
      }
      return fieldValue as FieldValuePrimitive;
    },
    [fieldValues]
  );
};

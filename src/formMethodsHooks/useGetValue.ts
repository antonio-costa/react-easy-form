import { useCallback } from "react";
import { FieldGroupValues, FieldValuePrimitive, FormInternalState } from "../useForm";
import { getNestedValue } from "../util/misc";

export type GetValue = <T extends boolean = false>(
  fieldNameOrRefs: string,
  allowObject?: T
) => T extends true ? FieldGroupValues | FieldValuePrimitive : FieldValuePrimitive;
export type UseGetValue = (formState: FormInternalState) => GetValue;
export const useGetValue: UseGetValue = ({ fieldValues }): GetValue => {
  return useCallback(
    (fieldName: string, allowObject) => {
      const fieldValue = getNestedValue(fieldValues.current, fieldName);
      if (!allowObject && typeof fieldValue === "object" && !Array.isArray(fieldValue) && fieldValue !== null) {
        throw new Error("[react-easy-form] Trying to access value of an object.");
      }
      return fieldValue as FieldValuePrimitive;
    },
    [fieldValues]
  );
};

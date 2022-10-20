import { useCallback } from "react";
import { FormValues, HTMLFormFieldElement } from "./useForm";
import { useGetValue } from "./useGetValue";

export type GetValues = () => FormValues;

export const useGetValues = (
  fields: React.MutableRefObject<HTMLFormFieldElement[]>,
  getValue: ReturnType<typeof useGetValue>
): GetValues => {
  return useCallback(() => {
    return fields.current.reduce((prev, field) => {
      return { ...prev, [field.name]: getValue([field]) };
    }, {} as FormValues);
  }, [fields, getValue]);
};

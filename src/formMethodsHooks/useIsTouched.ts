import { useCallback } from "react";
import { FormInternalState } from "../useForm";

export type IsTouched = (fieldNames?: string | string[]) => boolean;
export type UseIsTouched = (formState: FormInternalState) => IsTouched;
export const useIsTouched: UseIsTouched = (formState) => {
  const { fieldsNames, fieldsTouched } = formState;
  return useCallback(
    (fieldNames?: string | string[]): boolean => {
      const fnames = fieldNames ? (Array.isArray(fieldNames) ? fieldNames : [fieldNames]) : fieldsNames();
      return fnames.some((fname) => fieldsTouched.current.includes(fname));
    },
    [fieldsNames, fieldsTouched]
  );
};

import { useCallback } from "react";
import { FormInternalState } from "../useForm";

export type IsTouched = (fieldNames?: string | string[]) => boolean;
export type UseIsTouched = (formState: FormInternalState) => IsTouched;
export const useIsTouched: UseIsTouched = (formState) => {
  const { fieldElements, fieldsTouched } = formState;
  return useCallback(
    (fieldNames?: string | string[]): boolean => {
      const fnames = fieldNames ? (Array.isArray(fieldNames) ? fieldNames : [fieldNames]) : Object.keys(fieldElements());

      return fnames.every((fname) => fieldsTouched.current.includes(fname));
    },
    [fieldElements, fieldsTouched]
  );
};

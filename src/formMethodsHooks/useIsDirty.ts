import { useCallback } from "react";
import { FormInternalState } from "../useForm";
import { useGetValue } from "./useGetValue";

export type IsDirty = (fieldNames?: string | string[]) => boolean;
export type UseIsDirty = (formState: FormInternalState) => IsDirty;
export const useIsDirty: UseIsDirty = (formState) => {
  const getValue = useGetValue(formState);
  const { fieldElements, defaultValues } = formState;
  return useCallback(
    (fieldNames?: string | string[]): boolean => {
      const fnames = fieldNames ? (Array.isArray(fieldNames) ? fieldNames : [fieldNames]) : Object.keys(fieldElements());

      return fnames.some((fname) => getValue(fname) !== defaultValues.current[fname]);
    },
    [getValue, defaultValues, fieldElements]
  );
};

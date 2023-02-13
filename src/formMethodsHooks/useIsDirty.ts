import { useCallback } from "react";
import { FormInternalState } from "../useForm";
import { useGetValue } from "./useGetValue";

export type IsDirty = (fieldNames?: string | string[]) => boolean;
export type UseIsDirty = (formState: FormInternalState) => IsDirty;
export const useIsDirty: UseIsDirty = (formState) => {
  const getValue = useGetValue(formState);
  const { fieldsNames, defaultValues, fieldsNeverDirty } = formState;
  return useCallback(
    (fieldNames?: string | string[]): boolean => {
      const fnames = fieldNames ? (Array.isArray(fieldNames) ? fieldNames : [fieldNames]) : fieldsNames.current;

      return fnames.some(
        (fname) => getValue(fname) !== defaultValues.current[fname] && !fieldsNeverDirty.current.includes(fname)
      );
    },
    [fieldsNames, getValue, defaultValues, fieldsNeverDirty]
  );
};

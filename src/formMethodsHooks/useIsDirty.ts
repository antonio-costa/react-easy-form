import { useCallback } from "react";
import { FormInternalState } from "../useForm";
import { shallowEqual } from "../util/misc";
import { useGetValue } from "./useGetValue";

export type IsDirty = (fieldNames?: string | string[]) => boolean;
export type UseIsDirty = (formState: FormInternalState) => IsDirty;
export const useIsDirty: UseIsDirty = (formState) => {
  const getValue = useGetValue(formState);
  const { fieldsNames, defaultValues, fieldsNeverDirty, optionsRef } = formState;
  return useCallback(
    (fieldNames?: string | string[]): boolean => {
      const fnames = fieldNames ? (Array.isArray(fieldNames) ? fieldNames : [fieldNames]) : fieldsNames();
      const allDefaultOptions = { ...defaultValues.current, ...(optionsRef.current?.defaultValues || {}) };

      const dirtyField = fnames.find(
        (fname) => !shallowEqual(getValue(fname), allDefaultOptions[fname]) && !fieldsNeverDirty.current.includes(fname)
      );
      return dirtyField !== undefined;
    },
    [fieldsNames, optionsRef, defaultValues, getValue, fieldsNeverDirty]
  );
};

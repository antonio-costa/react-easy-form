import { useCallback } from "react";
import { FormInternalState } from "../useForm";
import { bothValuesUndefined, shallowEqual } from "../util/misc";
import { useGetValue } from "./useGetValue";

export type IsDirty = (fieldNames?: string | string[]) => boolean;
export type UseIsDirty = (formState: FormInternalState) => IsDirty;

export const useIsDirty: UseIsDirty = (formState) => {
  const getValue = useGetValue(formState);
  const { fieldsNames, defaultValues, fieldsNeverDirty, optionsRef } = formState;

  return useCallback(
    (_fieldNames?: string | string[]): boolean => {
      const fnames = _fieldNames ? (Array.isArray(_fieldNames) ? _fieldNames : [_fieldNames]) : fieldsNames();
      const allDefaultOptions = { ...defaultValues.current, ...(optionsRef.current?.flattenedDefaultValues || {}) };
      const dirtyField = fnames.find((fname) => {
        if (fieldsNeverDirty.current.includes(fname)) return false;

        const value = getValue(fname);
        const defaultValue = allDefaultOptions[fname];

        const bothUndefined = bothValuesUndefined(value, defaultValue);
        const equal = shallowEqual(value, defaultValue);

        const dirty = !(bothUndefined || equal);

        if (dirty && optionsRef.current.debug?.logDirty) {
          console.log("[FORMS-DEBUG] [logDirty] Dirty field: ", fname);
          console.log("[FORMS-DEBUG] [logDirty] Field value: ", value);
          console.log("[FORMS-DEBUG] [logDirty] Default value: ", defaultValue);
        }

        return dirty;
      });
      return dirtyField !== undefined;
    },
    [fieldsNames, defaultValues, optionsRef, getValue, fieldsNeverDirty]
  );
};

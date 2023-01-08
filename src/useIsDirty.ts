import { useCallback } from "react";
import { GetValue } from "./useGetValue";

export type IsDirty = (fieldNames?: string | string[]) => boolean;

export const useIsDirty = (
  defaultValues: React.MutableRefObject<Record<string, any>>,
  getValue: GetValue,
  fieldElements: React.MutableRefObject<HTMLFormField>
): IsDirty => {
  return useCallback(
    (fieldNames?: string | string[]): boolean => {
      const fnames = (() => {
        if (fieldNames) {
          return Array.isArray(fieldNames) ? fieldNames : [fieldNames];
        } else {
          return fieldElements.current.map((field) => field.name);
        }
      })();

      return fnames.some((fname) => getValue(fname) !== defaultValues.current[fname]);
    },
    [getValue, defaultValues, fieldElements]
  );
};

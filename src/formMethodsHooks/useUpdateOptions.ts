import { useCallback } from "react";
import { FormInternalState, UseFormOptionsRef } from "../useForm";
import { flattenObject } from "../util/misc";

export type UpdateFormOptions = (options: UseFormOptionsRef, replace?: boolean) => void;

export type UseUpdateFormOptions = (formState: FormInternalState) => UpdateFormOptions;

export const useUpdateFormOptions: UseUpdateFormOptions = (formState): UpdateFormOptions => {
  return useCallback(
    (options, replace) => {
      if (replace) {
        formState.optionsRef.current = options;
      } else {
        formState.optionsRef.current = Object.assign(formState.optionsRef.current, options);
      }
      if (options.defaultValues !== undefined) {
        formState.optionsRef.current.flattenedDefaultValues = flattenObject(
          formState.optionsRef.current.defaultValues || {}
        );
      }
    },
    [formState.optionsRef]
  );
};

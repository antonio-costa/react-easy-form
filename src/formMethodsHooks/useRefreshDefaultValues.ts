import { useCallback } from "react";
import { FormInternalState } from "../useForm";
import { flattenObject } from "../util/misc";
import { useRefreshDefaultValue } from "./useGetDefaultValue";

// TODO: Add support for custom elements
export type RefreshDefaultValues = () => void;
export type UseRefreshDefaultValues = (formState: FormInternalState) => RefreshDefaultValues;

export const useRefreshDefaultValues: UseRefreshDefaultValues = (formState) => {
  const { defaultValues, optionsRef, nativeFieldElements } = formState;

  const refreshDefaultValue = useRefreshDefaultValue(formState);

  return useCallback(() => {
    defaultValues.current = flattenObject(optionsRef.current?.defaultValues || {});

    Object.keys(nativeFieldElements.current).forEach((fieldName) => {
      const field = nativeFieldElements.current[fieldName];
      field.forEach((f) => refreshDefaultValue(f));
    });
  }, [defaultValues, nativeFieldElements, optionsRef, refreshDefaultValue]);
};

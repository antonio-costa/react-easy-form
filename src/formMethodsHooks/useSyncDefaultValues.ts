import { useCallback } from "react";
import { FormInternalState } from "../useForm";
import { flattenObject } from "../util/misc";
import { useSyncNativeDefaultValue } from "./useSyncNativeDefaultValue";

// TODO: Add support for custom elements
export type SyncDefaultValues = () => void;
export type UseSyncDefaultValues = (formState: FormInternalState) => SyncDefaultValues;

export const useSyncDefaultValues: UseSyncDefaultValues = (formState) => {
  const { defaultValues, optionsRef, nativeFieldElements, customFieldCallbacks } = formState;

  const syncNativeDefaultValue = useSyncNativeDefaultValue(formState);

  return useCallback(() => {
    defaultValues.current = flattenObject(optionsRef.current?.defaultValues || {});

    Object.keys(nativeFieldElements.current).forEach((fieldName) => {
      const field = nativeFieldElements.current[fieldName];
      field.forEach((f) => syncNativeDefaultValue(f, false));
    });

    Object.values(customFieldCallbacks.current).forEach((cb) => {
      cb.syncDefaultValue && cb.syncDefaultValue();
    });
  }, [customFieldCallbacks, defaultValues, nativeFieldElements, optionsRef, syncNativeDefaultValue]);
};

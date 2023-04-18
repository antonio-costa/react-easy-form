import { useCallback } from "react";
import { FormInternalState } from "../useForm";
import { useSyncDOMValues } from "./useSyncDOMValues";

export type ResetFormOptions = {
  syncDOMValues?: boolean;
};
export type ResetForm = (options: ResetFormOptions) => void;
export type UseResetForm = (formState: FormInternalState) => ResetForm;
export const useResetForm: UseResetForm = (formState): ResetForm => {
  const syncDOMValues = useSyncDOMValues(formState);
  const { optionsRef } = formState;
  return useCallback(
    (options) => {
      formState.fieldValues.setValue(optionsRef.current.defaultValues || {}); // should add trigger observables array?
      formState.formErrors.setValue({}); // should add trigger observables array?
      formState.fieldsTouched.setValue([]); // should add trigger observables array?

      if (options.syncDOMValues) {
        syncDOMValues();
      }
    },
    [formState.fieldValues, formState.fieldsTouched, formState.formErrors, optionsRef, syncDOMValues]
  );
};

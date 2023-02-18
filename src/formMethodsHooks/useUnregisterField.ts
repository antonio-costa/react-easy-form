import { useCallback } from "react";
import { FormInternalState } from "../useForm";
import { deleteNestedValue } from "../util/misc";

export type UnregisterField = (name: string) => void;

export const useUnregisterField = (formState: FormInternalState): UnregisterField => {
  const { fieldValues, formErrors, defaultValues, fieldsTouched } = formState;

  return useCallback(
    (name) => {
      // remove value from list of fieldValues
      fieldValues.setValue(
        (old) => {
          delete old[name];
          return deleteNestedValue(old, name);
        },
        [name]
      );
      // remove value from list of defaultValues
      if (defaultValues.current[name]) delete defaultValues.current[name];

      // remove error from fieldErrors
      formErrors.setValue(
        (old) => {
          delete old[name];
          return { ...old };
        },
        [name]
      );

      // remove from touched
      fieldsTouched.setValue((old) => old.filter((fname) => fname !== name), [name]);

      // remove from dirty
      const neverDirtyIndex = formState.fieldsNeverDirty.current.findIndex((fname) => fname === name);
      if (neverDirtyIndex !== -1) {
        formState.fieldsNeverDirty.current.splice(neverDirtyIndex, 1);
      }
    },
    [defaultValues, fieldValues, fieldsTouched, formErrors, formState.fieldsNeverDirty]
  );
};

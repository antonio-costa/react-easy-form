import { useCallback } from "react";
import { FormInternalState } from "../useForm";
import { deleteNestedKey, toArray } from "../util/misc";

export type UnregisterField = (fieldNames?: string | string[]) => void;

export const useUnregisterField = (formState: FormInternalState): UnregisterField => {
  const { fieldValues, formErrors, defaultValues, fieldsTouched, fieldsValidationDependencies } = formState;

  return useCallback(
    (_fieldNames) => {
      const fieldNames = toArray(_fieldNames);
      fieldNames.forEach((name) => {
        if (!name) return;

        // remove value from list of fieldValues
        fieldValues.setValue(
          (old) => {
            delete old[name];
            return deleteNestedKey(old, name, true);
          },
          [name]
        );
        // remove value from list of defaultValues
        if (defaultValues.current[name]) delete defaultValues.current[name];

        // remove error from fieldErrors
        formErrors.setValue(
          (old) => {
            delete old[name];
            return old;
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

        // remove field validation depencies
        fieldsValidationDependencies.current.delete(name);
      });
    },
    [defaultValues, fieldValues, fieldsTouched, fieldsValidationDependencies, formErrors, formState.fieldsNeverDirty]
  );
};

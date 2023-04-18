import { useCallback } from "react";
import { RegisterFieldOptions } from ".";
import { FormErrors, FormInternalState, FormNativeFieldElement, FormValidation } from "../useForm";
import { setNestedValue } from "../util/misc";
import { useGetValue } from "./useGetValue";
import { useGetValues } from "./useGetValues";

export type ValidateForm = (fieldName?: string) => Promise<FormValidation>;
export type UseValidateForm = (formState: FormInternalState) => ValidateForm;
export const useValidateForm: UseValidateForm = (formState) => {
  const { optionsRef, fieldsRegisterOptions } = formState;
  const getValues = useGetValues(formState);
  const getValue = useGetValue(formState);

  return useCallback(
    async (fieldName) => {
      const formValues = fieldName ? setNestedValue({}, fieldName, getValue(fieldName, true)) : getValues() || {};

      let errors: FormErrors = {};

      // validator registered through useForm()
      if (optionsRef?.current?.validator) {
        const validation = await optionsRef.current.validator(formValues);
        if (fieldName) {
          if (validation.errors[fieldName]) {
            errors[fieldName] = validation.errors[fieldName];
          }
        } else {
          errors = { ...validation.errors };
        }
      }

      // validators registered through {...form.register()}
      const fieldsRegisterOptionsEntries: [string, RegisterFieldOptions<FormNativeFieldElement>][] = fieldName
        ? fieldsRegisterOptions.current[fieldName]
          ? [[fieldName, fieldsRegisterOptions.current[fieldName]]]
          : []
        : Object.entries(fieldsRegisterOptions.current);

      for (let i = 0; i < fieldsRegisterOptionsEntries.length; i++) {
        const fieldName = fieldsRegisterOptionsEntries[i][0];
        const options = fieldsRegisterOptionsEntries[i][1];

        if (options.validator) {
          const fieldError = await options.validator(getValue(fieldName), formValues);
          if (fieldError !== null) {
            errors = { ...errors, [fieldName]: fieldError };
          }
        }
      }

      formState.formErrors.setValue(errors);

      return {
        valid: Object.keys(errors).length === 0,
        errors,
      };
    },
    [fieldsRegisterOptions, formState.formErrors, getValue, getValues, optionsRef]
  );
};

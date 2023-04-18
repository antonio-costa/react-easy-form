import { useCallback } from "react";
import { FieldError, FormInternalState } from "../useForm";
import { setNestedValue } from "../util/misc";
import { useGetValue } from "./useGetValue";
import { useGetValues } from "./useGetValues";

export const useTriggerValidation = (formState: FormInternalState) => {
  const getValues = useGetValues(formState);
  const getValue = useGetValue(formState);

  const triggerValidation = useCallback(
    async (fieldName: string) => {
      if (formState.fieldsDOMSyncing.current.has(fieldName)) {
        return;
      }

      let error: FieldError = undefined;

      // form validator
      const formValidator = formState?.optionsRef?.current?.validator;

      if (formValidator) {
        const validation = await formValidator(setNestedValue({}, fieldName, getValue(fieldName)));
        error = validation.errors[fieldName];
      }

      // field validator
      const fieldValidator = formState.fieldsRegisterOptions.current?.[fieldName]?.validator;
      const fieldErrorMessage = fieldValidator && (await fieldValidator(getValue(fieldName), getValues() || {}));
      if (fieldErrorMessage) {
        error = fieldErrorMessage;
      }
      if (error !== undefined && formState.formErrors.current[fieldName] !== error) {
        formState.formErrors.setValue({ ...formState.formErrors.current, [fieldName]: error }, [fieldName]);
      } else if (error === undefined && formState.formErrors.current[fieldName] !== undefined) {
        formState.formErrors.setValue(() => {
          const n = { ...formState.formErrors.current };
          delete n[fieldName];
          return n;
        }, [fieldName]);
      }
      // trigger validation for dependencies

      formState.fieldsValidationDependencies.current.forEach((depField) => {
        depField.forEach((depFieldName) => {
          if (fieldName !== depFieldName) triggerValidation(depFieldName);
        });
      });
    },
    [
      formState.fieldsDOMSyncing,
      formState.fieldsRegisterOptions,
      formState.fieldsValidationDependencies,
      formState.formErrors,
      formState?.optionsRef,
      getValue,
      getValues,
    ]
  );

  return triggerValidation;
};

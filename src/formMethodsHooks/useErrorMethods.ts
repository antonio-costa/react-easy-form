import { useCallback, useMemo } from "react";
import { FieldError, FormInternalState } from "../useForm";

export type SetFieldError = (fieldName: string, error: FieldError) => void;
export type ClearFieldsErrors = (fieldNames?: string | string[]) => void;
export type GetFieldError = (fieldName: string) => FieldError;

export type FormErrorMethods = {
  setError: SetFieldError;
  clearErrors: ClearFieldsErrors;
  getError: GetFieldError;
};
export type UseFormErrorMethods = (formState: FormInternalState) => FormErrorMethods;

export const useErrorMethods: UseFormErrorMethods = (formState) => {
  const { fieldsNames, optionsRef, formErrors } = formState;
  const setError = useCallback<SetFieldError>(
    (fieldName, error) => {
      if (optionsRef.current.debug?.logSetError?.includes(fieldName)) {
        console.log("[FORMS-DEBUG] [logSetError] Tracing set error: ", fieldName);
        console.log("[FORMS-DEBUG] [logSetError] New error value: ", error);
        console.trace(fieldName);
      }
      formErrors.setValue(() => {
        const r = { ...formErrors.current };
        if (error === null) {
          delete r[fieldName];
        } else if (fieldsNames().includes(fieldName)) {
          r[fieldName] = error;
        }
        return r;
      }, [fieldName]);
    },
    [fieldsNames, formErrors, optionsRef]
  );
  const clearErrors = useCallback<ClearFieldsErrors>(
    (_fieldNames) => {
      const fieldNames =
        _fieldNames === undefined ? fieldsNames() : typeof _fieldNames === "string" ? [_fieldNames] : _fieldNames;

      fieldNames.forEach((fieldName) => {
        if (optionsRef.current.debug?.logSetError?.includes(fieldName)) {
          console.log("[FORMS-DEBUG] [logSetError] Tracing clear error: ", fieldName);
          console.trace(fieldName);
        }
      });
      formErrors.setValue(() => {
        if (!fieldNames) return {};

        const n = { ...formErrors.current };

        fieldNames.forEach((fName) => {
          delete n[fName];
        });

        return n;
      }, fieldNames);
    },
    [fieldsNames, formErrors, optionsRef]
  );

  const getError = useCallback<GetFieldError>(
    (fieldName) => {
      return formState.formErrors.current?.[fieldName];
    },
    [formState.formErrors]
  );

  return useMemo(() => ({ setError, clearErrors, getError }), [setError, clearErrors, getError]);
};

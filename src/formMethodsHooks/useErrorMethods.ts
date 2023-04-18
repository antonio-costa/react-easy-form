import { useCallback, useMemo } from "react";
import { FieldError, FormInternalState } from "../useForm";

export type SetFieldError = (fieldName: string, error: FieldError) => void;
export type ClearFieldsErrors = (fieldNames: string | string[] | undefined) => void;
export type GetFieldError = (fieldName: string) => FieldError;

export type FormErrorMethods = {
  setError: SetFieldError;
  clearErrors: ClearFieldsErrors;
  getError: GetFieldError;
};
export type UseFormErrorMethods = (formState: FormInternalState) => FormErrorMethods;

export const useErrorMethods: UseFormErrorMethods = (formState) => {
  const { fieldsNames } = formState;
  const setError = useCallback<SetFieldError>(
    (fieldName, error) => {
      formState.formErrors.setValue(() => {
        const r = { ...formState.formErrors.current };
        if (error === null) {
          delete r[fieldName];
        } else if (formState.fieldsNames().includes(fieldName)) {
          r[fieldName] = error;
        }
        return r;
      }, [fieldName]);
    },
    [formState]
  );
  const clearErrors = useCallback<ClearFieldsErrors>(
    (_fieldNames) => {
      const fieldNames =
        _fieldNames === undefined ? fieldsNames() : typeof _fieldNames === "string" ? [_fieldNames] : _fieldNames;

      formState.formErrors.setValue(() => {
        if (!fieldNames) return {};

        const n = { ...formState.formErrors.current };

        fieldNames.forEach((fName) => {
          delete n[fName];
        });

        return n;
      }, fieldNames);
    },
    [fieldsNames, formState.formErrors]
  );

  const getError = useCallback<GetFieldError>(
    (fieldName) => {
      return formState.formErrors.current?.[fieldName];
    },
    [formState.formErrors]
  );

  return useMemo(() => ({ setError, clearErrors, getError }), [setError, clearErrors, getError]);
};

import { useCallback, useMemo } from "react";
import { FieldError, FormInternalState } from "../useForm";

export type SetFieldError = (fieldName: string, error: FieldError | null) => void;
export type ClearFieldErrors = (fieldNameOrFieldNames: string[]) => void;

export type FormErrorMethods = {
  setError: SetFieldError;
  clearErrors: ClearFieldErrors;
};
export type UseFormErrorMethods = (formState: FormInternalState) => FormErrorMethods;

export const useErrorMethods: UseFormErrorMethods = (formState) => {
  const setError = useCallback<SetFieldError>(
    (fieldName, error) => {
      formState.formErrors.setValue(() => {
        const r = { ...formState.formErrors.current };
        if (error === null) {
          delete r[fieldName];
        } else if (formState.fieldsNames.current.includes(fieldName)) {
          r[fieldName] = error;
        }
        return r;
      }, [fieldName]);
    },
    [formState]
  );
  const clearErrors = useCallback<ClearFieldErrors>(
    (fieldNames) => {
      formState.formErrors.setValue(() => {
        if (!fieldNames) return {};

        const n = { ...formState.formErrors.current };

        fieldNames.forEach((fName) => {
          delete n[fName];
        });

        return n;
      }, fieldNames);
    },
    [formState.formErrors]
  );

  return useMemo(() => ({ setError, clearErrors }), [clearErrors, setError]);
};

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "../FormContext";
import { FieldGroupErrors, FormContextValue, FormNativeField } from "../useForm";

export type RegisterFieldEvent = (field: FormNativeField) => () => void;
export type RegisterPathFieldsEvents = (fields: FormNativeField[]) => () => void;

export const useWatchErrors = (fieldNameOrPath?: string, customFormCtx?: FormContextValue) => {
  const formContext = useFormContext();
  const form = customFormCtx || formContext;

  const [errors, setErrors] = useState<FieldGroupErrors>({});

  const isPath = useMemo(() => fieldNameOrPath?.endsWith("."), [fieldNameOrPath]);

  const setErrorsFunc = useCallback(() => {
    if (fieldNameOrPath === undefined) {
      return setErrors(form._formState.formErrors.current);
    } else if (isPath) {
      setErrors(
        Object.keys(form._formState.formErrors.current).reduce<FieldGroupErrors>((prev, curr) => {
          if (curr.startsWith(fieldNameOrPath) && form._formState.formErrors.current[curr]) {
            prev[curr] = form._formState.formErrors.current[curr];
          }
          return prev;
        }, {})
      );
    } else if (form._formState.formErrors.current[fieldNameOrPath]) {
      setErrors({ [fieldNameOrPath]: form._formState.formErrors.current[fieldNameOrPath] });
    } else {
      setErrors({});
    }
  }, [fieldNameOrPath, form._formState.formErrors, isPath]);

  useEffect(() => {
    const unsub = form._formState.formErrors.observe(() => {
      setErrorsFunc();
    }, fieldNameOrPath);

    return () => unsub();
  }, [fieldNameOrPath, form._formState.formErrors, setErrorsFunc]);

  return errors;
};

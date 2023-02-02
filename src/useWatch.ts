import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "./FormContext";
import { FieldError, FieldGroupErrors, FieldValue, FormContextValue } from "./useForm";
import { flattenObject, getNestedValue } from "./util/misc";

export interface UseWatchOptions {
  watchValues?: boolean;
  watchErrors?: boolean;
  formContext?: FormContextValue;
  flattenErrorObject?: boolean;
  flattenValidationObject?: boolean;
}

const flattenIfRequired = (object: Record<string, FieldError | FieldValue>, shouldFlatten?: boolean) => ({
  ...(shouldFlatten ? flattenObject(object) : object),
});

export const useWatch = (fieldNameOrPath?: string, options?: UseWatchOptions) => {
  const { watchValues, watchErrors, formContext: customFormCtx } = options || {};

  const formContext = useFormContext();
  const form = customFormCtx || formContext;

  const [values, setValues] = useState<FieldValue>();
  const [errors, setErrors] = useState<FieldGroupErrors | FieldError>();

  const isPath = useMemo(() => fieldNameOrPath?.endsWith("."), [fieldNameOrPath]);

  const setValueFunc = useCallback(() => {
    if (fieldNameOrPath === undefined) {
      setValues(flattenIfRequired(form.fieldValues.current, options?.flattenValidationObject));
    } else if (isPath) {
      setValues(
        flattenIfRequired(getNestedValue(form.fieldValues.current, fieldNameOrPath), options?.flattenValidationObject)
      );
    } else {
      setValues(getNestedValue(form.fieldValues.current, fieldNameOrPath));
    }
  }, [fieldNameOrPath, form.fieldValues, isPath, options?.flattenValidationObject]);

  const setErrorsFunc = useCallback(() => {
    if (fieldNameOrPath === undefined) {
      setErrors(flattenIfRequired(form._formState.formErrors.current, options?.flattenErrorObject));
    } else if (isPath) {
      setErrors(
        flattenIfRequired(filterRecord(form._formState.formErrors.current, fieldNameOrPath), options?.flattenErrorObject)
      );
    } else if (form._formState.formErrors.current[fieldNameOrPath]) {
      setErrors(form._formState.formErrors.current[fieldNameOrPath]);
    } else {
      setErrors(undefined);
    }
  }, [fieldNameOrPath, form._formState.formErrors, isPath, options?.flattenErrorObject]);

  useEffect(() => {
    const unsubFuncs: (() => void)[] = [];
    // by default watchValue should be subscribed
    // (watchValue === undefined is the same as watchValue === true)
    if (watchValues !== false) {
      setValueFunc();
      unsubFuncs.push(
        form.fieldValues.observe(() => {
          setValueFunc();
        }, fieldNameOrPath)
      );
    }

    if (watchErrors) {
      unsubFuncs.push(
        form._formState.formErrors.observe(() => {
          setErrorsFunc();
        }, fieldNameOrPath)
      );
    }

    return () => {
      unsubFuncs.forEach((unsub) => unsub());
    };
  }, [fieldNameOrPath, form._formState.formErrors, form.fieldValues, setErrorsFunc, setValueFunc, watchErrors, watchValues]);

  return useMemo(() => {
    return { value: values as any, error: errors as any };
  }, [errors, values]);
};

const filterRecord = (record: Record<string, any>, keyFilter: string) => {
  return Object.keys(record).reduce<FieldGroupErrors>((prev, curr) => {
    if (curr.startsWith(keyFilter) && curr in record) {
      prev[curr] = record[curr] || undefined;
    }
    return prev;
  }, {});
};

import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "../FormContext";
import { FieldError, FieldGroupErrors, FieldRecordTouched, FieldValue, FormContextValue } from "../useForm";
import { flattenObject, getNestedValue } from "../util/misc";

export interface UseWatchOptions {
  watchValues?: boolean;
  watchErrors?: boolean;
  watchTouched?: boolean;
  formContext?: FormContextValue;
  flattenErrorObject?: boolean;
  flattenValidationObject?: boolean;
  flattenTouchedObject?: boolean;
}

export type UseWatchValueValue = FieldValue;
export type UseWatchErrorValue = FieldGroupErrors | FieldError;
export type UseWatchTouchedValue = FieldRecordTouched | boolean;

const flattenIfRequired = (object: Record<string, FieldError | FieldValue>, shouldFlatten?: boolean) => ({
  ...(shouldFlatten ? flattenObject(object) : object),
});

export const useWatch = <T extends FieldValue>(fieldNameOrPath?: string, options?: UseWatchOptions) => {
  const { watchValues, watchErrors, watchTouched, formContext: customFormCtx } = options || {};

  const formContext = useFormContext();
  const form = customFormCtx || formContext;

  const isPath = useMemo(() => fieldNameOrPath?.endsWith("."), [fieldNameOrPath]);
  const [values, setValues] = useState<UseWatchValueValue>(isPath || fieldNameOrPath === undefined ? {} : undefined);
  const [errors, setErrors] = useState<UseWatchErrorValue>(isPath || fieldNameOrPath === undefined ? {} : undefined);
  const [touched, setTouched] = useState<string[] | boolean>(isPath || fieldNameOrPath === undefined ? [] : false); // this is transformed into an object through a proxy

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

  const setTouchedFunc = useCallback(() => {
    if (fieldNameOrPath === undefined) {
      setTouched(form._formState.fieldsTouched.current);
    } else if (isPath) {
      setTouched(form._formState.fieldsTouched.current.filter((fname) => fname.startsWith(fieldNameOrPath)));
    } else {
      setTouched(form._formState.fieldsTouched.current.includes(fieldNameOrPath));
    }
  }, [fieldNameOrPath, form._formState, isPath]);

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

    if (watchTouched) {
      unsubFuncs.push(
        form._formState.fieldsTouched.observe(() => {
          setTouchedFunc();
        }, fieldNameOrPath)
      );
    }

    return () => {
      unsubFuncs.forEach((unsub) => unsub());
    };
  }, [
    fieldNameOrPath,
    form._formState.fieldsTouched,
    form._formState.formErrors,
    form.fieldValues,
    setErrorsFunc,
    setTouchedFunc,
    setValueFunc,
    watchErrors,
    watchTouched,
    watchValues,
  ]);

  return useMemo(() => {
    return { value: values as T, error: errors, touched: touchedProxy(touched) };
  }, [errors, touched, values]);
};

const filterRecord = (record: Record<string, any>, keyFilter: string) => {
  return Object.keys(record).reduce<FieldGroupErrors>((prev, curr) => {
    if (curr.startsWith(keyFilter) && curr in record) {
      prev[curr] = record[curr] || undefined;
    }
    return prev;
  }, {});
};

const touchedProxy = (touched: string[] | boolean): UseWatchTouchedValue => {
  if (typeof touched === "boolean") return touched;

  return new Proxy(
    touched.reduce<Record<string, boolean>>((p, n) => ((p[n] = true), p), {}),
    {
      get(_, key) {
        return typeof key === "string" ? touched.includes(key) : false;
      },
    }
  );
};

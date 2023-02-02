import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "../FormContext";
import { FieldGroupValues, FieldValue, FieldValuePrimitive, FormContextValue, FormNativeField } from "../useForm";

export type RegisterFieldEvent = (field: FormNativeField) => () => void;
export type RegisterPathFieldsEvents = (fields: FormNativeField[]) => () => void;

export const useWatchV1 = <T extends FieldGroupValues | FieldValuePrimitive>(
  fieldNameOrPath?: string,
  customFormCtx?: FormContextValue
) => {
  const formContext = useFormContext();
  const form = customFormCtx || formContext;

  const [value, setValue] = useState<FieldValue>();

  const isPath = useMemo(() => fieldNameOrPath?.endsWith("."), [fieldNameOrPath]);

  const setValueFunc = useCallback(() => {
    if (fieldNameOrPath === undefined) {
      return form.fieldValues.current;
    } else if (isPath) {
      setValue(
        Object.keys(form.fieldValues.current).reduce<Record<string, FieldValue>>((prev, curr) => {
          if (curr.startsWith(fieldNameOrPath)) {
            prev[curr] = form.fieldValues.current[curr];
          }
          return prev;
        }, {})
      );
    } else {
      setValue(form.fieldValues.current[fieldNameOrPath]);
    }
  }, [fieldNameOrPath, form.fieldValues, isPath]);

  useEffect(() => {
    setValueFunc();

    const unsub = form.fieldValues.observe(() => {
      setValueFunc();
    }, fieldNameOrPath);

    return () => unsub();
  }, [fieldNameOrPath, form.fieldValues, setValueFunc]);

  // "as T" is a typescript helper
  // it is not guaranteed value is actually of type T
  return value as T;
};

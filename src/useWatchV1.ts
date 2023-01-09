import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "./FormContext";
import { FieldGroupValues, FieldValue, FieldValuePrimitive, FormContextValue, HTMLFormField } from "./useForm";

export type RegisterFieldEvent = (field: HTMLFormField) => () => void;
export type RegisterPathFieldsEvents = (fields: HTMLFormField[]) => () => void;

// TODO: useTransition + optimize registerSingleFieldEvent()

export const useWatchV1 = <T extends FieldGroupValues | FieldValuePrimitive>(
  fieldNameOrPath: string,
  customFormCtx?: FormContextValue
) => {
  const formContext = useFormContext();
  const form = customFormCtx || formContext;

  const [value, setValue] = useState<FieldValue>();

  const isPath = useMemo(() => fieldNameOrPath.endsWith("."), [fieldNameOrPath]);

  useEffect(() => {
    setValue(form.fieldValues.current[fieldNameOrPath]);

    if (isPath) {
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

    const unsub = form.fieldValues.observe((fValues) => {
      if (isPath) {
        setValue(
          Object.keys(fValues).reduce<Record<string, FieldValue>>((prev, curr) => {
            if (curr.startsWith(fieldNameOrPath)) {
              prev[curr] = fValues[curr];
            }
            return prev;
          }, {})
        );
      } else {
        setValue(fValues[fieldNameOrPath]);
      }
    }, fieldNameOrPath);

    return () => unsub();
  }, [fieldNameOrPath, form.fieldValues, isPath]);

  // "as T" is a typescript helper
  // it is not guaranteed value is actually of type T
  return value as T;
};

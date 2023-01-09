import { useEffect, useState } from "react";
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

  useEffect(() => {
    setValue(form.fieldValues.current[fieldNameOrPath]);
    form.fieldValues.observe((value) => {
      setValue(value[fieldNameOrPath]);
    }, fieldNameOrPath);
  }, [fieldNameOrPath, form.fieldValues]);

  // "as T" is a typescript helper
  // it is not guaranteed value is actually of type T
  return value as T;
};

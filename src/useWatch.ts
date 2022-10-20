import { useEffect, useRef, useState } from "react";
import { useFormContext } from "./FormContext";
import { getCheckboxValue, getFieldValue, isCheckboxField, isRadioField } from "./getFieldValue";
import { FieldValue, HTMLFormFieldElement } from "./useForm";
import { useGetValue } from "./useGetValue";
import { formSelector } from "./util";

// input vs change events
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event

export const useWatch = (fieldName: string) => {
  const form = useFormContext();

  const fields = useRef<HTMLFormFieldElement[]>([]);

  useEffect(() => {
    fields.current = Array.from(
      document.querySelectorAll(`${formSelector(form.formId)} [name=${fieldName}]`)
    ) as HTMLFormFieldElement[];
  }, [fieldName, form.formId]);

  const [value, setValue] = useState<FieldValue>();

  const getValue = useGetValue(form.formId);

  useEffect(() => {
    if (!fields.current.length) {
      return () => undefined;
    }
    const fieldValue = getValue(fieldName);

    if (isCheckboxField(fields.current)) {
      const cb = (e: Event) => {
        setValue(getCheckboxValue(e.currentTarget as HTMLInputElement));
      };
      fields.current[0].addEventListener("change", cb);
      setValue(fieldValue);

      return () => {
        fields.current[0].removeEventListener("change", cb);
      };
    }
    if (isRadioField(fields.current)) {
      const cb = (e: Event) => {
        if ((e.currentTarget as HTMLInputElement).checked) {
          setValue((e.currentTarget as HTMLInputElement).value);
        }
      };
      fields.current.forEach((field) => field.addEventListener("change", cb));
      setValue(fieldValue);

      return () => {
        fields.current.forEach((field) => field.removeEventListener("change", cb));
      };
    }

    const cb = (e: Event) => {
      setValue(getFieldValue(e.currentTarget as HTMLFormFieldElement));
    };
    fields.current[0].addEventListener("input", cb);
    setValue(fieldValue);

    return () => {
      fields.current[0].removeEventListener("input", cb);
    };
  }, [fieldName, fields, getValue]);

  return value;
};

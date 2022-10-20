// support for form elements:
// - input
// - input type checkbox
// - input type radio
// - input type file
// - select
// - textarea

import { useCallback, useMemo, useRef } from "react";
import { isCheckboxField, isRadioField, isValidField } from "./getFieldValue";
import { GetValue, useGetValue } from "./useGetValue";
import { GetValues, useGetValues } from "./useGetValues";
import { useSetValue } from "./useSetValue";

export type HTMLFormFieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
export type FieldValue = string | number | boolean | undefined;
export type FormValues = { [fieldName: string]: FieldValue | FormValues };
export type FormId = string;
export type UseForm = typeof useForm;
export type FormContextValue = {
  fields: HTMLFormFieldElement[];
  formId: FormId;
  getValue: GetValue;
  getValues: GetValues;
  setValue: (fieldName: string, value: FieldValue) => void;
  register: (name: string) => { name: string; ref: any };
  registerForm: () => { id: FormId };
  isDirty: (fieldNames: string | string[]) => boolean;
};
export type FormSchema = { [fieldName: string]: FieldValue | FormValues };

const useForm = (formId: string): FormContextValue => {
  const fields = useRef<HTMLFormFieldElement[]>([]);
  const defaultValues = useRef<Record<string, any>>({});

  const registerRef = useCallback((ref: HTMLFormFieldElement | null, name: string) => {
    if (!ref) {
      // remove element if not in the dom
      fields.current.forEach((field, i) => {
        if (field.name === name && !document.body.contains(field)) {
          fields.current.splice(i, 1);
        }
      });

      // remove value from list of defaultValues
      if (defaultValues.current[name]) delete defaultValues.current[name];

      return;
    }
    const field = fields.current.find((field) => field === ref);
    if (!field) fields.current.push(ref);

    console.dir("selectRef", ref);

    // default values are used to test if field is dirty
    // if the default value is updated, then the isDirty
    // will use the new defaultValue to make the comparison

    if (isCheckboxField([ref])) {
      defaultValues.current[name] = (ref as HTMLInputElement).defaultChecked;
    } else if ((isRadioField([ref]) && !defaultValues.current[name]) || isValidField([ref])) {
      // https://github.com/facebook/react/issues/25294
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      defaultValues.current[name] = ref.defaultValue;
    }
  }, []);

  const register = useCallback(
    (name: string) => {
      return { name, ref: (ref: HTMLFormFieldElement | null) => registerRef(ref, name) };
    },
    [registerRef]
  );

  const registerForm = useCallback(() => ({ id: formId }), [formId]);

  const getValue = useGetValue(formId);
  const getValues = useGetValues(fields, getValue);
  const setValue = useSetValue(formId);

  const dirtyFields = useRef<string[]>([]);
  const isDirty = useCallback(
    (fieldNames: string | string[]): boolean => {
      const fnames = Array.isArray(fieldNames) ? fieldNames : [fieldNames];

      return fnames.reduce((prev, fname) => {
        const isCurrentlyDirty = getValue(fname) !== defaultValues.current[fname];
        console.log(fname, getValue(fname), defaultValues.current);
        if (isCurrentlyDirty) {
          dirtyFields.current = Array.from(new Set([...dirtyFields.current, fname]));
        }
        return dirtyFields.current.includes(fname);
      }, false);
    },
    [getValue]
  );

  return useMemo(
    () => ({ register, registerForm, getValue, getValues, fields: fields.current, formId, setValue, isDirty }),
    [register, registerForm, getValue, getValues, formId, setValue, isDirty]
  );
};

export { useForm };

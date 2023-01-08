// support for form elements:
// - input
// - input type checkbox
// - input type radio
// - input type file
// - select
// - textarea

import { useMemo, useRef } from "react";
import { GetValue, useGetValue } from "./useGetValue";
import { GetValues, useGetValues } from "./useGetValues";
import { IsDirty, useIsDirty } from "./useIsDirty";
import { RegisterField, useRegisterField } from "./useRegisterField";
import { ExecuteSubmit, RegisterForm, useRegisterForm } from "./useRegisterForm";
import { useSetValue } from "./useSetValue";
import { Observable, useObservableRef } from "./useSubscribable/useSubscribable";

export type HTMLFormFieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
export type HTMLFormField = HTMLFormFieldElement[];
export type HTMLFormFieldRecord = Record<string, HTMLFormField>;
export type FieldValuePrimitive = string | string[] | number | number[] | boolean | undefined;
export type FieldGroupValues = { [fieldName: string]: FieldValuePrimitive | FieldGroupValues };
export type FieldValue = FieldValuePrimitive | FieldGroupValues;
export type FormId = string;
export type UseForm = typeof useForm;

/*
  NOTE:
    In order to unify how to handle all inputs internally, a "field" is defined
    as an array of HTMLFormFieldElement with the same name.
*/

export type FormContextValue = {
  fieldElements: Observable<HTMLFormField>;
  formId: FormId;
  getValue: GetValue;
  getValues: GetValues;
  setValue: (fieldName: string, value: FieldValuePrimitive) => void;
  register: RegisterField;
  registerForm: RegisterForm;
  executeSubmit: ExecuteSubmit;
  isDirty: IsDirty;
  /*
  isTouched (low priority)
  ---
  setError
  getError
  clearErrors
  ---
  resetField (refreshes defaultValue + removes dirtyness + removes errors)
  resetForm (resets all fields)
  */
};
export type FormSchema = { [fieldName: string]: FieldValuePrimitive | FieldGroupValues };

const useForm = (formId: string): FormContextValue => {
  const fieldElements = useObservableRef<HTMLFormFieldElement[]>([]);
  const defaultValues = useRef<Record<string, any>>({});

  const register = useRegisterField({ fieldElements, defaultValues }); // fieldElements & defaultValues are mutated inside this function
  const { registerForm, executeSubmit } = useRegisterForm(formId);
  const getValue = useGetValue(formId);
  const getValues = useGetValues(fieldElements, getValue);
  const setValue = useSetValue(formId);
  const isDirty = useIsDirty(defaultValues, getValue, fieldElements);

  return useMemo(
    () => ({ register, registerForm, executeSubmit, getValue, getValues, fieldElements, formId, setValue, isDirty }),
    [register, registerForm, executeSubmit, getValue, getValues, fieldElements, formId, setValue, isDirty]
  );
};

export { useForm };

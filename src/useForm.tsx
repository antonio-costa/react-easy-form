// support for form elements:
// - input
// - input type checkbox
// - input type radio
// - input type file
// - select
// - textarea

import { useEffect, useMemo, useRef } from "react";
import {
  ExecuteSubmit,
  GetValue,
  GetValues,
  IsDirty,
  RegisterField,
  RegisterForm,
  UnregisterField,
  useErrorMethods,
  useGetValue,
  useGetValues,
  useIsDirty,
  useRegisterField,
  useRegisterForm,
  useSetValue,
  useUnregisterField
} from "./formMethodsHooks";
import { Observable, useObservableRef } from "./useObservableRef";

export type FormNativeFieldElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
export type FormNativeField = FormNativeFieldElement[];
export type FormNativeFields = Record<string, FormNativeField>;

export type FormCustomFieldElement<T extends HTMLElement = HTMLElement> = T;
export type FormCustomField<T extends HTMLElement = HTMLElement> = FormCustomFieldElement<T>[];
export type FormCustomFields = Record<string, FormCustomField>;

export type FormFieldElement<T extends HTMLElement = HTMLElement> = FormNativeFieldElement | FormCustomFieldElement<T>;
export type FormField<T extends HTMLElement = HTMLElement> = FormNativeField | FormCustomField<T>;
export type FormFields<T extends HTMLElement = HTMLElement> = Record<string, FormField<T>>;

export type FieldValuePrimitive = string | string[] | number | number[] | boolean | undefined;
export type FieldGroupValues = { [fieldName: string]: FieldValuePrimitive | FieldGroupValues };
export type FieldValue = FieldValuePrimitive | FieldGroupValues;
export type FormId = string;
export type UseForm = typeof useForm;
export type FormFieldValues = Record<string, FieldValue>;

<<<<<<< Updated upstream
=======
export type FieldsNames = string[];
export type FieldsExternallySet = string[];
>>>>>>> Stashed changes
export type FieldsTouched = string[];
export type FieldError = string;
export type FieldGroupErrors = Record<string, FieldError>;
export type FieldValidator = (fieldValue: FieldValue, formData: FormFieldValues) => string | null;
export type FormErrors = FieldGroupErrors;
export type FormValidation = {
  valid: boolean;
  errors: FormErrors;
};
export type FormValidator = (data: FormFieldValues) => FormValidation;

export type CustomFieldCallbacks = {
  setValue?: (value: FieldValuePrimitive) => void;
};
export type FormCustomFieldCallbacks = Record<string, CustomFieldCallbacks>;

/*
  NOTE:
    In order to unify how to handle all inputs internally, a "field" is defined
    as an array of HTMLFormFieldElement with the same name.
*/

export type FormContextValue = {
  fieldValues: Observable<FormFieldValues>;
  formId: FormId;
  getValue: GetValue;
  getValues: GetValues;
  setValue: (fieldName: string, value: FieldValuePrimitive) => void;
  setError: any;
  clearErrors: any;
  register: RegisterField;
  unregister: UnregisterField;
  registerForm: RegisterForm;
  executeSubmit: ExecuteSubmit;
  isDirty: IsDirty;
  _formState: FormInternalState;
  /*
  isTouched (low priority)
  ---
  getError
  ---
  resetField (refreshes defaultValue + removes dirtyness + removes errors)
  resetForm (resets all fields)
  */
};
export type FormInternalState = {
  formId: FormId;
  nativeFieldElements: Observable<FormNativeFields>;
  customFieldElements: Observable<FormCustomFields>;
  customFieldCallbacks: React.MutableRefObject<FormCustomFieldCallbacks>;
  fieldElements: () => FormFields;
  fieldValues: Observable<FormFieldValues>;
  formErrors: Observable<FormErrors>;
  fieldsTouched: Observable<string[]>;
  defaultValues: React.MutableRefObject<Record<string, FieldValuePrimitive>>;
  optionsRef: React.MutableRefObject<UseFormOptions | undefined>;
  fieldsNeverDirty: React.MutableRefObject<FieldsNeverDirty>;
  fieldsExternallySet: React.MutableRefObject<FieldsExternallySet>;
};
export type FormSchema = { [fieldName: string]: FieldValuePrimitive | FieldGroupValues };
export type FormValidationMethod = "onsubmit" | "onblur" | "onchange";
export type FormValidationObject = {
  method?: FormValidationMethod;
  flattenObject?: boolean;
};
export type UseFormOptions = {
  validator?: FormValidator;
  validation?: FormValidationObject;
};
const useForm = (formId: string, options?: UseFormOptions): FormContextValue => {
  const nativeFieldElements = useObservableRef<FormNativeFields>({});
  const customFieldElements = useObservableRef<FormCustomFields>({});
  const customFieldCallbacks = useRef<FormCustomFieldCallbacks>({});
  const fieldValues = useObservableRef<FormFieldValues>({});
  const formErrors = useObservableRef<FormErrors>({});
  const fieldsTouched = useObservableRef<FieldsTouched>([]);
  const fieldsNeverDirty = useRef<FieldsNeverDirty>(options?.neverDirty || []);
  const defaultValues = useRef<Record<string, FieldValuePrimitive>>(flattenedDefaultValues);
  const fieldsExternallySet = useRef<FieldsExternallySet>([]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const formInternalState = useMemo<FormInternalState>(
    () => ({
      nativeFieldElements,
      customFieldElements,
      customFieldCallbacks,
      fieldElements: () => ({ ...nativeFieldElements.current, ...customFieldElements.current }),
      defaultValues,
      fieldValues,
      fieldsTouched,
      formErrors,
      formId,
      optionsRef,
      fieldsNeverDirty,
      fieldsExternallySet,
    }),
    [nativeFieldElements, customFieldElements, fieldValues, fieldsTouched, formErrors, formId]
  );

  const { registerForm, executeSubmit } = useRegisterForm(formInternalState);
  const getValue = useGetValue(formInternalState);
  const getValues = useGetValues(formInternalState);
  const register = useRegisterField(formInternalState);
  const unregister = useUnregisterField(formInternalState);
  const setValue = useSetValue(formInternalState);
  const isDirty = useIsDirty(formInternalState);
  const { setError, clearErrors } = useErrorMethods(formInternalState);

  return useMemo(() => {
    return {
      register,
      registerForm,
      executeSubmit,
      getValue,
      getValues,
      setError,
      clearErrors,
      fieldValues,
      formId,
      setValue,
      isDirty,
      unregister,
      _formState: formInternalState,
    };
  }, [
    register,
    registerForm,
    executeSubmit,
    getValue,
    getValues,
    setError,
    clearErrors,
    fieldValues,
    formId,
    setValue,
    isDirty,
    unregister,
    formInternalState,
  ]);
};

export { useForm };

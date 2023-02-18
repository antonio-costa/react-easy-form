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
  RegisterFieldOptions,
  RegisterForm,
  UnregisterField,
  useErrorMethods,
  useGetValue,
  useGetValues,
  useIsDirty,
  useRegisterField,
  useRegisterForm,
  useSetValue,
  useUnregisterField,
} from "./formMethodsHooks";
import { IsTouched, useIsTouched } from "./formMethodsHooks/useIsTouched";
import { Observable, useObservableRef } from "./useObservableRef";
import { flattenObject } from "./util/misc";

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

export type FieldsNames = string[];
export type FieldsExternallySet = string[];
export type FieldsTouched = string[];
export type FieldsNeverDirty = string[];
export type FieldsRegisterOptions = Record<string, RegisterFieldOptions>;
export type FieldRecordTouched = Record<string, boolean>;
export type FieldError = string;
export type FieldGroupErrors = Record<string, FieldError>;
export type FieldValidator = (fieldValue: FieldValue, formData: FormFieldValues) => string | null;
export type FormErrors = FieldGroupErrors;
export type FormValidation = {
  valid: boolean;
  errors: FormErrors;
};

// export type FormMapper = (data: FormFieldValues) => FormFieldValues;

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
  isTouched: IsTouched;
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
  fieldsNames: () => FieldsNames;
  fieldElements: () => FormFields;
  fieldValues: Observable<FormFieldValues>;
  formErrors: Observable<FormErrors>;
  fieldsTouched: Observable<string[]>;
  defaultValues: React.MutableRefObject<Record<string, FieldValuePrimitive>>;
  optionsRef: React.MutableRefObject<UseFormOptionsRef>;
  fieldsNeverDirty: React.MutableRefObject<FieldsNeverDirty>;
  fieldsExternallySet: React.MutableRefObject<FieldsExternallySet>;
  fieldsRegisterOptions: React.MutableRefObject<FieldsRegisterOptions>;
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
  defaultValues?: FieldGroupValues;
  neverDirty?: FieldsNeverDirty;
};
export type UseFormOptionsRef = UseFormOptions & {
  flattenedDefaultValues?: Record<string, FieldValuePrimitive>;
};

const generateUseFormOptionsRef = (options?: UseFormOptions): UseFormOptionsRef => ({
  defaultValues: options?.defaultValues || {},
  neverDirty: [],
  flattenedDefaultValues: flattenObject(options?.defaultValues || {}),
  ...options,
});

const useForm = (formId: string, options?: UseFormOptions): FormContextValue => {
  const optionsRef = useRef<UseFormOptionsRef>(generateUseFormOptionsRef(options)); // avoid re-renders when changing options
  const nativeFieldElements = useObservableRef<FormNativeFields>({});
  const customFieldElements = useObservableRef<FormCustomFields>({});
  const customFieldCallbacks = useRef<FormCustomFieldCallbacks>({});
  const fieldValues = useObservableRef<FormFieldValues>({ ...(options?.defaultValues || {}) });
  const formErrors = useObservableRef<FormErrors>({});
  const fieldsTouched = useObservableRef<FieldsTouched>([]);
  const fieldsNeverDirty = useRef<FieldsNeverDirty>(options?.neverDirty || []);
  const defaultValues = useRef<Record<string, FieldValuePrimitive>>({});
  const fieldsExternallySet = useRef<FieldsExternallySet>([]);
  const fieldOptions = useRef<FieldsRegisterOptions>({});

  useEffect(() => {
    optionsRef.current = generateUseFormOptionsRef(options);
  }, [options]);

  const formInternalState = useMemo<FormInternalState>(
    () => ({
      nativeFieldElements,
      customFieldElements,
      customFieldCallbacks,
      fieldsNames: () =>
        Array.from(
          new Set([
            ...Object.keys(nativeFieldElements.current),
            ...Object.keys(customFieldElements.current),
            ...Object.keys(defaultValues.current),
            ...Object.keys(optionsRef.current.flattenedDefaultValues || {}),
          ])
        ),
      fieldElements: () => ({ ...nativeFieldElements.current, ...customFieldElements.current }),
      defaultValues,
      fieldValues,
      fieldsTouched,
      formErrors,
      formId,
      optionsRef,
      fieldsNeverDirty,
      fieldsExternallySet,
      fieldsRegisterOptions: fieldOptions,
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
  const isTouched = useIsTouched(formInternalState);
  const { setError, clearErrors } = useErrorMethods(formInternalState);

  return useMemo(() => {
    return {
      register,
      registerForm,
      executeSubmit,
      getValue,
      getValues,
      isTouched,
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
    isTouched,
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

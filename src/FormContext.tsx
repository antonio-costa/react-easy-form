import { createContext, useContext } from "react";
import {
  FieldsDOMSyncing,
  FieldsExternallySet,
  FieldsNeverDirty,
  FieldsRegisterOptions,
  FieldsTouched,
  FieldsValidationDependencies,
  FieldValuePrimitive,
  FormContextValue,
  FormCustomFieldCallbacks,
  FormCustomFields,
  FormErrors,
  FormFieldValues,
  FormNativeFields,
  UseFormOptions,
} from "./useForm";
import { Observable } from "./useObservableRef";

const emptyObservable = <T,>(initialValue: T): Observable<T> => ({
  current: initialValue,
  setValue: () => null,
  observe: () => () => null,
});
const emptyRef = <T,>(initialValue: T): React.MutableRefObject<T> => ({
  current: initialValue,
});

const defaultFormContextValue: FormContextValue = {
  fieldValues: emptyObservable<FormFieldValues>({}),
  formId: "",
  getValue: () => undefined,
  getValues: () => ({}),
  register: () => ({ name: "", ref: () => undefined, onChange: () => null, onBlur: () => null }),
  registerForm: () => ({ id: "", onSubmit: () => null }),
  executeSubmit: () => null,
  isDirty: () => false,
  syncDefaultValues: () => null,
  isTouched: () => false,
  setValue: () => null,
  clearValue: () => null,
  unregister: () => null,
  clearErrors: () => null,
  getError: () => undefined,
  setError: () => null,
  getDefaultValue: () => undefined,
  syncDOMValues: () => null,
  getExternalUpdatedValues: () => [],
  updateFormOptions: () => null,
  validate: async () => ({ valid: true, errors: {} }),
  resetForm: () => null,
  _formState: {
    formId: "",
    nativeFieldElements: emptyObservable<FormNativeFields>({}),
    customFieldElements: emptyObservable<FormCustomFields>({}),
    customFieldCallbacks: emptyRef<FormCustomFieldCallbacks>({}),
    fieldElements: () => ({}),
    fieldsNames: () => [],
    fieldValues: emptyObservable<FormFieldValues>({}),
    fieldsTouched: emptyObservable<FieldsTouched>([]),
    fieldsNeverDirty: emptyRef<FieldsNeverDirty>([]),
    formErrors: emptyObservable<FormErrors>({}),
    defaultValues: emptyRef<Record<string, FieldValuePrimitive>>({}),
    optionsRef: emptyRef<UseFormOptions>({}),
    fieldsExternallySet: emptyRef<FieldsExternallySet>([]),
    fieldsRegisterOptions: emptyRef<FieldsRegisterOptions>({}),
    fieldsDOMSyncing: emptyRef<FieldsDOMSyncing>(new Set()),
    fieldsValidationDependencies: emptyRef<FieldsValidationDependencies>(new Map()),
  },
};

export const FormContext = createContext<FormContextValue>(defaultFormContextValue);

export const useFormContext = (formCtx?: FormContextValue) => {
  const closestCtx = useContext(FormContext);

  return formCtx || closestCtx;
};

export interface FormProviderProps {
  value: FormContextValue;
  children?: React.ReactNode;
}
export const FormProvider: React.FC<FormProviderProps> = ({ value, children }) => {
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
};

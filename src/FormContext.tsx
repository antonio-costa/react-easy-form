import { createContext, useContext } from "react";
import {
  FieldsTouched,
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

export const FormContext = createContext<FormContextValue>({
  fieldValues: emptyObservable<FormFieldValues>({}),
  formId: "",
  getValue: () => undefined,
  getValues: () => ({}),
  register: () => ({ name: "", ref: () => undefined, onChange: () => null, onBlur: () => null }),
  registerForm: () => ({ id: "", onSubmit: () => null }),
  executeSubmit: () => null,
  isDirty: () => false,
  setValue: () => null,
  unregister: () => null,
  clearErrors: () => null,
  setError: () => null,
  _formState: {
    formId: "",
    nativeFieldElements: emptyObservable<FormNativeFields>({}),
    customFieldElements: emptyObservable<FormCustomFields>({}),
    customFieldCallbacks: emptyRef<FormCustomFieldCallbacks>({}),
    fieldElements: () => ({}),
    fieldValues: emptyObservable<FormFieldValues>({}),
    fieldsTouched: emptyObservable<FieldsTouched>([]),
    formErrors: emptyObservable<FormErrors>({}),
    defaultValues: emptyRef<Record<string, FieldValuePrimitive>>({}),
    optionsRef: emptyRef<UseFormOptions | undefined>(undefined),
  },
});

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

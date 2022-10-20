import { createContext, useContext } from "react";
import { FormContextValue } from "./useForm";

export const FormContext = createContext<FormContextValue>({
  fields: [],
  formId: "",
  getValue: () => undefined,
  getValues: () => ({}),
  register: () => ({ name: "", ref: () => undefined }),
  registerForm: () => ({ id: "" }),
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

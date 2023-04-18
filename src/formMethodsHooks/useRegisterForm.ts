import { useCallback, useMemo } from "react";
import { FormInternalState, FormValidation } from "../useForm";
import { useValidateForm } from "./useValidateForm";

export type FormHandleSubmit = (validation: Promise<FormValidation>, e?: React.FormEvent<HTMLFormElement>) => void;
export type ExecuteSubmit = (handleExecuteSubmit: FormHandleSubmit) => void;
export type RegisterFormOptions = { handleSubmit?: FormHandleSubmit };
export type UseRegisterForm = (formState: FormInternalState) => { registerForm: RegisterForm; executeSubmit: ExecuteSubmit };
export type RegisterForm = (options?: RegisterFormOptions) => {
  onSubmit?: React.DOMAttributes<HTMLFormElement>["onSubmit"];
};

export const useRegisterForm: UseRegisterForm = (formState) => {
  const validateForm = useValidateForm(formState);
  const { formId } = formState;

  // helper function if you want to submit a form outside the HTML native cycle
  const executeSubmit: ExecuteSubmit = useCallback(
    async (handleExecuteSubmit) => {
      handleExecuteSubmit(validateForm());
    },
    [validateForm]
  );

  // actually register the form and inject the onSubmit event handler
  const registerForm: RegisterForm = useCallback(
    (options) => {
      const onSubmitHandler: ReturnType<RegisterForm>["onSubmit"] = async (e) => {
        // execute validation, if any, and return it as the first argument
        options?.handleSubmit && options.handleSubmit(validateForm(), e);

        // prevent default and return false to avoid native form submission
        // Should this be done on through options?.handleSubmit() instead?
        e.preventDefault();
        return false;
      };

      return { id: formId, onSubmit: onSubmitHandler };
    },
    [formId, validateForm]
  );

  return useMemo(
    () => ({
      executeSubmit,
      registerForm,
    }),
    [executeSubmit, registerForm]
  );
};

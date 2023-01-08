import { useCallback, useMemo } from "react";
import { FormId } from "./useForm";

export type FormValidation = null; // TODO

export type ExecuteSubmit = (handleExecuteSubmit: (validation: FormValidation) => void) => void;
export type FormHandleSubmit = (validation: FormValidation, e: React.FormEvent<HTMLFormElement>) => void;
export type RegisterFormOptions = { handleSubmit?: FormHandleSubmit };
export type UseRegisterForm = (id: FormId) => { registerForm: RegisterForm; executeSubmit: ExecuteSubmit };
export type RegisterForm = (options?: RegisterFormOptions) => {
  id: FormId;
  onSubmit: React.DOMAttributes<HTMLFormElement>["onSubmit"];
};

export const useRegisterForm: UseRegisterForm = (formId) => {
  // executes the form validation
  // TODO
  const executeFormValidation = useCallback((): FormValidation => {
    return null;
  }, []);

  // helper function if you want to submit a form outside the HTML native cycle
  const executeSubmit: ExecuteSubmit = useCallback(
    (handleExecuteSubmit) => {
      handleExecuteSubmit(executeFormValidation());
    },
    [executeFormValidation]
  );

  // actually register the form and inject the onSubmit event handler
  const registerForm: RegisterForm = useCallback(
    (options) => {
      const onSubmitHandler: ReturnType<RegisterForm>["onSubmit"] = (e) => {
        // execute validation, if any, and return it as the first argument
        options?.handleSubmit && options.handleSubmit(executeFormValidation(), e);

        // prevent default and return false to avoid native form submission
        // Should this be done on through options?.handleSubmit() instead?
        e.preventDefault();
        return false;
      };

      return { id: formId, onSubmit: onSubmitHandler };
    },
    [executeFormValidation, formId]
  );

  return useMemo(
    () => ({
      executeSubmit,
      registerForm,
    }),
    [executeSubmit, registerForm]
  );
};

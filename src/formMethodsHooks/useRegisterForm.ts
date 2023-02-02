import { useCallback, useMemo } from "react";
import { FormId, FormInternalState, FormValidation } from "../useForm";
import { useGetValues } from "./useGetValues";

export type ExecuteSubmit = (handleExecuteSubmit: (validation: FormValidation) => void) => void;
export type FormHandleSubmit = (validation: FormValidation, e: React.FormEvent<HTMLFormElement>) => void;
export type RegisterFormOptions = { handleSubmit?: FormHandleSubmit };
export type UseRegisterForm = (formState: FormInternalState) => { registerForm: RegisterForm; executeSubmit: ExecuteSubmit };
export type RegisterForm = (options?: RegisterFormOptions) => {
  id: FormId;
  onSubmit: React.DOMAttributes<HTMLFormElement>["onSubmit"];
};

export const useRegisterForm: UseRegisterForm = (formState) => {
  const getValues = useGetValues(formState);
  const { formId, optionsRef } = formState;

  // executes the form validation
  const executeFormValidation = useCallback((): FormValidation => {
    if (!optionsRef?.current?.validator) return { valid: true, errors: {} };
    const validation = optionsRef.current.validator(
      getValues(undefined, { flattenObject: optionsRef.current.validation?.flattenObject })
    );
    formState.formErrors.setValue(validation.errors);

    return validation;
  }, [formState.formErrors, getValues, optionsRef]);

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

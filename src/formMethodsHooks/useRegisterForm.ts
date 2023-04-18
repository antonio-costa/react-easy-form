import { useCallback, useMemo } from "react";
import { FormErrors, FormInternalState, FormValidation } from "../useForm";
import { useGetValue } from "./useGetValue";
import { useGetValues } from "./useGetValues";

export type FormHandleSubmit = (validation: Promise<FormValidation>, e?: React.FormEvent<HTMLFormElement>) => void;
export type ExecuteSubmit = (handleExecuteSubmit: FormHandleSubmit) => void;
export type RegisterFormOptions = { handleSubmit?: FormHandleSubmit };
export type UseRegisterForm = (formState: FormInternalState) => { registerForm: RegisterForm; executeSubmit: ExecuteSubmit };
export type RegisterForm = (options?: RegisterFormOptions) => {
  onSubmit?: React.DOMAttributes<HTMLFormElement>["onSubmit"];
};
export type ExecuteFormValidation = () => Promise<FormValidation>;

export const useRegisterForm: UseRegisterForm = (formState) => {
  const getValues = useGetValues(formState);
  const getValue = useGetValue(formState);
  const { formId, optionsRef, fieldsRegisterOptions } = formState;

  // executes the form validation
  const executeFormValidation = useCallback<ExecuteFormValidation>(async () => {
    const formValues = getValues();

    let errors: FormErrors = {};

    // validator registered through useForm()
    if (optionsRef?.current?.validator) {
      const validation = await optionsRef.current.validator(formValues);
      errors = { ...errors, ...validation.errors };
    }

    // validators registered through {...form.register()}
    const fieldsRegisterOptionsEntries = Object.entries(fieldsRegisterOptions.current);
    for (let i = 0; i < fieldsRegisterOptionsEntries.length; i++) {
      const fieldName = fieldsRegisterOptionsEntries[i][0];
      const options = fieldsRegisterOptionsEntries[i][1];

      if (options.validator) {
        const fieldError = await options.validator(getValue(fieldName), formValues);
        if (fieldError !== null) {
          errors = { ...errors, [fieldName]: fieldError };
        }
      }
    }

    formState.formErrors.setValue(errors);

    return {
      valid: Object.keys(errors).length > 0,
      errors,
    };
  }, [fieldsRegisterOptions, formState.formErrors, getValue, getValues, optionsRef]);

  // helper function if you want to submit a form outside the HTML native cycle
  const executeSubmit: ExecuteSubmit = useCallback(
    async (handleExecuteSubmit) => {
      handleExecuteSubmit(executeFormValidation());
    },
    [executeFormValidation]
  );

  // actually register the form and inject the onSubmit event handler
  const registerForm: RegisterForm = useCallback(
    (options) => {
      const onSubmitHandler: ReturnType<RegisterForm>["onSubmit"] = async (e) => {
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

import React, { useCallback, useMemo } from "react";
import { useFormContext } from "./FormContext";
import { useGetValue, useGetValues } from "./formMethodsHooks";
import { CustomFieldCallbacks, FieldValidator, FieldValue, FieldValuePrimitive } from "./useForm";
import { nestedKeyExists, setNestedValue } from "./util/misc";

export type CustomFieldControllerOnChangeHandler = (target: { name: string; value: FieldValuePrimitive }) => void;
export type CustomFieldControllerOnBlurHandler = (target: { name: string }) => void;

export interface CustomFieldControllerProps {
  children: (fieldProps: {
    triggerChange: CustomFieldControllerOnChangeHandler;
    triggerBlur: CustomFieldControllerOnBlurHandler;
    ref: (ref: any) => void;
  }) => React.ReactNode;
  name: string;
  defaultValue?: FieldValuePrimitive;
  fieldValidator?: FieldValidator;
  onSetValue?: CustomFieldCallbacks["setValue"];
}
export const CustomFieldController = ({
  children,
  name,
  fieldValidator,
  onSetValue,
  defaultValue,
}: CustomFieldControllerProps) => {
  const form = useFormContext();
  const getValue = useGetValue(form._formState);
  const getValues = useGetValues(form._formState);

  const triggerValidation = useCallback(
    (fielName: string, fieldValidator?: FieldValidator) => {
      // field validator
      const fieldErrorMessage = fieldValidator && fieldValidator(getValue(fielName), getValues());
      if (fieldErrorMessage) {
        return form._formState.formErrors.setValue(
          { ...form._formState.formErrors.current, [fielName]: fieldErrorMessage },
          [fielName]
        );
      }

      // form validator
      if (!form._formState?.optionsRef?.current?.validator) return;
      const validation = form._formState?.optionsRef.current.validator(getValues(fielName));

      if (form._formState.formErrors.current[fielName] !== validation.errors[fielName]) {
        form._formState.formErrors.setValue(
          { ...form._formState.formErrors.current, [fielName]: validation.errors[fielName] },
          [fielName]
        );
      }
    },
    [form._formState.formErrors, form._formState?.optionsRef, getValue, getValues]
  );

  const triggerChange = useCallback<CustomFieldControllerOnChangeHandler>(
    ({ name, value }) => {
      form._formState.fieldValues.setValue(
        (old) => {
          return setNestedValue(old, name, value);
        },
        [name]
      );

      // set the field value
      if (
        !form._formState.fieldsTouched.current.includes(name) &&
        !nestedKeyExists(form._formState.fieldValues.current, name)
      ) {
        form._formState.fieldValues.setValue(
          (old) => {
            const defaultValueDefined = name in form._formState.defaultValues.current;
            return setNestedValue<FieldValue>(
              old,
              name,
              defaultValueDefined ? form._formState.defaultValues.current[name] : undefined
            );
          },
          [name]
        );
      }

      triggerValidation(name, fieldValidator);
    },
    [
      fieldValidator,
      form._formState.defaultValues,
      form._formState.fieldValues,
      form._formState.fieldsTouched,
      triggerValidation,
    ]
  );

  const triggerBlur = useCallback<CustomFieldControllerOnBlurHandler>(
    ({ name }) => {
      if (["onchange", "onblur"].includes(form._formState.optionsRef.current?.validation?.method || ""))
        triggerValidation(name, fieldValidator);
    },
    [fieldValidator, form._formState.optionsRef, triggerValidation]
  );

  const handleRef = useCallback(
    (ref: HTMLElement) => {
      if (!ref) {
        form._formState.customFieldElements.setValue((old) => {
          if (name in old) delete old[name];
          return old;
        });

        if (name in form._formState.customFieldCallbacks.current) {
          delete form._formState.customFieldCallbacks.current[name];
        }
      } else {
        form._formState.customFieldElements.setValue((old) => {
          old[name] = [ref];
          return old;
        });

        form._formState.customFieldCallbacks.current[name] = {
          ...(form._formState.customFieldCallbacks.current[name] || {}),
          setValue: onSetValue,
        };

        // set the default value
        if (!(name in form._formState.defaultValues.current)) {
          form._formState.defaultValues.current[name] = defaultValue;
        }

        if (
          !form._formState.fieldsTouched.current.includes(name) &&
          !nestedKeyExists(form._formState.fieldValues.current, name)
        ) {
          form._formState.fieldValues.setValue(
            (old) => {
              const defaultValueDefined = name in form._formState.defaultValues.current;
              return setNestedValue<FieldValue>(
                old,
                name,
                defaultValueDefined ? form._formState.defaultValues.current[name] : undefined
              );
            },
            [name]
          );
        }
      }

      form;
    },
    [defaultValue, form, name, onSetValue]
  );

  const childreMemoed = useMemo(() => {
    return children({ triggerChange, triggerBlur, ref: handleRef });
  }, [children, handleRef, triggerBlur, triggerChange]);

  return <>{childreMemoed}</>;
};

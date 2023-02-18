import React, { useCallback } from "react";
import { FieldValidator, FieldValue, FormInternalState, FormNativeFieldElement } from "../useForm";
import { isCheckboxField, isRadioField, typifyFieldValue } from "../util/getFieldValue";
import { getNestedValue, nestedKeyExists, setNestedValue } from "../util/misc";
import { useRefreshDefaultValue } from "./useGetDefaultValue";
import { useGetValue } from "./useGetValue";
import { useGetValues } from "./useGetValues";
import { useTouchField } from "./useTouchField";
import { useUpdateExternallySet } from "./useUpdateExternallySet";

export type RegisterFieldOptions<T = FormNativeFieldElement> = {
  defaultSelectOption?: string | string[];
  onChange?: React.ChangeEventHandler<T>;
  onBlur?: React.FocusEventHandler<T>;
  validator?: FieldValidator;
  neverDirty?: boolean;
};

export type RegisterFieldValue<T = FormNativeFieldElement> = {
  name: string;
  ref: any;
  value?: string;
  onChange: React.ChangeEventHandler<T> | undefined;
  onBlur: React.FocusEventHandler<T> | undefined;
};

export type RegisterField = <T = FormNativeFieldElement>(
  name: string,
  options?: RegisterFieldOptions<T>
) => RegisterFieldValue<T>;

export type UseRegisterField = (formState: FormInternalState) => RegisterField;

export const useRegisterField: UseRegisterField = (formState) => {
  const { nativeFieldElements, defaultValues, fieldValues, fieldsRegisterOptions } = formState;

  const getValue = useGetValue(formState);
  const getValues = useGetValues(formState);
  const touchField = useTouchField(formState);
  const updateExternallySet = useUpdateExternallySet(formState);
  const refreshDefaultValue = useRefreshDefaultValue(formState);

  const unregisterRef = useCallback(
    (name: string) => {
      // remove element from fieldElements
      if (!(name in nativeFieldElements.current)) return;

      nativeFieldElements.setValue((old) => {
        if (old[name]) {
          old[name] = old[name].filter((oldEl) => {
            return oldEl.name !== name;
          });
          if (!old[name].length) delete old[name];
        }
        return old;
      });
    },
    [nativeFieldElements]
  );

  const registerRef = useCallback(
    (ref: FormNativeFieldElement | null, name: string, registerOptions?: RegisterFieldOptions) => {
      if (!ref) {
        unregisterRef(name);
        return;
      }

      const field = nativeFieldElements.current[name];

      if (!field) {
        nativeFieldElements.setValue((old) => {
          old[name] = [...(old[name] || []), ref];
          return old;
        });
      }

      // update register options
      if (registerOptions) {
        fieldsRegisterOptions.current[name] = registerOptions;
      }

      // set value
      // TODO: Check if this is actually required
      // if not, delete equalityCheckers.tsx too
      /* const newValue = getFieldValue([ref]);
      if (getValue(name) !== newValue) {
        fieldValues.setValue(
          (old) => {
            return setNestedValue<FieldValue>(old, name, newValue);
          },
          [name]
        );
      } */

      // default values are used to test if field is dirty
      // if the default value is updated, the first value
      // will always be used unless the component was manually
      // unregistered (through form.unregister() function)
      if (!(name in defaultValues.current) || (defaultValues.current[name] === undefined && isRadioField([ref]))) {
        refreshDefaultValue(ref);
      }

      // set the default field values
      if (
        (!formState.fieldsTouched.current.includes(name) && !nestedKeyExists(formState.fieldValues.current, name)) ||
        (isRadioField([ref]) &&
          getNestedValue(formState.fieldValues.current, name) === undefined &&
          formState.defaultValues.current[name] !== undefined)
      ) {
        formState.fieldValues.setValue(
          (old) => {
            return setNestedValue<FieldValue>(old, name, formState.defaultValues.current[name]);
          },
          [name]
        );
      }

      // add to/remove from never dirty, if required
      const neverDirtyIndex = formState.fieldsNeverDirty.current.findIndex((fname) => fname === name);
      if (registerOptions?.neverDirty && neverDirtyIndex === -1) {
        formState.fieldsNeverDirty.current.push(name);
      } else if (!registerOptions?.neverDirty && neverDirtyIndex !== -1) {
        formState.fieldsNeverDirty.current.splice(neverDirtyIndex, 1);
      }
    },
    [
      defaultValues,
      fieldsRegisterOptions,
      formState.defaultValues,
      formState.fieldValues,
      formState.fieldsNeverDirty,
      formState.fieldsTouched,
      nativeFieldElements,
      refreshDefaultValue,
      unregisterRef,
    ]
  );
  const triggerValidation = useCallback(
    (fielName: string, fieldValidator?: FieldValidator) => {
      // field validator
      const fieldErrorMessage = fieldValidator && fieldValidator(getValue(fielName), getValues());
      if (fieldErrorMessage) {
        return formState.formErrors.setValue({ ...formState.formErrors.current, [fielName]: fieldErrorMessage }, [fielName]);
      }

      // form validator
      if (!formState?.optionsRef?.current?.validator) return;
      const validation = formState?.optionsRef.current.validator(getValues(fielName));

      if (formState.formErrors.current[fielName] !== validation.errors[fielName]) {
        formState.formErrors.setValue({ ...formState.formErrors.current, [fielName]: validation.errors[fielName] }, [
          fielName,
        ]);
      }
    },
    [formState.formErrors, formState?.optionsRef, getValue, getValues]
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<FormNativeFieldElement>, fieldValidator?: FieldValidator) => {
      fieldValues.setValue(
        (old) => {
          const name = e.currentTarget.name;
          const value = (() => {
            const field = [e.currentTarget];
            if (isCheckboxField(field)) {
              return (e.currentTarget as HTMLInputElement).checked;
            }
            if (isRadioField(field) && (field[0] as HTMLInputElement).checked) {
              return (e.currentTarget as HTMLInputElement).value;
            }
            return typifyFieldValue(field[0].value, field[0].type);
          })();
          return setNestedValue(old, name, value);
        },
        [e.currentTarget.name]
      );

      updateExternallySet(e.currentTarget.name, false);

      if (formState.optionsRef.current?.validation?.method === "onchange") {
        triggerValidation(e.currentTarget.name, fieldValidator);
      }

      // touch field if not already
      touchField(e.currentTarget.name);
    },
    [fieldValues, formState.optionsRef, touchField, triggerValidation, updateExternallySet]
  );

  const onBlur = useCallback(
    (e: React.FocusEvent<FormNativeFieldElement>, fieldValidator?: FieldValidator) => {
      if (["onchange", "onblur"].includes(formState.optionsRef.current?.validation?.method || "")) {
        triggerValidation(e.currentTarget.name, fieldValidator);
      }

      // touch field if not already
      touchField(e.currentTarget.name);
    },
    [formState.optionsRef, touchField, triggerValidation]
  );

  return useCallback(
    (name, options) => {
      // due to standardization concerns, the form.register() function should be able to be used
      // on CustomFieldControllers. However, these fields have their own registration process
      // which ignores the above one.
      // As such we are manually type checking if the form.register() was done on a native input type
      // and if not, ignore the execution of the respective event functions
      return {
        name,
        ref: (ref: FormNativeFieldElement | null) => {
          if (isNativeFieldElement(ref)) {
            // we will force options here to be RegisterFieldOptions<FormNativeFieldElement>
            // because we've checked that ref is of FormNativeFieldElement type
            registerRef(ref, name, options as RegisterFieldOptions<FormNativeFieldElement>);
          } else if (ref === null) {
            // if ref is null, then the ref will be unregistered from the nativeFieldElements
            // if this is a CustomFieldController, then this does nothing
            registerRef(ref as null, name);
          }
        },
        onChange: (e) => {
          // if not a "real" onChange event from a "input", "textarea" or "select", then ignore the onChange function
          // because this should refer to a CustomFieldController
          if (isNativeFieldBaseSyntheticEvent(e)) {
            options?.onChange && options?.onChange(e);
            onChange(e, options?.validator);
          }
        },
        onBlur: (e) => {
          // if not a "real" onBlur event from a "input", "textarea" or "select", then ignore the onChange function
          // because this should refer to a CustomFieldController
          if (isNativeFieldBaseSyntheticEvent(e)) {
            options?.onBlur && options?.onBlur(e);
            onBlur(e, options?.validator);
          }
        },
      };
    },
    [onBlur, onChange, registerRef]
  );
};

const isNativeFieldBaseSyntheticEvent = (e: unknown): e is React.BaseSyntheticEvent<FormNativeFieldElement> => {
  return (
    e !== null &&
    Object.prototype.hasOwnProperty.call(e, "currentTarget") &&
    ["input", "textarea", "select"].includes((e as any)?.currentTarget?.tagName?.toLowerCase() || "INVALID-INPUT-TAG")
  );
};

const isNativeFieldElement = (e: unknown): e is FormNativeFieldElement => {
  return e !== null && ["input", "textarea", "select"].includes((e as any)?.tagName?.toLowerCase() || "INVALID-INPUT-TAG");
};

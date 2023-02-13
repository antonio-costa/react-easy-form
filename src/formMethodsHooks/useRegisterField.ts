import React, { useCallback } from "react";
import { FieldValidator, FieldValue, FormInternalState, FormNativeFieldElement } from "../useForm";
import {
  isCheckboxField,
  isRadioField,
  isRangeField,
  isSelectField,
  isValidField,
  typifyFieldValue,
} from "../util/getFieldValue";
import { getNestedValue, nestedKeyExists, setNestedValue } from "../util/misc";
import { useGetValue } from "./useGetValue";
import { useGetValues } from "./useGetValues";
import { useTouchField } from "./useTouchField";
import { useUpdateExternallySet } from "./useUpdateExternallySet";

export type RegisterFieldOptions = {
  defaultSelectOption?: string | string[];
  // radioValue?: string;
  onChange?: React.ChangeEventHandler<FormNativeFieldElement>;
  onBlur?: React.FocusEventHandler<FormNativeFieldElement>;
  validator?: FieldValidator;
  neverDirty?: boolean;
};
export type RegisterFieldValue = {
  name: string;
  ref: any;
  value?: string;
  onChange: React.ChangeEventHandler<FormNativeFieldElement> | undefined;
  onBlur: React.FocusEventHandler<FormNativeFieldElement> | undefined;
};
export type RegisterField = (name: string, options?: RegisterFieldOptions) => RegisterFieldValue;

export type UseRegisterField = (formState: FormInternalState) => RegisterField;
export const useRegisterField: UseRegisterField = (formState) => {
  const { nativeFieldElements, defaultValues, fieldValues } = formState;
  const getValue = useGetValue(formState);
  const getValues = useGetValues(formState);
  const touchField = useTouchField(formState);
  const updateExternallySet = useUpdateExternallySet(formState);

  const unregisterRef = useCallback(
    (name: string) => {
      // remove element from fieldElements
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

      // set value
      const newValue = getValue(name);
      if (getNestedValue(fieldValues.current, name) !== newValue) {
        fieldValues.setValue(
          (old) => {
            return setNestedValue<FieldValue>(old, name, newValue);
          },
          [name]
        );
      }

      // default values are used to test if field is dirty
      // if the default value is updated, the first value
      // will always be used unless the component was manually
      // unregistered (through form.unregister() function)
      if (!(name in defaultValues.current)) {
        if (isCheckboxField([ref])) {
          defaultValues.current[name] = (ref as HTMLInputElement).defaultChecked;
        } else if (isRadioField([ref])) {
          if ((ref as HTMLInputElement).defaultChecked) {
            defaultValues.current[name] = (ref as HTMLInputElement).value;
          }
        } else if (isSelectField([ref])) {
          if (registerOptions?.defaultSelectOption !== undefined) {
            // default value for select is a special case
            // and needs to be defined here.
            // React uses "defaultValue" prop on the <select /> but that prop
            // does not exist on the DOM itself
            if ((ref as HTMLSelectElement).multiple) {
              if (!Array.isArray(registerOptions.defaultSelectOption)) {
                throw new Error(
                  "[react-hook-forms] Default value for a multiple <select /> input must be of type string[]."
                );
              }
              Array.from(ref.querySelectorAll("option")).forEach((option) => {
                if (registerOptions.defaultSelectOption?.includes(option.value)) {
                  option.selected = true;
                } else {
                  option.selected = false;
                }
              });
            } else {
              if (typeof registerOptions.defaultSelectOption !== "string") {
                throw new Error(
                  "[react-hook-forms] Default value for a non-multiple <select /> input must be of type string."
                );
              }
              ref.value = registerOptions.defaultSelectOption;
            }
            defaultValues.current[name] = registerOptions.defaultSelectOption;
          }
        } else if (isRangeField([ref])) {
          const max = Number((ref as HTMLInputElement).max) || 100;
          const min = Number((ref as HTMLInputElement).min) || 0;
          defaultValues.current[name] = Math.round((min + max) / 2);
        } else if (isValidField([ref])) {
          const typedRef = ref as Exclude<FormNativeFieldElement, HTMLSelectElement>;
          defaultValues.current[name] = typifyFieldValue(typedRef.defaultValue, typedRef.type);
        }
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
            const defaultValueDefined = name in formState.defaultValues.current;
            return setNestedValue<FieldValue>(
              old,
              name,
              defaultValueDefined ? formState.defaultValues.current[name] : undefined
            );
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

      // add to fieldNames, if required
      if (!formState.fieldsNames.current.includes(name)) {
        formState.fieldsNames.current.push(name);
      }
    },
    [
      nativeFieldElements,
      getValue,
      fieldValues,
      defaultValues,
      formState.fieldsTouched,
      formState.fieldValues,
      formState.defaultValues,
      formState.fieldsNeverDirty,
      formState.fieldsNames,
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
      const r: RegisterFieldValue = {
        name,
        ref: (ref: FormNativeFieldElement | null) => registerRef(ref, name, options),
        onChange: (e) => {
          options?.onChange && options?.onChange(e);
          onChange(e, options?.validator);
        },
        onBlur: (e) => {
          options?.onBlur && options?.onBlur(e);
          onBlur(e, options?.validator);
        },
      };

      return r;
    },
    [onBlur, onChange, registerRef]
  );
};

import React, { useCallback, useRef } from "react";
import { FieldValidator, FieldValue, FormInternalState, FormNativeFieldElement } from "../useForm";
import { isCheckboxField, isRadioField, isSelectField, typifyFieldValue } from "../util/getFieldValue";
import { getNestedValue, nestedKeyExists, setNestedValue } from "../util/misc";
import { useSyncNativeDefaultValue } from "./useSyncNativeDefaultValue";
import { useTouchField } from "./useTouchField";
import { useTriggerValidation } from "./useTriggerValidation";
import { useUpdateExternallySet } from "./useUpdateExternallySet";

export type RegisterFieldOptions<T = FormNativeFieldElement> = {
  defaultSelectOption?: string | string[];
  onChange?: React.ChangeEventHandler<T>;
  onBlur?: React.FocusEventHandler<T>;
  validator?: FieldValidator;
  neverDirty?: boolean;
  validationDeps?: string[];
};

export type RegisterFieldValue<T = FormNativeFieldElement> = {
  name: string;
  ref: any;
  value?: string;
  onChange: React.ChangeEventHandler<T> | undefined;
  onBlur: React.FocusEventHandler<T> | undefined;
  id?: string;
};

export type RegisterField = <T extends FormNativeFieldElement = FormNativeFieldElement>(
  name: string,
  options?: RegisterFieldOptions<T>
) => RegisterFieldValue<T>;

export type UseRegisterField = (formState: FormInternalState) => RegisterField;

export const useRegisterField: UseRegisterField = (formState) => {
  const {
    nativeFieldElements,
    defaultValues,
    fieldValues,
    fieldsRegisterOptions,
    fieldsDOMSyncing,
    fieldsValidationDependencies,
  } = formState;

  const touchField = useTouchField(formState);
  const updateExternallySet = useUpdateExternallySet(formState);
  const syncNativeDefaultValue = useSyncNativeDefaultValue(formState);
  const triggerValidation = useTriggerValidation(formState);

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

      if (!field || (field[0].type === "radio" && !field.some((el) => el.value === ref.value))) {
        nativeFieldElements.setValue((old) => {
          old[name] = [...(old[name] || []), ref];
          return old;
        });
      }

      // update register options
      if (registerOptions) {
        fieldsRegisterOptions.current[name] = registerOptions;
      }

      // default values are used to test if field is dirty
      // if the default value is updated, the first value
      // will always be used unless the component was manually
      // unregistered (through form.unregister() function)
      if (!(name in defaultValues.current) || (defaultValues.current[name] === undefined && isRadioField([ref]))) {
        syncNativeDefaultValue(ref);
      }

      // set the default field values
      if (
        (!formState.fieldsTouched.current.includes(name) && !nestedKeyExists(formState.fieldValues.current, name)) ||
        (isRadioField([ref]) &&
          getNestedValue(formState.fieldValues.current, name) === undefined &&
          formState.defaultValues.current[name] !== undefined)
      ) {
        formState.fieldValues.setValue(
          setNestedValue<FieldValue>(formState.fieldValues.current, name, formState.defaultValues.current[name]),
          [name]
        );
      }

      // add validation dependencies
      fieldsValidationDependencies.current.set(name, new Set(registerOptions?.validationDeps || []));
    },
    [
      defaultValues,
      fieldsRegisterOptions,
      fieldsValidationDependencies,
      formState.defaultValues,
      formState.fieldValues,
      formState.fieldsTouched,
      nativeFieldElements,
      syncNativeDefaultValue,
      unregisterRef,
    ]
  );

  const onChange = useCallback(
    (e: React.ChangeEvent<FormNativeFieldElement>, name: string) => {
      const onChangeFn = fieldsOptions.current?.[name]?.onChange;

      if (!fieldsDOMSyncing.current.has(name)) {
        onChangeFn && onChangeFn(e as React.ChangeEvent<FormNativeFieldElement>);
      }

      fieldValues.setValue(
        (old) => {
          const value = (() => {
            const field = [e.currentTarget];
            if (isCheckboxField(field)) {
              return (e.currentTarget as HTMLInputElement).checked;
            }
            if (isRadioField(field) && (field[0] as HTMLInputElement).checked) {
              return (e.currentTarget as HTMLInputElement).value;
            }
            if (isSelectField(field) && (field[0] as HTMLSelectElement).multiple) {
              const typedEl = field[0] as HTMLSelectElement;
              const optionsEls = Array.from(typedEl.querySelectorAll<HTMLOptionElement>("option:checked"));
              return optionsEls.map((o) => o.value);
            }
            return typifyFieldValue(field[0].value, field[0].type);
          })();

          return setNestedValue(old, name, value);
        },
        [name]
      );

      updateExternallySet(name, false);

      if (formState.optionsRef.current?.validation?.method === "onchange") {
        triggerValidation(name);
      }

      // touch field if not already
      touchField(name);

      if (fieldsDOMSyncing.current.has(name)) {
        fieldsDOMSyncing.current.delete(name);
      }
    },
    [fieldValues, fieldsDOMSyncing, formState.optionsRef, touchField, triggerValidation, updateExternallySet]
  );

  const onBlur = useCallback(
    (e: React.FocusEvent<FormNativeFieldElement>, name: string) => {
      const onBlurFn = fieldsOptions.current?.[name]?.onBlur;
      onBlurFn && onBlurFn(e as React.FocusEvent<FormNativeFieldElement>);

      if (["onchange", "onblur"].includes(formState.optionsRef.current?.validation?.method || "")) {
        triggerValidation(name);
      }

      // touch field if not already
      touchField(name);
    },
    [formState.optionsRef, touchField, triggerValidation]
  );
  const fieldsOptions = useRef<Record<string, RegisterFieldOptions<FormNativeFieldElement>>>({});
  const fieldsProps = useRef<Record<string, RegisterFieldValue<FormNativeFieldElement>>>({});

  const _ref = useCallback(
    (ref: FormNativeFieldElement | null, name: string) => {
      const neverDirtyIndex = formState.fieldsNeverDirty.current.findIndex((fname) => fname === name);

      if (fieldsOptions.current[name]?.neverDirty && neverDirtyIndex === -1) {
        formState.fieldsNeverDirty.current.push(name);
      } else if (!fieldsOptions.current[name]?.neverDirty && neverDirtyIndex !== -1) {
        formState.fieldsNeverDirty.current.splice(neverDirtyIndex, 1);
      }

      registerRef(ref, name, fieldsOptions.current[name]);
    },
    [formState.fieldsNeverDirty, registerRef]
  );

  const _onChange = useCallback(
    (e: any, name: string) => {
      onChange(e as React.ChangeEvent<FormNativeFieldElement>, name);
    },
    [onChange]
  );

  const _onBlur = useCallback(
    (e: any, name: string) => {
      onBlur(e as React.FocusEvent<FormNativeFieldElement>, name);
    },
    [onBlur]
  );

  return useCallback(
    (name, _options) => {
      fieldsOptions.current[name] = (_options || {}) as RegisterFieldOptions<FormNativeFieldElement>;
      if (!fieldsProps.current[name]) {
        fieldsProps.current[name] = {
          name,
          ref: (r: any) => _ref(r, name),
          onChange: (e) => _onChange(e, name),
          onBlur: (e) => _onBlur(e, name),
          id: `${formState.formId}-fld-${name}`,
        };
      }

      return fieldsProps.current[name];
    },
    [_onBlur, _onChange, _ref, formState.formId]
  );
};

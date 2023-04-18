import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "./FormContext";
import { useTouchField } from "./formMethodsHooks/useTouchField";
import { useTriggerValidation } from "./formMethodsHooks/useTriggerValidation";
import { useUpdateExternallySet } from "./formMethodsHooks/useUpdateExternallySet";
import { CustomFieldCallbacks, FieldValidator, FieldValue, FieldValuePrimitive } from "./useForm";
import { nestedKeyExists, setNestedValue, shallowEqual } from "./util/misc";

export type CustomFieldControllerOnChangeHandler = (target: { name: string; value: FieldValuePrimitive }) => void;
export type CustomFieldControllerOnBlurHandler = (target: { name: string }) => void;

export type CustomFieldControllerChildren = (fieldProps: {
  triggerChange: CustomFieldControllerOnChangeHandler;
  triggerBlur: CustomFieldControllerOnBlurHandler;
  ref: any;
  defaultValue: FieldValuePrimitive;
}) => React.ReactNode;

export interface CustomFieldControllerProps {
  children: CustomFieldControllerChildren;
  defaultValue?: FieldValuePrimitive;
  fieldValidator?: FieldValidator;
  onSetValue?: CustomFieldCallbacks["setValue"];
  name: string;
  neverDirty?: boolean;
  forceUpdateOnSyncDefaultValue?: boolean;
}
export const CustomFieldController = ({
  children,
  name,
  fieldValidator,
  onSetValue,
  defaultValue: defaultValueProp,
  neverDirty,
  forceUpdateOnSyncDefaultValue,
}: CustomFieldControllerProps) => {
  const form = useFormContext();
  const touchField = useTouchField(form._formState);
  const updateExternallySet = useUpdateExternallySet(form._formState);

  const triggerValidation = useTriggerValidation(form._formState);

  const triggerChange = useCallback<CustomFieldControllerOnChangeHandler>(
    ({ name, value }) => {
      const nestedValue = setNestedValue(form._formState.fieldValues.current, name, value);

      form._formState.fieldValues.setValue(() => {
        return nestedValue;
      }, [name]);

      if (["onchange"].includes(form._formState.optionsRef.current?.validation?.method || "")) {
        triggerValidation(name);
      }
      touchField(name);
      updateExternallySet(name, false);
    },
    [form._formState.fieldValues, form._formState.optionsRef, touchField, triggerValidation, updateExternallySet]
  );

  const triggerBlur = useCallback<CustomFieldControllerOnBlurHandler>(
    ({ name }) => {
      if (["onchange", "onblur"].includes(form._formState.optionsRef.current?.validation?.method || "")) {
        triggerValidation(name);
      }
      touchField(name);
    },
    [form._formState.optionsRef, touchField, triggerValidation]
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
          setValue: (value) => {
            triggerValidation(name);
            touchField(name);
            updateExternallySet(name, false);
            onSetValue && onSetValue(value);
          },
        };

        // set the default value
        if (!(name in form._formState.defaultValues.current)) {
          form._formState.defaultValues.current[name] = defaultValueProp;
        }

        if (
          !form._formState.fieldsTouched.current.includes(name) &&
          !nestedKeyExists(form._formState.fieldValues.current, name)
        ) {
          form._formState.fieldValues.setValue(
            setNestedValue<FieldValue>(
              form._formState.fieldValues.current,
              name,
              form._formState.defaultValues.current[name]
            ),
            [name]
          );
        }

        // add to/remove from never dirty, if required
        const neverDirtyIndex = form._formState.fieldsNeverDirty.current.findIndex((fname) => fname === name);
        if (neverDirty && neverDirtyIndex === -1) {
          form._formState.fieldsNeverDirty.current.push(name);
        } else if (!neverDirty && neverDirtyIndex !== -1) {
          form._formState.fieldsNeverDirty.current.splice(neverDirtyIndex, 1);
        }

        // add field validator
        if (fieldValidator && form._formState.fieldsRegisterOptions.current?.[name]?.validator === undefined) {
          form._formState.fieldsRegisterOptions.current[name] = {
            ...(form._formState.fieldsRegisterOptions.current[name] || {}),
            validator: fieldValidator,
          };
        }
      }

      form;
    },
    [
      defaultValueProp,
      fieldValidator,
      form,
      name,
      neverDirty,
      onSetValue,
      touchField,
      triggerValidation,
      updateExternallySet,
    ]
  );

  const [defaultValueStateful, setDefaultValueStateful] = useState(defaultValueProp);

  useEffect(() => {
    if (
      form._formState.customFieldCallbacks.current[name] &&
      (!shallowEqual(form._formState.defaultValues.current[name], defaultValueProp) ||
        form._formState.customFieldCallbacks.current[name]?.syncDefaultValue === undefined)
    ) {
      form._formState.customFieldCallbacks.current[name].syncDefaultValue = () => {
        form._formState.defaultValues.current[name] = defaultValueProp;
        if (forceUpdateOnSyncDefaultValue) setDefaultValueStateful(defaultValueProp);
      };
    }
  }, [
    defaultValueProp,
    forceUpdateOnSyncDefaultValue,
    form._formState.customFieldCallbacks,
    form._formState.defaultValues,
    name,
  ]);

  const childreMemoed = useMemo(() => {
    const defVal =
      name in (form._formState.optionsRef.current?.flattenedDefaultValues || {})
        ? form._formState.optionsRef.current?.flattenedDefaultValues?.[name]
        : defaultValueStateful;
    return children({
      triggerChange,
      triggerBlur,
      ref: handleRef,
      defaultValue: defVal,
    });
  }, [children, defaultValueStateful, form._formState.optionsRef, handleRef, name, triggerBlur, triggerChange]);

  return <>{childreMemoed}</>;
};

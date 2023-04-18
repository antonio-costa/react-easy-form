import { useCallback } from "react";
import { FieldValue, FieldValuePrimitive, FormInternalState } from "../useForm";
import { isCheckboxField, isRadioField, isSelectField, isValidField } from "../util/getFieldValue";
import { formNumericalTypes, setNestedValue } from "../util/misc";
import { useTouchField } from "./useTouchField";
import { useUpdateExternallySet } from "./useUpdateExternallySet";

export type SetValue = (fieldName: string, value: FieldValuePrimitive) => void;
export type UseSetValue = (formState: FormInternalState) => SetValue;

export const useSetValue: UseSetValue = (formState) => {
  const { fieldValues, nativeFieldElements, customFieldElements, customFieldCallbacks } = formState;

  const touchField = useTouchField(formState);
  const updateExternallySet = useUpdateExternallySet(formState);

  return useCallback(
    (fieldName: string, value: FieldValuePrimitive) => {
      const fieldEls = nativeFieldElements.current?.[fieldName] || [];

      if (fieldEls.length) {
        if (isCheckboxField(fieldEls)) {
          if (typeof value === "boolean") {
            (fieldEls[0] as HTMLInputElement).checked = value;
            (fieldEls[0] as HTMLInputElement).dispatchEvent(new Event("change"));

            fieldValues.setValue(
              (old) => {
                return setNestedValue<FieldValue>(old, fieldName, value);
              },
              [fieldName]
            );
            updateExternallySet(fieldName, true);
            touchField(fieldName);
            return;
          } else {
            throw new Error(`Checkbox [${fieldName}] expected boolean but got ${value} (${typeof value})`);
          }
        } else if (isRadioField(fieldEls)) {
          if (typeof value === "string" || typeof value === undefined) {
            (fieldEls as HTMLInputElement[]).forEach((el) => {
              el.checked = el.value === value;

              if (el.checked) {
                fieldValues.setValue(
                  (old) => {
                    return setNestedValue<FieldValue>(old, fieldName, el.value);
                  },
                  [fieldName]
                );
              }

              el.dispatchEvent(new Event("change"));

              updateExternallySet(fieldName, true);
              touchField(fieldName);
              return;
            });
          } else {
            throw new Error(`Radio [${fieldName}] expected string or undefined but got ${value} (${typeof value})`);
          }
        } else if (isSelectField(fieldEls)) {
          const typedEl = fieldEls[0] as HTMLSelectElement;

          if (typedEl.multiple) {
            if (!Array.isArray(value)) {
              throw new Error(`Input [${fieldName}] expected string[] but got ${value} (${typeof value})`);
            } else if (Array.isArray(value) && value.some((v) => typeof v !== "string")) {
              throw new Error(
                `Input [${fieldName}] expected string[] but got ${value.map((v) => `${v} (${typeof v})`).join(",")}`
              );
            }
          } else if (typeof value !== "string") {
            throw new Error(`Input [${fieldName}] expected string but got ${value} (${typeof value})`);
          }

          fieldValues.setValue(
            (old) => {
              return setNestedValue(old, fieldEls[0].name, value);
            },
            [fieldEls[0].name]
          );

          const fValue = typeof value === "number" ? String(value) : (value as string);
          fieldEls[0].value = fValue;

          (fieldEls[0] as HTMLInputElement).dispatchEvent(new Event("input"));

          updateExternallySet(fieldName, true);
          touchField(fieldName);
        } else if (isValidField(fieldEls)) {
          const expectedType = formNumericalTypes.includes(fieldEls[0].type) ? "number" : "string";

          if (typeof value !== expectedType) {
            throw new Error(`Input [${fieldName}] expected ${expectedType} but got ${value} (${typeof value})`);
          }

          fieldValues.setValue(
            (old) => {
              return setNestedValue(old, fieldEls[0].name, value);
            },
            [fieldEls[0].name]
          );

          const fValue = typeof value === "number" ? String(value) : (value as string);
          fieldEls[0].value = fValue;

          (fieldEls[0] as HTMLInputElement).dispatchEvent(new Event("input"));

          updateExternallySet(fieldName, true);
          touchField(fieldName);
          return;
        } else {
          throw new Error(`Could not set value for ${fieldName}.`);
        }
      } else {
        const customFields = customFieldElements.current?.[fieldName] || [];

        if (!customFields.length) return;

        fieldValues.setValue((old) => setNestedValue(old, fieldName, value));

        const setValueCb = customFieldCallbacks.current?.[fieldName]?.setValue;
        if (setValueCb) {
          setValueCb(value);
        }

        updateExternallySet(fieldName, true);
        touchField(fieldName);
        return;
      }
    },
    [customFieldCallbacks, customFieldElements, fieldValues, nativeFieldElements, touchField, updateExternallySet]
  );
};

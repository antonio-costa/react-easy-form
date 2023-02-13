import { useCallback } from "react";
import { FieldValue, FieldValuePrimitive, FormInternalState } from "../useForm";
import { isCheckboxField, isRadioField, isValidField } from "../util/getFieldValue";
import { formNumericalTypes, setNestedValue } from "../util/misc";
import { useTouchField } from "./useTouchField";
import { useUpdateExternallySet } from "./useUpdateExternallySet";

export const useSetValue = (formState: FormInternalState) => {
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
              if (el.name === fieldName) {
                el.checked = true;
                fieldValues.setValue(
                  (old) => {
                    return setNestedValue<FieldValue>(old, fieldName, el.value);
                  },
                  [fieldName]
                );
              } else {
                el.checked = false;
              }

              el.dispatchEvent(new Event("change"));

              updateExternallySet(fieldName, true);
              touchField(fieldName);
              return;
            });
          } else {
            throw new Error(`Radio [${fieldName}] expected string or undefined but got ${value} (${typeof value})`);
          }
        } else if (isValidField(fieldEls)) {
          const expectedType = formNumericalTypes.includes(fieldEls[0].type) ? "number" : "string";

          if (typeof value !== expectedType) {
            throw new Error(`Input [${fieldName}] expected ${expectedType} but got ${value} (${typeof value})`);
          }

          const fValue = typeof value === "number" ? String(value) : (value as string);
          fieldValues.setValue(
            (old) => {
              return setNestedValue(old, fieldEls[0].name, fValue);
            },
            [fieldEls[0].name]
          );

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

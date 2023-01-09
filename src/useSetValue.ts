import { useCallback } from "react";
import { isCheckboxField, isRadioField, isValidField } from "./getFieldValue";
import { FieldValuePrimitive, FormFieldValues, FormId } from "./useForm";
import { Observable } from "./useSubscribable/useSubscribable";
import { formNumericalTypes, getField } from "./util";

export interface UseSetValueProps {
  formId: FormId;
  fieldValues: Observable<FormFieldValues>;
}

export const useSetValue = ({ formId, fieldValues }: UseSetValueProps) => {
  return useCallback(
    (fieldName: string, value: FieldValuePrimitive) => {
      const fieldEls = getField(fieldName, formId);

      if (!fieldEls.length) return;

      if (isCheckboxField(fieldEls)) {
        if (typeof value === "boolean") {
          (fieldEls[0] as HTMLInputElement).checked = value;
          (fieldEls[0] as HTMLInputElement).dispatchEvent(new Event("change"));
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
                  old[fieldName] = el.value;
                  return { ...old };
                },
                [fieldName]
              );
            } else {
              el.checked = false;
            }

            el.dispatchEvent(new Event("change"));
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
            old[fieldEls[0].name] = fValue;
            return { ...old };
          },
          [fieldEls[0].name]
        );

        fieldEls[0].value = fValue;

        (fieldEls[0] as HTMLInputElement).dispatchEvent(new Event("input"));
      } else {
        throw new Error(`Could not set value for ${fieldName}.`);
      }
    },
    [formId]
  );
};

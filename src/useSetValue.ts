import { useCallback } from "react";
import { isCheckboxField, isRadioField, isValidField } from "./getFieldValue";
import { FieldValue, FormId } from "./useForm";
import { formNumericalTypes, getFieldElements } from "./util";

export const useSetValue = (formId: FormId) => {
  return useCallback(
    (fieldName: string, value: FieldValue) => {
      const fieldEls = getFieldElements(fieldName, formId);

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
        fieldEls[0].value = typeof value === "number" ? String(value) : (value as string);
        (fieldEls[0] as HTMLInputElement).dispatchEvent(new Event("input"));
      } else {
        throw new Error(`Could not set value for ${fieldName}.`);
      }
    },
    [formId]
  );
};

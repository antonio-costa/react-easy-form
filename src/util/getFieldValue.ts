import { HTMLInputTypeAttribute } from "react";
import { FieldValuePrimitive, FormField } from "../useForm";
import { formNumericalTypes } from "./misc";

const isRadioField = (refs: FormField): boolean => {
  return refs.every((ref) => ref instanceof HTMLInputElement && ref.type === "radio");
};

const isCheckboxField = (refs: FormField): boolean => {
  if (refs.length !== 1) return false;

  if (!(refs[0] instanceof HTMLInputElement)) return false;
  return refs[0].type === "checkbox";
};

const isSelectField = (refs: FormField): boolean => {
  if (refs.length !== 1) return false;

  return refs[0] instanceof HTMLSelectElement && refs[0].localName === "select";
};

const isRangeField = (refs: FormField): boolean => {
  return refs.every((ref) => ref instanceof HTMLInputElement && ref.type === "range");
};

const isValidField = (refs: FormField): boolean => {
  if (!isRadioField(refs) && refs.length > 1) {
    console.warn(
      `Found multiple (non-radio) fields with the same name. This may cause unexpected behaviour (such as values not being set or unintended values being retrived)`
    );
    return false;
  }

  return true;
};

const getRadioValue = (refs: HTMLInputElement[]): string => {
  return refs.find((ref) => ref.checked)?.value || "";
};

const getCheckboxValue = (ref: HTMLInputElement): boolean => {
  return ref.checked;
};

const getSelectValue = (ref: HTMLSelectElement): string | string[] => {
  return ref.multiple
    ? Array.from(ref.querySelectorAll<HTMLOptionElement>("option:checked")).map((option) => option.value)
    : ref.value;
};

const typifyFieldValue = (value: string, type: HTMLInputTypeAttribute = "text"): FieldValuePrimitive => {
  if (formNumericalTypes.includes(type)) {
    return Number(value);
  }
  return value ?? undefined;
};

export {
  isRadioField,
  isCheckboxField,
  isSelectField,
  isRangeField,
  getRadioValue,
  getCheckboxValue,
  getSelectValue,
  typifyFieldValue,
  isValidField,
};

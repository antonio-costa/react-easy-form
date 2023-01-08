import { HTMLInputTypeAttribute } from "react";
import { FieldValuePrimitive, HTMLFormField } from "./useForm";
import { formNumericalTypes } from "./util";

const isRadioField = (refs: HTMLFormField): boolean => {
  return refs.every((ref) => ref instanceof HTMLInputElement && ref.type === "radio");
};

const isCheckboxField = (refs: HTMLFormField): boolean => {
  if (refs.length !== 1) return false;

  if (!(refs[0] instanceof HTMLInputElement)) return false;
  return refs[0].type === "checkbox";
};

const isSelectField = (refs: HTMLFormField): boolean => {
  if (refs.length !== 1) return false;

  return refs[0] instanceof HTMLSelectElement && refs[0].localName === "select";
};

const isRangeField = (refs: HTMLFormField): boolean => {
  return refs.every((ref) => ref instanceof HTMLInputElement && ref.type === "range");
};

const isValidField = (refs: HTMLFormField): boolean => {
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
    return value ? Number(value) : undefined;
  }
  return value ?? undefined;
};

const getFieldValue = (field: HTMLFormField): FieldValuePrimitive => {
  if (isCheckboxField(field)) {
    return getCheckboxValue(field[0] as HTMLInputElement);
  }
  if (isRadioField(field)) {
    return getRadioValue(field as HTMLInputElement[]);
  }
  if (isSelectField(field)) {
    return getSelectValue(field[0] as HTMLSelectElement);
  }
  return typifyFieldValue(field[0].value, field[0]?.type);
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
  getFieldValue,
};

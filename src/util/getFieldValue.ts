import { HTMLInputTypeAttribute } from "react";
import { FieldValuePrimitive, FormField, FormNativeFieldElement } from "../useForm";
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

const getRadioValue = (refs: HTMLInputElement[], findInDOM?: boolean): string | undefined => {
  if (findInDOM && refs.length > 0) {
    const formElement = refs[0].closest("form");

    if (!formElement) {
      throw new Error("[react-easy-form] Please wrap all inputs in a <form /> element.");
    }

    const formData = new FormData(formElement);
    return (formData.get(refs[0].name) as string | undefined) ?? undefined;
  }
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

const getFieldValue = (refs: FormField) => {
  if (isRadioField(refs)) return getRadioValue(refs as HTMLInputElement[], true);
  if (isCheckboxField(refs)) return getCheckboxValue(refs[0] as HTMLInputElement);
  if (isSelectField(refs)) return getSelectValue(refs[0] as HTMLSelectElement);
  if (isValidField(refs))
    return typifyFieldValue(
      (refs[0] as Exclude<FormNativeFieldElement, HTMLSelectElement>).value,
      (refs[0] as Exclude<FormNativeFieldElement, HTMLSelectElement>).type
    );

  throw new Error("[react-easy-form] Invalid input reference.");
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

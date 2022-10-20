import { FieldValue, HTMLFormFieldElement } from "./useForm";
import { formNumericalTypes } from "./util";

const isRadioField = (refs: HTMLFormFieldElement[]): boolean => {
  return refs.every((ref) => ref instanceof HTMLInputElement && ref.type === "radio");
};

const isCheckboxField = (refs: HTMLFormFieldElement[]): boolean => {
  if (refs.length !== 1) return false;

  if (!(refs[0] instanceof HTMLInputElement)) return false;
  return refs[0].type === "checkbox";
};
const isValidField = (refs: HTMLFormFieldElement[]): boolean => {
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

const getFieldValue = (ref: HTMLFormFieldElement): FieldValue => {
  if (formNumericalTypes.includes(ref.type)) {
    return ref.value ? Number(ref.value) : undefined;
  }
  return ref.value ?? undefined;
};

export { isRadioField, isCheckboxField, getRadioValue, getCheckboxValue, getFieldValue, isValidField };

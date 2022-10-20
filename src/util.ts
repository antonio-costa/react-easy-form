import { HTMLFormFieldElement } from "./useForm";

export const formSelector = (formId?: string) => `form${formId !== "" && formId ? `#${formId}` : ``}`;

export const formNumericalTypes = ["number", "range"];
export const formBooleanTypes = ["checkbox"];

export const getFieldElements = (fieldName: string, formId?: string) =>
  Array.from(document.querySelectorAll(`${formSelector(formId)} [name=${fieldName}]`)) as HTMLFormFieldElement[];

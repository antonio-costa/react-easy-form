import { useEffect, useRef } from "react";
import { HTMLFormField, HTMLFormFieldElement, HTMLFormFieldRecord } from "./useForm";

export const formSelector = (formId?: string) => `form${formId !== "" && formId ? `#${formId}` : ``}`;

export const formNumericalTypes = ["number", "range"];
export const formBooleanTypes = ["checkbox"];

export const getField = (fieldName: string, formId?: string): HTMLFormField =>
  Array.from(document.querySelectorAll<HTMLFormFieldElement>(`${formSelector(formId)} [name=${fieldName}]`));

export const getFieldsRecordFromFieldElements = (fieldElements: HTMLFormFieldElement[]) =>
  fieldElements.reduce<HTMLFormFieldRecord>((prev, curr) => {
    prev[curr.name] = [...(prev[curr.name] || []), curr];
    return prev;
  }, {});

export const shallowEqual = (one: unknown, two: unknown): boolean => {
  if (typeof one !== typeof two) return false;

  const type = typeof one;

  if (type === "object") {
    const oneKeys = Object.keys(one as object);
    const twoKeys = Object.keys(two as object);

    if (oneKeys.length !== twoKeys.length) return false;

    const differentIndex = oneKeys.findIndex((key) => {
      if (!(key in (one as any)) || !(key in (two as any))) return false;

      return (one as any)[key] !== (two as any)[key];
    });

    return differentIndex === -1;
  }

  return one === two;
};

export const arrayRecordShallowEqual = (one: Record<string, any[]>, two: Record<string, any[]>) => {
  const oneKeys = Object.keys(one);
  const twoKeys = Object.keys(two);

  if (oneKeys.length !== twoKeys.length) return false;

  const differentIndex = oneKeys.findIndex((key) => {
    // if value is different, return true
    if (!(key in two)) return true;
    if (one[key].length !== two[key].length) return true;
    if (one[key].findIndex((_, i) => one[key][i] !== two[key][i]) !== -1) return true;
    return false;
  });

  return differentIndex === -1;
};

export const usePrevious = (value: any) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export function dotNotationSetValue(object: any, path: string, value: any) {
  const way = path.replace(/\[/g, ".").replace(/\]/g, "").split(".");
  const last = way.pop();

  if (last === undefined) return object;

  way.reduce(function (o, k, i, kk) {
    return (o[k] = o[k] || (isFinite(i + 1 in kk ? Number(kk[i + 1]) : Number(last)) ? [] : {}));
  }, object)[last] = value;

  return object;
}

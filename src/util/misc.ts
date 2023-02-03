import { useEffect, useRef } from "react";
import { FormFieldElement, FormNativeFieldElement, FormNativeFields } from "../useForm";
import { isRadioField } from "./getFieldValue";

export const formSelector = (formId?: string) => `form${formId !== "" && formId ? `#${formId}` : ``}`;

export const formNumericalTypes = ["number", "range"];
export const formBooleanTypes = ["checkbox"];

export const getFieldsRecordFromFieldElements = (fieldElements: FormNativeFieldElement[]) =>
  fieldElements.reduce<FormNativeFields>((prev, curr) => {
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

export const generateFieldName = (name: string, fieldElement: FormFieldElement) => {
  if (isRadioField([fieldElement])) {
    return `${name}[[[${(fieldElement as HTMLInputElement).value}]]]`;
  }
  return name;
};

export const flattenObject = (obj: Record<string, any>, prefix = "") => {
  return Object.keys(obj).reduce<Record<string, any>>((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (typeof obj[k] === "object") Object.assign(acc, flattenObject(obj[k], pre + k));
    else acc[pre + k] = obj[k];
    return acc;
  }, {});
};

export const setNestedValue = <T = unknown>(object: Record<PropertyKey, any>, key: string, value: T): typeof object => {
  key = trimEndWith(key, ".");

  const keys = key.split(".");

  const reference = [...keys].reduce((prev) => {
    if (keys.length === 1) return prev;
    const newKey = keys.shift();
    if (!newKey) return prev;
    if (!(newKey in prev)) prev[newKey] = {};
    return prev[newKey];
  }, object);

  reference[keys[0]] = value;

  return object;
};

export const deleteNestedValue = (object: Record<PropertyKey, any>, key: string): typeof object => {
  key = trimEndWith(key, ".");

  const keys = key.split(".");

  const reference = [...keys].reduce((prev) => {
    if (keys.length === 1) return prev;
    const newKey = keys.shift();
    if (!newKey) return prev;
    if (!(newKey in prev)) prev[newKey] = {};
    return prev[newKey];
  }, object);

  delete reference[keys[0]];

  return object;
};

export const getNestedValue = (object: Record<PropertyKey, any>, key: string): any => {
  key = trimEndWith(key, ".");

  let retValue = undefined;

  const keys = key.split(".");
  [...keys].reduce((prev) => {
    const newKey = keys.shift();
    if (!newKey) return prev;
    if (!keys.length) {
      retValue = prev?.[newKey];
      return prev;
    }
    if (!(newKey in prev)) return prev;
    return prev[newKey];
  }, object);

  return retValue;
};

export const nestedKeyExists = (object: Record<PropertyKey, any>, key: string): boolean => {
  key = trimEndWith(key, ".");

  let exists = true;

  const keys = key.split(".");
  [...keys].reduce((prev) => {
    const newKey = keys.shift();
    if (!newKey || !(newKey in prev)) {
      exists = false;
      return prev;
    }
    return prev[newKey];
  }, object);

  return exists;
};

export const trimEndWith = (str: string, chars: string) =>
  str.endsWith(chars) ? str.substring(0, str.length - chars.length) : str;

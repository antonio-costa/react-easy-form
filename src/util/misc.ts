import { FieldValuePrimitive } from "../useForm";

export const formNumericalTypes = ["number", "range"];
export const formBooleanTypes = ["checkbox"];

export const shallowEqual = (one: unknown, two: unknown): boolean => {
  if (typeof one !== typeof two) return false;

  const type = typeof one;

  if (type === "object" && one !== null && two !== null) {
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

export const flattenObject = (obj: Record<string, any>, prefix = "") => {
  return Object.keys(obj).reduce<Record<string, any>>((acc, k) => {
    const pre = prefix.length ? prefix + "." : "";
    if (typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k]))
      Object.assign(acc, flattenObject(obj[k], pre + k));
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
    if (typeof prev[newKey] !== "object" && prev[newKey] !== null)
      throw Error("Accessing a key inside an object that does not contain it.");
    return prev[newKey];
  }, object);

  reference[keys[0]] = value;

  return object;
};

export const unflattenObject = (obj: Record<string, any>) => {
  let unflattened: any = {};

  Object.keys(obj).forEach((objKey: string) => {
    unflattened = setNestedValue(unflattened, objKey, obj[objKey]);
  });

  return unflattened;
};

export const deleteNestedKey = (obj: Record<string, any>, key: string, deleteEmptySubObjects = false): typeof obj => {
  const newObj = { ...obj };
  const keys = key.split(".");
  const lastKey = keys.pop()!;
  let currentObj = newObj;
  let parentObj: typeof obj | null = null;
  let parentKey: string | null = null;

  for (const k of keys) {
    if (typeof currentObj[k] !== "object" || currentObj[k] === null) {
      // If a nested property does not exist or is not an object, return the original object
      return obj;
    }
    parentObj = currentObj;
    parentKey = k;
    currentObj[k] = { ...currentObj[k] };
    currentObj = currentObj[k];
  }

  delete currentObj[lastKey];

  if (deleteEmptySubObjects && parentObj && parentKey && Object.keys(currentObj).length === 0) {
    // Check if the parent object is now empty

    // Delete the empty sub-object from the parent object
    delete parentObj[parentKey];
  }

  return newObj;
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

export const bothValuesUndefined = (v1: FieldValuePrimitive, v2: FieldValuePrimitive) =>
  isUndefinedValue(v1) && isUndefinedValue(v2);

export const isUndefinedValue = (v: FieldValuePrimitive) =>
  v === "" || v === 0 || v === undefined || v === null || (Array.isArray(v) && v.length === 0);

type ToArrayReturnType<T> = T extends Array<any> ? Exclude<T[number], undefined> : Exclude<T, undefined>;
export const toArray = <T>(v: T): ToArrayReturnType<T>[] => {
  if (v === undefined) return [] as ToArrayReturnType<T>[];
  return (Array.isArray(v) ? v : [v]) as ToArrayReturnType<T>[];
};
export const customFilter = <Obj extends Record<PropertyKey, any>, CB extends (...args: any) => any>(obj: Obj, cb: CB) => {
  const entries = Object.entries(obj).filter(cb);
  return Object.fromEntries(entries);
};

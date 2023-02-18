export const isEqualArray = (firstArray: Array<any>, secondArray: Array<any>): boolean => {
  if (!(firstArray instanceof Array) || !(secondArray instanceof Array)) return false;
  if (firstArray.length !== secondArray.length) return false;
  for (let i = 0; i !== firstArray.length; i++) {
    if (firstArray[i] !== secondArray[i]) return false;
  }
  return true;
};
export const isObject = (objValue: unknown) => objValue && typeof objValue === "object" && objValue.constructor === Object;
export const isString = (argToTest: unknown): argToTest is string =>
  Object.prototype.toString.call(argToTest) === "[object String]";
export const isNumber = (argToTest: unknown): argToTest is number =>
  Object.prototype.toString.call(argToTest) === "[object Number]";

export const isEqualObject = (firstObject: Record<PropertyKey, any>, secondObject: Record<PropertyKey, any>): boolean => {
  const keysFromTheFirstObject = Object.keys(firstObject);
  const keysFromTheSecondObject = Object.keys(secondObject);

  if (keysFromTheFirstObject.length !== keysFromTheSecondObject.length) return false;

  for (const key of keysFromTheFirstObject) {
    const extractedValueFromTheFirstObject = firstObject[key];
    const extractedValueFromTheSecondObject = secondObject[key];
    if (!isEqual(extractedValueFromTheFirstObject, extractedValueFromTheSecondObject)) {
      return false;
    }
  }
  return true;
};

const isEqualString = <T extends string>(firstString: T, secondString: T) =>
  String(firstString).toLowerCase() === String(secondString).toLowerCase();

const isEqualNumber = <T extends number>(firstNumber: T, secondNumber: T) => Number(firstNumber) === Number(secondNumber);

export const isEqual = <T extends Array<any> | Record<PropertyKey, any> | PropertyKey | any>(args: T, args2: T): boolean => {
  if ((Array.isArray(args) && isObject(args2)) || (isObject(args) && Array.isArray(args))) return false;
  if (Array.isArray(args) && Array.isArray(args2)) return isEqualArray(args, args2);
  if (isObject(args) && isObject(args2))
    return isEqualObject(args as Record<PropertyKey, any>, args2 as Record<PropertyKey, any>);
  if (isString(args) && isString(args2)) return isEqualString(args as string, args2 as string);
  if (isNumber(args) && isNumber(args2)) return isEqualNumber(args as number, args2 as number);
  return (typeof args === typeof args2 && args === args2) || args === args2;
};

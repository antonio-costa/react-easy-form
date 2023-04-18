import { FieldGroupValues, FieldValuePrimitive, FormContextValue } from "../useForm";
import { useWatch, UseWatchSpecific } from "./useWatch";

export type WatchValueOptions = {
  formContext?: FormContextValue;
  flatten?: boolean;
};

export const useWatchValue: UseWatchSpecific<FieldGroupValues, FieldValuePrimitive, WatchValueOptions> = (
  fieldName,
  options
) => {
  return useWatch(fieldName, { flattenValidationObject: options?.flatten, formContext: options?.formContext }).value as any;
};

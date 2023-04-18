import { FieldRecordTouched, FormContextValue } from "../useForm";
import { useWatch, UseWatchSpecific } from "./useWatch";

export type WatchTouchedOptions = {
  formContext?: FormContextValue;
  flatten?: boolean;
};

export const useWatchTouched: UseWatchSpecific<FieldRecordTouched, boolean, WatchTouchedOptions> = (fieldName, options) => {
  return useWatch(fieldName, {
    watchTouched: true,
    watchValues: false,
    flattenTouchedObject: options?.flatten,
    formContext: options?.formContext,
  }).touched as any;
};

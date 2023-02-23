import { FieldValue, FormContextValue } from "../useForm";
import { useWatch } from "./useWatch";

export type WatchTouchedOptions = {
  formContext?: FormContextValue;
  flatten?: boolean;
};

export const useWatchTouched = <T extends FieldValue>(fieldNameOrPath?: string, options?: WatchTouchedOptions) => {
  return useWatch<T>(fieldNameOrPath, {
    watchTouched: true,
    watchValues: false,
    flattenTouchedObject: options?.flatten,
    formContext: options?.formContext,
  }).touched;
};

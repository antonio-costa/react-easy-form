import { FormContextValue } from "../useForm";
import { useWatch, UseWatchErrorValue } from "./useWatch";

export type WatchErrorOptions = {
  formContext?: FormContextValue;
  flatten?: boolean;
};

export const useWatchError = (fieldNameOrPath?: string, options?: WatchErrorOptions): UseWatchErrorValue => {
  return useWatch(fieldNameOrPath, {
    watchErrors: true,
    watchValues: false,
    flattenErrorObject: options?.flatten,
    formContext: options?.formContext,
  }).error;
};

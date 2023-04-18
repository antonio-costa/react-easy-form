import { FieldError, FieldGroupErrors, FormContextValue } from "../useForm";
import { useWatch, UseWatchSpecific } from "./useWatch";

export type WatchErrorOptions = {
  formContext?: FormContextValue;
  flatten?: boolean;
};

export const useWatchError: UseWatchSpecific<FieldGroupErrors, FieldError, WatchErrorOptions> = (
  fieldNameOrPath,
  options
) => {
  return useWatch(fieldNameOrPath, {
    watchErrors: true,
    watchValues: false,
    flattenErrorObject: options?.flatten,
    formContext: options?.formContext,
  }).error as any;
};

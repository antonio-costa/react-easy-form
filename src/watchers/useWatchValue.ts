import { FieldValue, FormContextValue } from "../useForm";
import { useWatch } from "./useWatch";

export type WatchValueOptions = {
  formContext?: FormContextValue;
  flatten?: boolean;
};

export const useWatchValue = <T extends FieldValue>(fieldNameOrPath?: string, options?: WatchValueOptions) => {
  return useWatch<T>(fieldNameOrPath, { flattenValidationObject: options?.flatten, formContext: options?.formContext })
    .value;
};

import { useCallback } from "react";
import { FormInternalState } from "../useForm";

export type GetExternalUpdatedValues = (fieldName: string) => string[];
export type UseGetExternalUpdatedValues = (formState: FormInternalState) => GetExternalUpdatedValues;

export const useGetExternalUpdatedValues: UseGetExternalUpdatedValues = ({
  fieldsExternallySet,
}): GetExternalUpdatedValues => {
  return useCallback(
    (fieldName: string = "") => {
      return fieldsExternallySet.current.filter((fname) => fname.includes(fieldName));
    },
    [fieldsExternallySet]
  );
};

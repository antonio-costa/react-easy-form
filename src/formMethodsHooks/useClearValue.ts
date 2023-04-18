import { useCallback } from "react";
import { FormInternalState } from "../useForm";
import { isCheckboxField, isNumericField, isRadioField, isSelectField } from "../util/getFieldValue";
import { useGetValue } from "./useGetValue";
import { useSetValue } from "./useSetValue";

export type ClearValue = (fieldName: string, triggerValidation?: boolean) => void;
export type UseClearValue = (formState: FormInternalState) => ClearValue;
export const useClearValue: UseClearValue = (formState): ClearValue => {
  const { nativeFieldElements } = formState;
  const getValue = useGetValue(formState);
  const setValue = useSetValue(formState);
  return useCallback(
    (fieldName, triggerValidation) => {
      // IMPLEMENT CUSTOM CONTROLLER

      const field = nativeFieldElements.current[fieldName];

      if (!field) return;

      const clearedValue = (() => {
        if (isNumericField(field[0].type)) return 0;
        if (isCheckboxField(field)) return false;
        if (isRadioField(field) || isSelectField(field)) return undefined;
        return "";
      })();
      if (clearedValue !== getValue(fieldName, true)) {
        setValue(fieldName, clearedValue, triggerValidation);
      }
    },
    [getValue, nativeFieldElements, setValue]
  );
};

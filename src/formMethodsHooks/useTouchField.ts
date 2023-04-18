import { useCallback } from "react";
import { FormInternalState } from "../useForm";
import { useIsDirty } from "./useIsDirty";

export const useTouchField = (formState: FormInternalState) => {
  const isDirty = useIsDirty(formState);
  return useCallback(
    (name: string) => {
      if (!formState.fieldsTouched.current.includes(name) && isDirty(name)) {
        formState.fieldsTouched.setValue(
          (old) => {
            old.push(name);
            return old;
          },
          [name]
        );
      }
    },
    [formState.fieldsTouched, isDirty]
  );
};

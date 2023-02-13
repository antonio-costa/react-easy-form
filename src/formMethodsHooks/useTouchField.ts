import { useCallback } from "react";
import { FormInternalState } from "../useForm";

export const useTouchField = (formState: FormInternalState) => {
  return useCallback(
    (name: string) => {
      if (!formState.fieldsTouched.current.includes(name)) {
        formState.fieldsTouched.setValue(
          (old) => {
            old.push(name);
            return old;
          },
          [name]
        );
      }
    },
    [formState.fieldsTouched]
  );
};

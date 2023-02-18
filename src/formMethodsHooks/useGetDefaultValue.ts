import { useCallback } from "react";
import { FormInternalState, FormNativeFieldElement } from "../useForm";
import {
  isCheckboxField,
  isRadioField,
  isRangeField,
  isSelectField,
  isValidField,
  typifyFieldValue,
} from "../util/getFieldValue";

type RefreshDefaultValue = (ref: FormNativeFieldElement) => void;

type UseRefreshDefaultValue = (formState: FormInternalState) => RefreshDefaultValue;

// TODO: REMOVE CODE REPETITION

export const useRefreshDefaultValue: UseRefreshDefaultValue = (formState: FormInternalState) => {
  const { defaultValues, fieldsRegisterOptions, optionsRef } = formState;

  return useCallback(
    (ref: FormNativeFieldElement) => {
      const name = ref.name;
      const registerOptions = fieldsRegisterOptions.current[name];

      const useFormDefaultValues = {
        exists: name in (optionsRef.current?.flattenedDefaultValues || {}),
        type: typeof optionsRef.current?.flattenedDefaultValues?.[name],
        value: optionsRef.current?.flattenedDefaultValues?.[name],
      };

      if (useFormDefaultValues.exists) {
        if (isCheckboxField([ref])) {
          // TODO: CHECK TYPE
          (ref as HTMLInputElement).checked = Boolean(useFormDefaultValues.value);
          defaultValues.current[name] = Boolean(useFormDefaultValues.value);
          return;
        }
        if (isRadioField([ref])) {
          // TODO: CHECK TYPE
          (ref as HTMLInputElement).checked = (ref as HTMLInputElement).value === useFormDefaultValues.value;
          defaultValues.current[name] = (ref as HTMLInputElement).value === useFormDefaultValues.value || undefined;

          return;
        }
        if (isSelectField([ref])) {
          if (registerOptions?.defaultSelectOption !== undefined) {
            // default value for select is a special case
            // and needs to be defined here.
            // React uses "defaultValue" prop on the <select /> but that prop
            // does not exist on the DOM itself
            if ((ref as HTMLSelectElement).multiple) {
              if (!Array.isArray(useFormDefaultValues.value)) {
                throw new Error(
                  "[react-hook-forms] Default value for a multiple <select /> input must be of type string[]."
                );
              }
              Array.from(ref.querySelectorAll("option")).forEach((option) => {
                if (useFormDefaultValues.value === "string") {
                  option.selected = useFormDefaultValues.value.includes(option.value);
                } else {
                  throw new Error(
                    "[react-hook-forms] Default value for a multiple <select /> input must be of type string[]."
                  );
                }
              });
            } else {
              if (typeof useFormDefaultValues.value !== "string") {
                throw new Error(
                  "[react-hook-forms] Default value for a non-multiple <select /> input must be of type string."
                );
              }
              ref.value = useFormDefaultValues.value;
            }
          }
          defaultValues.current[name] = useFormDefaultValues.value;
          return;
        }
        if (isValidField([ref]) || isRangeField([ref])) {
          // TODO: CHECK TYPE
          (ref as HTMLInputElement).value = String(useFormDefaultValues.value || "");
          defaultValues.current[name] = useFormDefaultValues.value;
          return;
        }
      }

      if (isCheckboxField([ref])) {
        defaultValues.current[name] = (ref as HTMLInputElement).defaultChecked;
      } else if (isRadioField([ref])) {
        if ((ref as HTMLInputElement).defaultChecked) {
          defaultValues.current[name] = (ref as HTMLInputElement).value;
        }
      } else if (isSelectField([ref])) {
        if (registerOptions?.defaultSelectOption !== undefined) {
          // default value for select is a special case
          // and needs to be defined here.
          // React uses "defaultValue" prop on the <select /> but that prop
          // does not exist on the DOM itself
          if ((ref as HTMLSelectElement).multiple) {
            if (!Array.isArray(registerOptions.defaultSelectOption)) {
              throw new Error("[react-hook-forms] Default value for a multiple <select /> input must be of type string[].");
            }
            Array.from(ref.querySelectorAll("option")).forEach((option) => {
              if (registerOptions.defaultSelectOption?.includes(option.value)) {
                option.selected = true;
              } else {
                option.selected = false;
              }
            });
          } else {
            if (typeof registerOptions.defaultSelectOption !== "string") {
              throw new Error(
                "[react-hook-forms] Default value for a non-multiple <select /> input must be of type string."
              );
            }
            ref.value = registerOptions.defaultSelectOption;
          }
          defaultValues.current[name] = registerOptions.defaultSelectOption;
        }
      } else if (isRangeField([ref])) {
        const max = Number((ref as HTMLInputElement).max) || 100;
        const min = Number((ref as HTMLInputElement).min) || 0;
        defaultValues.current[name] = Math.round((min + max) / 2);
      } else if (isValidField([ref])) {
        const typedRef = ref as Exclude<FormNativeFieldElement, HTMLSelectElement>;
        defaultValues.current[name] = typifyFieldValue(typedRef.defaultValue, typedRef.type);
      }
    },
    [defaultValues, fieldsRegisterOptions, optionsRef]
  );
};

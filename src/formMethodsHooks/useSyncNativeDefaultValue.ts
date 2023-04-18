import { useCallback } from "react";
import { FieldValuePrimitive, FormInternalState, FormNativeFieldElement } from "../useForm";
import {
  isCheckboxField,
  isRadioField,
  isRangeField,
  isSelectField,
  isValidField,
  typifyFieldValue,
} from "../util/getFieldValue";

type SyncNativeDefaultValue = (ref: FormNativeFieldElement, updateValues?: boolean) => void;

type UseSyncNativeDefaultValue = (formState: FormInternalState) => SyncNativeDefaultValue;

export const useSyncNativeDefaultValue: UseSyncNativeDefaultValue = (formState: FormInternalState) => {
  const { defaultValues, fieldsRegisterOptions, optionsRef } = formState;

  const syncNativeDefaultValue = useCallback(
    (
      ref: FormNativeFieldElement,
      { defaultValue, updateValues }: { defaultValue?: FieldValuePrimitive; updateValues?: boolean }
    ) => {
      const name = ref.name;
      const registerOptions = fieldsRegisterOptions.current[name];

      if (isCheckboxField([ref])) {
        // TODO: CHECK TYPE
        defaultValues.current[name] = Boolean(defaultValue ?? (ref as HTMLInputElement).defaultChecked);

        if (updateValues) {
          (ref as HTMLInputElement).checked = Boolean(defaultValue) ?? (ref as HTMLInputElement).defaultChecked;
        }
        return;
      }

      if (isRadioField([ref])) {
        // TODO: CHECK TYPE
        if (updateValues) {
          (ref as HTMLInputElement).checked = (ref as HTMLInputElement).value === defaultValue;
        }
        if (defaultValue === undefined) {
          if ((ref as HTMLInputElement).defaultChecked) {
            defaultValues.current[name] = (ref as HTMLInputElement).value;
          }
        } else {
          if ((ref as HTMLInputElement).value === defaultValue) {
            defaultValues.current[name] = (ref as HTMLInputElement).value;
          }
        }
        return;
      }

      if (isSelectField([ref])) {
        if (defaultValue) {
          // default value for select is a special case
          // and needs to be defined here.
          // React uses "defaultValue" prop on the <select /> but that prop
          // does not exist on the DOM itself
          if ((ref as HTMLSelectElement).multiple) {
            if (
              !Array.isArray(defaultValue) ||
              (Array.isArray(defaultValue) && defaultValue.some((o) => typeof o !== "string"))
            ) {
              throw new Error("[react-hook-forms] Default value for a multiple <select /> input must be of type string[].");
            }
            const typedDefaultValue = defaultValue as string[];
            Array.from(ref.querySelectorAll("option")).forEach((option) => {
              option.selected = typedDefaultValue.includes(option.value);
            });
            // this is how html select multiple works...
            // the value of the select only returns the first value selected...
            ref.value = typedDefaultValue?.[0] ?? "";
          } else {
            if (typeof defaultValue !== "string") {
              throw new Error(
                "[react-hook-forms] Default value for a non-multiple <select /> input must be of type string."
              );
            }
            Array.from(ref.querySelectorAll("option")).forEach((option) => {
              option.selected = defaultValue === option.value;
            });
            ref.value = defaultValue;
          }

          defaultValues.current[name] = defaultValue;
        } else if (registerOptions?.defaultSelectOption !== undefined) {
          // default value for select is a special case
          // and needs to be defined here.
          // React uses "defaultValue" prop on the <select /> but that prop
          // does not exist on the DOM itself
          if ((ref as HTMLSelectElement).multiple) {
            if (
              !Array.isArray(registerOptions?.defaultSelectOption) ||
              (Array.isArray(registerOptions?.defaultSelectOption) &&
                registerOptions.defaultSelectOption.some((o) => typeof o !== "string"))
            ) {
              throw new Error("[react-hook-forms] Default value for a multiple <select /> input must be of type string[].");
            }
            const typedDefaultValue = registerOptions?.defaultSelectOption as string[];
            Array.from(ref.querySelectorAll("option")).forEach((option) => {
              option.selected = typedDefaultValue.includes(option.value);
            });
            // this is how html select multiple works...
            // the value of the select only returns the first value selected...
            ref.value = typedDefaultValue?.[0] ?? "";
          } else {
            if (typeof registerOptions?.defaultSelectOption !== "string") {
              throw new Error(
                "[react-hook-forms] Default value for a non-multiple <select /> input must be of type string."
              );
            }
            Array.from(ref.querySelectorAll("option")).forEach((option) => {
              option.selected = registerOptions.defaultSelectOption === option.value;
            });
            ref.value = registerOptions.defaultSelectOption;
          }

          defaultValues.current[name] = registerOptions.defaultSelectOption;
        }

        return;
      }

      if (defaultValue) {
        if (isValidField([ref]) || isRangeField([ref])) {
          // TODO: CHECK TYPE
          if (updateValues) (ref as HTMLInputElement).value = String(defaultValue ?? "");
          defaultValues.current[name] = defaultValue;
          return;
        }
      } else {
        if (isRangeField([ref])) {
          const max = Number((ref as HTMLInputElement).max) || 100;
          const min = Number((ref as HTMLInputElement).min) || 0;
          defaultValues.current[name] = Math.round((min + max) / 2);
          return;
        } else if (isValidField([ref])) {
          const typedRef = ref as Exclude<FormNativeFieldElement, HTMLSelectElement>;
          defaultValues.current[name] = typifyFieldValue(typedRef.defaultValue, typedRef.type);
          return;
        }
      }
    },
    [defaultValues, fieldsRegisterOptions]
  );

  return useCallback(
    (ref, updateValues) => {
      const name = ref.name;

      const useFormDefaultValues = {
        exists: name in (optionsRef.current?.flattenedDefaultValues || {}),
        value: optionsRef.current?.flattenedDefaultValues?.[name],
      };

      if (useFormDefaultValues.exists) {
        syncNativeDefaultValue(ref, { defaultValue: useFormDefaultValues.value, updateValues: updateValues ?? true });
      } else {
        syncNativeDefaultValue(ref, { updateValues: updateValues ?? false });
      }
    },
    [optionsRef, syncNativeDefaultValue]
  );
};

import { useCallback } from "react";
import { isCheckboxField, isRadioField, isRangeField, isSelectField, isValidField, typifyFieldValue } from "./getFieldValue";
import { HTMLFormFieldElement } from "./useForm";
import { Observable } from "./useSubscribable/useSubscribable";

export type RegisterFieldOptions = { defaultSelectOption?: string; radioValue?: string };
export type RegisterFieldValue = { name: string; ref: any; value?: string };
export type RegisterField = (name: string, options?: RegisterFieldOptions) => RegisterFieldValue;
export type UseRegisterFieldProps = {
  fieldElements: Observable<HTMLFormFieldElement[]>;
  defaultValues: React.MutableRefObject<Record<string, any>>;
};
export const useRegisterField = ({ fieldElements, defaultValues }: UseRegisterFieldProps): RegisterField => {
  const unregisterRef = useCallback(
    (name: string, registerOptions?: RegisterFieldOptions) => {
      // remove element from fieldElements
      fieldElements.setValue((old) => {
        return old.filter((oldEl) => {
          if (registerOptions?.radioValue === undefined) return oldEl.name !== name;
          return oldEl.name !== name || registerOptions.radioValue !== oldEl.value;
        });
      });

      // remove value from list of defaultValues
      if (defaultValues.current[name]) delete defaultValues.current[name];
    },
    [defaultValues, fieldElements]
  );
  const registerRef = useCallback(
    (ref: HTMLFormFieldElement | null, name: string, registerOptions?: RegisterFieldOptions) => {
      if (!ref) {
        unregisterRef(name, registerOptions);
        return;
      }

      const field = fieldElements.current.find((field) => field === ref);
      if (!field) {
        fieldElements.setValue((old) => {
          return [...old, ref];
        });
      }

      // default values are used to test if field is dirty
      // if the default value is updated, then the isDirty
      // will use the new defaultValue to make the comparison

      if (isCheckboxField([ref])) {
        defaultValues.current[name] = (ref as HTMLInputElement).defaultChecked;
      } else if (isRadioField([ref])) {
        if ((ref as HTMLInputElement).defaultChecked) {
          defaultValues.current[name] = (ref as HTMLInputElement).value;
        }
      } else if (isSelectField([ref])) {
        if (registerOptions?.defaultSelectOption !== undefined) {
          defaultValues.current[name] = registerOptions.defaultSelectOption;
          // default value for select is a special case
          // and needs to be defined here.
          // React uses "defaultValue" prop on the <select /> but that prop
          // does not exist on the DOM itself
          ref.value = registerOptions.defaultSelectOption;
        }
      } else if (isRangeField([ref])) {
        defaultValues.current[name] = Number((ref as HTMLInputElement).min);
      } else if (isValidField([ref])) {
        const typedRef = ref as Exclude<HTMLFormFieldElement, HTMLSelectElement>;
        defaultValues.current[name] = typifyFieldValue(typedRef.defaultValue, typedRef.type);
      }

      // if we are registering a radio button,
      // make sure that it has a radioValue prop
      if (isRadioField([ref])) {
        if (registerOptions?.radioValue === undefined) {
          throw new Error(
            "[react-easy-forms] For radio fields, use radioValue inside of form.register() options instead of 'value' prop."
          );
        }
      } else {
        if (registerOptions?.radioValue !== undefined) {
          throw new Error("[react-easy-forms] Use radioValue only for radio inputs, it will be ignored otherwise.");
        }
      }
    },
    [defaultValues, fieldElements, unregisterRef]
  );

  return useCallback(
    (name, options) => {
      const r: RegisterFieldValue = { name, ref: (ref: HTMLFormFieldElement | null) => registerRef(ref, name, options) };

      if (options?.radioValue) {
        r.value = options.radioValue;
      }

      return r;
    },
    [registerRef]
  );
};

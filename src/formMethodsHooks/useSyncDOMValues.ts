import { useCallback } from "react";
import { FormInternalState } from "../useForm";
import { isCheckboxField, isRadioField, isSelectField, isValidField } from "../util/getFieldValue";
import { toArray } from "../util/misc";
import { useGetValue } from "./useGetValue";

export type SyncDOMValues = (fieldName?: string) => void;
export type UseSyncDOMValues = (formState: FormInternalState) => SyncDOMValues;

export const useSyncDOMValues: UseSyncDOMValues = (formState): SyncDOMValues => {
  const { fieldsNames, fieldsDOMSyncing } = formState;
  const getValue = useGetValue(formState);

  const syncDOMValue = useCallback(
    (fieldName: string) => {
      fieldsDOMSyncing.current.add(fieldName); // this is removed inside the onChange function in useFieldRegister or on setValue

      const formValue = getValue(fieldName);
      const ref = formState.nativeFieldElements?.current?.[fieldName]?.[0];

      if (!ref) {
        fieldsDOMSyncing.current.delete(fieldName);
        return;
      }

      if (isRadioField([ref])) {
        Array.from(document.querySelectorAll<HTMLInputElement>(`input[type=radio][name='${fieldName}']`)).forEach(
          (radio) => {
            radio.checked = formValue === radio.value;
          }
        );
      } else if (isCheckboxField([ref])) {
        (ref as HTMLInputElement).checked = Boolean(formValue);
      } else if (isSelectField([ref])) {
        const formValueArray = toArray(formValue);

        Array.from(ref.querySelectorAll("option")).forEach((option) => {
          option.selected = formValueArray.includes(option.value);
        });
        // this is how html select multiple works...
        // the value of the select only returns the first value selected...
        ref.value = (formValueArray?.[0] as string) ?? "";
      } else if (isValidField([ref])) {
        (ref as HTMLInputElement).value = formValue === undefined ? "" : (formValue as any); // should only accept string but our inputs accept everything...
      }
    },
    [fieldsDOMSyncing, formState.nativeFieldElements, getValue]
  );

  return useCallback(
    (fieldName) => {
      if (fieldName) {
        syncDOMValue(fieldName);
      } else {
        fieldsNames().forEach((fieldName) => {
          syncDOMValue(fieldName);
        });
      }
    },
    [fieldsNames, syncDOMValue]
  );
};

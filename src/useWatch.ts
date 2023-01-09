import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "./FormContext";
import { getFieldValue, isCheckboxField, isRadioField } from "./getFieldValue";
import {
  FieldGroupValues,
  FieldValue,
  FieldValuePrimitive,
  FormContextValue,
  HTMLFormField,
  HTMLFormFieldElement,
  HTMLFormFieldRecord,
} from "./useForm";
import { useGetValue } from "./useGetValue";
import { useGetValues } from "./useGetValues";
import { ObservableObserveCallback } from "./useSubscribable/useSubscribable";
import { arrayRecordShallowEqual, getFieldsRecordFromFieldElements } from "./util";

export type RegisterFieldEvent = (field: HTMLFormField) => () => void;
export type RegisterPathFieldsEvents = (fields: HTMLFormField[]) => () => void;

// TODO: useTransition + optimize registerSingleFieldEvent()

export const useWatch = <T extends FieldGroupValues | FieldValuePrimitive>(
  fieldNameOrPath: string,
  customFormCtx?: FormContextValue
) => {
  const formContext = useFormContext();
  const form = customFormCtx || formContext;

  const getValue = useGetValue(form.formId);
  const getValues = useGetValues(form.fieldElements, getValue);

  const fields = useRef<HTMLFormFieldRecord>({});
  const unsub = useRef<() => void>(() => null);

  const isPath = useMemo(() => fieldNameOrPath.endsWith("."), [fieldNameOrPath]);

  const [value, setValue] = useState<FieldValue>(!isPath ? getValue(fieldNameOrPath) : getValues(fieldNameOrPath));

  const subscribeField = useCallback(
    (field: HTMLFormField): (() => void) => {
      const cb = () => {
        const fieldValue = getFieldValue(field);

        // not using getValue() / getValues() for performance reasons
        if (isPath) {
          setValue((old) => {
            return getValues(fieldNameOrPath); // { ...dotNotationSetValue(old, field[0].name, fieldValue) };
          });
        } else {
          setValue(fieldValue);
        }
      };

      // if checkbox or radio, listen to "change" event and retrieve specific value
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/input_event
      const eventName = isCheckboxField(field) || isRadioField(field) ? "change" : "input";

      const unsubFuncs = field.map((fieldElement) => {
        fieldElement.addEventListener(eventName, cb);

        return () => {
          fieldElement.removeEventListener(eventName, cb);

          /* if (isPath) {
            setValue(getValues(fieldNameOrPath));
          } else {
            setValue(undefined);
          } */
        };
      });

      return () => {
        unsubFuncs.forEach((f) => f());
      };
    },
    [isPath]
  );

  const registerPathFieldsEvents: RegisterPathFieldsEvents = useCallback(
    (fieldsArray) => {
      const unsubFunctions = fieldsArray.map((field) => subscribeField(field));
      return () => {
        unsubFunctions.forEach((f) => f());
      };
    },
    [subscribeField]
  );

  const registerSingleFieldEvent: RegisterFieldEvent = useCallback(
    (field: HTMLFormField) => {
      return subscribeField(field);
    },
    [subscribeField]
  );
  const observeCallback = useCallback<ObservableObserveCallback<HTMLFormFieldElement[]>>(
    (newFieldElements) => {
      const newFields = getFieldsRecordFromFieldElements(
        newFieldElements.filter((field) =>
          isPath ? field.name.startsWith(fieldNameOrPath) : field.name === fieldNameOrPath
        )
      );
      if (!arrayRecordShallowEqual(newFields, fields.current)) {
        unsub.current();
        const newFieldsArray = Object.values(newFields);
        if (newFieldsArray.length) {
          unsub.current = isPath ? registerPathFieldsEvents(newFieldsArray) : registerSingleFieldEvent(newFieldsArray[0]);
        } else {
          unsub.current = () => null;
        }

        fields.current = newFields;
      }
    },
    [fieldNameOrPath, isPath, registerPathFieldsEvents, registerSingleFieldEvent]
  );

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      observeCallback(form.fieldElements.current);
      form.fieldElements.observe(observeCallback);
      isFirstRender.current = false;
    }
  }, [form, form.fieldElements, observeCallback]);

  // "as T" is a typescript helper
  // it is not guaranteed value is actually of type T
  return value as T;
};

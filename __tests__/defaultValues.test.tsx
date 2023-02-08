import { render, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { useForm } from "../src/useForm";
import FormWithInputs, { DefaultValuesPerInputType } from "./components/FormWithInputs";

describe("Undefined default values are properly typed", () => {
  const unassignedDefaultValues: DefaultValuesPerInputType = {
    text: "",
    number: 0,
    range: 50,
    checkbox: false,
    radio: undefined,
    select: undefined,
    textarea: "",
  };

  (Object.keys(unassignedDefaultValues) as (keyof typeof unassignedDefaultValues)[]).forEach((inputType) => {
    test(`input of type "${inputType}" should default to "${
      unassignedDefaultValues[inputType]
    }" (${typeof unassignedDefaultValues[inputType]})`, async () => {
      const {
        result: { current: form },
      } = renderHook(() => useForm("test-form"));
      await render(<FormWithInputs form={form} inputs={{ [inputType]: undefined }} />);
      waitFor(() => expect(form.getValue(`${inputType}-input`)).toBe(unassignedDefaultValues[inputType]));
    });
  });
});

describe("Undefined default values are properly typed", () => {
  const defaultValues: DefaultValuesPerInputType = {
    text: "text input default value",
    number: 100,
    range: 50,
    checkbox: true,
    radio: "second-radio",
    select: "third-option",
    textarea: "textarea default value",
  };

  (Object.keys(defaultValues) as (keyof typeof defaultValues)[]).forEach((inputType) => {
    test(`input of type "${inputType}" should default to "${defaultValues[inputType]}" (${typeof defaultValues[
      inputType
    ]})`, async () => {
      const {
        result: { current: form },
      } = renderHook(() => useForm("test-form"));

      await render(<FormWithInputs form={form} inputs={{ [inputType]: undefined }} />);

      waitFor(() => expect(form.getValue(`${inputType}-input`)).toBe(defaultValues[inputType]));
    });
  });
});

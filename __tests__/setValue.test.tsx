import { fireEvent, render, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { useForm } from "../src/useForm";
import FormWithInputs, { DefaultValuesPerInputType } from "./components/FormWithInputs";

describe("Values are properly assigned after changing input", () => {
  const defaultValues: DefaultValuesPerInputType = {
    text: "text input default value",
    number: 100,
    range: 50,
    checkbox: false,
    radio: "second-radio",
    select: "third-option",
    textarea: "textarea default value",
  };

  const newValues: DefaultValuesPerInputType = {
    text: "text input",
    number: 10,
    range: 0,
    checkbox: true,
    radio: "third-radio",
    select: "second-option",
    textarea: "textarea new value",
  };
  const inputTypes = Object.keys(defaultValues) as (keyof typeof defaultValues)[];

  for (const inputType of inputTypes) {
    test(`new value of "${inputType}-input" should be  "${newValues[inputType]}" (${typeof newValues[
      inputType
    ]})`, async () => {
      const {
        result: { current: form },
      } = renderHook(() => useForm("test-form"));

      const utils = await render(<FormWithInputs form={form} inputs={defaultValues} />);

      const inputs = await utils.getAllByLabelText(`${inputType}-input`);

      if ((inputs[0] as HTMLInputElement)?.type === "checkbox") {
        fireEvent.click(inputs[0]);
      } else if ((inputs[0] as HTMLInputElement)?.type === "radio") {
        (inputs as HTMLInputElement[]).forEach((input) => (input.value === newValues.radio ? fireEvent.click(input) : null));
      } else {
        fireEvent.change(inputs[0], { target: { value: newValues[inputType] } });
      }

      waitFor(() => expect(form.getValue(`${inputType}-input`)).toBe(newValues[inputType]));
    });
  }
});

describe("Use setValue() method", () => {
  const newValues: DefaultValuesPerInputType = {
    text: "text input",
    number: 10,
    range: 0,
    checkbox: true,
    radio: "third-radio",
    select: "second-option",
    textarea: "textarea new value",
  };
  const inputTypes = Object.keys(newValues) as (keyof typeof newValues)[];

  for (const inputType of inputTypes) {
    test(`new value of "${inputType}-input" should be  "${newValues[inputType]}" (${typeof newValues[
      inputType
    ]})`, async () => {
      const {
        result: { current: form },
      } = renderHook(() => useForm("test-form"));

      const utils = await render(<FormWithInputs form={form} inputs={{ [inputType]: undefined }} />);

      form.setValue(`${inputType}-input`, newValues[inputType]);
      const formElement = utils.getByTestId("unit-testing-form") as HTMLFormElement;
      const formData = new FormData(formElement);

      waitFor(() => {
        expect(formData.get(`${inputType}-input`)).toBe("lakwdklmawd");
        expect(form.getValue(`${inputType}-input`)).toBe(newValues[inputType]);
      });
    });
  }
});

describe("Cannot set values with wrong types", () => {
  const inputValues: any = {
    text: 10,
    number: "invalid",
    range: "another invalid",
    checkbox: 0,
    radio: 10,
    select: 100,
    textarea: false,
  };
  const inputTypes = Object.keys(inputValues) as (keyof typeof inputValues)[];

  for (const inputType of inputTypes) {
    const inputName = `${inputType as string}-input`;
    test(`Tried to set value "${inputValues[inputType]}" (${typeof inputValues[
      inputType
    ]}) for "${inputName}" and an error was thrown`, async () => {
      const {
        result: { current: form },
      } = renderHook(() => useForm("test-form"));

      await render(<FormWithInputs form={form} inputs={{ [inputType as string]: undefined }} />);

      await waitFor(() => {
        expect(() => {
          form.setValue(inputName, inputValues[inputType as string]);
        }).toThrow();
      });
    });
  }
});

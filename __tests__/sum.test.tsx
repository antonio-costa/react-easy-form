import { fireEvent, render, renderHook } from "@testing-library/react";
import React from "react";
import { FormContextValue, useForm } from "../src/useForm";

const inputTypes = ["text", "number", "range", "checkbox", "radio", "select", "textarea"] as const;

type DefaultValuesPerInputType = {
  text: string | undefined;
  number: number | undefined;
  range: number | undefined;
  checkbox: boolean | undefined;
  radio: string | undefined;
  select: string | undefined;
  textarea: string | undefined;
};
const renderForm = (form: FormContextValue, defaultValues?: DefaultValuesPerInputType) => {
  return (
    <form {...form.registerForm()}>
      {inputTypes.map((inputType, i) => {
        switch (inputType) {
          case "radio":
            return (
              <div key={`${inputType}-input`}>
                <input
                  aria-label={`${inputType}-input`}
                  type="radio"
                  {...form.register("radio-input")}
                  value="first-radio"
                  defaultChecked={defaultValues?.[inputType] === "first-radio" ? true : undefined}
                />
                <input
                  aria-label={`${inputType}-input`}
                  type="radio"
                  {...form.register("radio-input")}
                  value="second-radio"
                  defaultChecked={defaultValues?.[inputType] === "second-radio" ? true : undefined}
                />
                <input
                  aria-label={`${inputType}-input`}
                  type="radio"
                  {...form.register("radio-input")}
                  value="third-radio"
                  defaultChecked={defaultValues?.[inputType] === "third-radio" ? true : undefined}
                />
              </div>
            );
          case "select":
            return (
              <select
                key={`${inputType}-input`}
                {...form.register("select-input", { defaultSelectOption: defaultValues?.[inputType] || undefined })}
                aria-label={`${inputType}-input`}
              >
                <option value="first-option">First</option>
                <option value="second-option">Second</option>
                <option value="third-option">Third</option>
              </select>
            );
          case "textarea":
            return (
              <textarea
                key={`${inputType}-input`}
                {...form.register("textarea-input")}
                defaultValue={defaultValues?.[inputType] || undefined}
                aria-label={`${inputType}-input`}
              />
            );
          case "checkbox":
            return (
              <input
                key={`${inputType}-input`}
                type="checkbox"
                {...form.register(`${inputType}-input`)}
                aria-label={`${inputType}-input`}
                defaultChecked={defaultValues?.[inputType] || undefined}
              />
            );
          default:
            return (
              <input
                key={`${inputType}-input`}
                type={inputType}
                {...form.register(`${inputType}-input`)}
                aria-label={`${inputType}-input`}
                defaultValue={defaultValues?.[inputType] || undefined}
              />
            );
        }
      })}
    </form>
  );
};

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

  const {
    result: { current: form },
  } = renderHook(() => useForm("test-form"));

  render(renderForm(form));

  (Object.keys(unassignedDefaultValues) as (keyof typeof unassignedDefaultValues)[]).forEach((inputType) => {
    test(`input of type "${inputType}" should default to "${
      unassignedDefaultValues[inputType]
    }" (${typeof unassignedDefaultValues[inputType]})`, () => {
      expect(form.getValue(`${inputType}-input`)).toBe(unassignedDefaultValues[inputType]);
    });
  });
});

describe("Default values are properly assigned", () => {
  const defaultValues: DefaultValuesPerInputType = {
    text: "text input default value",
    number: 100,
    range: 50,
    checkbox: true,
    radio: "second-radio",
    select: "third-option",
    textarea: "textarea default value",
  };

  const {
    result: { current: form },
  } = renderHook(() => useForm("test-form"));

  render(renderForm(form, defaultValues));

  (Object.keys(defaultValues) as (keyof typeof defaultValues)[]).forEach((inputType) => {
    test(`input of type "${inputType}" should default to "${defaultValues[inputType]}" (${typeof defaultValues[
      inputType
    ]})`, () => {
      expect(form.getValue(`${inputType}-input`)).toBe(defaultValues[inputType]);
    });
  });
});

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

      const utils = render(renderForm(form, defaultValues));

      const inputs = await utils.getAllByLabelText(`${inputType}-input`);

      if ((inputs[0] as HTMLInputElement)?.type === "checkbox") {
        fireEvent.click(inputs[0]);
      } else if ((inputs[0] as HTMLInputElement)?.type === "radio") {
        (inputs as HTMLInputElement[]).forEach((input) => (input.value === newValues.radio ? fireEvent.click(input) : null));
      } else {
        fireEvent.change(inputs[0], { target: { value: newValues[inputType] } });
      }
      expect(form.getValue(`${inputType}-input`)).toBe(newValues[inputType]);
    });
  }
});

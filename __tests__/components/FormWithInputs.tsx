import React from "react";
import { FormContextValue, useForm } from "../../src/useForm";

export type DefaultValuesPerInputType = {
  text: string | undefined;
  number: number | undefined;
  range: number | undefined;
  checkbox: boolean | undefined;
  radio: string | undefined;
  select: string | undefined;
  textarea: string | undefined;
};

const FormWithInputs = ({
  inputs,
  form: _form,
}: {
  inputs: Partial<DefaultValuesPerInputType>;
  form?: FormContextValue;
}) => {
  const form = useForm("unit-testing-form") || _form;

  return (
    <form {...form.registerForm()} data-testid="unit-testing-form">
      {(Object.keys(inputs) as (keyof DefaultValuesPerInputType)[]).map((inputType) => {
        switch (inputType) {
          case "radio":
            return (
              <div key={`${inputType}-input`}>
                <input
                  aria-label={`${inputType}-input`}
                  type="radio"
                  {...form.register("radio-input")}
                  value="first-radio"
                  defaultChecked={inputs[inputType] === "first-radio" ? true : undefined}
                />
                <input
                  aria-label={`${inputType}-input`}
                  type="radio"
                  {...form.register("radio-input")}
                  value="second-radio"
                  defaultChecked={inputs[inputType] === "second-radio" ? true : undefined}
                />
                <input
                  aria-label={`${inputType}-input`}
                  type="radio"
                  {...form.register("radio-input")}
                  value="third-radio"
                  defaultChecked={inputs[inputType] === "third-radio" ? true : undefined}
                />
              </div>
            );
          case "select":
            return (
              <select
                key={`${inputType}-input`}
                {...form.register("select-input", { defaultSelectOption: inputs[inputType] || undefined })}
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
                defaultValue={inputs[inputType] || undefined}
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
                defaultChecked={inputs[inputType] || undefined}
              />
            );
          default:
            return (
              <input
                key={`${inputType}-input`}
                type={inputType}
                {...form.register(`${inputType}-input`)}
                aria-label={`${inputType}-input`}
                defaultValue={inputs[inputType] || undefined}
              />
            );
        }
      })}
    </form>
  );
};

export default FormWithInputs;

import { fireEvent, render, renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FieldValuePrimitive, FormContextValue, useForm, UseFormOptions } from "../../src/useForm";
import { CustomInput, CustomInputProps } from "./CustomInput";

export type InputType = "radio" | "checkbox" | "select" | "input" | "custom";

export interface RadioProps {
  name: string;
  defaultValue: string;
  values: string[];
}
export interface CheckboxProps {
  name: string;
  defaultValue: boolean;
  value: string;
}
export interface SelectProps {
  name: string;
  defaultValue: string | string[] | undefined;
  options: [string, string][];
}
export interface InputProps {
  name: string;
  type: string;
  defaultValue: FieldValuePrimitive;
}
export interface TestProps {
  radio: RadioProps[];
  checkbox: CheckboxProps[];
  select: SelectProps[];
  input: InputProps[];
  custom: CustomInputProps[];
}

export const inputComponents = (
  form: FormContextValue,
  { neverDirty }: { neverDirty?: boolean } = { neverDirty: false }
) => ({
  radio(props: RadioProps) {
    return (
      <div key={props.name}>
        {props.values.map((value) => (
          <input
            key={value}
            aria-label={props.name}
            type="radio"
            {...form.register(props.name, { neverDirty })}
            value={value}
            defaultChecked={props.defaultValue === value ? true : undefined}
          />
        ))}
      </div>
    );
  },
  checkbox(props: CheckboxProps) {
    return (
      <div key={props.name}>
        <input
          aria-label={props.name}
          type="checkbox"
          {...form.register(props.name, { neverDirty })}
          value={props.value as string}
          defaultChecked={props.defaultValue as boolean}
        />
      </div>
    );
  },
  select(props: SelectProps) {
    return (
      <div key={props.name}>
        <select
          aria-label={props.name}
          {...form.register(props.name, {
            defaultSelectOption: props.defaultValue,
            neverDirty,
          })}
          multiple={Array.isArray(props.defaultValue)}
        >
          {props.options.map((option) => (
            <option key={option[0]} value={option[0]} aria-label={`${props.name}-option`}>
              {option[1]}
            </option>
          ))}
        </select>
      </div>
    );
  },
  input(props: InputProps) {
    return (
      <div key={props.name}>
        <input
          aria-label={props.name}
          type={props.type}
          {...form.register(props.name, { neverDirty })}
          defaultValue={String(props.defaultValue)}
        />
      </div>
    );
  },
  custom(props: CustomInputProps) {
    return <CustomInput {...props} neverDirty={neverDirty} />;
  },
});

// !!IMPORTANT!!
// 1. all inputs inside defaultInputProps must have the pattern  "<objectKey>-*"
// 2. when updating defaultInputProps, also update changedValuesProps
export const defaultInputsProps: TestProps = {
  radio: [
    { name: "radio-input", defaultValue: "second-radio", values: ["first-radio", "second-radio", "third-radio"] },
    { name: "radio-input1", defaultValue: "second-radio", values: ["first-radio", "second-radio", "third-radio"] },
  ],
  checkbox: [
    { name: "checkbox-input", defaultValue: true, value: "receive-spam-checkbox" },
    { name: "checkbox-input1", defaultValue: false, value: "not-receive-spam-checkbox" },
  ],
  select: [
    {
      name: "select-input",
      defaultValue: "horse",
      options: [
        ["dog", "Dog"],
        ["horse", "Horse"],
        ["cat", "Cat"],
      ],
    },
    {
      name: "select-input1",
      defaultValue: "cat",
      options: [
        ["dog", "Dog"],
        ["horse", "Horse"],
        ["cat", "Cat"],
      ],
    },

    {
      name: "select-input-multiple",
      defaultValue: ["cat"],
      options: [
        ["dog", "Dog"],
        ["horse", "Horse"],
        ["cat", "Cat"],
      ],
    },
  ],
  input: [
    { name: "text-input", defaultValue: "default input text value", type: "text" },
    { name: "grouped.text-input", defaultValue: "default grouped input text value", type: "text" },
    { name: "grouped.text-input1", defaultValue: "default grouped input text1 value", type: "text" },
    { name: "number-input", defaultValue: 875218, type: "number" },
  ],
  custom: [
    {
      name: "custom-input",
      defaultValue: ["test-text"],
    },
    {
      name: "another.custom-input1",
      defaultValue: ["grouped-test"],
    },
  ],
};

export const validDefaultValues = Object.values(defaultInputsProps).reduce(
  (prev, curr) => ({
    ...prev,
    ...curr.reduce((p: any, c: any) => ({ ...p, [c.name]: c.defaultValue }), {} as any),
  }),
  {} as any
);

export const changedDefaultValues: Record<typeof defaultInputsProps[InputType][number]["name"], FieldValuePrimitive> = {
  "radio-input": "third-radio",
  "radio-input1": "first-radio",
  "checkbox-input": false,
  "checkbox-input1": true,
  "select-input": "cat",
  "select-input1": "dog",
  "select-input-multiple": ["dog", "cat"],
  "text-input": "new value",
  "grouped.text-input": "new value",
  "grouped.text-input1": "new value",
  "number-input": 9292,
  "custom-input": ["it works", "because it changed"],
  "another.custom-input1": ["it works", "grouped"],
};

export const invalidDefaultValues: Record<typeof defaultInputsProps[InputType][number]["name"], FieldValuePrimitive> = {
  "radio-input": 10,
  "radio-input1": false,
  "checkbox-input": 0,
  "checkbox-input1": "invalid string",
  "select-input": 10, // invalid option
  "select-input1": false,
  "select-input-multiple": [10, 10],
  "text-input": 2893,
  "grouped.text-input": false,
  "grouped.text-input1": [],
  "number-input": "9292",
  "custom-input": false,
  "another.custom-input1": 0,
};

export const setupFormHook = (formOptions?: UseFormOptions) => {
  const {
    result: { current: form },
  } = renderHook(() => useForm("test-form", formOptions));

  return form;
};

export const changeValueThroughDOM = async (
  props: TestProps[InputType][number],
  utils: ReturnType<typeof render>,
  componentType: InputType
) => {
  if (componentType === "checkbox") {
    const el = await utils.findByLabelText(props.name);
    await fireEvent.click(el);
  } else if (componentType === "radio") {
    const el = ((await utils.findAllByLabelText(props.name)) as HTMLInputElement[]).find(
      (el) => el.value === changedDefaultValues[props.name]
    );

    if (el) {
      await fireEvent.click(el);
    } else {
      fail("input element not found for radio");
    }
  } else if (componentType === "custom") {
    const el = await utils.findByLabelText(props.name);
    const inputEl = el.querySelector("input");
    const buttonEl = el.querySelector("button");
    const deleteButtonEls = Array.from(el.querySelectorAll(".delete-value"));
    if (!inputEl) {
      fail("input element not found for custom field");
    }
    if (!buttonEl) {
      fail("button element not found for custom field");
    }

    if (!deleteButtonEls) {
      fail("delete div element not found for custom field");
    }

    for (let i = 0; i < deleteButtonEls.length; i++) {
      const el = deleteButtonEls[i];
      await fireEvent.click(el);
    }

    const changedValuesPropsCustom = changedDefaultValues[props.name];

    const values = Array.isArray(changedValuesPropsCustom) ? changedValuesPropsCustom : [changedValuesPropsCustom];

    for (let i = 0; i < values.length; i++) {
      const changedValue = values[i];
      await fireEvent.change(inputEl, { target: { value: changedValue } });
      await fireEvent.click(buttonEl);
    }
  } else if (componentType === "select" && Array.isArray(changedDefaultValues[props.name])) {
    const el = await utils.findByLabelText(props.name);
    const optionsSelected = Array.from(el.querySelectorAll("option:checked")) as HTMLOptionElement[];
    await userEvent.deselectOptions(
      el,
      optionsSelected.map((o) => o.value)
    );
    await userEvent.selectOptions(el, changedDefaultValues[props.name] as string[]);
  } else {
    const el = await utils.findByLabelText(props.name);
    await fireEvent.change(el, { target: { value: changedDefaultValues[props.name] } });
  }
};

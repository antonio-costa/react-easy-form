import "@testing-library/jest-dom/extend-expect";
import { render, renderHook } from "@testing-library/react";
import { useForm } from "../src/useForm";
import { CustomInputProps } from "./helpers/CustomInput";
import { CheckboxProps, defaultInputsProps, InputType, setupFormHook, validDefaultValues } from "./helpers/misc";
import { TestInput } from "./helpers/TextInput";

describe("Inline default values are set appropriately", () => {
  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      it(`sets the default value for a ${props.name} input in Forms`, async () => {
        const form = setupFormHook();

        await render(<TestInput form={form} componentType={componentType} props={props} />);
        expect(form.getValue(props.name)).toBe(props.defaultValue);
      });

      it(`sets the default value for a ${props.name} input in DOM`, async () => {
        const form = setupFormHook();

        const utils = await render(<TestInput form={form} componentType={componentType} props={props} />);

        if (componentType === "custom") {
          const el = (await utils.findByLabelText(props.name + "-input-values")) as HTMLFormElement;
          expect(el.textContent).toBe(((props as CustomInputProps)?.defaultValue || []).join(""));
        } else {
          const el = (await utils.findByLabelText("test-form")) as HTMLFormElement;
          const formData = new FormData(el);

          if (componentType === "checkbox") {
            expect(formData.get(props.name)).toBe(props.defaultValue ? (props as CheckboxProps).value : null);
          } else {
            expect(formData.get(props.name)).toBe(String(props.defaultValue));
          }
        }
      });
    });
  });
});

describe("useForm default values are set appropriately", () => {
  const setupFormHook = () => {
    const {
      result: { current: form },
    } = renderHook(() =>
      useForm("test-form", {
        defaultValues: validDefaultValues,
      })
    );
    return form;
  };

  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      const defaultValue = props.defaultValue;
      it(`sets the default value for a ${props.name} input in Froms`, async () => {
        const form = setupFormHook();
        await render(<TestInput form={form} componentType={componentType} props={props} />);
        expect(form.getValue(props.name)).toBe(defaultValue);
      });

      it(`sets the default value for a ${props.name} input in DOM`, async () => {
        const form = setupFormHook();
        const utils = await render(<TestInput form={form} componentType={componentType} props={props} />);

        if (componentType === "custom") {
          const el = (await utils.findByLabelText(props.name + "-input-values")) as HTMLFormElement;

          if (
            !Array.isArray(defaultValue) ||
            (Array.isArray(defaultValue) && defaultValue.some((v) => typeof v !== "string"))
          ) {
            return fail("Default value for custom-input must be an array of strings");
          }

          return expect(el.textContent).toBe((defaultValue || []).join(""));
        } else {
          if (componentType === "checkbox") {
            const el = (await utils.findByLabelText(props.name)) as HTMLFormElement;
            if (defaultValue) {
              expect(el).toBeChecked();
            } else {
              expect(el).not.toBeChecked();
            }
          } else {
            const el = (await utils.findByLabelText("test-form")) as HTMLFormElement;
            const formData = new FormData(el);
            expect(formData.get(props.name)).toBe(String(defaultValue));
          }
        }
      });
    });
  });
});

/*
Not used but to proud of them to delete them:

type SetPropertyAsAny<T, K extends keyof T> = Omit<T, K> & { [key in K]: any };
type InvalidTestProps = {
  [K in keyof TestProps]: SetPropertyAsAny<TestProps[K][number], "defaultValue">[];
}; */

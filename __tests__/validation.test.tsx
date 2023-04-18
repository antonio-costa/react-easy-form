import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import { act } from "react-test-renderer";
import { FormErrors } from "../src/useForm";
import { changedDefaultValues, defaultInputsProps, InputType, setupFormHook, validDefaultValues } from "./helpers/misc";
import { TestInput } from "./helpers/TextInput";

describe("Set value works", () => {
  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      it(`triggers error for ${props.name} onchange`, async () => {
        const form = setupFormHook({
          validator: async (data) => {
            const errors = Object.entries(data).reduce<FormErrors>((prev, [fname, fvalue]) => {
              prev[fname] = validDefaultValues[fname] !== fvalue ? "Value is different from default" : undefined;
              return prev;
            }, {});

            return {
              valid: Object.keys(errors).length === 0,
              errors,
            };
          },
          validation: { method: "onchange" },
        });

        await render(<TestInput form={form} componentType={componentType} props={props} />);
        await act(() => form.setValue(props.name, changedDefaultValues[props.name]));
        expect(form.getError(props.name)).not.toBeUndefined();
      });
    });
  });
});

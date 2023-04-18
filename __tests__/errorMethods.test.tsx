import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import { defaultInputsProps, InputType, setupFormHook } from "./helpers/misc";
import { TestInput } from "./helpers/TextInput";

describe("Can set and clear errors", () => {
  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      it(`sets and error for ${props.name}`, async () => {
        const form = setupFormHook();

        await render(<TestInput form={form} componentType={componentType} props={props} />);

        form.setError(props.name, "Test error");
        expect(form.getError(props.name)).toBe("Test error");
      });
    });

    testProps.forEach((props) => {
      it(`sets and clears error for ${props.name}`, async () => {
        const form = setupFormHook();

        await render(<TestInput form={form} componentType={componentType} props={props} />);

        form.setError(props.name, "Test error");
        form.clearErrors(props.name);
        expect(form.getError(props.name)).toBeUndefined();
      });
    });
  });
});

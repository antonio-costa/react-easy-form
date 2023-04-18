import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import { changedDefaultValues, defaultInputsProps, InputType, invalidDefaultValues, setupFormHook } from "./helpers/misc";
import { TestInput } from "./helpers/TextInput";

describe("Set value works", () => {
  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      it(`sets ${changedDefaultValues[props.name]} as the new value for field ${props.name}`, async () => {
        const form = setupFormHook();

        await render(<TestInput form={form} componentType={componentType} props={props} />);
        form.setValue(props.name, changedDefaultValues[props.name]);
        expect(form.getValue(props.name)).toBe(changedDefaultValues[props.name]);
      });
    });

    testProps.forEach((props) => {
      // TODO: Type checking for custom inputs
      if (componentType === "custom") {
        return;
      }

      it(`throws an error if trying to set a invalid value for ${props.name}`, async () => {
        const form = setupFormHook();

        await render(<TestInput form={form} componentType={componentType} props={props} />);

        expect(() => form.setValue(props.name, invalidDefaultValues[props.name])).toThrow();
      });
    });
  });
});

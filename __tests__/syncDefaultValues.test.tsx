import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import { act } from "react-test-renderer";
import { changedDefaultValues, defaultInputsProps, InputType, setupFormHook } from "./helpers/misc";
import { TestInput } from "./helpers/TextInput";

// TODO: Test through DOM changes. changeValuesThroughDOM and form don't work properly with a rerendered component?

describe("Check if sync default values is working", () => {
  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      it(`sets ${changedDefaultValues[props.name]} as the new value for field ${props.name}`, async () => {
        const form = setupFormHook();

        const utils = render(
          <TestInput form={form} props={props} componentType={componentType} defaultValuesChanged={false} />
        );

        expect(form.isDirty(props.name)).toBe(false);
        expect(form.isDirty()).toBe(false);

        utils.rerender(<TestInput form={form} props={props} componentType={componentType} defaultValuesChanged={true} />);

        await act(() => {
          form.syncDefaultValues();
        });

        expect(form.isDirty(props.name)).toBe(true);
        expect(form.isDirty()).toBe(true);

        await act(async () => {
          form.setValue(props.name, changedDefaultValues[props.name]);
        });

        expect(form.isDirty(props.name)).toBe(false);
        expect(form.isDirty()).toBe(false);
      });
    });
  });
});

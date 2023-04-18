import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import { changedDefaultValues, changeValueThroughDOM, defaultInputsProps, InputType, setupFormHook } from "./helpers/misc";
import { TestInput } from "./helpers/TextInput";

describe("Change values through DOM", () => {
  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      it(`form retrieves appropriate value for ${props.name} after changing in through the DOM`, async () => {
        const form = setupFormHook();

        const utils = await render(<TestInput form={form} componentType={componentType} props={props} />);

        await changeValueThroughDOM(props, utils, componentType);

        expect(form.getValue(props.name)).toEqual(changedDefaultValues[props.name]);
      });
    });
  });
});

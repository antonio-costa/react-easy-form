import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/react";
import {
  changedDefaultValues,
  changeValueThroughDOM,
  defaultInputsProps,
  InputType,
  setupFormHook,
  validDefaultValues,
} from "./helpers/misc";
import { TestAllInputs, TestInput } from "./helpers/TextInput";

describe("Check dirtyness of fields", () => {
  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      it(`field ${props.name} is not dirty with default values set inline`, async () => {
        const form = setupFormHook();
        await render(<TestInput form={form} componentType={componentType} props={props} />);
        expect(form.isDirty(props.name)).toBe(false);
      });

      it(`field ${props.name} is dirty after a setValue with different value`, async () => {
        const form = setupFormHook();
        await render(<TestInput form={form} componentType={componentType} props={props} />);
        form.setValue(props.name, changedDefaultValues[props.name]);
        expect(form.isDirty(props.name)).toBe(true);
      });

      it(`field ${props.name} is not dirty after a setValue with different value and another with default value`, async () => {
        const form = setupFormHook();
        await render(<TestInput form={form} componentType={componentType} props={props} />);
        form.setValue(props.name, changedDefaultValues[props.name]);
        form.setValue(props.name, validDefaultValues[props.name]);
        expect(form.isDirty(props.name)).toBe(false);
      });

      it(`field ${props.name} is not dirty after a setValue with the same value as de the default value`, async () => {
        const form = setupFormHook();

        await render(<TestInput form={form} componentType={componentType} props={props} />);
        form.setValue(props.name, validDefaultValues[props.name]);
        expect(form.isDirty(props.name)).toBe(false);
      });

      it(`field ${props.name} is never dirty even after setValue with diff value`, async () => {
        const form = setupFormHook();

        await render(<TestInput form={form} componentType={componentType} props={props} neverDirty={true} />);
        form.setValue(props.name, changedDefaultValues[props.name]);
        expect(form.isDirty(props.name)).toBe(false);
      });

      it(`field ${props.name} is dirty after changing value through DOM`, async () => {
        const form = setupFormHook();
        const utils = await render(<TestInput componentType={componentType} props={props} form={form} />);

        await changeValueThroughDOM(props, utils, componentType);
        expect(form.isDirty(props.name)).toBe(true);
      });
    });
  });

  it(`form is not dirty by default`, async () => {
    const form = setupFormHook();
    await render(<TestAllInputs form={form} />);
    expect(form.isDirty()).toBe(false);
  });

  it(`form is dirty after a set value`, async () => {
    const form = setupFormHook();
    await render(<TestAllInputs form={form} />);
    const fieldNameToChange = Object.keys(changedDefaultValues)[0];
    form.setValue(fieldNameToChange, changedDefaultValues[fieldNameToChange]);
    expect(form.isDirty()).toBe(true);
  });

  it(`form is dirty after a change through DOM`, async () => {
    const form = setupFormHook();
    const utils = await render(<TestAllInputs form={form} />);
    const componentType = (Object.keys(defaultInputsProps) as InputType[])[0];
    const props = defaultInputsProps[componentType][0];
    await changeValueThroughDOM(props, utils, componentType);
    expect(form.isDirty()).toBe(true);
  });
});

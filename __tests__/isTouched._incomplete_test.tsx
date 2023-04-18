import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render } from "@testing-library/react";
import {
  changedDefaultValues,
  changeValueThroughDOM,
  defaultInputsProps,
  InputType,
  setupFormHook,
  validDefaultValues,
} from "./helpers/misc";
import { TestInput } from "./helpers/TextInput";

describe("Check isTouched function", () => {
  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      it(`field ${props.name} is not touched by default`, async () => {
        const form = setupFormHook();

        await render(<TestInput form={form} componentType={componentType} props={props} />);
        expect(form.isTouched(props.name)).toBe(false);
      });

      it(`field ${props.name} is touched after setting a value different from default value`, async () => {
        const form = setupFormHook();

        await render(<TestInput form={form} componentType={componentType} props={props} />);

        form.setValue(props.name, changedDefaultValues[props.name]);
        expect(form.isTouched(props.name)).toBe(true);
      });

      it(`field ${props.name} is touched after setting a value equal to default value`, async () => {
        const form = setupFormHook();

        await render(<TestInput form={form} componentType={componentType} props={props} />);
        form.setValue(props.name, validDefaultValues[props.name]);
        expect(form.isTouched(props.name)).toBe(true);
      });

      it(`field ${props.name} is dirty after blur`, async () => {
        const form = setupFormHook();

        const utils = await render(<TestInput form={form} componentType={componentType} props={props} />);

        if (componentType === "radio") {
          const el = (await utils.findAllByLabelText(props.name)) as HTMLInputElement[];
          const randomEl = el[Math.floor(Math.random() * el.length)];
          if (randomEl) {
            await fireEvent.blur(randomEl);
          } else {
            fail("input element not found for radio");
          }
        } else if (componentType === "custom") {
          const el = await utils.findByLabelText(props.name);
          const inputEl = el.querySelector("input");

          if (!inputEl) {
            fail("input element not found for custom field");
          }

          await fireEvent.blur(inputEl);
        } else {
          const el = await utils.findByLabelText(props.name);
          await fireEvent.blur(el);
        }
        expect(form.isTouched(props.name)).toBe(true);
      });

      it(`field ${props.name} is dirty after changing value through DOM`, async () => {
        const form = setupFormHook();

        const utils = await render(<TestInput form={form} componentType={componentType} props={props} />);

        await changeValueThroughDOM(props, utils, componentType);

        expect(form.isTouched(props.name)).toBe(true);
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

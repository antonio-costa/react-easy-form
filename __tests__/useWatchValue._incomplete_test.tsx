import "@testing-library/jest-dom/extend-expect";
import { render, renderHook } from "@testing-library/react";
import { act } from "react-test-renderer";
import { unflattenObject } from "../src/util/misc";
import { useWatchValue } from "../src/watchers/useWatchValue";
import {
  changedDefaultValues,
  changeValueThroughDOM,
  defaultInputsProps,
  InputType,
  setupFormHook,
  validDefaultValues,
} from "./helpers/misc";
import { TestAllInputs, TestInput } from "./helpers/TextInput";

describe("useWatch: listen to values changes for single fields", () => {
  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      it(`before rendering the Component, the default value for field ${props.name} is undefined`, async () => {
        const form = setupFormHook();
        const { result } = renderHook(() => useWatchValue(props.name, { formContext: form }));
        expect(result.current).toBe(undefined);
      });
    });

    testProps.forEach((props) => {
      it(`after rendering the Component, the default value for field ${props.name} is ${
        validDefaultValues[props.name]
      }`, async () => {
        const form = setupFormHook();
        const { result } = renderHook(() => useWatchValue(props.name, { formContext: form }));

        await render(<TestInput form={form} componentType={componentType} props={props} />);
        await expect(result.current).toBe(validDefaultValues[props.name]);
      });
    });
  });
});

describe("useWatch: listen to values changes in the DOM for single fields", () => {
  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      it(`field ${props.name} has new value of ${changedDefaultValues[props.name]} (DOM change)`, async () => {
        const form = setupFormHook();
        const { result } = renderHook(() => useWatchValue(props.name, { formContext: form }));
        const utils = await render(<TestInput form={form} componentType={componentType} props={props} />);

        await act(async () => await changeValueThroughDOM(props, utils, componentType));
        expect(result.current).toStrictEqual(changedDefaultValues[props.name]);
      });
    });
  });
});

describe("useWatch: listen to values changes through form.setValue() for single fields", () => {
  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      it(`field ${props.name} has new value of ${changedDefaultValues[props.name]} (form.setValue)`, async () => {
        const form = setupFormHook();
        const { result } = renderHook(() => useWatchValue(props.name, { formContext: form }));

        await render(<TestInput form={form} componentType={componentType} props={props} />);
        await act(() => form.setValue(props.name, changedDefaultValues[props.name]));
        return await expect(result.current).toBe(changedDefaultValues[props.name]);
      });
    });
  });
});

describe("useWatch: listen to values changes for the whole form (DOM + form.setValue())", () => {
  it(`retrieves the appropriate default values when watching the whole form`, async () => {
    const form = setupFormHook();
    const { result } = renderHook(() => useWatchValue(undefined, { formContext: form }));
    await render(<TestAllInputs form={form} />);
    expect(result.current).toStrictEqual(unflattenObject(validDefaultValues));
  });

  it(`updates value when watching the whole form
  `, async () => {
    const form = setupFormHook();
    const { result } = renderHook(() => useWatchValue(undefined, { formContext: form }));
    const utils = await render(<TestAllInputs form={form} />);

    const inputTypes = Object.keys(defaultInputsProps) as InputType[];

    for (let i = 0; i < inputTypes.length; i++) {
      const componentType = inputTypes[i];
      const testProps = defaultInputsProps[componentType];
      for (let j = 0; j < testProps.length; j++) {
        const props = testProps[j];
        await act(async () => await changeValueThroughDOM(props, utils, componentType));
      }
    }

    expect(result.current).toStrictEqual(unflattenObject(changedDefaultValues));
  });
});

describe("useWatch: listen to values changes for the a path (DOM + form.setValue())", () => {
  it(`retrieves the appropriate default values when watching a path`, async () => {
    const form = setupFormHook();
    const { result } = renderHook(() => useWatchValue("grouped.", { formContext: form }));
    await render(<TestAllInputs form={form} />);
    expect(result.current).toStrictEqual(unflattenObject(validDefaultValues).grouped);
  });

  it(`updates value when watching a path`, async () => {
    const form = setupFormHook();
    const { result } = renderHook(() => useWatchValue("grouped.", { formContext: form }));
    const utils = await render(<TestAllInputs form={form} />);

    const inputTypes = Object.keys(defaultInputsProps) as InputType[];

    for (let i = 0; i < inputTypes.length; i++) {
      const componentType = inputTypes[i];
      const testProps = defaultInputsProps[componentType];
      for (let j = 0; j < testProps.length; j++) {
        const props = testProps[j];
        if (props.name.startsWith("grouped.")) {
          await changeValueThroughDOM(props, utils, componentType);
        }
      }
    }

    expect(result.current).toStrictEqual(unflattenObject(changedDefaultValues).grouped);
  });
});

import "@testing-library/jest-dom/extend-expect";
import { render, renderHook } from "@testing-library/react";
import { act } from "react-test-renderer";
import { useWatchTouched } from "../src/watchers/useWatchTouched";
import { TestAllInputs, TestInput } from "./helpers/TextInput";
import { InputType, changedDefaultValues, defaultInputsProps, setupFormHook, validDefaultValues } from "./helpers/misc";

describe("useWatch: listen to touched fields", () => {
  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      it(`before and after rendering the Component, field ${props.name} is untouched`, async () => {
        const form = setupFormHook();
        const { result } = renderHook(() => useWatchTouched(props.name, { formContext: form }));

        expect(result.current).toBe(false);
        await render(<TestInput form={form} componentType={componentType} props={props} />);
        expect(result.current).toBe(false);
      });
    });

    testProps.forEach((props) => {
      it(`field ${props.name} is touched after setting a value equal to the default value through form.setValue()`, async () => {
        const form = setupFormHook();
        const { result } = renderHook(() => useWatchTouched(props.name, { formContext: form }));
        await render(<TestInput form={form} componentType={componentType} props={props} />);
        await act(async () => {
          form.setValue(props.name, validDefaultValues[props.name]);
        });
        expect(result.current).toBe(true);
      });
    });

    testProps.forEach((props) => {
      it(`field ${props.name} is touched after setting a value different from the default value through form.setValue()`, async () => {
        const form = setupFormHook();
        const { result } = renderHook(() => useWatchTouched(props.name, { formContext: form }));
        await render(<TestInput form={form} componentType={componentType} props={props} />);
        await act(async () => {
          form.setValue(props.name, changedDefaultValues[props.name]);
        });
        expect(result.current).toBe(true);
      });
    });
  });

  it(`retrieves an empty object when no touched are found in the form`, async () => {
    const form = setupFormHook();
    const { result } = renderHook(() => useWatchTouched(undefined, { formContext: form }));
    await render(<TestAllInputs form={form} />);
    expect(result.current).toEqual({});
  });

  it(`retrieves an object with all touched fields found in the form`, async () => {
    const form = setupFormHook();
    const { result } = renderHook(() => useWatchTouched(undefined, { formContext: form }));
    await render(<TestAllInputs form={form} />);
    const fieldsToTouch = [
      "radio-input1",
      "checkbox-input",
      "select-input1",
      "grouped.text-input",
      "grouped.text-input1",
      "another.custom-input1",
    ];
    await act(async () => {
      for (const [key, value] of Object.entries(changedDefaultValues)) {
        if (fieldsToTouch.includes(key)) form.setValue(key, value);
      }
    });
    expect(result.current).toEqual(
      Object.keys(changedDefaultValues).reduce<Record<string, boolean>>((prev, fname) => {
        if (!fieldsToTouch.includes(fname)) return prev;
        prev[fname] = true;
        return prev;
      }, {})
    );
  });
});

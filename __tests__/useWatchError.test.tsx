import "@testing-library/jest-dom/extend-expect";
import { render, renderHook } from "@testing-library/react";
import { act } from "react-test-renderer";
import { useWatchError } from "../src/watchers/useWatchError";
import { defaultInputsProps, InputType, setupFormHook } from "./helpers/misc";
import { TestAllInputs, TestInput } from "./helpers/TextInput";

describe("useWatch: listen to error changes for single fields", () => {
  (Object.keys(defaultInputsProps) as InputType[]).forEach((componentType) => {
    const testProps = defaultInputsProps[componentType];

    testProps.forEach((props) => {
      it(`before and after rendering the Component, field ${props.name} has no errors (useWatchError = null)`, async () => {
        const form = setupFormHook();
        const { result } = renderHook(() => useWatchError(props.name, { formContext: form }));

        expect(result.current).toBeUndefined();
        await render(<TestInput form={form} componentType={componentType} props={props} />);
        expect(result.current).toBeUndefined();
      });
    });

    testProps.forEach((props) => {
      it(`field ${props.name} has error (useWatchError = "test error string")`, async () => {
        const form = setupFormHook();
        const { result } = renderHook(() => useWatchError(props.name, { formContext: form }));

        await render(<TestInput form={form} componentType={componentType} props={props} />);
        await act(() => form.setError(props.name, "test error string"));
        return await expect(result.current).toBe("test error string");
      });
    });
  });

  it(`retrieves an empty object when no errors are found in a field path`, async () => {
    const form = setupFormHook();
    const { result } = renderHook(() => useWatchError("grouped.", { formContext: form }));
    await render(<TestAllInputs form={form} />);
    expect(result.current).toStrictEqual({});
  });

  it(`retrieves an object with the appropriate errors in a field path`, async () => {
    const form = setupFormHook();
    const { result } = renderHook(() => useWatchError("grouped.", { formContext: form }));
    await render(<TestAllInputs form={form} />);
    act(() => form.setError("grouped.text-input1", "invalid val"));
    expect(result.current).toStrictEqual({ "grouped.text-input1": "invalid val" });
  });

  it(`retrieves an empty object when watching whole form without errors`, async () => {
    const form = setupFormHook();
    const { result } = renderHook(() => useWatchError(undefined, { formContext: form }));
    await render(<TestAllInputs form={form} />);
    expect(result.current).toStrictEqual({});
  });

  it(`retrieves an object with the appropriate errors when watching whole form`, async () => {
    const form = setupFormHook();
    const { result } = renderHook(() => useWatchError(undefined, { formContext: form }));
    await render(<TestAllInputs form={form} />);
    act(() => form.setError("grouped.text-input1", "invalid val"));
    expect(result.current).toStrictEqual({ "grouped.text-input1": "invalid val" });
  });
});

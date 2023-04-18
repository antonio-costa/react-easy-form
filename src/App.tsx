import { useCallback } from "react";
import { CustomInput } from "../__tests__/helpers/CustomInput";
import { FormProvider } from "./FormContext";
import { FormHandleSubmit } from "./formMethodsHooks";
import { FormErrors, FormValidator, useForm } from "./useForm";
import { shallowEqual } from "./util/misc";
import { useWatchError } from "./watchers/useWatchError";
import { useWatchValue } from "./watchers/useWatchValue";

const defaultValues = {
  "test-custom": ["wow"],
  "test-text": "test default value",
  "test-checkbox": true,
  "test-radio": "lancia",
  "test-select": "cat",
  "test-select-multiple": ["horse", "cat"],
};

const validator: FormValidator = async (data) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, 1000);
  });

  const errors = Object.entries(data).reduce<FormErrors>((prev, [fname, fvalue]) => {
    if (!shallowEqual(fvalue, (defaultValues as any)[fname])) {
      prev[fname] = `DIFFERENT VALUE FROM DEFAULT (${fvalue})`;
    }
    return prev;
  }, {});

  return {
    valid: Object.keys(errors).length > 0,
    errors,
  };
};

function App() {
  const form = useForm("personal-details", {
    validator,
    validation: {
      method: "onblur",
    },
  });

  const onSubmit = useCallback<FormHandleSubmit>(
    async (validation, e) => {
      console.log("TEST SUBMIT", await validation, form.getValues(), e);
    },
    [form]
  );
  const values = useWatchValue(undefined, { formContext: form });
  const errors = useWatchError(undefined, { formContext: form });

  return (
    <div className="App">
      <FormProvider value={form}>
        <form {...form.registerForm({ handleSubmit: onSubmit })}>
          <div style={{ margin: 12 }}>
            <div>
              <CustomInput {...(form.register("test-custom") as any)} defaultValue={defaultValues["test-custom"]} />
            </div>
            <div>
              <input
                type="text"
                {...form.register("test-text", {
                  validator: async (v, formdata) => {
                    return (v as string).length > 0 ? null : "custom validator error";
                  },
                })}
                defaultValue={defaultValues["test-text"]}
              />
            </div>
            <div>
              <input type="checkbox" {...form.register("test-checkbox")} defaultChecked={defaultValues["test-checkbox"]} />
            </div>
            <div>
              <input
                type="radio"
                {...form.register("test-radio")}
                defaultChecked={defaultValues["test-radio"] === "bmw"}
                value="bmw"
              />
            </div>
            <div>
              <input
                type="radio"
                {...form.register("test-radio")}
                defaultChecked={defaultValues["test-radio"] === "lancia"}
                value="lancia"
              />
            </div>
            <div>
              <input
                type="radio"
                {...form.register("test-radio")}
                defaultChecked={defaultValues["test-radio"] === "mercedes"}
                value="mercedes"
              />
            </div>
            <div>
              <select {...form.register("test-select", { defaultSelectOption: defaultValues["test-select"] })}>
                <option value="dog">Dog</option>
                <option value="horse">Horse</option>
                <option value="cat">Cat</option>
              </select>
            </div>

            <div>
              <select
                {...form.register("test-select-multiple", { defaultSelectOption: defaultValues["test-select-multiple"] })}
                multiple
              >
                <option value="dog">Dog</option>
                <option value="horse">Horse</option>
                <option value="cat">Cat</option>
                <option value="cow">Cow</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <button>Submit native</button>
            <button
              type="button"
              onClick={() => {
                form.executeSubmit(onSubmit);
              }}
            >
              ExecuteSubmit
            </button>
          </div>
        </form>
      </FormProvider>
      <h3>Errors</h3>
      <pre>{JSON.stringify(errors, null, 2)}</pre>
      <h3>Values</h3>
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </div>
  );
}

export default App;

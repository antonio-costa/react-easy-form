import { useCallback } from "react";
import { ContentEditableWithForm } from "./customFieldsExamples/contentEditable";
import { MultiselectInputWithForm } from "./customFieldsExamples/multiselect";
import { FormProvider } from "./FormContext";
import { FormValidation, useForm } from "./useForm";
import { useWatchValue } from "./watchers/useWatchValue";

function App() {
  const form = useForm("personal-details", {
    defaultValues: { password: "useform", "contentEditable-custom": "test123" },
  });

  const onSubmit = useCallback(
    (validation: FormValidation /* , e: React.FormEvent<HTMLFormElement> */) => {
      console.log("TEST SUBMIT", validation, form.getValues());
    },
    [form]
  );

  return (
    <div className="App">
      <FormProvider value={form}>
        <form {...form.registerForm({ handleSubmit: onSubmit })}>
          <fieldset>
            <label>Username</label>
            <input type="text" {...form.register("person.username")} defaultValue="wow" autoComplete="username" />
          </fieldset>
          <fieldset>
            <label>Password</label>
            <input
              type="text"
              {...form.register("password", {
                validator: (value) => (value === "verysafe" ? null : "password must be 'verysafe'."),
              })}
              defaultValue=""
              autoComplete="current-password"
            />
          </fieldset>
          <fieldset>
            <label>Checkbox</label>
            <input type="checkbox" {...form.register("test-checkbox")} />
          </fieldset>
          <MultiselectInputWithForm defaultValue={["test"]} name="test" />
          <ContentEditableWithForm name="contentEditable-custom" defaultValue={10} />
          <StringifiedValues />
          <button
            type="button"
            onClick={() => {
              console.log("isDirty", form.isDirty());
              console.log(
                "defaultValues",
                form._formState.defaultValues.current,
                form._formState.optionsRef.current?.defaultValues
              );
            }}
          >
            is dirty
          </button>
        </form>
      </FormProvider>
    </div>
  );
}

const StringifiedValues = () => {
  const values = useWatchValue();
  return <pre>{JSON.stringify(values, null, 2)}</pre>;
};

export default App;

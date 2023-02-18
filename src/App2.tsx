import { memo, useCallback, useState } from "react";
import { FormProvider, useFormContext } from "./FormContext";
import { FormValidation, useForm } from "./useForm";
import { useWatch } from "./watchers/useWatch";
import { useWatchValue } from "./watchers/useWatchValue";

function App() {
  const form = useForm("personal-details", {
    defaultValues: { description: "useform" },
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
          <ToggleableTextArea defVal={"wow"} />
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
const ToggleableTextArea = memo(({ defVal }: { defVal: string }) => {
  const form = useFormContext();
  const [visible, setVisible] = useState(true);

  const onClick = useCallback(() => {
    if (visible) {
      form.unregister("description");
    }
    setVisible(!visible);
  }, [form, visible]);

  const { value: description } = useWatch<string>("description");

  return (
    <div>
      {visible ? (
        <fieldset>
          <label>Description {description}</label>
          <textarea {...form.register("description")} defaultValue={defVal} />
        </fieldset>
      ) : null}
      <br />
      Value description: {description}
      <br />
      <button type="button" onClick={onClick}>
        Hide/show textarea
      </button>
      <button
        type="button"
        onClick={() => {
          form.setValue("description", "AAAA");
        }}
      >
        change description value to &quot;AAAA&quot;
      </button>
    </div>
  );
});
ToggleableTextArea.displayName = "ToggleableTextArea";
const StringifiedValues = () => {
  const values = useWatchValue();
  return <pre>{JSON.stringify(values, null, 2)}</pre>;
};

export default App;

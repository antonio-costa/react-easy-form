import { useCallback } from "react";
import { CustomSelect } from "./customFieldsExamples/customSelect";
import { FormProvider } from "./FormContext";
import { FormValidation, useForm } from "./useForm";

function App() {
  const form = useForm("personal-details", {
    validation: { method: "onchange", flattenObject: true },
    defaultValues: {
      test: "chocolate",
    },
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
          <div style={{ margin: 12 }}>
            <CustomSelect name="test" />
          </div>
          <button>Test</button>
        </form>
      </FormProvider>
    </div>
  );
}

export default App;

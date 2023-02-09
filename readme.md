# React easy forms

## To do

- ~~Complete handleSubmit and executeSubmit functions. Maybe move handleSubmit to registerForm()?~~
- ~~Add validator support onsubmit, onchange and onblur~~
- ~~Make decision on how data should be handled (always nested keys or 1 level deep object) - see prop `flattenObject` on useGetValues.~~
  - ~~Decision above for field `values` and field `errors`~~
- ~~Add support to custom controllers~~
- Transform all validation functions to accept asynchronous validators
- Create `resetField()` and `resetForm()` methods.
- ~~Create `isTouched()` method.~~
- ~~Add support for `touched` functionality.~~
- Create debug tools for `setValue()` (to know from where it was called, if necessary)
- ~~Change getValue and getValues to retrieve values from \_formState instead of the DOM. (Need to make sure that \_formState is always up to date)~~
- Include field validators in general form validation function.
- ~~Add never dirty.~~
- Add form inputMapper and outputMapper.
- Add option to evaluate fields that were removed from the DOM (if they are not explicitly unregistered). How should `getValues()` handle this?
- Add default values for undefined default values for all input types (`button`, `color`, `date`, `datetime-local`, `email`, `file`, `hidden`, `image`, `month`, `password`, `reset`, `search`, `submit`, `tel`, `time`, `url`, `week`)

## TODO: Add Unit Testing

## How to use

```tsx
import { useCallback } from "react";
import { FormProvider } from "./FormContext";
import { useForm } from "./useForm";

function App() {
  const form = useForm("personal-details");

  const onSubmit = useCallback(
    (values) => {
      console.log("form values", values);
    },
    [form]
  );

  return (
    <FormProvider value={form}>
      <form {...form.registerForm()} onSubmit={handleSubmit(onSubmit)}>
        <fieldset>
          <label>Username</label>
          <input type="text" {...form.register("username")} />
        </fieldset>
        <fieldset>
          <label>Password</label>
          <input type="password" {...form.register("password")} />
        </fieldset>
        <button type="submit">Submit form</button>
      </form>
    </FormProvider>
  );
}
```

## Available hooks

- useForm(formName: string)
- useFormContext()
- useWatch()

## useForm(formName: string)

This is used to register a new form. The reference for the returned `form` always remains the same , so it is safe to pass as a prop or hook dependency, for example.

### Methods

- `register(name: string, options?: RegisterFieldOptions)` - Registers a new field. Options properties below:
  - `defaultOption?: string` - used only to define the default value for `<select />` inputs.
- `registerForm()` - Registers the form.
- `getValue(fieldName: string)` - Returns the value from a single field
- `getValues(fieldPath?: string)` - Returns the values for the the specified path (using dot notation). If no fieldPath is specified, the whole form is returned.
- `isDirty(fieldName?: string)` - Returns true/false if the form contains values different from the initially set on defaultValue prop.
- `setValue(fieldName: string, value: FieldValue)` - Sets the value for a field.
  Returns the value from a single field

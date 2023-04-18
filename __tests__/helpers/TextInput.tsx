import { FormProvider } from "../../src/FormContext";
import { FormContextValue } from "../../src/useForm";
import { changedDefaultValues, defaultInputsProps, inputComponents, InputType, validDefaultValues } from "./misc";

export const TestInput = ({
  form,
  neverDirty,
  componentType,
  props,
  defaultValuesChanged,
}: {
  form: FormContextValue;
  componentType: InputType;
  props: any;
  neverDirty?: boolean;
  defaultValuesChanged?: boolean;
}) => {
  const components = inputComponents(form, { neverDirty });
  const Component = components[componentType as InputType];
  if (defaultValuesChanged) props.defaultValue = changedDefaultValues[props.name];
  else props.defaultValue = validDefaultValues[props.name];

  return (
    <FormProvider value={form}>
      <form {...form.registerForm()} aria-label="test-form">
        <Component {...props} />
      </form>
    </FormProvider>
  );
};

export const TestAllInputs = ({
  form,
  neverDirty,
  defaultValuesChanged,
}: {
  form: FormContextValue;
  neverDirty?: boolean;
  defaultValuesChanged?: boolean;
}) => {
  const components = inputComponents(form, { neverDirty });

  return (
    <FormProvider value={form}>
      <form {...form.registerForm()} aria-label="test-form">
        {(Object.keys(components) as InputType[]).reduce((prev, componentType) => {
          const Component = components[componentType];
          const testProps = defaultInputsProps[componentType];

          testProps.forEach((props) => {
            if (defaultValuesChanged) props.defaultValue = changedDefaultValues[props.name];
            else props.defaultValue = validDefaultValues[props.name];
            prev.push(<Component key={props.name} {...(props as any)} />);
          });

          return prev;
        }, [] as JSX.Element[])}
      </form>
    </FormProvider>
  );
};

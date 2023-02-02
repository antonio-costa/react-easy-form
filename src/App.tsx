import { memo, useCallback, useEffect, useRef, useState } from "react";
import { CustomFieldController } from "./CustomFieldController";
import { MultiselectInputWithForm } from "./customFieldsExamples/multiselect";
import { FormProvider, useFormContext } from "./FormContext";
import { FormErrors, FormValidation, FormValidator, useForm } from "./useForm";
import { useWatch } from "./useWatch";

const validator1: FormValidator = (data) => {
  const validationString = "validated-user";
  if (typeof data?.person === "object" && !Array.isArray(data.person) && data.person?.username === validationString) {
    return {
      valid: true,
      errors: {},
    } as FormValidation;
  } else {
    return {
      valid: false,
      errors: { "person.username": `Username must be equal to '${validationString}'.` },
    } as FormValidation;
  }
};

const validator2: FormValidator = (data) => {
  const errors: FormErrors = {};
  Object.keys(data).forEach((fName) => {
    if (fName.startsWith("stress.")) errors[fName] = `Error on ${fName}`;
    if (fName.startsWith("contentEditable-fieldname")) errors[fName] = `Error on ${fName}`;
  });

  return {
    valid: Boolean(Object.keys(errors)),
    errors,
  };
};

function App() {
  const [validator, setValidator] = useState<FormValidator>(() => validator1);
  const form = useForm("personal-details", {
    validator,
    validation: { method: "onchange", flattenObject: true },
  });

  const onSubmit = useCallback(
    (validation: FormValidation /* , e: React.FormEvent<HTMLFormElement> */) => {
      console.log("TEST SUBMIT", validation, form.getValues());
    },
    [form]
  );

  const { value: personValues, error: personErrors } = useWatch("person.", { watchErrors: true, formContext: form });
  const { value: password, error: passwordError } = useWatch("password", { watchErrors: true, formContext: form });

  const { value: customFieldValue, error: customFieldError } = useWatch("contentEditable-fieldname", {
    watchErrors: true,
    formContext: form,
  });

  return (
    <div className="App">
      <FormProvider value={form}>
        <form {...form.registerForm({ handleSubmit: onSubmit })}>
          <fieldset>
            <label>Username ({personValues?.["person.username"]})</label>
            <input type="text" {...form.register("person.username")} defaultValue="wow" autoComplete="username" />
            <ErrorDiv error={personErrors?.["person.username"]} />
          </fieldset>
          <fieldset>
            <label>Password</label>
            <input
              type="password"
              {...form.register("password", {
                validator: (value) => (value === "verysafe" ? null : "password must be 'verysafe'."),
              })}
              autoComplete="current-password"
            />
            {password ? `very safe: ${password}` : null}
            <ErrorDiv error={passwordError} />
          </fieldset>
          <fieldset>
            <div>
              <label htmlFor="male">Male</label>
              <input type="radio" {...form.register("person.gender", { radioValue: "male" })} id="male" />
            </div>
            <div>
              <label htmlFor="female">Female</label>
              <input type="radio" {...form.register("person.gender", { radioValue: "female" })} defaultChecked id="female" />
            </div>
            <div>
              <label htmlFor="other">Other</label>
              <input type="radio" {...form.register("person.gender", { radioValue: "other" })} id="other" />
            </div>
          </fieldset>
          <button
            type="button"
            onClick={() => {
              console.log(form.isDirty("description"));
            }}
          >
            is description dirty?
          </button>
          <button
            type="button"
            onClick={() => {
              form.clearErrors();
              setValidator((old: any) => (old === validator1 ? validator2 : validator1));
            }}
          >
            change validator
          </button>
          <button
            type="button"
            onClick={() => {
              form.setError("password", "password is invalid for no reason.");
            }}
          >
            set password error
          </button>
          <button
            type="button"
            onClick={() => {
              form.clearErrors(["person.username"]);
            }}
          >
            clear username error
          </button>
          <button
            type="button"
            onClick={() => {
              form.clearErrors();
            }}
          >
            clear all errors
          </button>
          <fieldset>
            <label>Height</label>
            <input type="range" {...form.register("person.details.height")} min={50} max={250} />
          </fieldset>
          <fieldset>
            <label>Age</label>
            <input type="number" {...form.register("person.details.age")} min={1} max={150} />
          </fieldset>
          <fieldset>
            <label>Receive SPAM</label>
            <input type="checkbox" {...form.register("spam")} value="spam" />
          </fieldset>
          <fieldset>
            <label htmlFor="pet-select">Choose a pet:</label>
            <select {...form.register("pets", { defaultSelectOption: "hamster" })} id="pet-select">
              <option value="">--Please choose an option--</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="hamster">Hamster</option>
              <option value="parrot">Parrot</option>
              <option value="spider">Spider</option>
              <option value="goldfish">Goldfish</option>
            </select>
          </fieldset>
          <fieldset>
            <label htmlFor="car-select">Choose a car:</label>
            <select multiple {...form.register("cars", { defaultSelectOption: ["bmw", "fiat"] })} id="car-select">
              <option value="">--Please choose an option--</option>
              <option value="bmw">BMW</option>
              <option value="fiat">Fiat</option>
              <option value="mercedes">Mercedes</option>
              <option value="lancia">Lancia</option>
            </select>
          </fieldset>
          <MultiselectInputWithForm name="multiselect-custom" defaultValue={["test"]} />
          <ContentEditableField name="contentEditable-fieldname" defaultValue="def value!" />
          <p>Value: {customFieldValue}</p>
          <ErrorDiv error={customFieldError} />
          <button type="submit">Submit form</button>
          <ToggleableTextArea defVal={"wow"} />
          <button
            type="button"
            onClick={() => {
              form.setValue("multiselect-custom", ["wow bro, you set a custom value", "two"]);
            }}
          >
            debug
          </button>
          <StressValues />
          {
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 100px)" }}>
              {Array.from({ length: 1000 }, (_, i) => (
                <StressTestInput name={`test-${i}`} key={i} />
              ))}
            </div>
          }
          <div accessKey="7" onFocus={() => alert("aa")}></div>
        </form>
      </FormProvider>
    </div>
  );
}

const ContentEditableField = ({ name, defaultValue }: { name: string; defaultValue?: string }) => {
  const divRef = useRef<HTMLDivElement | null>();

  const defaultValueSet = useRef<boolean>(false);

  useEffect(() => {
    if (!divRef.current || defaultValueSet.current) return;
    defaultValueSet.current = true;
    divRef.current.innerText = String(defaultValue);
  }, [defaultValue]);

  return (
    <CustomFieldController
      name={name}
      onSetValue={(value) => {
        if (!divRef.current) return;
        divRef.current.innerText = String(value);
      }}
      defaultValue={defaultValue || ""}
    >
      {({ triggerChange, triggerBlur, ref }) => (
        <fieldset>
          <div
            style={{ border: "2px dashed pink", borderRadius: 4, padding: 4, width: 200, height: 20 }}
            contentEditable
            onInput={(e) => {
              triggerChange({ name, value: e.currentTarget.innerText });
            }}
            onBlur={() => {
              triggerBlur({ name });
            }}
            ref={(r) => {
              ref(r);
              divRef.current = r;
            }}
          ></div>
        </fieldset>
      )}
    </CustomFieldController>
  );
};
const ErrorDiv = ({ error }: { error: string }) => {
  return error ? <div style={{ color: "red" }}>{error}</div> : null;
};
const StressTestInput = memo(({ name }: { name: string }) => {
  const form = useFormContext();
  const { value, error } = useWatch(`stress.${name}`, { watchValues: true, watchErrors: true });

  return (
    <div>
      {`stress.${name}`} {`(${value})`}
      <ContentEditableField name={`stress.${name}`} defaultValue={`stress.${name}`} />
      <div>{error || ""}</div>
    </div>
  );
});

/* <fieldset>
      <label>
        {`stress.${name}`} {`(${value})`}
      </label>
      <input
        style={{ width: 80 }}
        {...form.register(`stress.${name}`)}
        type="text"
        // defaultValue={!name.includes("-1") ? `def ${name}` : undefined}
      />
      {error || ""}
    </fieldset> */

StressTestInput.displayName = "StressTestInput";
const StressValues = () => {
  const [visible, setVisible] = useState(true);
  const { value: stressValues } = useWatch("stress.");
  return (
    <div>
      stress values (undefined is converted to null for visualization purposes)
      <button onClick={() => setVisible((old) => !old)} type="button">
        hide
      </button>
      {visible ? <pre>{JSON.stringify(stressValues, (k, v) => (v === undefined ? null : v), 2)}</pre> : null}
    </div>
  );
};
const ToggleableTextArea = memo(({ defVal }: { defVal: string }) => {
  const form = useFormContext();
  const [visible, setVisible] = useState(true);

  const onClick = () => {
    setVisible((old) => {
      if (old) {
        form.unregister("description");
        return false;
      }
      return true;
    });
  };

  const { value: description } = useWatch("description");

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

export default App;

import { memo, useCallback, useEffect, useState } from "react";
import { FormProvider, useFormContext } from "./FormContext";
import { useForm } from "./useForm";
import { Observable, useObservableRef, useObserve } from "./useSubscribable/useSubscribable";
import { useWatch } from "./useWatch";

/* interface RegisterForm {
  person: {
    username: string
  },
  password: string,
  spam?: boolean
}

const useWatchTyped = () = useWatch<typeof Validafor>();

const username = useWatchTyped<number>("person.age");

*/

function App() {
  const form = useForm("personal-details");

  const onSubmit = useCallback((validation: any, e: React.FormEvent<HTMLFormElement>) => {
    console.log("TEST SUBMIT", validation, e);
  }, []);

  const value = useWatch<string>(`stress.`, form);

  useEffect(() => {
    // console.log(value);
  }, [value]);

  const count = useObservableRef(0);
  return (
    <div className="App">
      <div>
        <RerenderableComponent value={count} />
        <button onClick={() => count.setValue((old) => old + 1)}>Add +1 count</button>
        <button onClick={() => console.log(count.current)}>log count that didnt trigger re-render</button>
      </div>
      <div>
        <FormProvider value={form}>
          <form {...form.registerForm({ handleSubmit: onSubmit })}>
            <fieldset>
              <label>Username</label>
              <input type="text" {...form.register("person.username")} defaultValue="wow" autoComplete="username" />
            </fieldset>
            <fieldset>
              <label>Password</label>
              <input type="password" {...form.register("password")} autoComplete="current-password" />
            </fieldset>
            <fieldset>
              <div>
                <label htmlFor="male">Male</label>
                <input type="radio" {...form.register("person.gender", { radioValue: "male" })} id="male" />
              </div>
              <div>
                <label htmlFor="female">Female</label>
                <input
                  type="radio"
                  {...form.register("person.gender", { radioValue: "female" })}
                  defaultChecked
                  id="female"
                />
              </div>
              <div>
                <label htmlFor="other">Other</label>
                <input type="radio" {...form.register("person.gender", { radioValue: "other" })} id="other" />
              </div>
            </fieldset>
            {/* <fieldset>
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
              <select {...form.register("pets", { defaultOption: "hamster" })} id="pet-select">
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
              <select multiple {...form.register("cars", { defaultOption: "bmw" })} id="car-select">
                <option value="">--Please choose an option--</option>
                <option value="bmw">BMW</option>
                <option value="fiat">Fiat</option>
                <option value="mercedes">Mercedes</option>
                <option value="lancia">Lancia</option>
              </select>
            </fieldset> */}
            <button type="submit">Submit form</button>
            {/* <ToggleableTextArea /> */}
            {/* <SelfContainedDebug /> */}
            {
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 100px)" }}>
                {Array.from({ length: 1 }, (_, i) => (
                  <StressTestInput name={`test-${i}`} key={i} />
                ))}
              </div>
            }
            <button
              type="button"
              onClick={() => {
                console.log(form.fieldElements.current);
              }}
            >
              debug
            </button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
const RerenderableComponent = ({ value }: { value: Observable<number> }) => {
  const count = useObserve(value);

  return <div>Updated: {count}</div>;
};
const StressTestInput = ({ name }: { name: string }) => {
  const form = useFormContext();

  return (
    <fieldset>
      <label>{`stress.${name}`}</label>
      <input style={{ width: 80 }} {...form.register(`stress.${name}`)} />
    </fieldset>
  );
};

const ToggleableTextArea = memo(() => {
  const form = useFormContext();
  const [visible, setVisible] = useState(true);

  const onClick = () => {
    setVisible((old) => !old);
  };

  const description = useWatch<string>("description");

  return (
    <div>
      {visible ? (
        <fieldset>
          <label>Description</label>
          <textarea {...form.register("description")} />
        </fieldset>
      ) : null}
      <br />
      Value description: {description}
      <br />
      <button type="button" onClick={onClick}>
        Hide/show textarea
      </button>
    </div>
  );
});
ToggleableTextArea.displayName = "ToggleableTextArea";

const SelfContainedDebug = () => {
  const form = useFormContext();

  const onDebug = () => {
    /*     console.log("isDirty", form.isDirty());
     */
    /* form.setValue("username", "dog");
    form.setValue("password", "dog");
    form.setValue("gender", "dog");
    form.setValue("height", 160);
    form.setValue("age", 54);
    form.setValue("description", "dog"); */
    /* 
    console.log("getValue car", form.getValue("cars"));
    console.log("getValues ", form.getValues()); */
    console.log("form.fieldElements", form.fieldElements);
  };

  const personDetails = useWatch("person.");

  useEffect(() => {
    console.log("person details updated:", personDetails);
  }, [personDetails]);

  return (
    <div>
      <button type="button" onClick={onDebug}>
        Debug
      </button>
    </div>
  );
};

export default App;

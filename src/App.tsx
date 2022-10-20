import { useEffect, useState } from "react";
import { FormProvider } from "./FormContext";
import { useForm } from "./useForm";
import { useWatch } from "./useWatch";

function App() {
  const [debug /* setDebug */] = useState<any>("");
  const form = useForm("personal-details");

  const onDebug = () => {
    form.setValue("username", "dog");
    form.setValue("password", "dog");
    form.setValue("gender", "dog");
    form.setValue("height", 160);
    form.setValue("age", 54);
    // form.setValue("spam", true);
    form.setValue("description", "dog");
    console.log("is pets dirty?", form.isDirty("pets"));
    console.log("is spam dirty?", form.isDirty("spam"));
    /* console.log("username", username);
    console.log("password", form.getValue("password"));
    console.log("gender", form.getValue("gender"));
    console.log("height", form.getValue("height"));
    console.log("age", form.getValue("age"));
    console.log("spam", form.getValue("spam"));
    console.log("description", form.getValue("description"));
    console.log("pets", form.getValue("pets"));
    console.log("FORM:", form.getValues()); */
  };

  const username = useWatch("username");
  useEffect(() => console.log("username", username), [username]);

  const password = useWatch("password");
  useEffect(() => console.log("password", password), [password]);

  const gender = useWatch("gender");
  useEffect(() => console.log("gender", gender), [gender]);

  const height = useWatch("height");
  useEffect(() => console.log("height", height), [height]);

  const age = useWatch("age");
  useEffect(() => console.log("age", age), [age]);

  const spam = useWatch("spam");

  useEffect(() => console.log("spam", spam), [spam]);

  const description = useWatch("description");
  useEffect(() => console.log("description", description), [description]);

  const pets = useWatch("pets");
  useEffect(() => console.log("pets", pets), [pets]);

  return (
    <div className="App">
      <FormProvider value={form}>
        <form {...form.registerForm()} /*  onSubmit={handleSubmit(onSubmit)} */>
          <fieldset>
            <label>Username</label>
            <input type="text" {...form.register("username")} />
          </fieldset>
          <fieldset>
            <label>Password</label>
            <input type="password" {...form.register("password")} />
          </fieldset>
          <fieldset>
            <div>
              <label htmlFor="male">Male</label>
              <input type="radio" {...form.register("gender")} id="male" value="male" />
            </div>
            <div>
              <label htmlFor="female">Female</label>
              <input type="radio" {...form.register("gender")} id="female" value="female" />
            </div>
            <div>
              <label htmlFor="other">Other</label>
              <input type="radio" {...form.register("gender")} id="other" value="other" />
            </div>
          </fieldset>
          <fieldset>
            <label>Height</label>
            <input type="range" {...form.register("height")} min={50} max={250} />
          </fieldset>
          <fieldset>
            <label>Age</label>
            <input type="number" {...form.register("age")} min={1} max={150} />
          </fieldset>
          <fieldset>
            <label>Receive SPAM</label>
            <input type="checkbox" {...form.register("spam")} value="spam" />
          </fieldset>
          <fieldset>
            <label>Description</label>
            <textarea {...form.register("description")} />
          </fieldset>
          <fieldset>
            <label htmlFor="pet-select">Choose a pet:</label>
            <select {...form.register("pets")} id="pet-select" defaultValue="hamster">
              <option value="">--Please choose an option--</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
              <option value="hamster">Hamster</option>
              <option value="parrot">Parrot</option>
              <option value="spider">Spider</option>
              <option value="goldfish">Goldfish</option>
            </select>
          </fieldset>
          <button type="submit">Submit form</button>
        </form>
      </FormProvider>
      <div>{debug}</div>
      <div>
        <button onClick={onDebug}>Debug</button>
      </div>
    </div>
  );
}

export default App;

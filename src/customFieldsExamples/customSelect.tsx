import { useEffect, useState } from "react";
import Select from "react-select";
import { CustomFieldController } from "../CustomFieldController";
import { useWatchError } from "../watchers/useWatchError";

const options = [
  { value: "chocolate", label: "Chocolate" },
  { value: "strawberry", label: "Strawberry" },
  { value: "vanilla", label: "Vanilla" },
];

export const CustomSelect = ({ name, defaultValue }: any) => {
  const error = useWatchError(name);
  useEffect(() => {
    console.log("error", error);
  }, [error]);
  const [value, setValue] = useState<{ label: string; value: string } | undefined>(defaultValue);
  return (
    <CustomFieldController
      name={name}
      onSetValue={(value) => {
        const option = options.find((o) => o.value === value);
        setValue(option);
      }}
      defaultValue={defaultValue}
    >
      {({ defaultValue, ref, triggerBlur, triggerChange }) => (
        <Select
          options={options}
          onChange={(newValue) => {
            triggerChange({ name, value: newValue?.value });
          }}
          onBlur={() => {
            triggerBlur({ name });
          }}
          ref={ref}
          value={value}
          defaultValue={options.find((o) => o.value === defaultValue)}
        />
      )}
    </CustomFieldController>
  );
};

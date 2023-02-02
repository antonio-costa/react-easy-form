import { forwardRef, useEffect, useRef, useState } from "react";
import { CustomFieldController } from "../CustomFieldController";

interface MultiselectInputProps {
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
  value?: string[];
}

export const MultiselectInput = forwardRef<HTMLDivElement & { value: string[] }, MultiselectInputProps>(
  ({ defaultValue, onChange, onBlur, value }, wrapperRef) => {
    const [values, setValues] = useState<string[]>(defaultValue || []);

    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (value) setValues(value);
    }, [value]);

    return (
      <div style={{ display: "flex" }} ref={wrapperRef}>
        {values.map((v) => (
          <div
            style={{
              fontSize: 14,
              backgroundColor: "#ccc",
              padding: 4,
              borderRadius: 2,
              marginRight: 4,
            }}
            key={v}
          >
            {v}
            <span
              onClick={() => {
                setValues((old) => {
                  const newValues = old.filter((o) => o !== v);

                  if (newValues.length === old.length) return old;

                  onChange && onChange(newValues);
                  return newValues;
                });
              }}
            >
              [DEL]
            </span>
          </div>
        ))}
        <input
          type="text"
          ref={ref}
          style={{
            marginRight: 4,
          }}
          onBlur={() => onBlur && onBlur()}
        />
        <button
          type="button"
          onClick={() => {
            setValues((old) => {
              if (!ref.current) return old;

              const newValues = Array.from(new Set([...old, ref.current.value]));
              if (newValues.length === old.length) return old;

              onChange && onChange(newValues);
              return newValues;
            });
          }}
        >
          add value
        </button>
      </div>
    );
  }
);

MultiselectInput.displayName = "MultiselectInput";

export const MultiselectInputWithForm = ({ defaultValue, name }: MultiselectInputProps & { name: string }) => {
  const [triggerValue, setTriggerValue] = useState<string[]>(defaultValue || []);

  return (
    <CustomFieldController
      name={name}
      defaultValue={defaultValue}
      onSetValue={(value) => setTriggerValue(value as string[])}
    >
      {({ ref, triggerBlur, triggerChange }) => (
        <MultiselectInput
          onBlur={() => triggerBlur({ name })}
          onChange={(value) => triggerChange({ name, value })}
          ref={ref}
          defaultValue={defaultValue}
          value={triggerValue}
        />
      )}
    </CustomFieldController>
  );
};

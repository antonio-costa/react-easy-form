import { forwardRef, useEffect, useRef, useState } from "react";
import { CustomFieldController } from "../CustomFieldController";
import { RegisterFieldValue } from "../formMethodsHooks";

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
                const newValues = values.filter((o) => o !== v);
                if (newValues.length === values.length) return;
                onChange && onChange(newValues);
                setValues(newValues);
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
            if (!ref.current) return;

            const newValues = Array.from(new Set([...values, ref.current.value]));
            if (newValues.length === values.length) return;

            onChange && onChange(newValues);
            setValues(newValues);
          }}
        >
          add value
        </button>
      </div>
    );
  }
);

MultiselectInput.displayName = "MultiselectInput";

export interface MultiselectInputWithFormProps extends Partial<RegisterFieldValue<HTMLDivElement & { value: string[] }>> {
  defaultValue?: string[];
  onChangeOverride?: (value: string[]) => void;
  name: string;
}

export const MultiselectInputWithForm = forwardRef(
  ({ defaultValue, name, onChangeOverride }: MultiselectInputWithFormProps, _) => {
    const [triggerValue, setTriggerValue] = useState<string[]>(defaultValue || []);
    return (
      <CustomFieldController
        name={name}
        defaultValue={defaultValue}
        onSetValue={(value) => setTriggerValue(value as string[])}
      >
        {({ ref, triggerBlur, triggerChange, defaultValue: _defaultValue }) => (
          <MultiselectInput
            onBlur={() => triggerBlur({ name })}
            onChange={(value) => {
              triggerChange({ name, value });
              onChangeOverride && onChangeOverride(value);
            }}
            ref={ref}
            defaultValue={_defaultValue as string[] | undefined}
            value={triggerValue}
          />
        )}
      </CustomFieldController>
    );
  }
);

MultiselectInputWithForm.displayName = "MultiselectInputWithForm";

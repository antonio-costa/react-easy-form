import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from "react";
import { CustomFieldController, CustomFieldControllerChildren } from "../../src/CustomFieldController";

interface CustomInputAbstractProps {
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
  value?: string[];
  "aria-label"?: string;
}

export const CustomInputAbstract = forwardRef<HTMLDivElement, CustomInputAbstractProps>(
  ({ defaultValue, onChange, onBlur, "aria-label": ariaLabel }, wrapperRef) => {
    const [values, setValues] = useState<string[]>(defaultValue || []);
    const ref = useRef<HTMLInputElement>(null);

    return (
      <div style={{ display: "flex" }} ref={wrapperRef} aria-label={ariaLabel}>
        <div
          aria-label={ariaLabel + "-input-values"}
          className={"input-values"}
          style={{
            display: "flex",
          }}
        >
          {values.map((v) => (
            <div
              style={{
                fontSize: 14,
                backgroundColor: "#ccc",
                padding: 4,
                borderRadius: 2,
                marginRight: 4,
                display: "flex",
              }}
              key={v}
            >
              {v}
              <div
                className={"delete-value"}
                onClick={() => {
                  const newValues = values.filter((o) => o !== v);

                  if (newValues.length === values.length) return;

                  onChange && onChange(newValues);
                  setValues(newValues);
                }}
                style={{ width: 12, height: 12, backgroundColor: "red" }}
              ></div>
            </div>
          ))}
        </div>
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

CustomInputAbstract.displayName = "CustomInputAbstract";

export type CustomInputProps = CustomInputAbstractProps & { name: string; neverDirty?: boolean };

export const CustomInput = forwardRef(({ defaultValue, name, neverDirty }: CustomInputProps, _inputRef) => {
  const inputRef = useRef<any>();
  useImperativeHandle(_inputRef, () => inputRef.current);

  const children = useCallback<CustomFieldControllerChildren>(
    ({ ref, triggerBlur, triggerChange, defaultValue }) => {
      return (
        <div aria-label="test-input">
          <CustomInputAbstract
            onBlur={() => triggerBlur({ name })}
            onChange={(value) => triggerChange({ name, value })}
            ref={(r) => {
              ref(r);
              inputRef.current = r;
            }}
            aria-label={name}
            defaultValue={defaultValue as string[] | undefined}
          />
        </div>
      );
    },
    [name]
  );

  return (
    <CustomFieldController
      name={name}
      defaultValue={defaultValue || []}
      onSetValue={(value) => {
        if (!inputRef.current) return;
        inputRef.current.value = value;
      }}
      neverDirty={neverDirty}
      fieldValidator={async (v) => {
        return "custom validator error for custom field";
      }}
    >
      {children}
    </CustomFieldController>
  );
});

CustomInput.displayName = "CustomInput";

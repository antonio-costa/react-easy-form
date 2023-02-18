import { forwardRef, useRef } from "react";
import { CustomFieldController } from "../CustomFieldController";

export const ContentEditable = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { defaultValue?: number }>(
  ({ defaultValue, ...props }, ref) => {
    return (
      <fieldset>
        <div
          suppressContentEditableWarning={true}
          {...props}
          style={{ border: "2px dashed pink", borderRadius: 4, padding: 4, width: 200, height: 20 }}
          contentEditable
          ref={ref}
        >
          {String(defaultValue)}
        </div>
      </fieldset>
    );
  }
);

ContentEditable.displayName = "ContentEditable";

export const ContentEditableWithForm = ({ name, defaultValue }: { name: string; defaultValue?: number }) => {
  const divRef = useRef<HTMLDivElement | null>();

  return (
    <CustomFieldController
      name={name}
      onSetValue={(value) => {
        if (!divRef.current) return;
        divRef.current.innerText = String(value);
      }}
      defaultValue={Number(defaultValue) || 0}
    >
      {({ triggerChange, triggerBlur, ref, defaultValue }) => {
        return (
          <ContentEditable
            onInput={(e) => {
              triggerChange({ name, value: Number(e.currentTarget.innerText) });
            }}
            onBlur={() => {
              triggerBlur({ name });
            }}
            ref={(r) => {
              ref(r);
              divRef.current = r;
            }}
            defaultValue={defaultValue as number | undefined}
          />
        );
      }}
    </CustomFieldController>
  );
};

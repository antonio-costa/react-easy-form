import { useCallback } from "react";
import { FormInternalState } from "../useForm";

export const useUpdateExternallySet = (formState: FormInternalState) =>
  useCallback(
    (fieldName: string, externallySet: boolean) => {
      const externallySetIndex = formState.fieldsExternallySet.current.findIndex((fname) => fname === fieldName);
      if (externallySet && externallySetIndex === -1) {
        formState.fieldsExternallySet.current.push(fieldName);
      } else if (!externallySet && externallySetIndex !== -1) {
        formState.fieldsExternallySet.current.splice(externallySetIndex, 1);
      }
    },
    [formState.fieldsExternallySet]
  );

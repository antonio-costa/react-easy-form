import { useCallback, useEffect, useState } from "react";
import { Observable } from "./useObservableRef";

export const useObserve = <T = unknown>(subscribable: Observable<T>) => {
  const [value, setValue] = useState(subscribable.current);
  const listener = useCallback((v: T) => setValue(v), []);

  useEffect(() => {
    const unsub = subscribable.observe(listener);
    return () => {
      unsub();
    };
  }, [listener, subscribable]);

  return value;
};

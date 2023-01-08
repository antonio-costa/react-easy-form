import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ObservableObserveCallback<T> = (value: T) => void;
export type ObservableObserve<T> = (cb: ObservableObserveCallback<T>) => () => void;

export type Observable<T> = {
  current: T;
  observe: ObservableObserve<T>;
  setValue: SetObservable<T>;
};
export type SetObservable<T> = (newValue: T | ((old: T) => T)) => void;

export const useObservableRef = <T>(initialValue: T): Observable<T> => {
  const value = useRef<T>(initialValue);
  const subscriptions = useRef<ObservableObserveCallback<T>[]>([]);
  return useMemo(() => {
    const subscribable: Observable<T> = {
      get current() {
        return value.current;
      },
      set current(_) {
        throw new Error("Cannot mutate directly an observable. Use setValue() function.");
      },
      observe: (cb) => {
        subscriptions.current.push(cb);
        return () => {
          subscriptions.current = subscriptions.current.filter((findCb) => findCb !== cb);
        };
      },
      setValue: (newValue) => {
        if (newValue instanceof Function) {
          value.current = newValue(value.current);
        } else {
          value.current = newValue;
        }
        subscriptions.current.forEach((cb) => cb(value.current));
      },
    };
    return subscribable;
  }, []);
};

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

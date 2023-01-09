import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type ObservableObserveCallback<T> = (value: T) => void;
export type ObservableObserve<T> = (cb: ObservableObserveCallback<T>, key?: string) => () => void;
export type SetObservable<T> = (newValue: T | ((old: T) => T), triggerKeyObservables?: string[]) => void;

export type Observable<T> = {
  current: T;
  observe: ObservableObserve<T>;
  setValue: SetObservable<T>;
};

export const useObservableRef = <T>(initialValue: T): Observable<T> => {
  const value = useRef<T>(initialValue);
  const subscriptions = useRef<ObservableObserveCallback<T>[]>([]);
  const keySubscriptions = useRef<Record<string, ObservableObserveCallback<T>[]>>({});

  return useMemo(() => {
    const subscribable: Observable<T> = {
      get current() {
        return value.current;
      },
      set current(_) {
        throw new Error("Cannot mutate directly an observable. Use setValue() function.");
      },
      observe: (cb, key) => {
        if (key) {
          if (keySubscriptions.current[key]) {
            keySubscriptions.current[key].push(cb);
          } else {
            keySubscriptions.current[key] = [cb];
          }
        } else {
          subscriptions.current.push(cb);
        }
        return () => {
          if (key && keySubscriptions.current[key]) {
            keySubscriptions.current[key] = keySubscriptions.current[key].filter((findCb) => findCb !== cb);
          } else {
            subscriptions.current = subscriptions.current.filter((findCb) => findCb !== cb);
          }
        };
      },
      setValue: (newValue, triggerKeyObservables) => {
        if (newValue instanceof Function) {
          value.current = newValue(value.current);
        } else {
          value.current = newValue;
        }
        subscriptions.current.forEach((cb) => cb(value.current));

        if (triggerKeyObservables) {
          triggerKeyObservables.forEach((triggeredKey) => {
            Object.keys(keySubscriptions.current).forEach((subscriptionKey) => {
              if (triggeredKey.startsWith(subscriptionKey)) {
                keySubscriptions.current[subscriptionKey].forEach((cb) => cb(value.current));
              }
            });
          });
        }
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

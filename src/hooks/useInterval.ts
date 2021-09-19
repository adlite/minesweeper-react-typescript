import {useEffect, useRef} from 'react';

type IntervalCallback = () => void;

export default function useInterval(callback: IntervalCallback, delay: number | null) {
  const savedCallback = useRef<IntervalCallback>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const tick = () => {
      if (savedCallback.current) {
        savedCallback.current();
      }
    };
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

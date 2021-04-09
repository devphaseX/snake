import { useEffect, useRef } from 'react';

export function useInterval<T extends Function>(
  callback: T,
  delay: number | null
): void {
  const savedCallback = useRef<Function>();

  //Remember the lastest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  //Set up the interval
  useEffect(() => {
    function tick() {
      savedCallback.current!();
    }

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

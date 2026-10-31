import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

// Smoothly counts from last value → target
export function useCountUp(target = 0, duration = 0.9) {
  const [value, setValue] = useState(0);
  const last = useRef(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      last.current = target;
      setValue(target);
      return;
    }
    const controls = animate(last.current, target, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => {
        last.current = v;
        setValue(v);
      },
    });
    return () => controls.stop();
  }, [target, duration, reduce]);

  return value;
}

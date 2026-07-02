import { useState, useEffect, useMemo } from "react";
import { SESSION_START, STEP_MS, N_POINTS } from "../data/staticEntities";

/**
 * useSessionClock
 * Único lugar donde "avanza el tiempo de sesión". Cualquier vista que
 * necesite saber "qué hora es ahora" consume este hook — así se garantiza
 * que dos pantallas nunca muestren dos momentos distintos de la sesión
 * (ver: por qué separamos esto en la conversación de diseño).
 *
 * @param {number} tickMs cada cuánto avanza una barra de 10 min (demo acelerada)
 */
 export function useSessionClock(tickMs = 6000) {
  const [simIndex, setSimIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSimIndex((idx) => Math.min(idx + 1, N_POINTS - 1));
    }, tickMs);

    return () => clearInterval(interval);
  }, [tickMs]);

  const currentTs = useMemo(
    () => SESSION_START + simIndex * STEP_MS,
    [simIndex]
  );

  return {
    simIndex,
    currentTs,
  };
}

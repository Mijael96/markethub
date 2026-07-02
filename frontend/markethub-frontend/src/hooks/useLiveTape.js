import { useState, useEffect, useRef, useCallback } from "react";
import { EXECUTIONS } from "../data/staticEntities";
import { SET_META } from "../config/theme";
import { createSeededRandom } from "../utils/seededRandom";

const TAPE_MAX = 40; // buffer acotado: nunca acumulamos eventos sin límite en memoria
const TICK_INTERVAL_MS = 1100;

const rng = createSeededRandom(99);

/**
 * useLiveTape
 * Simula el feed de WebSocket: cada ~1.1s "llega" un fill de alguna
 * ejecución al azar, que (a) entra al tape con buffer acotado y (b) mueve
 * el PnL de esa ejecución puntual mediante un jitter.
 *
 * El jitter representa el movimiento "todavía no asentado" dentro de la
 * barra de 10 min vigente del reloj de sesión: se resetea cada vez que
 * `simIndex` avanza, así el live feed siempre converge al valor oficial
 * de `statAt` en cuanto cierra la barra — nunca queda desincronizado.
 */
export function useLiveTape(simIndex) {
  const [tape, setTape] = useState([]);
  const [pulseBySet, setPulseBySet] = useState({});
  const [jitterByExecution, setJitterByExecution] = useState({});
  const idCounter = useRef(0);

  // Al avanzar el reloj de sesión, la barra anterior "cierra": se reabsorbe el jitter.
  useEffect(() => {
    setJitterByExecution({});
  }, [simIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      const exec = EXECUTIONS[Math.floor(rng() * EXECUTIONS.length)];
      const meta = SET_META[exec.set_id];
      const side = rng() > 0.5 ? "buy" : "sell";
      const refPx = exec.refPrice || exec.refA || exec.refImplicit || 1000;
      const price = refPx * (1 + (rng() - 0.5) * 0.01);
      const qty = Math.floor(50 + rng() * 900);

      // El edge esperado depende del tipo de estrategia: un MM captura spread
      // chico de forma consistente, un arbitraje captura bps más grandes
      // pero esporádicos.
      const edgeBps = exec.type === "mm_bonos_cedears" ? 8 + rng() * 10 : 15 + rng() * 30;
      const delta = (side === "buy" ? -1 : 1) * (rng() > 0.5 ? 1 : -1) * price * qty * (edgeBps / 10000) * (0.4 + rng());

      idCounter.current += 1;
      const tapeItem = {
        id: idCounter.current,
        ts: Date.now(),
        executionId: exec.id,
        executionName: exec.name,
        setId: exec.set_id,
        symbol: exec.instrument || exec.legA || exec.cedear,
        side, price, qty, delta,
        color: meta.color,
      };

      setTape((prev) => [tapeItem, ...prev].slice(0, TAPE_MAX));
      setPulseBySet((prev) => ({ ...prev, [exec.set_id]: Date.now() }));
      setJitterByExecution((prev) => ({ ...prev, [exec.id]: (prev[exec.id] ?? 0) + delta }));
    }, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const getJitterFor = useCallback((executionId) => jitterByExecution[executionId] ?? 0, [jitterByExecution]);

  const isSetRecentlyActive = useCallback(
    (setId) => Boolean(pulseBySet[setId] && Date.now() - pulseBySet[setId] < 1500),
    [pulseBySet]
  );

  return { tape, getJitterFor, isSetRecentlyActive, tapeMax: TAPE_MAX };
}

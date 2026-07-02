import { useEffect, useState } from "react";

const URL = "http://127.0.0.1:8000/api/v1/trading/historical-trades/";

export function useHistoricalTrades() {
  const [trades, setTrades] = useState([]);
  const [simulationCutoff, setSimulationCutoff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(URL);

        if (!response.ok) {
          throw new Error("No se pudieron obtener los trades");
        }

        const json = await response.json();

        if (cancelled) return;

        setTrades(json.trades ?? []);
        setSimulationCutoff(json.simulation_cutoff);
      } catch (err) {
        if (!cancelled) {
          setError(err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    trades,
    simulationCutoff,
    loading,
    error,
  };
}
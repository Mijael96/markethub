import { useEffect, useState } from "react";

const BASELINE_URL = "http://127.0.0.1:8000/api/v1/trading/baseline/";

export function useBaseline() {
  const [baseline, setBaseline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    let mounted = true;

    async function fetchBaseline() {
      try {
        const response = await fetch(BASELINE_URL);

        if (!response.ok) {
          throw new Error("Error obteniendo baseline");
        }

        const data = await response.json();

        if (mounted) {
          setBaseline(data);
        }

      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }


    fetchBaseline();


    return () => {
      mounted = false;
    };

  }, []);


  return {
    baseline,
    loading,
    error,
  };
}
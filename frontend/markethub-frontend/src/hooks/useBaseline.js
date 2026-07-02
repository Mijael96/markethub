import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const BASELINE_URL = `${API_BASE_URL}/trading/baseline/`;

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
/**
 * formatters.js
 * Funciones de formato 100% puras (mismo input -> mismo output, sin efectos).
 * Se separan de los componentes para poder testearlas de forma aislada
 * y para que ningún componente reimplemente su propio fmtARS "a mano".
 */

export const fmtARS = (n) => {
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  if (v >= 1e9) return `${sign}$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${sign}$${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${sign}$${(v / 1e3).toFixed(1)}K`;
  return `${sign}$${v.toFixed(0)}`;
};

export const fmtNum = (n, decimals = 0) =>
  n.toLocaleString("es-AR", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });

export const fmtBps = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(1)} bps`;

export const fmtPct = (n) => `${(n * 100).toFixed(1)}%`;

export const fmtTime = (ts) =>
  new Date(ts).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export function fmtDate(datetime) {
  if (!datetime) return "--/--";

  return new Date(datetime).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function fmtTimeSession(datetime) {
  if (!datetime) return "--:--";

  return datetime.split("T")[1].substring(0, 5);
}

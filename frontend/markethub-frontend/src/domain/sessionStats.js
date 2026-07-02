/**
 * sessionStats.js
 * Lógica de negocio pura (sin React, sin estado de UI) para responder:
 * "¿cuánto PnL y cuántos trades lleva esta ejecución hasta tal hora de sesión?"
 *
 * Esto es lo que evita la inconsistencia de "mostrar el cierre de las 20:00
 * cuando el reloj de sesión está en las 15:00": Portafolio y cualquier otra
 * vista que necesite un número "a esta hora" llaman a statAt con el mismo
 * índice de reloj, así nunca pueden divergir entre sí.
 *
 * Como el PnL se interpreta distinto según el tipo de estrategia (realizado
 * + no realizado para MM, vs. realized+unrealized para arbitrajes, vs. pnl
 * de la curva de equity para trend), se resuelve con tabla de despacho
 * (mismo patrón Strategy que seriesGenerators.js) en vez de un if/else
 * gigante — agregar un tipo nuevo no obliga a tocar esta función.
 */

import { EXECUTIONS } from "../data/staticEntities";
import { getSeriesFor } from "../data/sessionData";
import { createSeededRandom } from "../utils/seededRandom";

const rng = createSeededRandom(7); // seed propio para stats finales, independiente del de las series

const PNL_AT_POINT_BY_TYPE = {
  mm_bonos_cedears: (point) => point.total,
  arb_dolar_cable: (point) => point.realized + point.unrealized,
  arb_cedears_underlying: (point) => point.realized + point.unrealized,
  trend_futuros: (point) => point.pnl,
};

/** PnL y trades acumulados de una ejecución hasta el índice `simIndex` del reloj de sesión. */
export function statAt(executionId, simIndex) {
  const exec = EXECUTIONS.find((e) => e.id === executionId);
  const series = getSeriesFor(executionId);
  const clampedIndex = Math.min(simIndex, series.length - 1);
  const point = series[clampedIndex];
  const pnlResolver = PNL_AT_POINT_BY_TYPE[exec.type];
  const finalStats = getFinalStats(executionId);

  return {
    pnl: pnlResolver(point),
    trades: Math.max(1, Math.round(finalStats.total_trades * (clampedIndex + 1) / series.length)),
    win_rate: finalStats.win_rate,
  };
}

/**
 * Estadísticas de cierre de sesión por ejecución (las que alimentan las
 * métricas específicas de cada tipo: spread capturado, convergencias, etc.)
 * Memoizadas una sola vez por executionId.
 */
const finalStatsCache = {};

export function getFinalStats(executionId) {
  if (finalStatsCache[executionId]) return finalStatsCache[executionId];

  const exec = EXECUTIONS.find((e) => e.id === executionId);
  const series = getSeriesFor(executionId);
  const last = series[series.length - 1];
  const totalTrades = 60 + Math.floor(rng() * 60);

  const buildersByType = {
    mm_bonos_cedears: () => ({
      total_pnl: last.total, realized_pnl: last.realized, unrealized_pnl: last.unrealized, fees: last.fees,
      win_rate: 0.5 + rng() * 0.25,
      metrics: {
        spread_capturado_bps: average(series, "spread_bps"),
        fill_rate: average(series, "fill_rate"),
        cancel_ratio: average(series, "cancel_ratio"),
        inventario_max: Math.max(...series.map((p) => Math.abs(p.net_qty))),
      },
    }),
    arb_dolar_cable: () => ({
      total_pnl: last.realized + last.unrealized, realized_pnl: last.realized, unrealized_pnl: last.unrealized, fees: last.realized * 0.02,
      win_rate: 0.55 + rng() * 0.2,
      metrics: {
        spread_promedio_bps: average(series, "spread_bps"),
        spread_max_bps: Math.max(...series.map((p) => p.spread_bps)),
        spread_min_bps: Math.min(...series.map((p) => p.spread_bps)),
        convergencias: series.filter((p) => p.in_position).length,
      },
    }),
    arb_cedears_underlying: () => ({
      total_pnl: last.realized + last.unrealized, realized_pnl: last.realized, unrealized_pnl: last.unrealized, fees: last.realized * 0.02,
      win_rate: 0.5 + rng() * 0.2,
      metrics: {
        gap_promedio_bps: average(series, "gap_bps"),
        gap_max_bps: Math.max(...series.map((p) => p.gap_bps)),
        gap_min_bps: Math.min(...series.map((p) => p.gap_bps)),
      },
    }),
    trend_futuros: () => {
      const maxDrawdown = Math.min(...series.map((p) => p.drawdown));
      const returns = series.map((p, i) => (i === 0 ? 0 : p.pnl - series[i - 1].pnl));
      const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const stdReturn = Math.sqrt(returns.reduce((a, b) => a + (b - meanReturn) ** 2, 0) / returns.length) || 1;
      return {
        total_pnl: last.pnl, realized_pnl: last.pnl * 0.6, unrealized_pnl: last.pnl * 0.4, fees: Math.abs(last.pnl) * 0.015,
        win_rate: 0.4 + rng() * 0.25,
        metrics: {
          max_drawdown: maxDrawdown,
          sharpe: (meanReturn / stdReturn) * Math.sqrt(series.length),
          exposure_pct: Math.abs(last.position) / exec.limit,
        },
      };
    },
  };

  const stats = { total_trades: totalTrades, ...buildersByType[exec.type]() };
  finalStatsCache[executionId] = stats;
  return stats;
}

function average(series, key) {
  return series.reduce((acc, p) => acc + p[key], 0) / series.length;
}

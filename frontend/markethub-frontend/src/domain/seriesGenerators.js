/**
 * seriesGenerators.js
 *
 * Acá vive la heterogeneidad que pide la consigna: "un market maker no se
 * analiza igual que un arbitraje ni que una estrategia de trend". Cada tipo
 * de ejecución tiene su propio generador con su propio esquema de datos
 * (equivalente a los distintos shapes de metric_series.json / eventos
 * `metric` del WebSocket para cada `type`).
 *
 * Patrón Strategy: GENERATORS_BY_TYPE mapea `execution.type` -> función
 * generadora. Agregar un quinto tipo de estrategia es agregar una entrada
 * al mapa, sin tocar el código que ya funciona (Open/Closed Principle).
 */

import { createSeededRandom } from "../utils/seededRandom";
import { SESSION_START, STEP_MS, N_POINTS } from "../data/staticEntities";

const rng = createSeededRandom(42); // mismo seed que meta.json del dataset (reproducibilidad)

function generateMarketMakingSeries(exec) {
  const out = [];
  let inv = exec.id === "exec-carni-al30" ? -500000 : 0;
  let realized = 0;
  let walk = 0;
  for (let i = 0; i < N_POINTS; i++) {
    const ts = SESSION_START + i * STEP_MS;
    walk += (rng() - 0.5) * 0.6;
    inv = inv * 0.55 + (rng() - 0.5) * exec.maxPos * 0.9;
    inv = Math.max(-exec.maxPos, Math.min(exec.maxPos, inv));
    const mid = exec.refPrice * (1 + walk * 0.004);
    const spreadBps = 8 + rng() * 10;
    const fillsThisStep = Math.floor(2 + rng() * 6);
    realized += fillsThisStep * (exec.refPrice * (spreadBps / 10000)) * (50 + rng() * 200);
    const unrealized = inv * (mid - exec.refPrice);
    const fees = realized * 0.0009 + i * 50;
    out.push({
      ts, mid, net_qty: inv, inventory_value: inv * mid,
      spread_bps: spreadBps, fill_rate: 0.75 + rng() * 0.18, cancel_ratio: 0.03 + rng() * 0.06,
      realized, unrealized, fees, total: realized + unrealized - fees,
      trades_buy: Math.floor(fillsThisStep * (inv < 0 ? 0.6 : 0.4)),
      trades_sell: Math.floor(fillsThisStep * (inv < 0 ? 0.4 : 0.6)),
    });
  }
  return out;
}

function generateArbDolarCableSeries(exec) {
  const out = [];
  let realized = 0;
  let walk = 0;
  for (let i = 0; i < N_POINTS; i++) {
    const ts = SESSION_START + i * STEP_MS;
    walk += (rng() - 0.5) * 0.6;
    const pxA = exec.refA * (1 + walk * 0.003);
    const pxB = exec.refB * (1 + walk * 0.0021 + Math.sin(i / 4) * 0.0015);
    const spreadBps = ((pxB - pxA) / pxA) * 10000;
    const inPosition = Math.abs(spreadBps) > 18;
    if (inPosition && rng() > 0.7) realized += Math.abs(spreadBps) * 1800;
    const netExposure = (rng() - 0.5) * exec.refA * 400 * (inPosition ? 0.3 : 1);
    out.push({ ts, px_a: pxA, px_b: pxB, spread_bps: spreadBps, in_position: inPosition, realized, net_exposure: netExposure, unrealized: (rng() - 0.45) * 900000 });
  }
  return out;
}

function generateArbCedearUnderlyingSeries(exec) {
  const out = [];
  let realized = 0;
  let walk = 0;
  for (let i = 0; i < N_POINTS; i++) {
    const ts = SESSION_START + i * STEP_MS;
    walk += (rng() - 0.5) * 0.6;
    const fxImplicit = exec.refImplicit * (1 + walk * 0.0035);
    const fxReal = exec.refImplicit * (1 + Math.sin(i / 5) * 0.012 + walk * 0.0018);
    const gapBps = ((fxImplicit - fxReal) / fxReal) * 10000;
    if (rng() > 0.82) realized += Math.abs(gapBps) * 900;
    out.push({
      ts, fx_implicit: fxImplicit, fx_real: fxReal, gap_bps: gapBps, realized,
      unrealized: (rng() - 0.4) * 600000,
      long_qty: 1000 + Math.floor(rng() * 500),
      short_qty: -(1000 + Math.floor(rng() * 500)),
    });
  }
  return out;
}

function generateTrendFuturesSeries(exec) {
  const out = [];
  let drawWalk = 0;
  const trendBias = (rng() - 0.45) * 1.4;
  for (let i = 0; i < N_POINTS; i++) {
    const ts = SESSION_START + i * STEP_MS;
    drawWalk += (rng() - 0.5) * 0.8 + trendBias * 0.25;
    const price = exec.refPrice * (1 + drawWalk * 0.006);
    const position = trendBias > 0
      ? Math.min(exec.limit, exec.limit * Math.min(1, Math.max(0, drawWalk * 0.15 + 0.4)))
      : -Math.min(exec.limit, exec.limit * Math.min(1, Math.max(0, -drawWalk * 0.15 + 0.4)));
    const pnl = position * (drawWalk * 0.006) * exec.refPrice * 0.5;
    out.push({ ts, price, position, pnl });
  }
  return withDrawdown(out);
}

function withDrawdown(series) {
  let peak = -Infinity;
  return series.map((point) => {
    peak = Math.max(peak, point.pnl);
    return { ...point, peak, drawdown: point.pnl - peak };
  });
}

/** Tabla de despacho: tipo de ejecución -> generador de su serie. */
const GENERATORS_BY_TYPE = {
  mm_bonos_cedears: generateMarketMakingSeries,
  arb_dolar_cable: generateArbDolarCableSeries,
  arb_cedears_underlying: generateArbCedearUnderlyingSeries,
  trend_futuros: generateTrendFuturesSeries,
};

export function generateSeriesFor(exec) {
  const generator = GENERATORS_BY_TYPE[exec.type];
  if (!generator) throw new Error(`No hay generador de series para el tipo "${exec.type}"`);
  return generator(exec);
}

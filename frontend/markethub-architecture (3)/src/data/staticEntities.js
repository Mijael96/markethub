/**
 * staticEntities.js
 * Catálogo estático de conjuntos y ejecuciones — el equivalente "front" de
 * strategy_sets.json y executions.json del dataset entregado.
 * No contiene lógica, solo datos: si esto viniera de una API, este archivo
 * se reemplaza por un fetch sin tocar ningún componente (Dependency Inversion:
 * el resto de la app depende de la FORMA de estos objetos, no de su origen).
 */

export const STRATEGY_SETS = [
  { id: "set-carnicero", name: "El Carnicero", display_type: "Market Making Bonos/Cedears", description: "Cotiza ambas puntas en bonos y cedears líquidos, captura spread y rebatea contra inventario." },
  { id: "set-tobogan", name: "Tobogán Cable", display_type: "Arbitraje Dólar/Cable", description: "Arbitra el spread MEP vs CCL y mayorista. Patas largas y cortas en distintos dólares implícitos." },
  { id: "set-doble", name: "Doble o Nada", display_type: "Arbitraje Cedear vs Underlying", description: "Compara el FX implícito del cedear contra el underlying en USD usando el ratio de conversión." },
  { id: "set-fierro", name: "Fierro Caliente", display_type: "Trend / Momentum Futuros", description: "Sigue tendencia en futuros con cruces de medias y gestión de riesgo por drawdown." },
];

export const EXECUTIONS = [
  { id: "exec-carni-al30", set_id: "set-carnicero", name: "Carnicero - Faena AL30", type: "mm_bonos_cedears", status: "running", instrument: "AL30", maxPos: 10000000, refPrice: 62500 },
  { id: "exec-carni-gd30", set_id: "set-carnicero", name: "Carnicero - Faena GD30", type: "mm_bonos_cedears", status: "paused", instrument: "GD30", maxPos: 5000000, refPrice: 71200 },
  { id: "exec-carni-aapl", set_id: "set-carnicero", name: "Carnicero - Milanesa AAPL", type: "mm_bonos_cedears", status: "running", instrument: "AAPL.BA", maxPos: 5000, refPrice: 28950 },
  { id: "exec-carni-meli", set_id: "set-carnicero", name: "Carnicero - Asado MELI", type: "mm_bonos_cedears", status: "running", instrument: "MELI.BA", maxPos: 5000, refPrice: 41500 },
  { id: "exec-tobo-mepccl", set_id: "set-tobogan", name: "Tobogán - Resbalón MEP/CCL", type: "arb_dolar_cable", status: "running", legA: "MEP", legB: "CCL", refA: 1185, refB: 1212 },
  { id: "exec-tobo-maycable", set_id: "set-tobogan", name: "Tobogán - Caída Libre May/Cable", type: "arb_dolar_cable", status: "running", legA: "USD.MAY", legB: "CCL", refA: 1078, refB: 1212 },
  { id: "exec-doble-aapl", set_id: "set-doble", name: "Doble - Manzana Podrida", type: "arb_cedears_underlying", status: "paused", cedear: "AAPL.BA", underlying: "AAPL", ratio: 1 / 10, refImplicit: 1190 },
  { id: "exec-doble-tsla", set_id: "set-doble", name: "Doble - Plena Combustión TSLA", type: "arb_cedears_underlying", status: "running", cedear: "TSLA.BA", underlying: "TSLA", ratio: 1 / 15, refImplicit: 1205 },
  { id: "exec-fierro-dlr", set_id: "set-fierro", name: "Fierro - Rolido Dólar Futuro", type: "trend_futuros", status: "running", instrument: "DLR/JUL26", refPrice: 1240, limit: 8000000 },
  { id: "exec-fierro-oro", set_id: "set-fierro", name: "Fierro - Brasa Oro", type: "trend_futuros", status: "running", instrument: "GOLD/AGO26", refPrice: 2620, limit: 6000000 },
  { id: "exec-fierro-rfx", set_id: "set-fierro", name: "Fierro - Chisporroteo RFX20", type: "trend_futuros", status: "paused", instrument: "RFX20/JUL26", refPrice: 56400, limit: 9000000 },
];

export const SESSION_START = new Date("2026-06-18T14:00:00Z").getTime();
export const SESSION_END = new Date("2026-06-18T20:00:00Z").getTime();
export const STEP_MS = 10 * 60 * 1000; // 10 min, igual que metric_series.json real
export const N_POINTS = Math.floor((SESSION_END - SESSION_START) / STEP_MS) + 1;

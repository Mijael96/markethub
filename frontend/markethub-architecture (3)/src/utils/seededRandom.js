/**
 * seededRandom.js
 * Generador pseudoaleatorio determinístico (LCG). Aislado en su propio módulo
 * porque es la única pieza de "azar" del sistema: si mañana se reemplaza por
 * datos reales del backend, este es el único archivo que se elimina.
 */

export function createSeededRandom(seed) {
  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;
  return function next() {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

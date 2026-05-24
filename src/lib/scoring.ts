import { Prediccion, PrediccionPartidos, ResultadosReales, PuntajeDetalles } from '../types';

export const DEFAULT_RESULTADOS: ResultadosReales = {
  primerPuesto: null,
  segundoPuesto: null,
  tercerPuesto: null,
  ecuadorPosicion: null,
  partido1: null,
  partido2: null,
  partido3: null,
};

// Puntos por cada acierto
export const PUNTOS: Record<keyof PuntajeDetalles, number> = {
  podio1:   3,
  podio2:   2,
  podio3:   1,
  ecuador:  5,
  partido1: 2,
  partido2: 2,
  partido3: 2,
};

export const MAX_PUNTAJE: number = (Object.values(PUNTOS) as number[]).reduce((a, b) => a + b, 0); // 17

// Convierte posición (1-48) al índice de fase (0=Grupos … 5=Final)
// para comparación por fase en lugar de posición exacta
function getFaseId(pos: number): number {
  if (pos >= 33) return 0;
  if (pos >= 17) return 1;
  if (pos >= 9)  return 2;
  if (pos >= 5)  return 3;
  if (pos >= 3)  return 4;
  return 5;
}

export function calcularPuntaje(
  prediccion: Prediccion | null,
  partidos: PrediccionPartidos | null,
  resultados: ResultadosReales,
): { puntaje: number; detalles: PuntajeDetalles } {
  const d: PuntajeDetalles = {
    podio1: false, podio2: false, podio3: false,
    ecuador: false,
    partido1: false, partido2: false, partido3: false,
  };

  if (prediccion) {
    if (resultados.primerPuesto !== null  && prediccion.primerPuesto  === resultados.primerPuesto)  d.podio1 = true;
    if (resultados.segundoPuesto !== null && prediccion.segundoPuesto === resultados.segundoPuesto) d.podio2 = true;
    if (resultados.tercerPuesto !== null  && prediccion.tercerPuesto  === resultados.tercerPuesto)  d.podio3 = true;
    if (resultados.ecuadorPosicion !== null &&
        getFaseId(prediccion.ecuadorPosicion) === getFaseId(resultados.ecuadorPosicion))            d.ecuador = true;
  }

  if (partidos) {
    if (resultados.partido1 !== null && partidos.partido1 === resultados.partido1) d.partido1 = true;
    if (resultados.partido2 !== null && partidos.partido2 === resultados.partido2) d.partido2 = true;
    if (resultados.partido3 !== null && partidos.partido3 === resultados.partido3) d.partido3 = true;
  }

  const puntaje = (Object.keys(d) as Array<keyof PuntajeDetalles>)
    .filter(k => d[k])
    .reduce((sum, k) => sum + PUNTOS[k], 0);

  return { puntaje, detalles: d };
}

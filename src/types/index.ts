export interface Usuario {
  id: string;
  nombreCompleto: string;
  correoInstitucional: string;
  contrasenaHash: string;
  nivel: '1ro' | '2do' | '3ro' | '4to' | '5to' | '6to' | '7mo' | '8vo';
  carrera: 'Tecnología de la Información' | 'Ingeniería en Software';
  creadoEn: string;
  esAdmin?: boolean;
}

export interface UsuarioConPrediccion extends Omit<Usuario, 'contrasenaHash'> {
  prediccion: Prediccion | null;
  prediccionPartidos: PrediccionPartidos | null;
}

export interface Configuracion {
  prediccionesAbiertas: boolean;
}

export type ResultadoPartido = 'ecuador' | 'empate' | 'rival';

export interface PrediccionPartidos {
  id: string;
  usuarioId: string;
  partido1: ResultadoPartido; // 14/6 vs Costa de Marfil
  partido2: ResultadoPartido; // 20/6 vs Curazao
  partido3: ResultadoPartido; // 25/6 vs Alemania
  creadoEn: string;
}

export interface Prediccion {
  id: string;
  usuarioId: string;
  primerPuesto: string;
  segundoPuesto: string;
  tercerPuesto: string;
  ecuadorPosicion: number;
  creadoEn: string;
}

// Resultados reales ingresados por el admin
export interface ResultadosReales {
  primerPuesto: string | null;
  segundoPuesto: string | null;
  tercerPuesto: string | null;
  ecuadorPosicion: number | null;   // posición representativa de la fase
  partido1: ResultadoPartido | null;
  partido2: ResultadoPartido | null;
  partido3: ResultadoPartido | null;
}

// Desglose de qué acertó un usuario
export interface PuntajeDetalles {
  podio1: boolean;   // 3 pts
  podio2: boolean;   // 2 pts
  podio3: boolean;   // 1 pt
  ecuador: boolean;  // 5 pts
  partido1: boolean; // 2 pts
  partido2: boolean; // 2 pts
  partido3: boolean; // 2 pts
}

// Entrada del ranking/clasificación
export interface EntradaClasificacion {
  id: string;
  nombreCompleto: string;
  carrera: string;
  nivel: string;
  puntaje: number;
  detalles: PuntajeDetalles;
  tienePrediccion: boolean;
  tienePartidos: boolean;
}

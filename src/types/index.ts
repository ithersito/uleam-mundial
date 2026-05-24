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

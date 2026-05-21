export interface Usuario {
  id: string;
  nombreCompleto: string;
  correoInstitucional: string;
  contrasenaHash: string;
  nivel: '1ro' | '2do' | '3ro' | '4to' | '5to' | '6to' | '7mo' | '8vo';
  carrera: 'Tecnología de la Información' | 'Ingeniería en Software';
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

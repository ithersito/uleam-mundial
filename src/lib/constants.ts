// Partido inaugural: México, 11 jun 2026 14:00 hora Ecuador (UTC-5) = 19:00 UTC
export const MUNDIAL_START = new Date('2026-06-11T19:00:00Z');

export function isMundialStarted(): boolean {
  return Date.now() >= MUNDIAL_START.getTime();
}

export const PAISES_REGIONES = [
  { region: 'Coanfitriones (CONCACAF)',                  paises: ['Canadá', 'Estados Unidos', 'México'] },
  { region: 'Sudamérica (CONMEBOL)',                     paises: ['Argentina', 'Brasil', 'Colombia', 'Ecuador', 'Paraguay', 'Uruguay'] },
  { region: 'Europa (UEFA)',                             paises: ['Alemania', 'Austria', 'Bélgica', 'Bosnia y Herzegovina', 'Croacia', 'Escocia', 'España', 'Francia', 'Inglaterra', 'Noruega', 'Países Bajos', 'Portugal', 'República Checa', 'Suecia', 'Suiza', 'Turquía'] },
  { region: 'Norte, Centroamérica y Caribe (CONCACAF)',  paises: ['Curazao', 'Haití', 'Panamá'] },
  { region: 'Asia (AFC)',                                paises: ['Arabia Saudí', 'Australia', 'Catar', 'Corea del Sur', 'Irak', 'Irán', 'Japón', 'Jordania', 'Uzbekistán'] },
  { region: 'África (CAF)',                              paises: ['Argelia', 'Cabo Verde', 'Costa de Marfil', 'Egipto', 'Ghana', 'Marruecos', 'República Democrática del Congo', 'Senegal', 'Sudáfrica', 'Túnez'] },
];

export const FASES_COPA = [
  { label: 'Fase de Grupos',         short: 'Grupos',        color: '#ff6d00', equipos: 48, min: 33, max: 48, pos: 40, icon: '🟠' },
  { label: 'Dieciseisavos de Final', short: 'Dieciseisavos', color: '#ffd600', equipos: 32, min: 17, max: 32, pos: 24, icon: '🟡' },
  { label: 'Octavos de Final',       short: 'Octavos',       color: '#00e5ff', equipos: 16, min: 9,  max: 16, pos: 12, icon: '🔵' },
  { label: 'Cuartos de Final',       short: 'Cuartos',       color: '#bf00ff', equipos: 8,  min: 5,  max: 8,  pos: 6,  icon: '🟣' },
  { label: 'Semifinales',            short: 'Semifinal',     color: '#ff0080', equipos: 4,  min: 3,  max: 4,  pos: 4,  icon: '🔴' },
  { label: 'Gran Final',             short: 'Final',         color: '#ffd600', equipos: 2,  min: 1,  max: 2,  pos: 1,  icon: '🏆' },
];

export type FaseCopa = typeof FASES_COPA[number];

export function getFaseCopa(pos: number): FaseCopa {
  return FASES_COPA.find(f => pos >= f.min && pos <= f.max) ?? FASES_COPA[0];
}

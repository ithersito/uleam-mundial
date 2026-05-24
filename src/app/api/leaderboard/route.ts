import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT, SESSION_COOKIE_NAME } from '@/lib/auth';
import { db } from '@/lib/db';
import { calcularPuntaje } from '@/lib/scoring';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    const user = await verifyJWT(token);
    if (!user) return NextResponse.json({ error: 'Sesión inválida.' }, { status: 401 });

    const [usuarios, resultados] = await Promise.all([
      db.getAllUsersWithPredictions(),
      db.getResultadosReales(),
    ]);

    const leaderboard = usuarios
      .filter(u => !u.esAdmin)
      .map(u => {
        const { puntaje, detalles } = calcularPuntaje(u.prediccion, u.prediccionPartidos, resultados);
        return {
          id: u.id,
          nombreCompleto: u.nombreCompleto,
          carrera: u.carrera,
          nivel: u.nivel,
          puntaje,
          detalles,
          tienePrediccion: u.prediccion !== null,
          tienePartidos: u.prediccionPartidos !== null,
        };
      })
      .sort((a, b) => b.puntaje - a.puntaje || a.nombreCompleto.localeCompare(b.nombreCompleto));

    return NextResponse.json({ leaderboard, resultados });
  } catch {
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

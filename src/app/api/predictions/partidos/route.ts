import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT, SESSION_COOKIE_NAME } from '@/lib/auth';
import { db } from '@/lib/db';
import { ResultadoPartido } from '@/types';

const RESULTADOS_VALIDOS: ResultadoPartido[] = ['ecuador', 'empate', 'rival'];

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const user = token ? await verifyJWT(token) : null;
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

    const prediccion = await db.getPartidosPredictionByUserId(user.id);
    return NextResponse.json({ prediccion });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const user = token ? await verifyJWT(token) : null;
    if (!user) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });

    const body = await req.json();
    const { partido1, partido2, partido3 } = body;

    if (!RESULTADOS_VALIDOS.includes(partido1) || !RESULTADOS_VALIDOS.includes(partido2) || !RESULTADOS_VALIDOS.includes(partido3)) {
      return NextResponse.json({ error: 'Resultados inválidos.' }, { status: 400 });
    }

    const existente = await db.getPartidosPredictionByUserId(user.id);
    if (existente) {
      return NextResponse.json({ error: 'Ya enviaste tus predicciones de partidos. No se pueden modificar.' }, { status: 409 });
    }

    const prediccion = await db.createPartidosPrediction({ usuarioId: user.id, partido1, partido2, partido3 });
    return NextResponse.json({ prediccion }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

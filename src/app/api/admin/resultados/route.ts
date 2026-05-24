import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT, SESSION_COOKIE_NAME } from '@/lib/auth';
import { db } from '@/lib/db';

async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await verifyJWT(token) : null;
  return user?.esAdmin ? user : null;
}

export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    const resultados = await db.getResultadosReales();
    return NextResponse.json({ resultados });
  } catch {
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    const body = await request.json();
    const resultados = await db.setResultadosReales(body);
    return NextResponse.json({ resultados });
  } catch {
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}

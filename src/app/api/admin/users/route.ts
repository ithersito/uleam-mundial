import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT, SESSION_COOKIE_NAME } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user || !user.esAdmin) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    }

    const usuarios = await db.getAllUsersWithPredictions();
    return NextResponse.json({ usuarios });
  } catch (error) {
    console.error('Error en /api/admin/users:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

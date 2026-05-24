import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT, SESSION_COOKIE_NAME } from '@/lib/auth';
import { db } from '@/lib/db';

export async function DELETE(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    const user = token ? await verifyJWT(token) : null;

    if (!user || !user.esAdmin) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 403 });
    }

    const { userId } = await params;
    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido.' }, { status: 400 });
    }

    await db.deletePredictionByUserId(userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error en DELETE /api/admin/predictions:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

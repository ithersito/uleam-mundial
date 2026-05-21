import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const response = NextResponse.json({
      message: 'Sesión cerrada correctamente.',
    });

    // Eliminar la cookie configurando su expiración a 0
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error en logout:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al cerrar la sesión.' },
      { status: 500 }
    );
  }
}

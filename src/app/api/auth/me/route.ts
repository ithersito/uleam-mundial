import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyJWT, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    // Obtener cookie de sesión de la request
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map(c => c.trim().split('='))
    );
    const token = cookies[SESSION_COOKIE_NAME];

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado. No existe sesión activa.' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = await verifyJWT(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Sesión inválida o expirada.' },
        { status: 401 }
      );
    }

    // Buscar usuario en base de datos
    const usuario = await db.getUserById(decoded.id);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no encontrado.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      usuario: {
        id: usuario.id,
        nombreCompleto: usuario.nombreCompleto,
        correoInstitucional: usuario.correoInstitucional,
        nivel: usuario.nivel,
        carrera: usuario.carrera,
      },
    });
  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al obtener la información de sesión.' },
      { status: 500 }
    );
  }
}

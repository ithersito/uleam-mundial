import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, signJWT, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { correoInstitucional, contrasena } = body;

    // 1. Validar campos
    if (!correoInstitucional || !contrasena) {
      return NextResponse.json(
        { error: 'Por favor, ingrese el correo y la contraseña.' },
        { status: 400 }
      );
    }

    // 2. Buscar usuario
    const usuario = await db.getUserByEmail(correoInstitucional);
    if (!usuario) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Verifique el correo y la contraseña.' },
        { status: 400 }
      );
    }

    // 3. Verificar contraseña
    const esValida = await verifyPassword(contrasena, usuario.contrasenaHash);
    if (!esValida) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Verifique el correo y la contraseña.' },
        { status: 400 }
      );
    }

    // 4. Crear JWT
    const token = await signJWT({
      id: usuario.id,
      email: usuario.correoInstitucional,
      nombre: usuario.nombreCompleto,
      esAdmin: usuario.esAdmin ?? false,
    });

    const response = NextResponse.json({
      message: 'Inicio de sesión exitoso.',
      esAdmin: usuario.esAdmin ?? false,
      usuario: {
        id: usuario.id,
        nombreCompleto: usuario.nombreCompleto,
        correoInstitucional: usuario.correoInstitucional,
        nivel: usuario.nivel,
        carrera: usuario.carrera,
      },
    });

    // 5. Guardar en cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado al iniciar sesión.' },
      { status: 500 }
    );
  }
}

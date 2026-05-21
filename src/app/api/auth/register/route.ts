import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, signJWT, validateUleamEmail, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombreCompleto, correoInstitucional, contrasena, confirmarContrasena, nivel, carrera } = body;

    // 1. Validar campos requeridos
    if (!nombreCompleto || !correoInstitucional || !contrasena || !confirmarContrasena || !nivel || !carrera) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios.' },
        { status: 400 }
      );
    }

    // 2. Validar formato de correo institucional ULEAM
    if (!validateUleamEmail(correoInstitucional)) {
      return NextResponse.json(
        { error: 'El correo debe ser institucional con el formato: e1234567890@live.uleam.edu.ec (Empieza con "e", seguido de números).' },
        { status: 400 }
      );
    }

    // 3. Validar concordancia de contraseñas
    if (contrasena !== confirmarContrasena) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden.' },
        { status: 400 }
      );
    }

    // 4. Validar longitud de contraseña
    if (contrasena.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    // 5. Validar nivel
    const nivelesValidos = ['1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo'];
    if (!nivelesValidos.includes(nivel)) {
      return NextResponse.json(
        { error: 'Nivel no válido.' },
        { status: 400 }
      );
    }

    // 6. Validar carrera
    const carrerasValidas = ['Tecnología de la Información', 'Ingeniería en Software'];

    if (!carrerasValidas.includes(carrera)) {
      return NextResponse.json(
        { error: 'Carrera no válida.' },
        { status: 400 }
      );
    }

    // 7. Verificar si el usuario ya existe
    const usuarioExistente = await db.getUserByEmail(correoInstitucional);
    if (usuarioExistente) {
      return NextResponse.json(
        { error: 'El correo electrónico institucional ya se encuentra registrado.' },
        { status: 400 }
      );
    }

    // 8. Hashear la contraseña
    const contrasenaHash = await hashPassword(contrasena);

    // 9. Crear el usuario
    const nuevoUsuario = await db.createUser({
      nombreCompleto,
      correoInstitucional: correoInstitucional.toLowerCase().trim(),
      contrasenaHash,
      nivel,
      carrera,
    });

    // 10. Iniciar sesión automáticamente (crear JWT y cookie)
    const token = await signJWT({
      id: nuevoUsuario.id,
      email: nuevoUsuario.correoInstitucional,
      nombre: nuevoUsuario.nombreCompleto,
    });

    const response = NextResponse.json(
      {
        message: 'Registro exitoso.',
        usuario: {
          id: nuevoUsuario.id,
          nombreCompleto: nuevoUsuario.nombreCompleto,
          correoInstitucional: nuevoUsuario.correoInstitucional,
          nivel: nuevoUsuario.nivel,
          carrera: nuevoUsuario.carrera,
        },
      },
      { status: 201 }
    );

    // Establecer la cookie HTTP-only segura
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
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado al procesar el registro.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyJWT, SESSION_COOKIE_NAME } from '@/lib/auth';
import { isMundialStarted } from '@/lib/constants';

// Helper para obtener el usuario autenticado
async function getAuthenticatedUser(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => c.trim().split('='))
  );
  const token = cookies[SESSION_COOKIE_NAME];

  if (!token) return null;
  return await verifyJWT(token);
}

// GET: Obtener la predicción del usuario
export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado.' },
        { status: 401 }
      );
    }

    const prediccion = await db.getPredictionByUserId(user.id);
    return NextResponse.json({ prediccion });
  } catch (error) {
    console.error('Error obteniendo predicción:', error);
    return NextResponse.json(
      { error: 'Error al recuperar tu predicción.' },
      { status: 500 }
    );
  }
}

// POST: Registrar la predicción del usuario
export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado.' },
        { status: 401 }
      );
    }

    // 1. Verificar si el Mundial ya comenzó (cierre automático por fecha)
    if (isMundialStarted()) {
      return NextResponse.json(
        { error: 'Las predicciones están cerradas. El Mundial ya comenzó el 11 de junio de 2026.' },
        { status: 403 }
      );
    }

    // 1b. Verificar si las predicciones están cerradas manualmente por el admin
    const config = await db.getConfig();
    if (!config.prediccionesAbiertas) {
      return NextResponse.json(
        { error: 'Las predicciones están cerradas. El plazo de envío ha finalizado.' },
        { status: 403 }
      );
    }

    // 3. Verificar si ya tiene una predicción
    const prediccionExistente = await db.getPredictionByUserId(user.id);
    if (prediccionExistente) {
      return NextResponse.json(
        { error: 'Por reglamento, solo puedes enviar una predicción y no puede ser modificada.' },
        { status: 400 }
      );
    }

    // 4. Obtener y validar datos
    const body = await request.json();
    const { primerPuesto, segundoPuesto, tercerPuesto, ecuadorPosicion } = body;

    if (!primerPuesto || !segundoPuesto || !tercerPuesto || !ecuadorPosicion) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos para guardar la predicción.' },
        { status: 400 }
      );
    }

    // 5. Validar que no haya países duplicados en el podio
    if (primerPuesto === segundoPuesto || primerPuesto === tercerPuesto || segundoPuesto === tercerPuesto) {
      return NextResponse.json(
        { error: 'No puedes elegir el mismo país para más de un puesto en el podio.' },
        { status: 400 }
      );
    }

    // 6. Validar posición de Ecuador (1 a 48)
    const pos = parseInt(ecuadorPosicion, 10);
    if (isNaN(pos) || pos < 1 || pos > 48) {
      return NextResponse.json(
        { error: 'La posición estimada de Ecuador debe ser un número entero entre 1 y 48.' },
        { status: 400 }
      );
    }

    // 7. Guardar predicción
    const nuevaPrediccion = await db.createPrediction({
      usuarioId: user.id,
      primerPuesto,
      segundoPuesto,
      tercerPuesto,
      ecuadorPosicion: pos,
    });

    return NextResponse.json(
      {
        message: 'Predicción guardada exitosamente.',
        prediccion: nuevaPrediccion,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error al guardar predicción:', error);
    return NextResponse.json(
      { error: error.message || 'Ocurrió un error inesperado al procesar la predicción.' },
      { status: 500 }
    );
  }
}

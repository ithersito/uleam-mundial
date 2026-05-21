import fs from 'fs';
import path from 'path';
import { Usuario, Prediccion, UsuarioConPrediccion } from '../types';

// Rutas para base de datos local
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Interface para el JSON local
interface LocalDB {
  usuarios: Usuario[];
  predicciones: Prediccion[];
}

// Inicializar base de datos local si no existe
function initLocalDB(): LocalDB {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const defaultData: LocalDB = { usuarios: [], predicciones: [] };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), 'utf-8');
    return defaultData;
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error leyendo la base de datos local:', error);
    return { usuarios: [], predicciones: [] };
  }
}

function saveLocalDB(data: LocalDB) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error guardando la base de datos local:', error);
  }
}

// Configuración de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_KEY);

// Helper para peticiones fetch a Supabase REST API
async function fetchSupabase(endpoint: string, options: RequestInit = {}) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase no está configurado');
  }

  const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Error de Supabase en ${endpoint}:`, errorText);
    throw new Error(`Error en base de datos: ${response.statusText} (${errorText})`);
  }

  // Si es un DELETE o un POST que no devuelve contenido
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const db = {
  // --- MÉTODOS DE USUARIOS ---

  async getUserByEmail(email: string): Promise<Usuario | null> {
    const normalizedEmail = email.toLowerCase().trim();

    if (isSupabaseConfigured) {
      try {
        // En supabase, las columnas están con snake_case
        const data = await fetchSupabase(`usuarios?correo_institucional=eq.${encodeURIComponent(normalizedEmail)}&select=*`);
        if (!data || data.length === 0) return null;
        
        const u = data[0];
        return {
          id: u.id,
          nombreCompleto: u.nombre_completo,
          correoInstitucional: u.correo_institucional,
          contrasenaHash: u.contrasena_hash,
          nivel: u.nivel,
          carrera: u.carrera,
          creadoEn: u.creado_en,
        };
      } catch (error) {
        console.error('Error obteniendo usuario de Supabase, usando fallback local...', error);
      }
    }

    // Fallback local
    const localDb = initLocalDB();
    const user = localDb.usuarios.find(u => u.correoInstitucional.toLowerCase() === normalizedEmail);
    return user || null;
  },

  async getUserById(id: string): Promise<Usuario | null> {
    if (isSupabaseConfigured) {
      try {
        const data = await fetchSupabase(`usuarios?id=eq.${id}&select=*`);
        if (!data || data.length === 0) return null;
        
        const u = data[0];
        return {
          id: u.id,
          nombreCompleto: u.nombre_completo,
          correoInstitucional: u.correo_institucional,
          contrasenaHash: u.contrasena_hash,
          nivel: u.nivel,
          carrera: u.carrera,
          creadoEn: u.creado_en,
        };
      } catch (error) {
        console.error('Error obteniendo usuario por ID de Supabase, usando fallback local...', error);
      }
    }

    // Fallback local
    const localDb = initLocalDB();
    const user = localDb.usuarios.find(u => u.id === id);
    return user || null;
  },

  async createUser(user: Omit<Usuario, 'id' | 'creadoEn'>): Promise<Usuario> {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    const creadoEn = new Date().toISOString();
    const nuevoUsuario: Usuario = {
      ...user,
      id,
      creadoEn,
    };

    if (isSupabaseConfigured) {
      try {
        await fetchSupabase('usuarios', {
          method: 'POST',
          headers: {
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            id,
            nombre_completo: user.nombreCompleto,
            correo_institucional: user.correoInstitucional.toLowerCase().trim(),
            contrasena_hash: user.contrasenaHash,
            nivel: user.nivel,
            carrera: user.carrera,
            creado_en: creadoEn,
          }),
        });
        return nuevoUsuario;
      } catch (error) {
        console.error('Error creando usuario en Supabase, guardando localmente...', error);
      }
    }

    // Fallback local
    const localDb = initLocalDB();
    localDb.usuarios.push(nuevoUsuario);
    saveLocalDB(localDb);
    return nuevoUsuario;
  },

  // --- MÉTODOS DE PREDICCIONES ---

  async getPredictionByUserId(userId: string): Promise<Prediccion | null> {
    if (isSupabaseConfigured) {
      try {
        const data = await fetchSupabase(`predicciones?usuario_id=eq.${userId}&select=*`);
        if (!data || data.length === 0) return null;
        
        const p = data[0];
        return {
          id: p.id,
          usuarioId: p.usuario_id,
          primerPuesto: p.primer_puesto,
          segundoPuesto: p.segundo_puesto,
          tercerPuesto: p.tercer_puesto,
          ecuadorPosicion: p.ecuador_posicion,
          creadoEn: p.creado_en,
        };
      } catch (error) {
        console.error('Error obteniendo predicción de Supabase, usando fallback local...', error);
      }
    }

    // Fallback local
    const localDb = initLocalDB();
    const prediction = localDb.predicciones.find(p => p.usuarioId === userId);
    return prediction || null;
  },

  async getAllUsersWithPredictions(): Promise<UsuarioConPrediccion[]> {
    const localDb = initLocalDB();
    return localDb.usuarios.map(({ contrasenaHash: _, ...u }) => ({
      ...u,
      prediccion: localDb.predicciones.find(p => p.usuarioId === u.id) ?? null,
    }));
  },

  async createPrediction(prediction: Omit<Prediccion, 'id' | 'creadoEn'>): Promise<Prediccion> {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
    const creadoEn = new Date().toISOString();
    const nuevaPrediccion: Prediccion = {
      ...prediction,
      id,
      creadoEn,
    };

    if (isSupabaseConfigured) {
      try {
        await fetchSupabase('predicciones', {
          method: 'POST',
          headers: {
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            id,
            usuario_id: prediction.usuarioId,
            primer_puesto: prediction.primerPuesto,
            segundo_puesto: prediction.segundoPuesto,
            tercer_puesto: prediction.tercerPuesto,
            ecuador_posicion: prediction.ecuadorPosicion,
            creado_en: creadoEn,
          }),
        });
        return nuevaPrediccion;
      } catch (error) {
        console.error('Error creando predicción en Supabase, guardando localmente...', error);
      }
    }

    // Fallback local
    const localDb = initLocalDB();
    // Validar que sea única por usuario (reemplazar o lanzar error. El requerimiento dice una sola)
    const index = localDb.predicciones.findIndex(p => p.usuarioId === prediction.usuarioId);
    if (index !== -1) {
      throw new Error('El usuario ya cuenta con una predicción registrada.');
    }
    
    localDb.predicciones.push(nuevaPrediccion);
    saveLocalDB(localDb);
    return nuevaPrediccion;
  }
};

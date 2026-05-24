<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# GYPS — Gana Y Pasa el Semestre

Aplicación de predicciones del Mundial 2026 para estudiantes de ULEAM. Los estudiantes realizan tres tipos de predicciones:
1. **Podio** — 1°, 2°, 3° del torneo (inmutable tras envío)
2. **Fase de Ecuador** — hasta qué fase llega Ecuador (posición 1–48, inmutable)
3. **Resultados Grupo E** — ganador de cada partido de Ecuador vs Costa de Marfil, Curazao y Alemania (inmutable)

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16.2.6 (App Router) |
| UI | React 19, Tailwind CSS 4, lucide-react |
| Lenguaje | TypeScript 5 (strict) |
| Auth | JWT (`jose` v6) + cookies httpOnly |
| Base de datos | JSON local (`data/db.json`) con fallback Supabase REST |
| Hashing | SHA-256 + sal estática (demo — no apto para producción) |
| Deploy | Vercel |

---

## Estructura relevante

```
src/
├── app/
│   ├── api/
│   │   ├── auth/login/route.ts                    # POST: autenticar usuario
│   │   ├── auth/logout/route.ts                   # POST: cerrar sesión
│   │   ├── auth/me/route.ts                       # GET: usuario autenticado
│   │   ├── auth/register/route.ts                 # POST: registro + auto-login
│   │   ├── predictions/route.ts                   # GET/POST: predicción de podio + fase Ecuador
│   │   ├── predictions/partidos/route.ts          # GET/POST: predicción de partidos Grupo E
│   │   └── admin/
│   │       ├── users/route.ts                     # GET: todos los usuarios con predicciones
│   │       ├── config/route.ts                    # GET/POST: abrir/cerrar predicciones
│   │       └── predictions/[userId]/route.ts      # DELETE: borrar predicción de un usuario
│   ├── admin/page.tsx                             # Panel de administración
│   ├── dashboard/page.tsx                         # Vista principal post-login
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── page.tsx                                   # Home con contador regresivo
├── components/ui/
│   ├── spinner.tsx                                # Spinner neon animado
│   └── toast.tsx                                  # Notificaciones (success/error/info)
├── lib/
│   ├── auth.ts                                    # JWT, hash, validación email ULEAM
│   ├── constants.ts                               # MUNDIAL_START y otras constantes
│   └── db.ts                                      # CRUD sobre JSON local / Supabase
├── middleware.ts                                  # Protege /dashboard y /admin, redirige auth
└── types/index.ts                                 # Interfaces TypeScript
data/db.json                                       # BD local (usuarios, predicciones, prediccionesPartidos)
schema.sql                                         # Esquema PostgreSQL / Supabase
```

---

## Modelos de datos (`types/index.ts`)

```ts
// Predicción del podio y fase de Ecuador
interface Prediccion {
  id: string; usuarioId: string;
  primerPuesto: string; segundoPuesto: string; tercerPuesto: string;
  ecuadorPosicion: number; // 1–48
  creadoEn: string;
}

// Predicción de partidos Grupo E
type ResultadoPartido = 'ecuador' | 'empate' | 'rival';
interface PrediccionPartidos {
  id: string; usuarioId: string;
  partido1: ResultadoPartido; // 14/6 vs Costa de Marfil
  partido2: ResultadoPartido; // 20/6 vs Curazao
  partido3: ResultadoPartido; // 25/6 vs Alemania
  creadoEn: string;
}

// Usuario enriquecido para el admin
interface UsuarioConPrediccion extends Omit<Usuario, 'contrasenaHash'> {
  prediccion: Prediccion | null;
  prediccionPartidos: PrediccionPartidos | null;
}
```

---

## Partidos de Ecuador — Grupo E

| # | Fecha | Hora | Rival | Color neon |
|---|---|---|---|---|
| partido1 | 14 Jun 2026 | 6:00 p.m. | Costa de Marfil 🇨🇮 | `#ff6d00` |
| partido2 | 20 Jun 2026 | 7:00 p.m. | Curazao 🇨🇼 | `#00e5ff` |
| partido3 | 25 Jun 2026 | 3:00 p.m. | Alemania 🇩🇪 | `#bf00ff` |

Ecuador siempre se muestra a la **izquierda** en las tarjetas de partido.

---

## Convenciones de código

- **No hay ORM**: acceso a datos directo vía `lib/db.ts` (lectura/escritura JSON o fetch Supabase REST).
- **Validación dual**: cliente + servidor en todos los formularios.
- **Correo institucional**: el campo de registro muestra el sufijo `@live.uleam.edu.ec` fijo; el usuario solo escribe el prefijo (`e[0-9]+`). Usar `validateUleamEmail()` de `lib/auth.ts` para validar.
- **Inmutabilidad**: todas las predicciones son definitivas tras envío. El admin puede borrar la predicción de podio/fase de un usuario vía `DELETE /api/admin/predictions/[userId]`.
- **Sesión**: cookie `uleam_mundial_session` (httpOnly, secure en prod, sameSite: lax). JWT expira en 24h.
- **Variables de entorno**: `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Sin Supabase, `lib/db.ts` cae al JSON local.
- **LocalDB**: el objeto JSON local incluye `configuracion`, `usuarios`, `predicciones` y `prediccionesPartidos` — todos los fallbacks deben incluir los cuatro campos.

---

## Panel Admin (`/admin`)

- Accesible solo para usuarios con `esAdmin: true`.
- **Stats**: Total estudiantes, Con Podio, Sin Podio, Con Partidos, Mostrando.
- **Filtros**: búsqueda, semestre, carrera, estado apuesta, podio (1°/2°/3°), posición Ecuador, fase Copa, resultado de cada partido del Grupo E.
- **Botón limpiar filtros** aparece solo cuando hay filtros activos.
- **Tabla** con agrupación visual: Podio · Ecuador · Grupo E.
- **Borrar predicción**: botón 🗑 por fila abre modal de confirmación → `DELETE /api/admin/predictions/[userId]`.
- **Abrir/Cerrar predicciones**: controla el flag `prediccionesAbiertas` en `configuracion`.

---

## Design system — Neon Casino

- Fondo base: `#06000f`
- Texto: `#f0e6ff`
- Colores neon: pink `#ff0080`, cyan `#00e5ff`, yellow `#ffd600`, purple `#bf00ff`, green `#39ff14`, orange `#ff6d00`
- Clases utilitarias definidas en `globals.css`: `.neon-text-*`, `.neon-border-*`, `.neon-btn`, `.casino-card`, `.casino-input`, `.casino-select`, `.scanlines`
- Fuentes: Geist Sans / Geist Mono

Mantener la estética neon en cualquier componente nuevo que se añada.

---

## Seguridad — advertencias conocidas

- `hashPassword()` usa SHA-256 con sal estática — aceptable para demo, NO para producción.
- El JWT secret por defecto está hardcodeado — siempre usar `JWT_SECRET` en producción.
- No hay rate limiting en los endpoints de auth.

---

## Flujo de datos

1. **Registro**: form (prefijo correo + sufijo fijo) → `POST /api/auth/register` → hash → db → JWT → cookie → `/dashboard`
2. **Login**: form → `POST /api/auth/login` → verificar hash → JWT → cookie → `/dashboard`
3. **Predicción podio**: form → `POST /api/predictions` → validar unicidad + rangos → db → estado bloqueado
4. **Predicción partidos**: form → `POST /api/predictions/partidos` → validar unicidad + valores válidos → db → estado bloqueado
5. **Admin borrar**: botón → `DELETE /api/admin/predictions/[userId]` → elimina predicción → el estudiante puede reenviar si predicciones están abiertas
6. **Sesión**: middleware lee cookie → verifica JWT → permite/redirige

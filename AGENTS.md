<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# GYPS — Gana Y Pasa el Semestre

Aplicación de predicciones del Mundial 2026 para estudiantes de ULEAM. Los estudiantes predicen el podio (1°, 2°, 3°) y la posición final de Ecuador (1–48). Una sola predicción por usuario, inmutable tras envío.

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
│   │   ├── auth/login/route.ts       # POST: autenticar usuario
│   │   ├── auth/logout/route.ts      # POST: cerrar sesión
│   │   ├── auth/me/route.ts          # GET: usuario autenticado
│   │   ├── auth/register/route.ts    # POST: registro + auto-login
│   │   └── predictions/route.ts      # GET/POST: predicciones
│   ├── dashboard/page.tsx            # Vista principal post-login
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── page.tsx                      # Home con animación slot machine
├── components/ui/
│   ├── spinner.tsx                   # Spinner neon animado
│   └── toast.tsx                     # Notificaciones (success/error/info)
├── lib/
│   ├── auth.ts                       # JWT, hash, validación email ULEAM
│   └── db.ts                         # CRUD sobre JSON local / Supabase
├── middleware.ts                     # Protege /dashboard, redirige auth
└── types/index.ts                    # Interfaces TypeScript
data/db.json                          # Base de datos local (usuarios + predicciones)
schema.sql                            # Esquema PostgreSQL alternativo
```

---

## Convenciones de código

- **No hay ORM**: acceso a datos directo vía `lib/db.ts` (lectura/escritura JSON o fetch Supabase REST).
- **Validación dual**: cliente + servidor en todos los formularios.
- **Correo institucional**: formato `e[0-9]+@live.uleam.edu.ec` — usar `validateUleamEmail()` de `lib/auth.ts`.
- **Una predicción por usuario**: la ruta POST `/api/predictions` rechaza duplicados.
- **Sesión**: cookie `uleam_mundial_session` (httpOnly, secure en prod, sameSite: lax). JWT expira en 24h.
- **Variables de entorno**: `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Si Supabase no está configurado, `lib/db.ts` cae al JSON local.

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

1. **Registro**: form → `POST /api/auth/register` → hash → db → JWT → cookie → `/dashboard`
2. **Login**: form → `POST /api/auth/login` → verificar hash → JWT → cookie → `/dashboard`
3. **Predicción**: form → `POST /api/predictions` → validar unicidad + rangos → db → estado bloqueado
4. **Sesión**: middleware lee cookie → verifica JWT → permite/redirige

---

## Datos de ejemplo actuales (`data/db.json`)

- **Usuario**: Ither Eugenio Caicedo — `e1314031483@live.uleam.edu.ec` — 4to semestre, TI
- **Predicción**: Ecuador #1 · Canadá #2 · Estados Unidos #3 (enviada 2026-05-21)

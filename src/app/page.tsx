'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ShieldCheck, UserCheck, Calendar, ArrowRight, Activity } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.usuario);
        }
      } catch (err) {
        console.error('Error chequando auth:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-neutral-50 dark:bg-neutral-950 font-sans">
      
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-uleam-green-soft/40 dark:bg-uleam-green-dark/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-red-50/20 dark:bg-uleam-red-dark/5 blur-3xl pointer-events-none -z-10" />

      {/* Navbar */}
      <header className="border-b border-neutral-200/60 dark:border-neutral-800/50 backdrop-blur-md sticky top-0 z-30 bg-white/70 dark:bg-neutral-900/65">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-uleam-green-primary to-uleam-green-light flex items-center justify-center text-white shadow-md shadow-uleam-green-primary/20">
              <Trophy className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-uleam-green-dark dark:text-emerald-400">ULEAM Mundial 2026</h1>
              <p className="text-[10px] text-neutral-500 font-medium tracking-wider uppercase">Facultad de Ciencias Informáticas</p>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            {loading ? (
              <Spinner size="sm" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300 hidden sm:inline">
                  Hola, <strong className="text-uleam-green-primary dark:text-emerald-400">{user.nombreCompleto.split(' ')[0]}</strong>
                </span>
                <Link
                  href="/dashboard"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-uleam-green-primary to-uleam-green-medium hover:brightness-110 active:scale-95 transition-all shadow-md shadow-uleam-green-primary/10 flex items-center gap-1.5"
                >
                  Ir al Panel <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:text-uleam-green-primary dark:text-neutral-300 dark:hover:text-emerald-400 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-uleam-green-primary to-uleam-green-medium hover:brightness-110 active:scale-95 transition-all shadow-md shadow-uleam-green-primary/15"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-uleam-green-medium/20 bg-uleam-green-soft text-uleam-green-primary dark:bg-emerald-950/30 dark:text-emerald-400 text-xs font-semibold mb-6 animate-bounce">
          <Activity className="w-3.5 h-3.5" /> Proyecto Universitario del Mundial 2026
        </div>

        <h2 className="text-4xl md:text-6xl font-black tracking-tight max-w-3xl leading-[1.15] text-neutral-900 dark:text-white">
          Predice el Podio de la Copa del Mundo <span className="bg-clip-text text-transparent bg-gradient-to-r from-uleam-green-medium via-uleam-gold-primary to-uleam-red-light">2026</span>
        </h2>

        <p className="mt-6 text-base md:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
          Diseñado exclusivamente para la comunidad estudiantil de <strong className="text-uleam-green-primary dark:text-emerald-400 font-semibold">ULEAM</strong>. Regístrate con tu correo institucional y demuestra tus conocimientos sobre el fútbol internacional.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          {loading ? (
            <Spinner />
          ) : user ? (
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-uleam-green-primary to-uleam-green-medium hover:brightness-115 active:scale-95 shadow-lg shadow-uleam-green-primary/20 flex items-center gap-2 transition-all"
            >
              Ir a mi Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="px-8 py-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-uleam-green-primary to-uleam-green-medium hover:brightness-115 active:scale-95 shadow-lg shadow-uleam-green-primary/20 flex items-center gap-2 transition-all"
              >
                Registrarme Ahora <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 rounded-2xl text-sm font-bold text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 dark:bg-neutral-900 dark:text-white dark:border-neutral-800 dark:hover:bg-neutral-800/80 active:scale-95 shadow-md transition-all"
              >
                Tengo una cuenta
              </Link>
            </>
          )}
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          
          {/* Card 1 */}
          <div className="p-8 rounded-3xl border border-neutral-200/60 bg-white/50 backdrop-blur-sm shadow-sm dark:bg-neutral-900/40 dark:border-neutral-800/50 text-left flex flex-col gap-4 hover:translate-y-[-5px] hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-uleam-green-soft text-uleam-green-primary dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center shadow-inner">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Acceso Institucional</h3>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Validación segura en tiempo real exclusiva para correos institucionales <code className="text-xs bg-neutral-100 dark:bg-neutral-800 p-1 rounded text-uleam-green-primary dark:text-emerald-400">@live.uleam.edu.ec</code>.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-3xl border border-neutral-200/60 bg-white/50 backdrop-blur-sm shadow-sm dark:bg-neutral-900/40 dark:border-neutral-800/50 text-left flex flex-col gap-4 hover:translate-y-[-5px] hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-uleam-gold-primary dark:bg-amber-950/20 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Reglas del Torneo</h3>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              Cada estudiante puede guardar solo <strong>una predicción definitiva</strong>. Los datos no son editables tras ser guardados en la base de datos para asegurar juego limpio.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-3xl border border-neutral-200/60 bg-white/50 backdrop-blur-sm shadow-sm dark:bg-neutral-900/40 dark:border-neutral-800/50 text-left flex flex-col gap-4 hover:translate-y-[-5px] hover:shadow-md transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-uleam-red-primary dark:bg-red-950/20 dark:text-red-400 flex items-center justify-center shadow-inner">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Fecha y Hora</h3>
            <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              El envío registra la fecha y hora oficial del servidor. Se guardarán la posición del campeón, subcampeón, tercer puesto y la predicción final de Ecuador.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/60 dark:border-neutral-800/50 py-8 bg-white/50 dark:bg-neutral-950 text-center text-xs text-neutral-500 font-medium">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Universidad Laica Eloy Alfaro de Manabí. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">Tecnología de la Información</span>
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <span className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">Ingeniería en Software</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

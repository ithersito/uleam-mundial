'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, UserCheck, Calendar, ArrowRight, Activity, Zap, ScrollText, CheckCircle2, XCircle, Trophy, Flag, AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const REGLAS = [
  {
    icon: Trophy,
    color: '#ffd600',
    titulo: 'Predice el Podio',
    texto: 'Debes elegir el campeón (1°), subcampeón (2°) y tercer lugar (3°) del Mundial. Los tres países deben ser distintos.',
  },
  {
    icon: Flag,
    color: '#39ff14',
    titulo: 'Posición Final de Ecuador',
    texto: 'Además del podio, debes indicar en qué puesto quedará Ecuador al finalizar el torneo. El rango válido es del 1 al 48.',
  },
  {
    icon: XCircle,
    color: '#ff0080',
    titulo: 'Una Sola Apuesta — Sin Ediciones',
    texto: 'Cada estudiante tiene exactamente UNA oportunidad de enviar su predicción. Una vez confirmada, es DEFINITIVA e irrevocable. No hay correcciones.',
  },
  {
    icon: ShieldCheck,
    color: '#00e5ff',
    titulo: 'Acceso Exclusivo ULEAM',
    texto: 'Solo se aceptan correos institucionales con formato e1234567890@live.uleam.edu.ec. Correos inválidos serán rechazados automáticamente.',
  },
  {
    icon: AlertTriangle,
    color: '#ff6d00',
    titulo: 'Fecha y Hora Oficial',
    texto: 'El sistema registra la fecha y hora del servidor al momento del envío. Esta marca temporal es la oficial e inapelable para cualquier evaluación.',
  },
];

function ReglasModal({ onAceptar }: { onAceptar: () => void }) {
  const [leido, setLeido] = useState(false);
  const [scrollado, setScrollado] = useState(false);

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) {
      setScrollado(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,0,15,.92)', backdropFilter: 'blur(8px)' }}>

      <div className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ border: '1px solid rgba(255,214,0,.4)', boxShadow: '0 0 60px rgba(255,214,0,.15), 0 0 120px rgba(255,0,128,.1)' }}>

        {/* Header */}
        <div className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, rgba(255,214,0,.08), rgba(255,0,128,.05))', borderBottom: '1px solid rgba(255,214,0,.2)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,214,0,.12)', border: '1px solid rgba(255,214,0,.4)' }}>
            <ScrollText className="w-5 h-5" style={{ color: '#ffd600' }} />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight" style={{ color: '#ffd600' }}>
              ⚠️ Reglas Oficiales del Torneo
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(240,230,255,.4)' }}>
              Lee completamente antes de participar
            </p>
          </div>
        </div>

        {/* Scrollable rules */}
        <div onScroll={handleScroll}
          className="overflow-y-auto max-h-[50vh] px-6 py-4 space-y-4"
          style={{ background: 'rgba(12,0,26,.8)' }}>
          {REGLAS.map(({ icon: Icon, color, titulo, texto }) => (
            <div key={titulo} className="flex gap-4 p-4 rounded-2xl"
              style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${color}15`, border: `1px solid ${color}35` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-black mb-1" style={{ color }}>{titulo}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,230,255,.65)' }}>{texto}</p>
              </div>
            </div>
          ))}
          <div className="h-2" />
        </div>

        {/* Footer */}
        <div className="px-6 py-5 space-y-4"
          style={{ background: 'rgba(6,0,15,.9)', borderTop: '1px solid rgba(255,214,0,.15)' }}>

          {!scrollado && (
            <p className="text-center text-[10px] font-bold uppercase tracking-widest animate-pulse"
              style={{ color: 'rgba(255,214,0,.5)' }}>
              ↓ Desplázate para leer todas las reglas
            </p>
          )}

          <label className="flex items-start gap-3 cursor-pointer group">
            <div onClick={() => scrollado && setLeido(p => !p)}
              className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
              style={{
                background: leido ? 'rgba(57,255,20,.2)' : 'rgba(255,255,255,.05)',
                border: `1px solid ${leido ? '#39ff14' : 'rgba(255,255,255,.15)'}`,
                cursor: scrollado ? 'pointer' : 'not-allowed',
                opacity: scrollado ? 1 : 0.4,
              }}>
              {leido && <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#39ff14' }} />}
            </div>
            <span className="text-xs leading-relaxed" style={{ color: scrollado ? 'rgba(240,230,255,.7)' : 'rgba(240,230,255,.3)' }}>
              He leído y entiendo todas las reglas del torneo. Comprendo que mi predicción será <strong className="text-white">definitiva e irrevocable</strong> una vez enviada.
            </span>
          </label>

          <button
            onClick={onAceptar}
            disabled={!leido}
            className="w-full py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all active:scale-95"
            style={{
              background: leido ? 'linear-gradient(135deg, #ff0080, #bf00ff)' : 'rgba(255,255,255,.05)',
              color: leido ? '#fff' : 'rgba(240,230,255,.25)',
              boxShadow: leido ? '0 0 20px rgba(255,0,128,.4)' : 'none',
              cursor: leido ? 'pointer' : 'not-allowed',
              border: leido ? 'none' : '1px solid rgba(255,255,255,.1)',
            }}>
            ✅ Entendido — Quiero Participar
          </button>
        </div>
      </div>
    </div>
  );
}

const REEL_SYMBOLS = ['🏆', '⚽', '🌍', '🎯', '🥇', '🔥', '💎', '7️⃣'];

function SlotReel({ symbols, delay = 0 }: { symbols: string[]; delay?: number }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const id = setInterval(() => setCurrent(p => (p + 1) % symbols.length), 120);
      setTimeout(() => clearInterval(id), 1800 + delay);
    }, delay);
    return () => clearTimeout(t);
  }, [symbols, delay]);
  return (
    <div
      className="w-16 h-16 flex items-center justify-center text-3xl rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a0030 0%, #0c001a 100%)',
        border: '2px solid rgba(255,0,128,.5)',
        boxShadow: '0 0 10px rgba(255,0,128,.4), inset 0 0 10px rgba(0,0,0,.5)',
      }}
    >
      <span className="animate-reel-drop select-none">{symbols[current]}</span>
    </div>
  );
}

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tickerStep, setTickerStep] = useState(0);
  const [mostrarReglas, setMostrarReglas] = useState(false);

  const TICKER_ITEMS = [
    '🎰 GYPS MUNDIAL 2026',
    '⚽ HAZ TU PREDICCIÓN',
    '🏆 GANA Y PASA EL SEMESTRE',
    '💎 JACKPOT ACADÉMICO',
    '🔥 COPA DEL MUNDO FIFA 2026',
  ];

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
    const aceptado = localStorage.getItem('gyps_reglas_aceptadas');
    if (!aceptado) setMostrarReglas(true);
    const tickerId = setInterval(() => setTickerStep(p => (p + 1) % TICKER_ITEMS.length), 2500);
    return () => clearInterval(tickerId);
  }, []);

  function handleAceptarReglas() {
    localStorage.setItem('gyps_reglas_aceptadas', '1');
    setMostrarReglas(false);
  }

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden font-sans">

      {mostrarReglas && <ReglasModal onAceptar={handleAceptarReglas} />}

      {/* ── Ambient glow blobs ── */}
      <div className="absolute top-[-15%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(255,0,128,.12) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(191,0,255,.1) 0%, transparent 70%)' }} />
      <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,.06) 0%, transparent 70%)' }} />

      {/* ── Ticker / marquee bar ── */}
      <div className="w-full py-1.5 overflow-hidden text-[11px] font-black tracking-widest uppercase"
        style={{ background: 'linear-gradient(90deg, #ff0080, #bf00ff, #00e5ff, #ff0080)', backgroundSize: '200%' }}>
        <div className="flex gap-16 animate-marquee-coins whitespace-nowrap">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="shrink-0 text-white drop-shadow">{item}</span>
          ))}
        </div>
      </div>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-30 border-b backdrop-blur-xl"
        style={{ borderColor: 'rgba(255,0,128,.2)', background: 'rgba(6,0,15,.82)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden animate-neon-pulse-pink"
              style={{ border: '1px solid rgba(255,0,128,.6)' }}>
              <Image src="/logo-gyps.png" alt="GYPS Logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight neon-text-pink animate-flicker">GYPS Mundial 2026</h1>
              <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'rgba(0,229,255,.7)' }}>
                Gana Y Pasa el Semestre
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            {loading ? (
              <Spinner size="sm" />
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium hidden sm:inline" style={{ color: 'rgba(0,229,255,.85)' }}>
                  Hola, <strong className="neon-text-cyan">{user.nombreCompleto.split(' ')[0]}</strong>
                </span>
                <Link href="/dashboard"
                  className="neon-btn px-5 py-2 rounded-xl text-xs flex items-center gap-1.5">
                  Ir al Panel <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login"
                  className="neon-btn-secondary px-4 py-2 rounded-xl text-xs font-semibold">
                  Iniciar Sesión
                </Link>
                <Link href="/register"
                  className="neon-btn px-5 py-2 rounded-xl text-xs">
                  Registrarse
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-14 md:py-22 flex flex-col items-center justify-center text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8 animate-blink-border border"
          style={{ background: 'rgba(255,0,128,.06)', color: '#ff0080' }}>
          <Activity className="w-3.5 h-3.5" />
          <span>🎰 Predicciones Activas — Copa 2026</span>
          <Activity className="w-3.5 h-3.5" />
        </div>

        {/* Slot machine reels */}
        <div className="flex items-center justify-center gap-3 mb-8 p-4 rounded-2xl"
          style={{ background: 'rgba(12,0,26,.7)', border: '2px solid rgba(255,214,0,.3)', boxShadow: '0 0 20px rgba(255,214,0,.15)' }}>
          {[
            ['🏆', '⚽', '🌍', '🎯'],
            ['7️⃣', '💎', '🔥', '🥇'],
            ['⚽', '🏆', '🎯', '7️⃣'],
          ].map((syms, i) => (
            <SlotReel key={i} symbols={syms} delay={i * 400} />
          ))}
          <div className="ml-2 text-left">
            <p className="text-[9px] font-black tracking-widest uppercase" style={{ color: 'rgba(255,214,0,.7)' }}>JACKPOT</p>
            <p className="text-xl font-black neon-text-yellow">GYPS</p>
          </div>
        </div>

        {/* Main heading */}
        <h2 className="text-4xl md:text-6xl font-black tracking-tight max-w-3xl leading-[1.1] text-white">
          Predice el Podio del{' '}
          <span style={{
            backgroundImage: 'linear-gradient(90deg, #ff0080, #bf00ff, #00e5ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 20px rgba(255,0,128,.6))',
          }}>
            Mundial 2026
          </span>
        </h2>

        <p className="mt-6 text-base md:text-lg max-w-2xl leading-relaxed" style={{ color: 'rgba(240,230,255,.55)' }}>
          Diseñado exclusivamente para el proyecto{' '}
          <strong className="neon-text-cyan">Gana Y Pasa el Semestre (GYPS)</strong>.
          Regístrate con tu correo institucional y demuestra tus conocimientos sobre el fútbol internacional.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          {loading ? (
            <Spinner />
          ) : user ? (
            <Link href="/dashboard"
              className="neon-btn px-8 py-4 rounded-2xl text-sm flex items-center gap-2">
              🎰 Ir a mi Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link href="/register"
                className="neon-btn px-8 py-4 rounded-2xl text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" /> ¡Jugar Ahora! <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login"
                className="neon-btn-secondary px-8 py-4 rounded-2xl text-sm">
                Tengo una cuenta
              </Link>
            </>
          )}
        </div>

        {/* Feature cards */}
        <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">

          {/* Card 1 */}
          <div className="casino-card p-8 rounded-3xl text-left flex flex-col gap-4 hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
            style={{ '--tw-shadow-color': 'rgba(0,229,255,.2)' } as any}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-neon-pulse-cyan"
              style={{ background: 'rgba(0,229,255,.08)', border: '1px solid rgba(0,229,255,.4)' }}>
              <UserCheck className="w-6 h-6" style={{ color: '#00e5ff' }} />
            </div>
            <h3 className="text-lg font-black text-white">Acceso Institucional</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,230,255,.5)' }}>
              Validación segura exclusiva para correos{' '}
              <code className="text-xs px-1.5 py-0.5 rounded neon-text-cyan"
                style={{ background: 'rgba(0,229,255,.08)', border: '1px solid rgba(0,229,255,.2)' }}>
                @live.uleam.edu.ec
              </code>.
            </p>
          </div>

          {/* Card 2 */}
          <div className="casino-card p-8 rounded-3xl text-left flex flex-col gap-4 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-neon-pulse-yellow"
              style={{ background: 'rgba(255,214,0,.08)', border: '1px solid rgba(255,214,0,.4)' }}>
              <ShieldCheck className="w-6 h-6" style={{ color: '#ffd600' }} />
            </div>
            <h3 className="text-lg font-black text-white">Reglas del Torneo</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,230,255,.5)' }}>
              Cada estudiante puede guardar solo <strong className="neon-text-yellow">una predicción definitiva</strong>.
              Sin ediciones tras confirmar — juego limpio garantizado.
            </p>
          </div>

          {/* Card 3 */}
          <div className="casino-card p-8 rounded-3xl text-left flex flex-col gap-4 hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center animate-neon-pulse-pink"
              style={{ background: 'rgba(255,0,128,.08)', border: '1px solid rgba(255,0,128,.4)' }}>
              <Calendar className="w-6 h-6" style={{ color: '#ff0080' }} />
            </div>
            <h3 className="text-lg font-black text-white">Fecha y Hora Oficial</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(240,230,255,.5)' }}>
              El envío registra la fecha y hora del servidor. Se guardan campeón, subcampeón,
              tercer puesto y la posición final de <span className="neon-text-pink">Ecuador 🇪🇨</span>.
            </p>
          </div>

        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="py-6 border-t text-center text-[11px] font-semibold tracking-wide"
        style={{ borderColor: 'rgba(255,0,128,.15)', background: 'rgba(6,0,15,.7)', color: 'rgba(240,230,255,.35)' }}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} <span className="neon-text-pink">GYPS</span> — Gana Y Pasa el Semestre · Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span style={{ color: 'rgba(0,229,255,.5)' }}>Tecnología de la Información</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'rgba(255,0,128,.5)' }} />
            <span style={{ color: 'rgba(0,229,255,.5)' }}>Ingeniería en Software</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

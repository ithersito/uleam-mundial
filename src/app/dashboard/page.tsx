'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Trophy, LogOut, ShieldAlert, Award, Calendar,
  CheckCircle2, Lock, User, Briefcase, GraduationCap, Zap, AlertTriangle, Swords, Medal, X,
} from 'lucide-react';
import { ResultadoPartido, PrediccionPartidos, EntradaClasificacion, ResultadosReales } from '@/types';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { MUNDIAL_START, FASES_COPA, getFaseCopa } from '@/lib/constants';
import { MAX_PUNTAJE } from '@/lib/scoring';

// Agrupación de países por regiones
const PAISES_REGIONES = [
  { region: 'Coanfitriones (CONCACAF)',               paises: ['Canadá', 'Estados Unidos', 'México'] },
  { region: 'Sudamérica (CONMEBOL)',                  paises: ['Argentina', 'Brasil', 'Colombia', 'Ecuador', 'Paraguay', 'Uruguay'] },
  { region: 'Europa (UEFA)',                          paises: ['Alemania', 'Austria', 'Bélgica', 'Bosnia y Herzegovina', 'Croacia', 'Escocia', 'España', 'Francia', 'Inglaterra', 'Noruega', 'Países Bajos', 'Portugal', 'República Checa', 'Suecia', 'Suiza', 'Turquía'] },
  { region: 'Norte, Centroamérica y Caribe (CONCACAF)', paises: ['Curazao', 'Haití', 'Panamá'] },
  { region: 'Asia (AFC)',                             paises: ['Arabia Saudí', 'Australia', 'Catar', 'Corea del Sur', 'Irak', 'Irán', 'Japón', 'Jordania', 'Uzbekistán'] },
  { region: 'África (CAF)',                           paises: ['Argelia', 'Cabo Verde', 'Costa de Marfil', 'Egipto', 'Ghana', 'Marruecos', 'República Democrática del Congo', 'Senegal', 'Sudáfrica', 'Túnez'] },
];

// ── Sub-component: Neon stat badge ──
function NeonBadge({ label, value, color }: { label: string; value: string; color: 'pink' | 'cyan' | 'yellow' | 'green' }) {
  const map = {
    pink:   { text: 'neon-text-pink',   border: 'rgba(255,0,128,.3)',   bg: 'rgba(255,0,128,.06)' },
    cyan:   { text: 'neon-text-cyan',   border: 'rgba(0,229,255,.3)',   bg: 'rgba(0,229,255,.06)' },
    yellow: { text: 'neon-text-yellow', border: 'rgba(255,214,0,.3)',   bg: 'rgba(255,214,0,.06)' },
    green:  { text: 'neon-text-green',  border: 'rgba(57,255,20,.3)',   bg: 'rgba(57,255,20,.06)' },
  }[color];
  return (
    <div className="px-3 py-1.5 rounded-lg text-center"
      style={{ background: map.bg, border: `1px solid ${map.border}` }}>
      <p className={`text-lg font-black ${map.text}`}>{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'rgba(240,230,255,.4)' }}>{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const { showToast } = useToast();

  const [usuario, setUsuario] = useState<any>(null);
  const [prediccion, setPrediccion] = useState<any>(null);
  const [prediccionPartidos, setPrediccionPartidos] = useState<PrediccionPartidos | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPartidos, setSavingPartidos] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [mostrarConfirmacionPartidos, setMostrarConfirmacionPartidos] = useState(false);
  const [mundialStarted, setMundialStarted] = useState(() => Date.now() >= MUNDIAL_START.getTime());

  // ── leaderboard ────────────────────────────────────────────────────────────
  const [verClasificacion, setVerClasificacion]       = useState(false);
  const [clasificacion, setClasificacion]             = useState<EntradaClasificacion[]>([]);
  const [resultadosRanking, setResultadosRanking]     = useState<ResultadosReales | null>(null);
  const [loadingClasificacion, setLoadingClasificacion] = useState(false);

  const [formPartidos, setFormPartidos] = useState<{ p1: ResultadoPartido | ''; p2: ResultadoPartido | ''; p3: ResultadoPartido | '' }>({
    p1: '', p2: '', p3: '',
  });

  const [form, setForm] = useState({
    primerPuesto: '',
    segundoPuesto: '',
    tercerPuesto: '',
    ecuadorPosicion: '40',
  });

  useEffect(() => {
    if (mundialStarted) return;
    const msLeft = MUNDIAL_START.getTime() - Date.now();
    const t = setTimeout(() => setMundialStarted(true), msLeft);
    return () => clearTimeout(t);
  }, [mundialStarted]);

  useEffect(() => {
    async function initDashboard() {
      try {
        const resUser = await fetch('/api/auth/me');
        if (!resUser.ok) { router.push('/login'); return; }
        const dataUser = await resUser.json();
        setUsuario(dataUser.usuario);

        const [resPred, resPart] = await Promise.all([
          fetch('/api/predictions'),
          fetch('/api/predictions/partidos'),
        ]);
        if (resPred.ok) {
          const dataPred = await resPred.json();
          setPrediccion(dataPred.prediccion);
        }
        if (resPart.ok) {
          const dataPart = await resPart.json();
          setPrediccionPartidos(dataPart.prediccion);
        }
      } catch (err) {
        console.error('Error al inicializar dashboard:', err);
        showToast('No se pudieron recuperar los datos del servidor.', 'error');
      } finally {
        setLoading(false);
      }
    }
    initDashboard();
  }, [router, showToast]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        showToast('Sesión cerrada. ¡Hasta la próxima partida! 🎰', 'info');
        router.push('/login');
        router.refresh();
      } else {
        showToast('Ocurrió un error al intentar cerrar la sesión.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error de red al cerrar sesión.', 'error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePartidosSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPartidos.p1 || !formPartidos.p2 || !formPartidos.p3) {
      showToast('Por favor, selecciona un resultado para cada partido.', 'error');
      return;
    }
    setMostrarConfirmacionPartidos(true);
  };

  const handleConfirmarPartidos = async () => {
    setMostrarConfirmacionPartidos(false);
    setSavingPartidos(true);
    try {
      const res = await fetch('/api/predictions/partidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partido1: formPartidos.p1, partido2: formPartidos.p2, partido3: formPartidos.p3 }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'No se pudo guardar.', 'error');
      } else {
        showToast('⚽ ¡Predicciones de partidos guardadas!', 'success');
        setPrediccionPartidos(data.prediccion);
      }
    } catch {
      showToast('Error de red.', 'error');
    } finally {
      setSavingPartidos(false);
    }
  };

  const handleEditClick = () => {
    showToast('🔒 Reglamento Oficial: Las predicciones guardadas son definitivas y no se pueden modificar.', 'error');
  };

  const handleVerClasificacion = async () => {
    setVerClasificacion(true);
    if (clasificacion.length > 0) return; // ya cargado
    setLoadingClasificacion(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.leaderboard) setClasificacion(data.leaderboard);
      if (data.resultados)  setResultadosRanking(data.resultados);
    } catch { /* silencioso */ }
    finally { setLoadingClasificacion(false); }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { primerPuesto, segundoPuesto, tercerPuesto, ecuadorPosicion } = form;
    if (!primerPuesto || !segundoPuesto || !tercerPuesto || !ecuadorPosicion) {
      showToast('Por favor, selecciona los tres puestos del podio y la posición de Ecuador.', 'error');
      return;
    }
    setMostrarConfirmacion(true);
  };

  const handleConfirmar = async () => {
    setMostrarConfirmacion(false);
    setSaving(true);
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'No se pudo guardar la predicción.', 'error');
      } else {
        showToast('🎰 ¡Predicción enviada exitosamente! Guardada en base de datos.', 'success');
        setPrediccion(data.prediccion);
      }
    } catch (err) {
      console.error(err);
      showToast('Ocurrió un error al enviar la predicción.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const renderPaisesOptions = (excluir: string[] = []) => (
    <>
      <option value="" disabled>Selecciona un país...</option>
      {PAISES_REGIONES.map((reg) => (
        <optgroup key={reg.region} label={reg.region}>
          {reg.paises.map((pais) => (
            <option key={pais} value={pais} disabled={excluir.includes(pais)}>
              {excluir.includes(pais) ? `${pais} ✗` : pais}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );

  const renderEcuadorOptions = () => {
    const options = [];
    for (let i = 1; i <= 48; i++) {
      let label = `${i}ro`;
      if (i === 2) label = '2do';
      if (i === 3) label = '3ro';
      if (i === 4 || i === 5 || i === 6) label = `${i}to`;
      if (i >= 7 && i <= 10) label = `${i}mo`;
      options.push(<option key={i} value={i}>Puesto {i} ({label})</option>);
    }
    return options;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-screen">
        <div className="animate-float-up">
          <Spinner size="lg" />
        </div>
        <p className="mt-4 text-xs font-black uppercase tracking-widest animate-flicker neon-text-pink">
          Cargando Panel...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative font-sans min-h-screen">

      {/* ── Modal de confirmación ── */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(6,0,15,.92)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(255,0,128,.4)', boxShadow: '0 0 60px rgba(255,0,128,.2)' }}>

            {/* Header */}
            <div className="px-6 py-5 flex items-center gap-3"
              style={{ background: 'rgba(255,0,128,.06)', borderBottom: '1px solid rgba(255,0,128,.2)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,0,128,.12)', border: '1px solid rgba(255,0,128,.4)' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#ff0080' }} />
              </div>
              <div>
                <h2 className="text-base font-black" style={{ color: '#ff0080' }}>¿Confirmar predicción?</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(240,230,255,.4)' }}>
                  Esta acción es irreversible
                </p>
              </div>
            </div>

            {/* Resumen */}
            <div className="px-6 py-5 space-y-3" style={{ background: 'rgba(12,0,26,.85)' }}>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(240,230,255,.6)' }}>
                Estás a punto de enviar tu predicción oficial. Una vez confirmada,{' '}
                <strong className="text-white">no podrás editarla</strong>. Verifica que todo esté correcto:
              </p>
              <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'rgba(240,230,255,.4)' }}>🥇 Campeón</span>
                  <strong className="neon-text-yellow">{form.primerPuesto}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'rgba(240,230,255,.4)' }}>🥈 Subcampeón</span>
                  <strong className="neon-text-cyan">{form.segundoPuesto}</strong>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'rgba(240,230,255,.4)' }}>🥉 Tercer Lugar</span>
                  <strong style={{ color: '#ff6d00' }}>{form.tercerPuesto}</strong>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
                  <span style={{ color: 'rgba(240,230,255,.4)' }}>🇪🇨 Ecuador</span>
                  <strong className="neon-text-green">
                    {getFaseCopa(parseInt(form.ecuadorPosicion)).icon} {getFaseCopa(parseInt(form.ecuadorPosicion)).label}
                  </strong>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="px-6 py-5 flex gap-3" style={{ background: 'rgba(6,0,15,.9)', borderTop: '1px solid rgba(255,0,128,.15)' }}>
              <button
                onClick={() => setMostrarConfirmacion(false)}
                className="flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(240,230,255,.5)' }}>
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                className="flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, #ff0080, #bf00ff)', color: '#fff', boxShadow: '0 0 20px rgba(255,0,128,.4)' }}>
                ✅ Sí, confirmar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Modal confirmación partidos ── */}
      {mostrarConfirmacionPartidos && (() => {
        const PARTIDOS_INFO = [
          { rival: 'Costa de Marfil', fecha: '14/6' },
          { rival: 'Curazao',         fecha: '20/6' },
          { rival: 'Alemania',        fecha: '25/6' },
        ];
        const labels: Record<ResultadoPartido, string> = { ecuador: '🇪🇨 Ecuador gana', empate: '🤝 Empate', rival: '❌ Rival gana' };
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(6,0,15,.92)', backdropFilter: 'blur(8px)' }}>
            <div className="w-full max-w-md rounded-3xl overflow-hidden"
              style={{ border: '1px solid rgba(0,229,255,.4)', boxShadow: '0 0 60px rgba(0,229,255,.15)' }}>
              <div className="px-6 py-5 flex items-center gap-3"
                style={{ background: 'rgba(0,229,255,.06)', borderBottom: '1px solid rgba(0,229,255,.2)' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#00e5ff' }} />
                <div>
                  <h2 className="text-base font-black" style={{ color: '#00e5ff' }}>¿Confirmar predicciones?</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(240,230,255,.4)' }}>
                    Esta acción es irreversible
                  </p>
                </div>
              </div>
              <div className="px-6 py-5 space-y-3" style={{ background: 'rgba(12,0,26,.85)' }}>
                {PARTIDOS_INFO.map((p, i) => {
                  const val = [formPartidos.p1, formPartidos.p2, formPartidos.p3][i] as ResultadoPartido;
                  return (
                    <div key={i} className="flex justify-between items-center text-xs rounded-xl px-4 py-2.5"
                      style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                      <span style={{ color: 'rgba(240,230,255,.5)' }}>{p.fecha} — Ecuador vs {p.rival}</span>
                      <strong className="neon-text-cyan">{labels[val]}</strong>
                    </div>
                  );
                })}
              </div>
              <div className="px-6 py-5 flex gap-3"
                style={{ background: 'rgba(6,0,15,.9)', borderTop: '1px solid rgba(0,229,255,.15)' }}>
                <button onClick={() => setMostrarConfirmacionPartidos(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(240,230,255,.5)' }}>
                  Cancelar
                </button>
                <button onClick={handleConfirmarPartidos}
                  className="flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #00e5ff, #bf00ff)', color: '#fff', boxShadow: '0 0 20px rgba(0,229,255,.3)' }}>
                  ✅ Sí, confirmar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Modal: Clasificación ── */}
      {verClasificacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(6,0,15,.94)', backdropFilter: 'blur(12px)' }}>
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(255,214,0,.3)', boxShadow: '0 0 60px rgba(255,214,0,.12)' }}>

            {/* Header modal */}
            <div className="px-6 py-5 flex items-center justify-between flex-shrink-0"
              style={{ background: 'rgba(255,214,0,.05)', borderBottom: '1px solid rgba(255,214,0,.15)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(255,214,0,.1)', border: '1px solid rgba(255,214,0,.35)' }}>
                  <Medal className="w-5 h-5" style={{ color: '#ffd600' }} />
                </div>
                <div>
                  <h2 className="text-lg font-black" style={{ color: '#ffd600' }}>Clasificación General</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(240,230,255,.4)' }}>
                    GYPS · Mundial 2026 · ULEAM
                  </p>
                </div>
              </div>
              <button onClick={() => setVerClasificacion(false)}
                className="p-2 rounded-xl transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(240,230,255,.5)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resultados reales (si están definidos) */}
            {resultadosRanking && Object.values(resultadosRanking).some(v => v !== null) && (
              <div className="px-6 py-3 flex-shrink-0"
                style={{ background: 'rgba(255,255,255,.02)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,214,0,.5)' }}>🎯 Resultados Oficiales</p>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {resultadosRanking.primerPuesto  && <span className="px-2 py-1 rounded-lg font-black" style={{ background: 'rgba(255,214,0,.1)', color: '#ffd600', border: '1px solid rgba(255,214,0,.2)' }}>🥇 {resultadosRanking.primerPuesto}</span>}
                  {resultadosRanking.segundoPuesto && <span className="px-2 py-1 rounded-lg font-black" style={{ background: 'rgba(0,229,255,.08)', color: '#00e5ff', border: '1px solid rgba(0,229,255,.2)' }}>🥈 {resultadosRanking.segundoPuesto}</span>}
                  {resultadosRanking.tercerPuesto  && <span className="px-2 py-1 rounded-lg font-black" style={{ background: 'rgba(255,109,0,.08)', color: '#ff6d00', border: '1px solid rgba(255,109,0,.2)' }}>🥉 {resultadosRanking.tercerPuesto}</span>}
                  {resultadosRanking.ecuadorPosicion !== null && (
                    <span className="px-2 py-1 rounded-lg font-black" style={{ background: 'rgba(57,255,20,.08)', color: '#39ff14', border: '1px solid rgba(57,255,20,.2)' }}>
                      🇪🇨 {getFaseCopa(resultadosRanking.ecuadorPosicion).short}
                    </span>
                  )}
                  {(['partido1','partido2','partido3'] as const).map((pk, i) => {
                    const v = resultadosRanking[pk];
                    if (!v) return null;
                    const labels = { ecuador: '🇪🇨 Gana', empate: '🤝 Empate', rival: '❌ Rival' };
                    const cols   = { ecuador: '#39ff14', empate: '#ffd600', rival: '#ff0080' };
                    const dates  = ['14/6', '20/6', '25/6'];
                    return (
                      <span key={pk} className="px-2 py-1 rounded-lg font-black"
                        style={{ background: `${cols[v]}12`, color: cols[v], border: `1px solid ${cols[v]}30` }}>
                        {dates[i]}: {labels[v]}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Body scrollable */}
            <div className="flex-1 overflow-y-auto" style={{ background: 'rgba(6,0,15,.8)' }}>
              {loadingClasificacion ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <Spinner size="lg" />
                  <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,214,0,.5)' }}>Calculando puntos...</p>
                </div>
              ) : clasificacion.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16" style={{ color: 'rgba(240,230,255,.3)' }}>
                  <Trophy className="w-10 h-10 opacity-20" />
                  <p className="text-sm font-bold">Aún no hay datos en la clasificación.</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {clasificacion.map((entrada, idx) => {
                    const esTu = entrada.id === usuario?.id;
                    const medallas = ['🥇', '🥈', '🥉'];
                    const pct = MAX_PUNTAJE > 0 ? (entrada.puntaje / MAX_PUNTAJE) * 100 : 0;
                    const barColor = idx === 0 ? '#ffd600' : idx === 1 ? '#00e5ff' : idx === 2 ? '#ff6d00' : esTu ? '#ff0080' : '#bf00ff';
                    return (
                      <div key={entrada.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
                        style={{
                          background: esTu ? 'rgba(255,0,128,.08)' : 'rgba(255,255,255,.02)',
                          border: `1px solid ${esTu ? 'rgba(255,0,128,.3)' : 'rgba(255,255,255,.05)'}`,
                          boxShadow: esTu ? '0 0 16px rgba(255,0,128,.1)' : 'none',
                        }}>

                        {/* Posición */}
                        <div className="w-8 text-center flex-shrink-0">
                          {idx < 3
                            ? <span className="text-lg">{medallas[idx]}</span>
                            : <span className="text-xs font-black" style={{ color: 'rgba(240,230,255,.3)' }}>{idx + 1}</span>}
                        </div>

                        {/* Nombre */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-white truncate">
                            {entrada.nombreCompleto}
                            {esTu && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full font-black"
                              style={{ background: 'rgba(255,0,128,.15)', color: '#ff0080', border: '1px solid rgba(255,0,128,.3)' }}>TÚ</span>}
                          </p>
                          <p className="text-[9px] mt-0.5" style={{ color: 'rgba(240,230,255,.35)' }}>
                            {entrada.nivel} · {entrada.carrera === 'Tecnología de la Información' ? 'TI' : 'IS'}
                          </p>
                        </div>

                        {/* Barra de progreso */}
                        <div className="flex-1 max-w-[120px] hidden sm:block">
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.06)' }}>
                            <div className="h-full rounded-full transition-all"
                              style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 6px ${barColor}60` }} />
                          </div>
                        </div>

                        {/* Puntos */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-black"
                            style={{ color: entrada.puntaje > 0 ? barColor : 'rgba(240,230,255,.2)', textShadow: entrada.puntaje > 0 ? `0 0 8px ${barColor}50` : 'none' }}>
                            {entrada.puntaje}
                          </p>
                          <p className="text-[9px]" style={{ color: 'rgba(240,230,255,.25)' }}>/{MAX_PUNTAJE} pts</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 flex items-center justify-between flex-shrink-0 text-[10px]"
              style={{ borderTop: '1px solid rgba(255,255,255,.04)', background: 'rgba(6,0,15,.9)', color: 'rgba(240,230,255,.3)' }}>
              <span>{clasificacion.length} participantes</span>
              <span>Máx: <strong style={{ color: '#ffd600' }}>{MAX_PUNTAJE} pts</strong></span>
              <button onClick={() => { setClasificacion([]); setResultadosRanking(null); handleVerClasificacion(); }}
                className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg"
                style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(240,230,255,.4)' }}>
                ↻ Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ambient blobs */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(255,0,128,.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(191,0,255,.07) 0%, transparent 70%)' }} />

      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b backdrop-blur-xl"
        style={{ borderColor: 'rgba(255,0,128,.18)', background: 'rgba(6,0,15,.85)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden animate-neon-pulse-pink"
              style={{ border: '1px solid rgba(255,0,128,.5)' }}>
              <Image src="/logo-gyps.png" alt="GYPS Logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight neon-text-pink">Panel de Predicciones</h1>
              <p className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'rgba(0,229,255,.6)' }}>
                GYPS Mundial 2026
              </p>
            </div>
          </div>

          <button
            onClick={handleVerClasificacion}
            className="neon-btn-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            style={{ borderColor: 'rgba(255,214,0,.5)', color: '#ffd600',
              boxShadow: '0 0 6px rgba(255,214,0,.3)', textShadow: '0 0 6px rgba(255,214,0,.4)' }}>
            <Medal className="w-4 h-4" /> Clasificación
          </button>
          <button
            onClick={handleLogout}
            className="neon-btn-secondary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            style={{ borderColor: 'rgba(255,109,0,.5)', color: '#ff6d00',
              boxShadow: '0 0 6px rgba(255,109,0,.4)', textShadow: '0 0 6px rgba(255,109,0,.5)' }}>
            <LogOut className="w-4 h-4" /> Salir
          </button>

        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left column ── */}
        <div className="lg:col-span-1 space-y-5">

          {/* User identity card */}
          <div className="casino-card p-6 rounded-3xl">
            {/* Avatar row */}
            <div className="flex items-center gap-4 pb-4 mb-4 border-b" style={{ borderColor: 'rgba(255,0,128,.15)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 animate-neon-pulse-pink"
                style={{ background: 'rgba(255,0,128,.08)', border: '1px solid rgba(255,0,128,.4)', color: '#ff0080' }}>
                {usuario?.nombreCompleto.charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-white leading-snug truncate">{usuario?.nombreCompleto}</h3>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block"
                  style={{ background: 'rgba(0,229,255,.08)', border: '1px solid rgba(0,229,255,.3)', color: '#00e5ff' }}>
                  Estudiante Activo
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(240,230,255,.6)' }}>
                <User className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,0,128,.5)' }} />
                <span className="truncate">{usuario?.correoInstitucional}</span>
              </div>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(240,230,255,.6)' }}>
                <Briefcase className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(0,229,255,.5)' }} />
                <span className="truncate">{usuario?.carrera}</span>
              </div>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(240,230,255,.6)' }}>
                <GraduationCap className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,214,0,.5)' }} />
                <span>Semestre: <strong className="neon-text-yellow">{usuario?.nivel}</strong></span>
              </div>
            </div>
          </div>

          {/* Prediction status card */}
          <div className="casino-card p-6 rounded-3xl">
            <h4 className="text-[9px] font-black uppercase tracking-widest mb-4"
              style={{ color: 'rgba(240,230,255,.35)' }}>
              Estado de Predicciones
            </h4>

            {prediccion ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: 'rgba(57,255,20,.06)', border: '1px solid rgba(57,255,20,.25)' }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0 neon-text-green" />
                  <div>
                    <p className="text-xs font-black neon-text-green leading-tight">🏆 Guardada con Éxito</p>
                    <p className="text-[10px] mt-0.5" style={{ color: 'rgba(57,255,20,.6)' }}>La predicción se encuentra en sistema.</p>
                  </div>
                </div>
                <button onClick={handleEditClick}
                  className="w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  style={{ background: 'rgba(255,0,128,.06)', border: '1px solid rgba(255,0,128,.3)', color: 'rgba(255,0,128,.7)' }}>
                  <Lock className="w-3.5 h-3.5" /> Editar Predicciones
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: 'rgba(255,214,0,.06)', border: '1px solid rgba(255,214,0,.25)' }}>
                <ShieldAlert className="w-5 h-5 shrink-0 neon-text-yellow" />
                <div>
                  <p className="text-xs font-black neon-text-yellow leading-tight">⚠ Pendiente por Enviar</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,214,0,.6)' }}>Completa los datos en el formulario.</p>
                </div>
              </div>
            )}
          </div>

          {/* Quick stats */}
          {prediccion && (
            <div className="casino-card p-5 rounded-3xl">
              <h4 className="text-[9px] font-black uppercase tracking-widest mb-3"
                style={{ color: 'rgba(240,230,255,.35)' }}>Tu Jugada</h4>
              <div className="grid grid-cols-2 gap-2">
                <NeonBadge label="Campeón"   value={prediccion.primerPuesto.split(' ')[0]} color="yellow" />
                <NeonBadge label="Subcampeón" value={prediccion.segundoPuesto.split(' ')[0]} color="cyan" />
                <NeonBadge label="Tercer Lugar" value={prediccion.tercerPuesto.split(' ')[0]} color="pink" />
                <NeonBadge label="Ecuador 🇪🇨" value={`#${prediccion.ecuadorPosicion}`} color="green" />
              </div>
            </div>
          )}

          {/* Ecuador match schedule */}
          <div className="casino-card p-5 rounded-3xl">
            <h4 className="text-[9px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"
              style={{ color: 'rgba(0,229,255,.7)' }}>
              <span className="w-1 h-4 rounded inline-block" style={{ background: '#00e5ff', boxShadow: '0 0 6px #00e5ff' }} />
              ⚽ Partidos de Ecuador — Grupo E
            </h4>

            <div className="space-y-3">
              {[
                { fecha: '14/6', hora: '6:00 p.m.', rival: 'Costa de Marfil', rivalFlag: '🇨🇮', color: '#ff6d00' },
                { fecha: '20/6', hora: '7:00 p.m.', rival: 'Curazao',         rivalFlag: '🇨🇼', color: '#00e5ff' },
                { fecha: '25/6', hora: '3:00 p.m.', rival: 'Alemania',        rivalFlag: '🇩🇪', color: '#bf00ff' },
              ].map((m) => (
                <div key={m.fecha}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: `1px solid ${m.color}30`, background: `${m.color}06` }}>

                  {/* header */}
                  <div className="px-3 py-1.5 flex items-center justify-between"
                    style={{ borderBottom: `1px solid ${m.color}20`, background: `${m.color}0a` }}>
                    <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: `${m.color}aa` }}>
                      Copa Mundial · Grupo E
                    </span>
                    <div className="text-right">
                      <p className="text-[10px] font-black" style={{ color: m.color }}>{m.fecha}</p>
                      <p className="text-[9px]" style={{ color: `${m.color}80` }}>{m.hora}</p>
                    </div>
                  </div>

                  {/* teams — Ecuador siempre a la izquierda */}
                  <div className="px-3 py-3 flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span className="text-xl leading-none shrink-0">🇪🇨</span>
                      <span className="text-xs font-black truncate" style={{ color: m.color }}>Ecuador</span>
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0"
                      style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(240,230,255,.4)', border: '1px solid rgba(255,255,255,.08)' }}>
                      VS
                    </span>
                    <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
                      <span className="text-xs font-black text-white truncate text-right">{m.rival}</span>
                      <span className="text-xl leading-none shrink-0">{m.rivalFlag}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-6">

          {prediccion ? (
            /* ─ COMPLETED STATE ─ */
            <div className="casino-card p-8 rounded-3xl relative overflow-hidden">

              {/* Ghost trophy */}
              <div className="absolute top-0 right-0 p-6 opacity-[0.04] pointer-events-none">
                <Trophy className="w-64 h-64 rotate-12 translate-x-20 -translate-y-4" />
              </div>

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 gap-4 border-b"
                style={{ borderColor: 'rgba(255,0,128,.15)' }}>
                <div>
                  <h3 className="text-xl font-black text-white">Tus Predicciones Oficiales</h3>
                  <p className="text-xs mt-1" style={{ color: 'rgba(240,230,255,.4)' }}>Copa del Mundo FIFA 2026</p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
                  style={{ background: 'rgba(57,255,20,.07)', border: '1px solid rgba(57,255,20,.3)', color: '#39ff14' }}>
                  <Lock className="w-3.5 h-3.5" /> Definitivo
                </div>
              </div>

              {/* Podium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

                {/* 1st */}
                <div className="p-5 rounded-2xl text-center flex flex-col items-center gap-2 animate-neon-pulse-yellow"
                  style={{ background: 'rgba(255,214,0,.05)', border: '2px solid rgba(255,214,0,.35)' }}>
                  <span className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                    style={{ background: 'rgba(255,214,0,.12)', color: '#ffd600', border: '1px solid rgba(255,214,0,.4)' }}>1</span>
                  <p className="text-[10px] font-black uppercase tracking-widest neon-text-yellow">🥇 Campeón</p>
                  <p className="text-base font-black text-white mt-1">{prediccion.primerPuesto}</p>
                </div>

                {/* 2nd */}
                <div className="p-5 rounded-2xl text-center flex flex-col items-center gap-2 animate-neon-pulse-cyan"
                  style={{ background: 'rgba(0,229,255,.05)', border: '2px solid rgba(0,229,255,.3)' }}>
                  <span className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                    style={{ background: 'rgba(0,229,255,.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,.4)' }}>2</span>
                  <p className="text-[10px] font-black uppercase tracking-widest neon-text-cyan">🥈 Subcampeón</p>
                  <p className="text-base font-black text-white mt-1">{prediccion.segundoPuesto}</p>
                </div>

                {/* 3rd */}
                <div className="p-5 rounded-2xl text-center flex flex-col items-center gap-2 animate-neon-pulse-pink"
                  style={{ background: 'rgba(255,109,0,.05)', border: '2px solid rgba(255,109,0,.3)' }}>
                  <span className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm"
                    style={{ background: 'rgba(255,109,0,.1)', color: '#ff6d00', border: '1px solid rgba(255,109,0,.4)' }}>3</span>
                  <p className="text-[10px] font-black uppercase tracking-widest neon-text-orange">🥉 Tercer Lugar</p>
                  <p className="text-base font-black text-white mt-1">{prediccion.tercerPuesto}</p>
                </div>

              </div>

              {/* Ecuador row */}
              <div className="p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 mb-6"
                style={{ background: 'rgba(57,255,20,.04)', border: '1px solid rgba(57,255,20,.25)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(57,255,20,.08)', border: '1px solid rgba(57,255,20,.3)' }}>
                  <Award className="w-6 h-6 neon-text-green animate-pulse" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs font-black text-white">Posición estimada de Ecuador 🇪🇨</p>
                  <p className="text-[11px] mt-0.5" style={{ color: 'rgba(240,230,255,.4)' }}>¿En qué lugar quedará Ecuador en el Mundial?</p>
                </div>
                <div className="text-2xl font-black neon-text-green">Puesto #{prediccion.ecuadorPosicion}</div>
              </div>

              {/* Copa structure */}
              {(() => {
                const fase = getFaseCopa(prediccion.ecuadorPosicion);
                const faseIdx = FASES_COPA.indexOf(fase);
                return (
                  <div className="rounded-2xl p-5 mb-2"
                    style={{ background: `${fase.color}08`, border: `1px solid ${fase.color}25` }}>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-4"
                      style={{ color: `${fase.color}99` }}>
                      ⚽ Estructura de la Copa — Hasta dónde llega Ecuador
                    </p>
                    <div className="flex flex-col gap-2">
                      {FASES_COPA.map((f, idx) => {
                        const esFaseActual = idx === faseIdx;
                        const esPasada = idx < faseIdx;
                        const opacity = esFaseActual ? 1 : esPasada ? 0.45 : 0.15;
                        return (
                          <div key={f.label}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                            style={{
                              background: esFaseActual ? `${f.color}14` : 'transparent',
                              border: `1px solid ${esFaseActual ? f.color + '50' : 'transparent'}`,
                              opacity,
                            }}>
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs"
                              style={{ background: `${f.color}18`, border: `1px solid ${f.color}40` }}>
                              {esFaseActual ? '🇪🇨' : esPasada ? '✓' : String(idx + 1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black leading-tight" style={{ color: esFaseActual ? f.color : '#f0e6ff' }}>
                                {f.label}
                              </p>
                              <p className="text-[9px]" style={{ color: 'rgba(240,230,255,.4)' }}>
                                {f.equipos} equipos
                              </p>
                            </div>
                            {esFaseActual && (
                              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0"
                                style={{ background: `${f.color}20`, color: f.color, border: `1px solid ${f.color}50` }}>
                                Puesto #{prediccion.ecuadorPosicion}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Timestamp */}
              <div className="flex items-center gap-2 pt-4 border-t text-[10px] font-medium"
                style={{ borderColor: 'rgba(255,0,128,.1)', color: 'rgba(240,230,255,.3)' }}>
                <Calendar className="w-3.5 h-3.5" />
                <span>Enviado oficialmente el: <strong style={{ color: 'rgba(0,229,255,.6)' }}>{new Date(prediccion.creadoEn).toLocaleString('es-EC')}</strong></span>
              </div>

            </div>

          ) : mundialStarted ? (
            /* ─ CLOSED STATE ─ */
            <div className="casino-card p-8 rounded-3xl flex flex-col items-center justify-center text-center gap-5 min-h-[320px]">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(255,109,0,.08)', border: '1px solid rgba(255,109,0,.4)' }}>
                <Lock className="w-8 h-8" style={{ color: '#ff6d00' }} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-2">Predicciones Cerradas</h3>
                <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'rgba(240,230,255,.5)' }}>
                  El Mundial comenzó el <strong className="text-white">11 de junio de 2026</strong>.
                  El plazo para enviar predicciones ha finalizado.
                </p>
              </div>
              <div className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest"
                style={{ background: 'rgba(255,109,0,.07)', border: '1px solid rgba(255,109,0,.3)', color: '#ff6d00' }}>
                ⚽ El torneo ya está en curso
              </div>
            </div>

          ) : (
            /* ─ PREDICTION FORM ─ */
            <div className="casino-card p-8 rounded-3xl">

              <div className="pb-5 mb-6 border-b" style={{ borderColor: 'rgba(255,0,128,.15)' }}>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 neon-text-pink" />
                  Formulario de Predicciones
                </h3>
                <p className="text-xs mt-1" style={{ color: 'rgba(240,230,255,.4)' }}>
                  Por favor, selecciona tus elecciones con atención. No podrás modificarlas después de guardarlas.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-7">

                {/* Podium section */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2"
                    style={{ color: '#ffd600' }}>
                    <span className="w-1 h-4 rounded inline-block" style={{ background: '#ffd600', boxShadow: '0 0 6px #ffd600' }} />
                    🏆 Formulario 1: Predicción del Podio
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {[
                      { id: 'primerPuesto',  label: '1er Puesto – Campeón',     color: 'rgba(255,214,0,.4)',  excluir: [form.segundoPuesto, form.tercerPuesto] },
                      { id: 'segundoPuesto', label: '2do Puesto – Subcampeón',  color: 'rgba(0,229,255,.4)',  excluir: [form.primerPuesto,  form.tercerPuesto] },
                      { id: 'tercerPuesto',  label: '3er Puesto – Tercer Lugar', color: 'rgba(255,109,0,.4)', excluir: [form.primerPuesto,  form.segundoPuesto] },
                    ].map(({ id, label, color, excluir }) => (
                      <div key={id} className="space-y-2">
                        <label htmlFor={id}
                          className="text-[10px] font-black uppercase tracking-wider block"
                          style={{ color }}>
                          {label}
                        </label>
                        <select
                          id={id}
                          name={id}
                          required
                          value={(form as any)[id]}
                          onChange={handleChange}
                          disabled={saving}
                          className="casino-select w-full px-4 py-3 rounded-xl text-sm cursor-pointer">
                          {renderPaisesOptions(excluir.filter(Boolean))}
                        </select>
                      </div>
                    ))}

                  </div>
                </div>

                {/* Ecuador section */}
                <div className="pt-6 border-t" style={{ borderColor: 'rgba(255,0,128,.12)' }}>
                  <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2"
                    style={{ color: '#39ff14' }}>
                    <span className="w-1 h-4 rounded inline-block" style={{ background: '#39ff14', boxShadow: '0 0 6px #39ff14' }} />
                    🇪🇨 Formulario 2: Fase Final de Ecuador en la Copa
                  </h4>
                  <p className="text-[10px] mb-4" style={{ color: 'rgba(240,230,255,.35)' }}>
                    Selecciona hasta qué fase llegará Ecuador. El Mundial 2026 tiene 48 equipos.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {FASES_COPA.map((fase) => {
                      const seleccionado = getFaseCopa(parseInt(form.ecuadorPosicion)).label === fase.label;
                      return (
                        <button
                          key={fase.label}
                          type="button"
                          disabled={saving}
                          onClick={() => setForm(prev => ({ ...prev, ecuadorPosicion: String(fase.pos) }))}
                          className="flex flex-col gap-2 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                          style={{
                            background: seleccionado ? `${fase.color}18` : 'rgba(255,255,255,.03)',
                            border: `2px solid ${seleccionado ? fase.color : 'rgba(255,255,255,.08)'}`,
                            boxShadow: seleccionado ? `0 0 20px ${fase.color}30` : 'none',
                          }}>
                          <div className="flex items-center justify-between">
                            <span className="text-lg">{fase.icon}</span>
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                              style={{ background: `${fase.color}20`, color: fase.color }}>
                              {fase.equipos} eq.
                            </span>
                          </div>
                          <div>
                            <p className="text-xs font-black leading-tight"
                              style={{ color: seleccionado ? fase.color : '#f0e6ff' }}>
                              {fase.label}
                            </p>
                            <p className="text-[9px] mt-0.5" style={{ color: 'rgba(240,230,255,.35)' }}>
                              Puestos {fase.min}–{fase.max}
                            </p>
                          </div>
                          {seleccionado && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3" style={{ color: fase.color }} />
                              <span className="text-[9px] font-black" style={{ color: fase.color }}>Seleccionado</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <div className="pt-6 border-t" style={{ borderColor: 'rgba(255,0,128,.12)' }}>
                  <button
                    type="submit"
                    id="submit-prediction-btn"
                    disabled={saving}
                    className="neon-btn w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
                    {saving ? (
                      <><Spinner size="sm" /> Guardando Predicción...</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> 🎰 Enviar Predicción Oficial</>
                    )}
                  </button>
                  <p className="text-center text-[10px] font-medium mt-3"
                    style={{ color: 'rgba(240,230,255,.3)' }}>
                    * Al enviar confirmas que tus predicciones son definitivas y no se podrán volver a editar.
                  </p>
                </div>

              </form>
            </div>
          )}

          {/* ── Formulario 3: Predicción de Partidos ── */}
          {!mundialStarted && (() => {
            const PARTIDOS = [
              { key: 'p1' as const, fecha: '14 Jun', hora: '6:00 p.m.', rival: 'Costa de Marfil', rivalFlag: '🇨🇮', color: '#ff6d00' },
              { key: 'p2' as const, fecha: '20 Jun', hora: '7:00 p.m.', rival: 'Curazao',         rivalFlag: '🇨🇼', color: '#00e5ff' },
              { key: 'p3' as const, fecha: '25 Jun', hora: '3:00 p.m.', rival: 'Alemania',        rivalFlag: '🇩🇪', color: '#bf00ff' },
            ];
            const OPCIONES: { val: ResultadoPartido; label: string; icon: string }[] = [
              { val: 'ecuador', label: 'Ecuador gana', icon: '🇪🇨' },
              { val: 'empate',  label: 'Empate',       icon: '🤝' },
              { val: 'rival',   label: 'Rival gana',   icon: '❌' },
            ];
            const labelRes: Record<ResultadoPartido, string> = { ecuador: '🇪🇨 Ecuador gana', empate: '🤝 Empate', rival: '❌ Rival gana' };

            return (
              <div className="casino-card p-8 rounded-3xl">
                <div className="pb-5 mb-6 border-b flex items-center gap-3" style={{ borderColor: 'rgba(0,229,255,.15)' }}>
                  <Swords className="w-5 h-5" style={{ color: '#00e5ff' }} />
                  <div>
                    <h3 className="text-xl font-black text-white">
                      Formulario 3: <span className="neon-text-cyan">Predicción de Partidos</span>
                    </h3>
                    <p className="text-xs mt-1" style={{ color: 'rgba(240,230,255,.4)' }}>
                      ¿Quién ganará cada partido de Ecuador en la fase de grupos?
                    </p>
                  </div>
                </div>

                {prediccionPartidos ? (
                  /* Estado guardado */
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-2xl mb-4"
                      style={{ background: 'rgba(57,255,20,.06)', border: '1px solid rgba(57,255,20,.25)' }}>
                      <CheckCircle2 className="w-5 h-5 shrink-0 neon-text-green" />
                      <div>
                        <p className="text-xs font-black neon-text-green">Predicciones guardadas</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(57,255,20,.6)' }}>
                          {new Date(prediccionPartidos.creadoEn).toLocaleString('es-EC')}
                        </p>
                      </div>
                      <Lock className="w-4 h-4 ml-auto neon-text-green" />
                    </div>
                    {PARTIDOS.map((p, i) => {
                      const res = [prediccionPartidos.partido1, prediccionPartidos.partido2, prediccionPartidos.partido3][i] as ResultadoPartido;
                      return (
                        <div key={p.key} className="flex items-center justify-between p-4 rounded-2xl"
                          style={{ background: `${p.color}08`, border: `1px solid ${p.color}30` }}>
                          <div className="flex items-center gap-3">
                            <span className="text-lg">🇪🇨</span>
                            <div>
                              <p className="text-xs font-black text-white">Ecuador vs {p.rival} {p.rivalFlag}</p>
                              <p className="text-[9px]" style={{ color: 'rgba(240,230,255,.4)' }}>{p.fecha} — {p.hora}</p>
                            </div>
                          </div>
                          <span className="text-xs font-black px-3 py-1.5 rounded-xl"
                            style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}40` }}>
                            {labelRes[res]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Formulario */
                  <form onSubmit={handlePartidosSubmit} className="space-y-4">
                    {PARTIDOS.map((p) => (
                      <div key={p.key} className="rounded-2xl overflow-hidden"
                        style={{ border: `1px solid ${p.color}30`, background: `${p.color}06` }}>
                        {/* Header partido */}
                        <div className="px-4 py-2.5 flex items-center justify-between"
                          style={{ borderBottom: `1px solid ${p.color}20`, background: `${p.color}0a` }}>
                          <div className="flex items-center gap-2">
                            <span className="text-base">🇪🇨</span>
                            <span className="text-xs font-black" style={{ color: p.color }}>Ecuador</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-lg font-black"
                              style={{ background: 'rgba(255,255,255,.05)', color: 'rgba(240,230,255,.4)', border: '1px solid rgba(255,255,255,.08)' }}>
                              vs
                            </span>
                            <span className="text-xs font-black text-white">{p.rival}</span>
                            <span className="text-base">{p.rivalFlag}</span>
                          </div>
                          <span className="text-[10px] font-black" style={{ color: `${p.color}99` }}>
                            {p.fecha} · {p.hora}
                          </span>
                        </div>
                        {/* Botones resultado */}
                        <div className="grid grid-cols-3 gap-2 p-3">
                          {OPCIONES.map((op) => {
                            const sel = formPartidos[p.key] === op.val;
                            return (
                              <button
                                key={op.val}
                                type="button"
                                disabled={savingPartidos}
                                onClick={() => setFormPartidos(prev => ({ ...prev, [p.key]: op.val }))}
                                className="flex flex-col items-center gap-1 py-3 rounded-xl text-center transition-all hover:scale-[1.03] active:scale-95 disabled:opacity-50"
                                style={{
                                  background: sel ? `${p.color}20` : 'rgba(255,255,255,.03)',
                                  border: `2px solid ${sel ? p.color : 'rgba(255,255,255,.08)'}`,
                                  boxShadow: sel ? `0 0 16px ${p.color}30` : 'none',
                                }}>
                                <span className="text-xl">{op.icon}</span>
                                <span className="text-[10px] font-black" style={{ color: sel ? p.color : 'rgba(240,230,255,.6)' }}>
                                  {op.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={savingPartidos}
                        className="w-full py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: 'linear-gradient(135deg, #00e5ff, #bf00ff)', color: '#fff', boxShadow: '0 0 24px rgba(0,229,255,.3)' }}>
                        {savingPartidos ? (
                          <><Spinner size="sm" /> Guardando...</>
                        ) : (
                          <><CheckCircle2 className="w-4 h-4" /> ⚽ Enviar Predicciones de Partidos</>
                        )}
                      </button>
                      <p className="text-center text-[10px] font-medium mt-3" style={{ color: 'rgba(240,230,255,.3)' }}>
                        * Una vez enviadas no podrán modificarse.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            );
          })()}

        </div>
      </main>

    </div>
  );
}

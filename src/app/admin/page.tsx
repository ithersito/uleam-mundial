'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Filter, Trophy, LogOut, Search, GraduationCap, BookOpen, Lock, Unlock, AlertTriangle, Trash2, RotateCcw, Swords } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { UsuarioConPrediccion, ResultadoPartido } from '@/types';

const NIVELES = ['Todos', '1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo'];
const CARRERAS = ['Todas', 'Tecnología de la Información', 'Ingeniería en Software'];
const ECUADOR_OPTS = ['Todas', ...Array.from({ length: 48 }, (_, i) => String(i + 1))];

const FASES = [
  { label: 'Fase de Grupos',         short: 'Grupos',        color: '#ff6d00', equipos: 48, icon: '🟠' },
  { label: 'Dieciseisavos de Final', short: 'Dieciseisavos', color: '#ffd600', equipos: 32, icon: '🟡' },
  { label: 'Octavos de Final',       short: 'Octavos',       color: '#00e5ff', equipos: 16, icon: '🔵' },
  { label: 'Cuartos de Final',       short: 'Cuartos',       color: '#bf00ff', equipos: 8,  icon: '🟣' },
  { label: 'Semifinales',            short: 'Semifinal',     color: '#ff0080', equipos: 4,  icon: '🔴' },
  { label: 'Gran Final',             short: 'Final',         color: '#ffd600', equipos: 2,  icon: '🏆' },
];

function getFase(pos: number) {
  if (pos >= 33) return FASES[0];
  if (pos >= 17) return FASES[1];
  if (pos >= 9)  return FASES[2];
  if (pos >= 5)  return FASES[3];
  if (pos >= 3)  return FASES[4];
  return FASES[5];
}

const RES_MAP: Record<ResultadoPartido, { label: string; color: string }> = {
  ecuador: { label: '🇪🇨 Gana',  color: '#39ff14' },
  empate:  { label: '🤝 Empate', color: '#ffd600' },
  rival:   { label: '❌ Rival',  color: '#ff0080' },
};

const PARTIDOS_DEF = [
  { key: 'p1' as const, rival: 'C. Marfil', fecha: '14/6', hex: '#ff6d00' },
  { key: 'p2' as const, rival: 'Curazao',   fecha: '20/6', hex: '#00e5ff' },
  { key: 'p3' as const, rival: 'Alemania',  fecha: '25/6', hex: '#bf00ff' },
];

const INIT_FILTROS = {
  busqueda: '', nivel: 'Todos', carrera: 'Todas', apuesta: 'todos' as 'todos'|'con'|'sin',
  primero: 'Todos', segundo: 'Todos', tercero: 'Todos',
  ecuador: 'Todas', fase: 'Todas',
  p1: 'todas', p2: 'todas', p3: 'todas',
};

export default function AdminPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<UsuarioConPrediccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prediccionesAbiertas, setPrediccionesAbiertas] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);
  const [confirmarCierre, setConfirmarCierre] = useState(false);
  const [borrandoId, setBorrandoId] = useState<string | null>(null);
  const [confirmarBorrado, setConfirmarBorrado] = useState<{ id: string; nombre: string } | null>(null);
  const [filtros, setFiltros] = useState(INIT_FILTROS);

  const setF = (k: keyof typeof INIT_FILTROS, v: string) =>
    setFiltros(prev => ({ ...prev, [k]: v }));

  const hayFiltrosActivos = JSON.stringify(filtros) !== JSON.stringify(INIT_FILTROS);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/config').then(r => r.json()),
    ]).then(([dataUsers, dataConfig]) => {
      if (dataUsers.error) { setError(dataUsers.error); return; }
      setUsuarios(dataUsers.usuarios.filter((u: UsuarioConPrediccion) => !u.esAdmin));
      if (dataConfig.config) setPrediccionesAbiertas(dataConfig.config.prediccionesAbiertas);
    }).catch(() => setError('No se pudo cargar la información.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleBorrarPrediccion = async () => {
    if (!confirmarBorrado) return;
    const { id } = confirmarBorrado;
    setConfirmarBorrado(null);
    setBorrandoId(id);
    try {
      const res = await fetch(`/api/admin/predictions/${id}`, { method: 'DELETE' });
      if (res.ok) setUsuarios(prev => prev.map(u => u.id === id ? { ...u, prediccion: null } : u));
    } finally { setBorrandoId(null); }
  };

  const handleToggle = async () => {
    if (prediccionesAbiertas && !confirmarCierre) { setConfirmarCierre(true); return; }
    setConfirmarCierre(false);
    setToggling(true);
    const res = await fetch('/api/admin/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prediccionesAbiertas: !prediccionesAbiertas }),
    });
    const data = await res.json();
    if (data.config) setPrediccionesAbiertas(data.config.prediccionesAbiertas);
    setToggling(false);
  };

  const paisesUnicos = (campo: 'primerPuesto' | 'segundoPuesto' | 'tercerPuesto') =>
    ['Todos', ...Array.from(new Set(usuarios.map(u => u.prediccion?.[campo]).filter(Boolean) as string[])).sort()];

  const filtrados = useMemo(() => usuarios.filter(u => {
    const q = filtros.busqueda.toLowerCase();
    if (q && !u.nombreCompleto.toLowerCase().includes(q) && !u.correoInstitucional.toLowerCase().includes(q)) return false;
    if (filtros.nivel !== 'Todos' && u.nivel !== filtros.nivel) return false;
    if (filtros.carrera !== 'Todas' && u.carrera !== filtros.carrera) return false;
    if (filtros.apuesta === 'con' && !u.prediccion) return false;
    if (filtros.apuesta === 'sin' && u.prediccion) return false;
    if (filtros.primero !== 'Todos' && u.prediccion?.primerPuesto !== filtros.primero) return false;
    if (filtros.segundo !== 'Todos' && u.prediccion?.segundoPuesto !== filtros.segundo) return false;
    if (filtros.tercero !== 'Todos' && u.prediccion?.tercerPuesto !== filtros.tercero) return false;
    if (filtros.ecuador !== 'Todas' && String(u.prediccion?.ecuadorPosicion) !== filtros.ecuador) return false;
    if (filtros.fase !== 'Todas' && (u.prediccion ? getFase(u.prediccion.ecuadorPosicion).label !== filtros.fase : true)) return false;
    if (filtros.p1 !== 'todas' && u.prediccionPartidos?.partido1 !== filtros.p1) return false;
    if (filtros.p2 !== 'todas' && u.prediccionPartidos?.partido2 !== filtros.p2) return false;
    if (filtros.p3 !== 'todas' && u.prediccionPartidos?.partido3 !== filtros.p3) return false;
    return true;
  }), [usuarios, filtros]);

  const conApuesta = usuarios.filter(u => u.prediccion !== null).length;
  const sinApuesta = usuarios.length - conApuesta;
  const conPartidos = usuarios.filter(u => u.prediccionPartidos !== null).length;

  const sel = "casino-select w-full px-3 py-2.5 rounded-xl text-xs";

  return (
    <div className="min-h-screen font-sans px-4 py-8" style={{ color: '#f0e6ff' }}>

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(191,0,255,.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,229,255,.06) 0%, transparent 70%)' }} />
      </div>

      {/* Modal cierre */}
      {confirmarCierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(6,0,15,.92)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(255,109,0,.4)', boxShadow: '0 0 40px rgba(255,109,0,.2)' }}>
            <div className="px-6 py-5 flex items-center gap-3"
              style={{ background: 'rgba(255,109,0,.06)', borderBottom: '1px solid rgba(255,109,0,.2)' }}>
              <AlertTriangle className="w-6 h-6 flex-shrink-0" style={{ color: '#ff6d00' }} />
              <div>
                <p className="font-black text-sm" style={{ color: '#ff6d00' }}>¿Cerrar predicciones?</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(240,230,255,.4)' }}>Esta acción bloqueará nuevos envíos</p>
              </div>
            </div>
            <div className="px-6 py-4 text-xs leading-relaxed" style={{ background: 'rgba(12,0,26,.9)', color: 'rgba(240,230,255,.6)' }}>
              Los estudiantes que aún no hayan enviado su predicción <strong className="text-white">ya no podrán hacerlo</strong>. Las predicciones existentes se conservan.
            </div>
            <div className="px-6 py-4 flex gap-3" style={{ background: 'rgba(6,0,15,.95)', borderTop: '1px solid rgba(255,109,0,.15)' }}>
              <button onClick={() => setConfirmarCierre(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(240,230,255,.5)' }}>
                Cancelar
              </button>
              <button onClick={handleToggle}
                className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
                style={{ background: 'linear-gradient(135deg, #ff6d00, #ff0080)', color: '#fff', boxShadow: '0 0 16px rgba(255,109,0,.4)' }}>
                Sí, cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal borrado */}
      {confirmarBorrado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(6,0,15,.92)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ border: '1px solid rgba(255,0,128,.4)', boxShadow: '0 0 40px rgba(255,0,128,.2)' }}>
            <div className="px-6 py-5 flex items-center gap-3"
              style={{ background: 'rgba(255,0,128,.06)', borderBottom: '1px solid rgba(255,0,128,.2)' }}>
              <Trash2 className="w-6 h-6 flex-shrink-0" style={{ color: '#ff0080' }} />
              <div>
                <p className="font-black text-sm" style={{ color: '#ff0080' }}>¿Borrar predicción?</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(240,230,255,.4)' }}>Esta acción no se puede deshacer</p>
              </div>
            </div>
            <div className="px-6 py-4 text-xs leading-relaxed" style={{ background: 'rgba(12,0,26,.9)', color: 'rgba(240,230,255,.6)' }}>
              Se eliminará la predicción de <strong className="text-white">{confirmarBorrado.nombre}</strong>. El estudiante podrá volver a enviar si las predicciones están abiertas.
            </div>
            <div className="px-6 py-4 flex gap-3" style={{ background: 'rgba(6,0,15,.95)', borderTop: '1px solid rgba(255,0,128,.15)' }}>
              <button onClick={() => setConfirmarBorrado(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: 'rgba(240,230,255,.5)' }}>
                Cancelar
              </button>
              <button onClick={handleBorrarPrediccion}
                className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #ff0080, #bf00ff)', color: '#fff', boxShadow: '0 0 16px rgba(255,0,128,.4)' }}>
                <Trash2 className="w-3.5 h-3.5" /> Sí, borrar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(191,0,255,.15)', border: '1px solid rgba(191,0,255,.4)', boxShadow: '0 0 16px rgba(191,0,255,.2)' }}>
              <Users className="w-5 h-5" style={{ color: '#bf00ff' }} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">
                <span className="neon-text-purple">PANEL</span>{' '}
                <span className="neon-text-cyan">ADMIN</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,214,0,.6)' }}>
                GYPS · Mundial 2026 · ULEAM
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {prediccionesAbiertas !== null && (
              <button onClick={handleToggle} disabled={toggling}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 disabled:opacity-50"
                style={prediccionesAbiertas ? {
                  background: 'rgba(255,109,0,.12)', border: '1px solid rgba(255,109,0,.5)',
                  color: '#ff6d00', boxShadow: '0 0 12px rgba(255,109,0,.2)',
                } : {
                  background: 'rgba(57,255,20,.1)', border: '1px solid rgba(57,255,20,.4)',
                  color: '#39ff14', boxShadow: '0 0 12px rgba(57,255,20,.2)',
                }}>
                {toggling ? <Spinner size="sm" /> : prediccionesAbiertas
                  ? <><Lock className="w-4 h-4" /> Cerrar Predicciones</>
                  : <><Unlock className="w-4 h-4" /> Abrir Predicciones</>}
              </button>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:scale-105"
              style={{ background: 'rgba(255,0,128,.1)', border: '1px solid rgba(255,0,128,.3)', color: '#ff0080' }}>
              <LogOut className="w-4 h-4" /> Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Banner estado */}
        {prediccionesAbiertas !== null && (
          <div className="mb-6 px-5 py-3 rounded-2xl flex items-center gap-3"
            style={prediccionesAbiertas
              ? { background: 'rgba(57,255,20,.05)', border: '1px solid rgba(57,255,20,.25)' }
              : { background: 'rgba(255,109,0,.05)', border: '1px solid rgba(255,109,0,.3)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
              style={{ background: prediccionesAbiertas ? '#39ff14' : '#ff6d00' }} />
            <span className="text-xs font-black uppercase tracking-widest"
              style={{ color: prediccionesAbiertas ? '#39ff14' : '#ff6d00' }}>
              {prediccionesAbiertas
                ? 'Predicciones ABIERTAS — Los estudiantes pueden enviar sus apuestas'
                : 'Predicciones CERRADAS — No se aceptan nuevos envíos'}
            </span>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Total',        value: usuarios.length, color: '#00e5ff', icon: Users },
            { label: 'Con Podio',    value: conApuesta,      color: '#39ff14', icon: Trophy },
            { label: 'Sin Podio',    value: sinApuesta,      color: '#ff6d00', icon: Filter },
            { label: 'Con Partidos', value: conPartidos,     color: '#bf00ff', icon: Swords },
            { label: 'Mostrando',    value: filtrados.length, color: '#ff0080', icon: Filter },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="casino-card p-4 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18`, border: `1px solid ${color}40` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-xl font-black" style={{ color }}>{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(240,230,255,.4)' }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filtros ── */}
        <div className="casino-card p-5 rounded-2xl mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" style={{ color: '#ffd600' }} />
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#ffd600' }}>Filtros</span>
            </div>
            {hayFiltrosActivos && (
              <button onClick={() => setFiltros(INIT_FILTROS)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all hover:scale-105"
                style={{ background: 'rgba(255,214,0,.08)', border: '1px solid rgba(255,214,0,.25)', color: '#ffd600' }}>
                <RotateCcw className="w-3 h-3" /> Limpiar
              </button>
            )}
          </div>

          {/* Fila 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(255,0,128,.5)' }} />
              <input type="text" placeholder="Buscar nombre o correo..."
                value={filtros.busqueda} onChange={e => setF('busqueda', e.target.value)}
                className="casino-input w-full pl-9 pr-4 py-2.5 rounded-xl text-xs" />
            </div>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(0,229,255,.5)' }} />
              <select value={filtros.nivel} onChange={e => setF('nivel', e.target.value)} className={`${sel} pl-9`}>
                {NIVELES.map(n => <option key={n} value={n}>{n === 'Todos' ? 'Todos los semestres' : `${n} Semestre`}</option>)}
              </select>
            </div>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(191,0,255,.5)' }} />
              <select value={filtros.carrera} onChange={e => setF('carrera', e.target.value)} className={`${sel} pl-9`}>
                {CARRERAS.map(c => <option key={c} value={c}>{c === 'Todas' ? 'Todas las carreras' : c}</option>)}
              </select>
            </div>
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,0,128,.2)' }}>
              {(['todos', 'con', 'sin'] as const).map((v, i) => (
                <button key={v} onClick={() => setF('apuesta', v)}
                  className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all"
                  style={{
                    background: filtros.apuesta === v ? 'rgba(255,0,128,.2)' : 'transparent',
                    color: filtros.apuesta === v ? '#ff0080' : 'rgba(240,230,255,.4)',
                    borderRight: i < 2 ? '1px solid rgba(255,0,128,.1)' : 'none',
                  }}>
                  {v === 'todos' ? 'Todos' : v === 'con' ? 'Con podio' : 'Sin podio'}
                </button>
              ))}
            </div>
          </div>

          {/* Fila 2: Podio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,214,0,.6)' }}>🥇 1° Puesto</p>
              <select value={filtros.primero} onChange={e => setF('primero', e.target.value)} className={sel}>
                {paisesUnicos('primerPuesto').map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(0,229,255,.6)' }}>🥈 2° Puesto</p>
              <select value={filtros.segundo} onChange={e => setF('segundo', e.target.value)} className={sel}>
                {paisesUnicos('segundoPuesto').map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,109,0,.6)' }}>🥉 3° Puesto</p>
              <select value={filtros.tercero} onChange={e => setF('tercero', e.target.value)} className={sel}>
                {paisesUnicos('tercerPuesto').map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Fila 3: Ecuador */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(57,255,20,.6)' }}>🇪🇨 Ecuador — Posición exacta</p>
              <select value={filtros.ecuador} onChange={e => setF('ecuador', e.target.value)} className={sel}>
                {ECUADOR_OPTS.map(p => <option key={p} value={p}>{p === 'Todas' ? 'Todas las posiciones' : `Puesto #${p}`}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(191,0,255,.7)' }}>⚽ Ecuador — Fase de la Copa</p>
              <select value={filtros.fase} onChange={e => setF('fase', e.target.value)} className={sel}>
                <option value="Todas">Todas las fases</option>
                {FASES.map(f => <option key={f.label} value={f.label}>{f.icon} {f.label} ({f.equipos} eq.)</option>)}
              </select>
            </div>
          </div>

          {/* Fila 4: Partidos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            {([
              { label: '⚽ 14/6 — vs Costa de Marfil', fk: 'p1' as const, hex: '#ff6d00', val: filtros.p1 },
              { label: '⚽ 20/6 — vs Curazao',         fk: 'p2' as const, hex: '#00e5ff', val: filtros.p2 },
              { label: '⚽ 25/6 — vs Alemania',         fk: 'p3' as const, hex: '#bf00ff', val: filtros.p3 },
            ]).map(({ label, fk, hex, val }) => (
              <div key={fk}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: hex + 'aa' }}>{label}</p>
                <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${hex}40` }}>
                  {([
                    { v: 'todas',   txt: 'Todos'  },
                    { v: 'ecuador', txt: '🇪🇨 Gana' },
                    { v: 'empate',  txt: '🤝 Empate' },
                    { v: 'rival',   txt: '❌ Rival' },
                  ] as const).map(({ v, txt }, i, arr) => (
                    <button key={v} onClick={() => setF(fk, v)}
                      className="flex-1 py-2 text-[9px] font-black uppercase tracking-wide transition-all"
                      style={{
                        background: val === v ? hex + '25' : 'transparent',
                        color: val === v ? hex : 'rgba(240,230,255,.35)',
                        borderRight: i < arr.length - 1 ? `1px solid ${hex}20` : 'none',
                      }}>
                      {txt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabla ── */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="casino-card p-8 rounded-2xl text-center" style={{ color: '#ff0080' }}>
            <p className="font-bold">{error}</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="casino-card p-12 rounded-2xl flex flex-col items-center gap-3" style={{ color: 'rgba(240,230,255,.4)' }}>
            <Search className="w-8 h-8 opacity-30" />
            <p className="font-bold text-sm">No hay estudiantes con esos filtros.</p>
            <button onClick={() => setFiltros(INIT_FILTROS)}
              className="text-xs font-black flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all hover:scale-105"
              style={{ background: 'rgba(255,214,0,.08)', border: '1px solid rgba(255,214,0,.25)', color: '#ffd600' }}>
              <RotateCcw className="w-3.5 h-3.5" /> Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="casino-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  {/* Grupos de columnas */}
                  <tr style={{ background: 'rgba(255,255,255,.02)', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
                    <th colSpan={4} />
                    <th colSpan={4} className="px-4 py-1.5 text-left text-[9px] font-black uppercase tracking-widest"
                      style={{ color: 'rgba(255,214,0,.5)', borderLeft: '1px solid rgba(255,214,0,.1)' }}>
                      🏆 Podio
                    </th>
                    <th colSpan={2} className="px-4 py-1.5 text-left text-[9px] font-black uppercase tracking-widest"
                      style={{ color: 'rgba(57,255,20,.5)', borderLeft: '1px solid rgba(57,255,20,.1)' }}>
                      🇪🇨 Ecuador
                    </th>
                    <th colSpan={3} className="px-4 py-1.5 text-left text-[9px] font-black uppercase tracking-widest"
                      style={{ color: 'rgba(0,229,255,.5)', borderLeft: '1px solid rgba(0,229,255,.1)' }}>
                      ⚽ Grupo E
                    </th>
                    <th />
                  </tr>
                  {/* Cabeceras */}
                  <tr style={{ borderBottom: '1px solid rgba(255,0,128,.15)', background: 'rgba(255,0,128,.04)' }}>
                    {[
                      { h: '#',           color: 'rgba(240,230,255,.3)' },
                      { h: 'Estudiante',  color: 'rgba(0,229,255,.7)'   },
                      { h: 'Semestre',    color: 'rgba(0,229,255,.7)'   },
                      { h: 'Carrera',     color: 'rgba(0,229,255,.7)'   },
                      { h: '1° Puesto',   color: 'rgba(255,214,0,.8)',   bl: true },
                      { h: '2° Puesto',   color: 'rgba(0,229,255,.7)'   },
                      { h: '3° Puesto',   color: 'rgba(255,109,0,.8)'   },
                      { h: 'Fecha',       color: 'rgba(240,230,255,.3)' },
                      { h: 'Posición',    color: 'rgba(57,255,20,.7)',   bl: true },
                      { h: 'Fase',        color: 'rgba(57,255,20,.7)'   },
                      { h: 'vs C. Marfil',color: '#ff6d00',              bl: true },
                      { h: 'vs Curazao',  color: '#00e5ff'               },
                      { h: 'vs Alemania', color: '#bf00ff'               },
                      { h: '',            color: ''                       },
                    ].map(({ h, color, bl }, idx) => (
                      <th key={idx} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
                        style={{ color, borderLeft: bl ? '1px solid rgba(255,255,255,.06)' : undefined }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((u, i) => (
                    <tr key={u.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)' }}
                      className="hover:bg-[rgba(191,0,255,.05)] transition-colors">

                      {/* # */}
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'rgba(240,230,255,.3)' }}>{i + 1}</td>

                      {/* Estudiante */}
                      <td className="px-4 py-3 min-w-[180px]">
                        <p className="font-bold text-white text-xs leading-tight">{u.nombreCompleto}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(0,229,255,.55)' }}>{u.correoInstitucional}</p>
                      </td>

                      {/* Semestre */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase"
                          style={{ background: 'rgba(0,229,255,.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,.2)' }}>
                          {u.nivel}
                        </span>
                      </td>

                      {/* Carrera */}
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-black px-2 py-1 rounded-lg"
                          style={{ background: 'rgba(191,0,255,.1)', color: '#bf00ff', border: '1px solid rgba(191,0,255,.25)' }}>
                          {u.carrera === 'Tecnología de la Información' ? 'TI' : 'IS'}
                        </span>
                      </td>

                      {u.prediccion ? (
                        <>
                          {/* Podio */}
                          <td className="px-4 py-3" style={{ borderLeft: '1px solid rgba(255,255,255,.04)' }}>
                            <span className="text-xs font-bold" style={{ color: '#ffd600' }}>🥇 {u.prediccion.primerPuesto}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-bold" style={{ color: 'rgba(240,230,255,.7)' }}>🥈 {u.prediccion.segundoPuesto}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs font-bold" style={{ color: '#ff6d00' }}>🥉 {u.prediccion.tercerPuesto}</span>
                          </td>
                          <td className="px-4 py-3 text-[10px] font-mono whitespace-nowrap" style={{ color: 'rgba(240,230,255,.3)' }}>
                            {new Date(u.prediccion.creadoEn).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: '2-digit' })}
                          </td>

                          {/* Ecuador */}
                          <td className="px-4 py-3" style={{ borderLeft: '1px solid rgba(255,255,255,.04)' }}>
                            <span className="px-2 py-1 rounded-lg text-[10px] font-black"
                              style={{ background: 'rgba(57,255,20,.1)', color: '#39ff14', border: '1px solid rgba(57,255,20,.2)' }}>
                              #{u.prediccion.ecuadorPosicion}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {(() => {
                              const fase = getFase(u.prediccion!.ecuadorPosicion);
                              return (
                                <div className="flex flex-col gap-1 min-w-[110px]">
                                  <span className="px-2 py-1 rounded-lg text-[10px] font-black whitespace-nowrap"
                                    style={{ background: `${fase.color}18`, color: fase.color, border: `1px solid ${fase.color}40` }}>
                                    {fase.icon} {fase.short}
                                  </span>
                                  <div className="flex gap-0.5">
                                    {FASES.map((f, idx) => {
                                      const faseIdx = FASES.indexOf(fase);
                                      return (
                                        <div key={f.label} title={f.label}
                                          className="h-1 flex-1 rounded-full"
                                          style={{ background: idx <= faseIdx ? f.color : 'rgba(255,255,255,.08)' }} />
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}
                          </td>

                          {/* Partidos Grupo E */}
                          {PARTIDOS_DEF.map((p, pi) => {
                            const vals = u.prediccionPartidos
                              ? [u.prediccionPartidos.partido1, u.prediccionPartidos.partido2, u.prediccionPartidos.partido3] as ResultadoPartido[]
                              : null;
                            const res = vals?.[pi];
                            return (
                              <td key={p.key} className="px-4 py-3" style={{ borderLeft: pi === 0 ? '1px solid rgba(255,255,255,.04)' : undefined }}>
                                {res ? (
                                  <span className="px-2 py-1 rounded-lg text-[10px] font-black whitespace-nowrap"
                                    style={{ background: `${RES_MAP[res].color}18`, color: RES_MAP[res].color, border: `1px solid ${RES_MAP[res].color}40` }}>
                                    {RES_MAP[res].label}
                                  </span>
                                ) : (
                                  <span className="text-[10px]" style={{ color: 'rgba(240,230,255,.2)' }}>—</span>
                                )}
                              </td>
                            );
                          })}

                          {/* Borrar */}
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setConfirmarBorrado({ id: u.id, nombre: u.nombreCompleto })}
                              disabled={borrandoId === u.id}
                              title="Borrar predicción"
                              className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
                              style={{ background: 'rgba(255,0,128,.08)', border: '1px solid rgba(255,0,128,.25)', color: '#ff0080' }}>
                              {borrandoId === u.id ? <Spinner size="sm" /> : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </>
                      ) : (
                        <td colSpan={10} className="px-4 py-3 text-center" style={{ borderLeft: '1px solid rgba(255,255,255,.04)' }}>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg"
                            style={{ background: 'rgba(255,109,0,.08)', color: 'rgba(255,109,0,.6)', border: '1px solid rgba(255,109,0,.2)' }}>
                            Sin apuesta
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer tabla */}
            <div className="px-5 py-3 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,.04)' }}>
              <span className="text-[10px]" style={{ color: 'rgba(240,230,255,.25)' }}>
                {filtrados.length} de {usuarios.length} estudiantes
                {hayFiltrosActivos && <span style={{ color: 'rgba(255,214,0,.5)' }}> — filtros activos</span>}
              </span>
              <div className="flex gap-4 text-[10px]" style={{ color: 'rgba(240,230,255,.3)' }}>
                <span>Con podio: <strong style={{ color: '#39ff14' }}>{conApuesta}</strong></span>
                <span>Con partidos: <strong style={{ color: '#bf00ff' }}>{conPartidos}</strong></span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

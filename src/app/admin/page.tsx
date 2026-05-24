'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Filter, Trophy, LogOut, Search, GraduationCap, BookOpen, Lock, Unlock, AlertTriangle, Trash2 } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { UsuarioConPrediccion, ResultadoPartido } from '@/types';

const NIVELES = ['Todos', '1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo'];
const CARRERAS = ['Todas', 'Tecnología de la Información', 'Ingeniería en Software'];
const ECUADOR_OPTS = ['Todas', ...Array.from({ length: 48 }, (_, i) => String(i + 1))];

type Fase = {
  label: string;
  short: string;
  color: string;
  equipos: number;
  icon: string;
};

const FASES: Fase[] = [
  { label: 'Fase de Grupos',          short: 'Grupos',        color: '#ff6d00', equipos: 48, icon: '🟠' },
  { label: 'Dieciseisavos de Final',  short: 'Dieciseisavos', color: '#ffd600', equipos: 32, icon: '🟡' },
  { label: 'Octavos de Final',        short: 'Octavos',       color: '#00e5ff', equipos: 16, icon: '🔵' },
  { label: 'Cuartos de Final',        short: 'Cuartos',       color: '#bf00ff', equipos: 8,  icon: '🟣' },
  { label: 'Semifinales',             short: 'Semifinal',     color: '#ff0080', equipos: 4,  icon: '🔴' },
  { label: 'Gran Final',              short: 'Final',         color: '#ffd600', equipos: 2,  icon: '🏆' },
];

function getFase(pos: number): Fase {
  if (pos >= 33) return FASES[0];
  if (pos >= 17) return FASES[1];
  if (pos >= 9)  return FASES[2];
  if (pos >= 5)  return FASES[3];
  if (pos >= 3)  return FASES[4];
  return FASES[5];
}

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

  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('Todos');
  const [filtroCarrera, setFiltroCarrera] = useState('Todas');
  const [filtroApuesta, setFiltroApuesta] = useState<'todos' | 'con' | 'sin'>('todos');
  const [filtroPrimero, setFiltroPrimero] = useState('Todos');
  const [filtroSegundo, setFiltroSegundo] = useState('Todos');
  const [filtroTercero, setFiltroTercero] = useState('Todos');
  const [filtroEcuador, setFiltroEcuador] = useState('Todas');
  const [filtroFase, setFiltroFase] = useState('Todas');
  const [filtroP1, setFiltroP1] = useState('todas');
  const [filtroP2, setFiltroP2] = useState('todas');
  const [filtroP3, setFiltroP3] = useState('todas');

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
      if (res.ok) {
        setUsuarios(prev => prev.map(u => u.id === id ? { ...u, prediccion: null } : u));
      }
    } finally {
      setBorrandoId(null);
    }
  };

  const handleToggle = async () => {
    if (prediccionesAbiertas && !confirmarCierre) {
      setConfirmarCierre(true);
      return;
    }
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

  // Listas únicas para los filtros de país
  const paisesUnicos = (campo: 'primerPuesto' | 'segundoPuesto' | 'tercerPuesto') =>
    ['Todos', ...Array.from(new Set(usuarios.map(u => u.prediccion?.[campo]).filter(Boolean) as string[])).sort()];

  const filtrados = useMemo(() => {
    return usuarios.filter(u => {
      const matchBusqueda = busqueda === '' ||
        u.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.correoInstitucional.toLowerCase().includes(busqueda.toLowerCase());
      const matchNivel = filtroNivel === 'Todos' || u.nivel === filtroNivel;
      const matchCarrera = filtroCarrera === 'Todas' || u.carrera === filtroCarrera;
      const matchApuesta =
        filtroApuesta === 'todos' ? true :
        filtroApuesta === 'con' ? u.prediccion !== null : u.prediccion === null;
      const matchPrimero = filtroPrimero === 'Todos' || u.prediccion?.primerPuesto === filtroPrimero;
      const matchSegundo = filtroSegundo === 'Todos' || u.prediccion?.segundoPuesto === filtroSegundo;
      const matchTercero = filtroTercero === 'Todos' || u.prediccion?.tercerPuesto === filtroTercero;
      const matchEcuador = filtroEcuador === 'Todas' || String(u.prediccion?.ecuadorPosicion) === filtroEcuador;
      const matchFase = filtroFase === 'Todas' || (u.prediccion ? getFase(u.prediccion.ecuadorPosicion).label === filtroFase : false);
      const matchP1 = filtroP1 === 'todas' || u.prediccionPartidos?.partido1 === filtroP1;
      const matchP2 = filtroP2 === 'todas' || u.prediccionPartidos?.partido2 === filtroP2;
      const matchP3 = filtroP3 === 'todas' || u.prediccionPartidos?.partido3 === filtroP3;
      return matchBusqueda && matchNivel && matchCarrera && matchApuesta &&
             matchPrimero && matchSegundo && matchTercero && matchEcuador && matchFase &&
             matchP1 && matchP2 && matchP3;
    });
  }, [usuarios, busqueda, filtroNivel, filtroCarrera, filtroApuesta, filtroPrimero, filtroSegundo, filtroTercero, filtroEcuador, filtroFase, filtroP1, filtroP2, filtroP3]);

  const conApuesta = usuarios.filter(u => u.prediccion !== null).length;
  const sinApuesta = usuarios.length - conApuesta;

  const selectCls = "casino-select w-full px-3 py-2.5 rounded-xl text-xs appearance-none";

  return (
    <div className="min-h-screen font-sans px-4 py-8" style={{ color: '#f0e6ff' }}>

      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(191,0,255,.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,229,255,.06) 0%, transparent 70%)' }} />
      </div>

      {/* Modal confirmar cierre */}
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

      {/* Modal confirmar borrado de predicción */}
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
              Se eliminará la predicción de <strong className="text-white">{confirmarBorrado.nombre}</strong>. El estudiante podrá volver a enviar una nueva (si las predicciones están abiertas).
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

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(191,0,255,.15)', border: '1px solid rgba(191,0,255,.4)' }}>
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

          <div className="flex items-center gap-3">
            {/* Botón detener/abrir predicciones */}
            {prediccionesAbiertas !== null && (
              <button onClick={handleToggle} disabled={toggling}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:scale-105 disabled:opacity-50"
                style={prediccionesAbiertas ? {
                  background: 'rgba(255,109,0,.12)',
                  border: '1px solid rgba(255,109,0,.5)',
                  color: '#ff6d00',
                  boxShadow: '0 0 12px rgba(255,109,0,.2)',
                } : {
                  background: 'rgba(57,255,20,.1)',
                  border: '1px solid rgba(57,255,20,.4)',
                  color: '#39ff14',
                  boxShadow: '0 0 12px rgba(57,255,20,.2)',
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

        {/* Estado predicciones banner */}
        {prediccionesAbiertas !== null && (
          <div className="mb-6 px-5 py-3 rounded-2xl flex items-center gap-3"
            style={prediccionesAbiertas ? {
              background: 'rgba(57,255,20,.05)',
              border: '1px solid rgba(57,255,20,.25)',
            } : {
              background: 'rgba(255,109,0,.05)',
              border: '1px solid rgba(255,109,0,.3)',
            }}>
            <div className={`w-2 h-2 rounded-full animate-pulse`}
              style={{ background: prediccionesAbiertas ? '#39ff14' : '#ff6d00' }} />
            <span className="text-xs font-black uppercase tracking-widest"
              style={{ color: prediccionesAbiertas ? '#39ff14' : '#ff6d00' }}>
              {prediccionesAbiertas ? 'Predicciones ABIERTAS — Los estudiantes pueden enviar sus apuestas' : 'Predicciones CERRADAS — No se aceptan nuevos envíos'}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Estudiantes', value: usuarios.length, color: '#00e5ff', icon: Users },
            { label: 'Con Apuesta', value: conApuesta, color: '#39ff14', icon: Trophy },
            { label: 'Sin Apuesta', value: sinApuesta, color: '#ff6d00', icon: Filter },
            { label: 'Mostrando', value: filtrados.length, color: '#bf00ff', icon: Filter },
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

        {/* Filtros */}
        <div className="casino-card p-5 rounded-2xl mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" style={{ color: '#ffd600' }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#ffd600' }}>Filtros</span>
          </div>

          {/* Fila 1: búsqueda, semestre, carrera, estado */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,0,128,.5)' }} />
              <input type="text" placeholder="Buscar nombre o correo..."
                value={busqueda} onChange={e => setBusqueda(e.target.value)}
                className="casino-input w-full pl-9 pr-4 py-2.5 rounded-xl text-xs" />
            </div>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(0,229,255,.5)' }} />
              <select value={filtroNivel} onChange={e => setFiltroNivel(e.target.value)}
                className={`${selectCls} pl-9`}>
                {NIVELES.map(n => <option key={n} value={n}>{n === 'Todos' ? 'Todos los semestres' : `${n} Semestre`}</option>)}
              </select>
            </div>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'rgba(191,0,255,.5)' }} />
              <select value={filtroCarrera} onChange={e => setFiltroCarrera(e.target.value)}
                className={`${selectCls} pl-9`}>
                {CARRERAS.map(c => <option key={c} value={c}>{c === 'Todas' ? 'Todas las carreras' : c}</option>)}
              </select>
            </div>
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,0,128,.2)' }}>
              {(['todos', 'con', 'sin'] as const).map((val, i) => (
                <button key={val} onClick={() => setFiltroApuesta(val)}
                  className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all"
                  style={{
                    background: filtroApuesta === val ? 'rgba(255,0,128,.2)' : 'transparent',
                    color: filtroApuesta === val ? '#ff0080' : 'rgba(240,230,255,.4)',
                    borderRight: i < 2 ? '1px solid rgba(255,0,128,.1)' : 'none',
                  }}>
                  {val === 'todos' ? 'Todos' : val === 'con' ? 'Con' : 'Sin'}
                </button>
              ))}
            </div>
          </div>

          {/* Fila 2: filtros por apuesta — podio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,214,0,.6)' }}>🥇 1° Puesto</p>
              <select value={filtroPrimero} onChange={e => setFiltroPrimero(e.target.value)} className={selectCls}>
                {paisesUnicos('primerPuesto').map(p => <option key={p} value={p}>{p === 'Todos' ? 'Todos' : p}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(0,229,255,.6)' }}>🥈 2° Puesto</p>
              <select value={filtroSegundo} onChange={e => setFiltroSegundo(e.target.value)} className={selectCls}>
                {paisesUnicos('segundoPuesto').map(p => <option key={p} value={p}>{p === 'Todos' ? 'Todos' : p}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,109,0,.6)' }}>🥉 3° Puesto</p>
              <select value={filtroTercero} onChange={e => setFiltroTercero(e.target.value)} className={selectCls}>
                {paisesUnicos('tercerPuesto').map(p => <option key={p} value={p}>{p === 'Todos' ? 'Todos' : p}</option>)}
              </select>
            </div>
          </div>

          {/* Fila 3: Ecuador */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(57,255,20,.6)' }}>🇪🇨 Ecuador — Posición exacta</p>
              <select value={filtroEcuador} onChange={e => setFiltroEcuador(e.target.value)} className={selectCls}>
                {ECUADOR_OPTS.map(p => <option key={p} value={p}>{p === 'Todas' ? 'Todas las posiciones' : `Puesto #${p}`}</option>)}
              </select>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(191,0,255,.7)' }}>⚽ Ecuador — Fase de la Copa</p>
              <select value={filtroFase} onChange={e => setFiltroFase(e.target.value)} className={selectCls}>
                <option value="Todas">Todas las fases</option>
                {FASES.map(f => (
                  <option key={f.label} value={f.label}>{f.icon} {f.label} ({f.equipos} equipos)</option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 4: Partidos Grupo E */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
            {([
              { label: '🟠 14/6 vs Costa de Marfil', hex: '#ff6d00', val: filtroP1, set: setFiltroP1 },
              { label: '🔵 20/6 vs Curazao',         hex: '#00e5ff', val: filtroP2, set: setFiltroP2 },
              { label: '🟣 25/6 vs Alemania',         hex: '#bf00ff', val: filtroP3, set: setFiltroP3 },
            ] as const).map(({ label, hex, val, set }) => (
              <div key={label}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: hex + 'aa' }}>{label}</p>
                <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${hex}40` }}>
                  {([
                    { v: 'todas',   txt: 'Todos' },
                    { v: 'ecuador', txt: '🇪🇨 Gana' },
                    { v: 'empate',  txt: '🤝 Empate' },
                    { v: 'rival',   txt: '❌ Rival' },
                  ] as const).map(({ v, txt }, i, arr) => (
                    <button key={v} onClick={() => set(v)}
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

        {/* Partidos de Ecuador */}
        <div className="casino-card p-5 rounded-2xl mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">⚽</span>
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#00e5ff' }}>
              Partidos de Ecuador — Grupo E
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { fecha: '14/6', hora: '6:00 p.m.', rival: 'Costa de Marfil', rivalFlag: '🇨🇮', color: '#ff6d00' },
              { fecha: '20/6', hora: '7:00 p.m.', rival: 'Curazao',         rivalFlag: '🇨🇼', color: '#00e5ff' },
              { fecha: '25/6', hora: '3:00 p.m.', rival: 'Alemania',        rivalFlag: '🇩🇪', color: '#bf00ff' },
            ].map((m) => (
              <div key={m.fecha} className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${m.color}30`, background: `${m.color}06` }}>
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

        {/* Tabla */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="casino-card p-8 rounded-2xl text-center" style={{ color: '#ff0080' }}>
            <p className="font-bold">{error}</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="casino-card p-8 rounded-2xl text-center" style={{ color: 'rgba(240,230,255,.4)' }}>
            <p className="font-bold">No se encontraron estudiantes con esos filtros.</p>
          </div>
        ) : (
          <div className="casino-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,0,128,.15)', background: 'rgba(255,0,128,.05)' }}>
                    {['#', 'Estudiante', 'Semestre', 'Carrera', '1° Puesto', '2° Puesto', '3° Puesto', 'Ecuador', 'Fase 🇪🇨', 'Fecha', 'vs Costa de Marfil', 'vs Curazao', 'vs Alemania', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest"
                        style={{ color: 'rgba(0,229,255,.7)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((u, i) => (
                    <tr key={u.id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.01)' }}
                      className="hover:bg-[rgba(191,0,255,.05)] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'rgba(240,230,255,.3)' }}>{i + 1}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-white text-xs">{u.nombreCompleto}</p>
                        <p className="text-[10px]" style={{ color: 'rgba(0,229,255,.6)' }}>{u.correoInstitucional}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase"
                          style={{ background: 'rgba(0,229,255,.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,.2)' }}>
                          {u.nivel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-bold" style={{ color: 'rgba(191,0,255,.9)' }}>
                          {u.carrera === 'Tecnología de la Información' ? 'TI' : 'IS'}
                        </span>
                      </td>
                      {u.prediccion ? (
                        <>
                          <td className="px-4 py-3"><span className="text-xs font-bold" style={{ color: '#ffd600' }}>🥇 {u.prediccion.primerPuesto}</span></td>
                          <td className="px-4 py-3"><span className="text-xs font-bold" style={{ color: 'rgba(240,230,255,.7)' }}>🥈 {u.prediccion.segundoPuesto}</span></td>
                          <td className="px-4 py-3"><span className="text-xs font-bold" style={{ color: '#ff6d00' }}>🥉 {u.prediccion.tercerPuesto}</span></td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 rounded-lg text-[10px] font-black"
                              style={{ background: 'rgba(57,255,20,.1)', color: '#39ff14', border: '1px solid rgba(57,255,20,.2)' }}>
                              #{u.prediccion.ecuadorPosicion}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {(() => {
                              const fase = getFase(u.prediccion.ecuadorPosicion);
                              return (
                                <div className="flex flex-col gap-1 min-w-[130px]">
                                  <span className="px-2 py-1 rounded-lg text-[10px] font-black whitespace-nowrap"
                                    style={{ background: `${fase.color}18`, color: fase.color, border: `1px solid ${fase.color}40` }}>
                                    {fase.icon} {fase.short}
                                  </span>
                                  <div className="flex gap-0.5 items-center">
                                    {FASES.map((f, idx) => {
                                      const fasesOrden = FASES.map(x => x.label);
                                      const faseIdx = fasesOrden.indexOf(fase.label);
                                      const activo = idx <= faseIdx;
                                      return (
                                        <div key={f.label}
                                          title={f.label}
                                          className="h-1.5 flex-1 rounded-full transition-all"
                                          style={{ background: activo ? f.color : 'rgba(255,255,255,.08)' }} />
                                      );
                                    })}
                                  </div>
                                  <span className="text-[9px]" style={{ color: 'rgba(240,230,255,.3)' }}>
                                    {fase.equipos} equipos
                                  </span>
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3 text-[10px] font-mono" style={{ color: 'rgba(240,230,255,.3)' }}>
                            {new Date(u.prediccion.creadoEn).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: '2-digit' })}
                          </td>
                          {/* Predicciones de partidos */}
                          {(() => {
                            const COLORES: Record<ResultadoPartido, { label: string; color: string }> = {
                              ecuador: { label: '🇪🇨 Gana', color: '#39ff14' },
                              empate:  { label: '🤝 Empate', color: '#ffd600' },
                              rival:   { label: '❌ Rival',  color: '#ff0080' },
                            };
                            const vals = u.prediccionPartidos
                              ? [u.prediccionPartidos.partido1, u.prediccionPartidos.partido2, u.prediccionPartidos.partido3] as ResultadoPartido[]
                              : null;
                            return [0, 1, 2].map(i => (
                              <td key={i} className="px-4 py-3">
                                {vals ? (
                                  <span className="px-2 py-1 rounded-lg text-[10px] font-black whitespace-nowrap"
                                    style={{ background: `${COLORES[vals[i]].color}18`, color: COLORES[vals[i]].color, border: `1px solid ${COLORES[vals[i]].color}40` }}>
                                    {COLORES[vals[i]].label}
                                  </span>
                                ) : (
                                  <span className="text-[10px]" style={{ color: 'rgba(240,230,255,.2)' }}>—</span>
                                )}
                              </td>
                            ));
                          })()}
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setConfirmarBorrado({ id: u.id, nombre: u.nombreCompleto })}
                              disabled={borrandoId === u.id}
                              title="Borrar predicción"
                              className="p-2 rounded-lg transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
                              style={{ background: 'rgba(255,0,128,.08)', border: '1px solid rgba(255,0,128,.25)', color: '#ff0080' }}>
                              {borrandoId === u.id
                                ? <Spinner size="sm" />
                                : <Trash2 className="w-3.5 h-3.5" />}
                            </button>
                          </td>
                        </>
                      ) : (
                        <td colSpan={9} className="px-4 py-3 text-center">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg"
                            style={{ background: 'rgba(255,109,0,.1)', color: 'rgba(255,109,0,.7)', border: '1px solid rgba(255,109,0,.2)' }}>
                            Sin apuesta
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-right"
              style={{ color: 'rgba(240,230,255,.25)', borderTop: '1px solid rgba(255,255,255,.04)' }}>
              {filtrados.length} de {usuarios.length} estudiantes
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

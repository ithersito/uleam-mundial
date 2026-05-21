'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Filter, Trophy, LogOut, Search, GraduationCap, BookOpen, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { UsuarioConPrediccion } from '@/types';

const NIVELES = ['Todos', '1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo'];
const CARRERAS = ['Todas', 'Tecnología de la Información', 'Ingeniería en Software'];
const ECUADOR_OPTS = ['Todas', ...Array.from({ length: 48 }, (_, i) => String(i + 1))];

export default function AdminPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<UsuarioConPrediccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [prediccionesAbiertas, setPrediccionesAbiertas] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);
  const [confirmarCierre, setConfirmarCierre] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('Todos');
  const [filtroCarrera, setFiltroCarrera] = useState('Todas');
  const [filtroApuesta, setFiltroApuesta] = useState<'todos' | 'con' | 'sin'>('todos');
  const [filtroPrimero, setFiltroPrimero] = useState('Todos');
  const [filtroSegundo, setFiltroSegundo] = useState('Todos');
  const [filtroTercero, setFiltroTercero] = useState('Todos');
  const [filtroEcuador, setFiltroEcuador] = useState('Todas');

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
      return matchBusqueda && matchNivel && matchCarrera && matchApuesta &&
             matchPrimero && matchSegundo && matchTercero && matchEcuador;
    });
  }, [usuarios, busqueda, filtroNivel, filtroCarrera, filtroApuesta, filtroPrimero, filtroSegundo, filtroTercero, filtroEcuador]);

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

          {/* Fila 2: filtros por apuesta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,.06)' }}>
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
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(57,255,20,.6)' }}>🇪🇨 Ecuador — Posición</p>
              <select value={filtroEcuador} onChange={e => setFiltroEcuador(e.target.value)} className={selectCls}>
                {ECUADOR_OPTS.map(p => <option key={p} value={p}>{p === 'Todas' ? 'Todas' : `Puesto #${p}`}</option>)}
              </select>
            </div>
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
                    {['#', 'Estudiante', 'Semestre', 'Carrera', '1° Puesto', '2° Puesto', '3° Puesto', 'Ecuador', 'Fecha'].map(h => (
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
                          <td className="px-4 py-3 text-[10px] font-mono" style={{ color: 'rgba(240,230,255,.3)' }}>
                            {new Date(u.prediccion.creadoEn).toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: '2-digit' })}
                          </td>
                        </>
                      ) : (
                        <td colSpan={5} className="px-4 py-3 text-center">
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

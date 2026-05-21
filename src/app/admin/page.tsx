'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Filter, Trophy, LogOut, Search, Globe, GraduationCap, BookOpen } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { UsuarioConPrediccion } from '@/types';

const NIVELES = ['Todos', '1ro', '2do', '3ro', '4to', '5to', '6to', '7mo', '8vo'];
const CARRERAS = ['Todas', 'Tecnología de la Información', 'Ingeniería en Software'];

export default function AdminPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<UsuarioConPrediccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('Todos');
  const [filtroCarrera, setFiltroCarrera] = useState('Todas');
  const [filtroApuesta, setFiltroApuesta] = useState<'todos' | 'con' | 'sin'>('todos');

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setUsuarios(data.usuarios.filter((u: UsuarioConPrediccion) => !u.esAdmin));
      })
      .catch(() => setError('No se pudo cargar la información.'))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const filtrados = useMemo(() => {
    return usuarios.filter(u => {
      const matchBusqueda = busqueda === '' ||
        u.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.correoInstitucional.toLowerCase().includes(busqueda.toLowerCase());
      const matchNivel = filtroNivel === 'Todos' || u.nivel === filtroNivel;
      const matchCarrera = filtroCarrera === 'Todas' || u.carrera === filtroCarrera;
      const matchApuesta =
        filtroApuesta === 'todos' ? true :
        filtroApuesta === 'con' ? u.prediccion !== null :
        u.prediccion === null;
      return matchBusqueda && matchNivel && matchCarrera && matchApuesta;
    });
  }, [usuarios, busqueda, filtroNivel, filtroCarrera, filtroApuesta]);

  const conApuesta = usuarios.filter(u => u.prediccion !== null).length;
  const sinApuesta = usuarios.length - conApuesta;

  return (
    <div className="min-h-screen font-sans px-4 py-8" style={{ color: '#f0e6ff' }}>

      {/* Ambient */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(191,0,255,.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,229,255,.06) 0%, transparent 70%)' }} />
      </div>

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-105"
            style={{ background: 'rgba(255,0,128,.1)', border: '1px solid rgba(255,0,128,.3)', color: '#ff0080' }}>
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Estudiantes', value: usuarios.length, color: '#00e5ff', icon: Users },
            { label: 'Con Apuesta', value: conApuesta, color: '#39ff14', icon: Trophy },
            { label: 'Sin Apuesta', value: sinApuesta, color: '#ff6d00', icon: Globe },
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,0,128,.5)' }} />
              <input
                type="text"
                placeholder="Buscar nombre o correo..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="casino-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm"
              />
            </div>

            {/* Curso/Nivel */}
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(0,229,255,.5)' }} />
              <select
                value={filtroNivel}
                onChange={e => setFiltroNivel(e.target.value)}
                className="casino-select w-full pl-10 pr-4 py-2.5 rounded-xl text-sm appearance-none">
                {NIVELES.map(n => <option key={n} value={n}>{n === 'Todos' ? 'Todos los semestres' : `${n} Semestre`}</option>)}
              </select>
            </div>

            {/* Carrera */}
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(191,0,255,.5)' }} />
              <select
                value={filtroCarrera}
                onChange={e => setFiltroCarrera(e.target.value)}
                className="casino-select w-full pl-10 pr-4 py-2.5 rounded-xl text-sm appearance-none">
                {CARRERAS.map(c => <option key={c} value={c}>{c === 'Todas' ? 'Todas las carreras' : c}</option>)}
              </select>
            </div>

            {/* Estado apuesta */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,0,128,.2)' }}>
              {([['todos', 'Todos'], ['con', 'Con apuesta'], ['sin', 'Sin apuesta']] as const).map(([val, label]) => (
                <button key={val} onClick={() => setFiltroApuesta(val)}
                  className="flex-1 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all"
                  style={{
                    background: filtroApuesta === val ? 'rgba(255,0,128,.2)' : 'transparent',
                    color: filtroApuesta === val ? '#ff0080' : 'rgba(240,230,255,.4)',
                  }}>
                  {label}
                </button>
              ))}
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
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#ffd600' }}>
                              🥇 {u.prediccion.primerPuesto}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: 'rgba(240,230,255,.7)' }}>
                              🥈 {u.prediccion.segundoPuesto}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#ff6d00' }}>
                              🥉 {u.prediccion.tercerPuesto}
                            </span>
                          </td>
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

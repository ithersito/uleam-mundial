'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Trophy, LogOut, ShieldAlert, Award, Calendar, CheckCircle2, Lock, User, Briefcase, GraduationCap } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';

// Agrupación de países por regiones
const PAISES_REGIONES = [
  {
    region: 'Coanfitriones (CONCACAF)',
    paises: ['Canadá', 'Estados Unidos', 'México']
  },
  {
    region: 'Sudamérica (CONMEBOL)',
    paises: ['Argentina', 'Brasil', 'Colombia', 'Ecuador', 'Paraguay', 'Uruguay']
  },
  {
    region: 'Europa (UEFA)',
    paises: [
      'Alemania', 'Austria', 'Bélgica', 'Bosnia y Herzegovina', 'Croacia', 'Escocia',
      'España', 'Francia', 'Inglaterra', 'Noruega', 'Países Bajos', 'Portugal',
      'República Checa', 'Suecia', 'Suiza', 'Turquía'
    ]
  },
  {
    region: 'Norte, Centroamérica y Caribe (CONCACAF)',
    paises: ['Curazao', 'Haití', 'Panamá']
  },
  {
    region: 'Asia (AFC)',
    paises: ['Arabia Saudí', 'Australia', 'Catar', 'Corea del Sur', 'Irak', 'Irán', 'Japón', 'Jordania', 'Uzbekistán']
  },
  {
    region: 'África (CAF)',
    paises: ['Argelia', 'Cabo Verde', 'Costa de Marfil', 'Egipto', 'Ghana', 'Marruecos', 'República Democrática del Congo', 'Senegal', 'Sudáfrica', 'Túnez']
  }
];

export default function Dashboard() {
  const router = useRouter();
  const { showToast } = useToast();

  const [usuario, setUsuario] = useState<any>(null);
  const [prediccion, setPrediccion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estados del formulario
  const [form, setForm] = useState({
    primerPuesto: '',
    segundoPuesto: '',
    tercerPuesto: '',
    ecuadorPosicion: '1',
  });

  useEffect(() => {
    async function initDashboard() {
      try {
        // 1. Obtener datos del usuario
        const resUser = await fetch('/api/auth/me');
        if (!resUser.ok) {
          router.push('/login');
          return;
        }
        const dataUser = await resUser.json();
        setUsuario(dataUser.usuario);

        // 2. Obtener predicciones
        const resPred = await fetch('/api/predictions');
        if (resPred.ok) {
          const dataPred = await resPred.json();
          setPrediccion(dataPred.prediccion);
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
        showToast('Sesión cerrada correctamente. ¡Hasta luego!', 'info');
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

  const handleEditClick = () => {
    showToast(
      'Reglamento Oficial: Las predicciones guardadas son definitivas y no se pueden modificar.',
      'error'
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { primerPuesto, segundoPuesto, tercerPuesto, ecuadorPosicion } = form;

    // 1. Validaciones
    if (!primerPuesto || !segundoPuesto || !tercerPuesto || !ecuadorPosicion) {
      showToast('Por favor, selecciona los tres puestos del podio y la posición de Ecuador.', 'error');
      return;
    }

    if (primerPuesto === segundoPuesto || primerPuesto === tercerPuesto || segundoPuesto === tercerPuesto) {
      showToast('No puedes seleccionar el mismo país en más de una posición del podio.', 'error');
      return;
    }

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
        showToast('¡Predicción enviada exitosamente! Guardada en base de datos.', 'success');
        setPrediccion(data.prediccion);
      }
    } catch (err) {
      console.error(err);
      showToast('Ocurrió un error al enviar la predicción.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Renderizador del selector de países
  const renderPaisesOptions = () => {
    return (
      <>
        <option value="" disabled>Selecciona un país...</option>
        {PAISES_REGIONES.map((reg) => (
          <optgroup key={reg.region} label={reg.region} className="font-bold text-uleam-green-primary dark:text-emerald-400">
            {reg.paises.map((pais) => (
              <option key={pais} value={pais} className="text-neutral-800 dark:text-neutral-200 font-normal">
                {pais}
              </option>
            ))}
          </optgroup>
        ))}
      </>
    );
  };

  // Renderizador de posiciones de Ecuador
  const renderEcuadorOptions = () => {
    const options = [];
    for (let i = 1; i <= 48; i++) {
      let label = `${i}ro`;
      if (i === 2) label = '2do';
      if (i === 3) label = '3ro';
      if (i === 4 || i === 5 || i === 6) label = `${i}to`;
      if (i >= 7 && i <= 10) label = `${i}mo`;
      
      options.push(
        <option key={i} value={i}>
          Puesto {i} ({label})
        </option>
      );
    }
    return options;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <Spinner size="lg" />
        <p className="mt-4 text-xs font-bold text-neutral-500 uppercase tracking-widest animate-pulse">Cargando Panel de Usuario...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col relative bg-neutral-50 dark:bg-neutral-950 font-sans min-h-screen">
      
      {/* Decorative Blob Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-uleam-green-soft/40 dark:bg-uleam-green-dark/10 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-red-50/20 dark:bg-uleam-red-dark/5 blur-3xl pointer-events-none -z-10" />

      {/* Header / Navbar */}
      <header className="border-b border-neutral-200/60 dark:border-neutral-800/50 backdrop-blur-md sticky top-0 z-30 bg-white/70 dark:bg-neutral-900/65">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-uleam-green-primary to-uleam-green-medium flex items-center justify-center text-white shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">Panel de Predicciones</h1>
              <p className="text-[9px] text-neutral-500 font-medium tracking-wider uppercase">GYPS Mundial 2026</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-uleam-red-light bg-neutral-100 hover:bg-red-50 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-red-950/20 dark:hover:text-red-400 transition-all flex items-center gap-1.5 border border-transparent hover:border-red-200 dark:hover:border-red-950 cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>

        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: User Profile Details & Status */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Card 1: User Identity Card */}
          <div className="p-6 rounded-3xl border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-xl dark:bg-neutral-900/70 dark:border-neutral-800/50">
            <div className="flex items-center gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-uleam-green-soft text-uleam-green-primary dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center font-black text-lg">
                {usuario?.nombreCompleto.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-black text-neutral-900 dark:text-white leading-snug">
                  {usuario?.nombreCompleto}
                </h3>
                <span className="text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-medium px-2 py-0.5 rounded-full mt-1 inline-block">
                  Estudiante Activo
                </span>
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                <User className="w-4 h-4 text-neutral-400" />
                <span className="truncate flex-1">{usuario?.correoInstitucional}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                <Briefcase className="w-4 h-4 text-neutral-400" />
                <span className="truncate flex-1">{usuario?.carrera}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                <GraduationCap className="w-4 h-4 text-neutral-400" />
                <span className="truncate flex-1">Nivel Semestre: <strong>{usuario?.nivel}</strong></span>
              </div>
            </div>
          </div>

          {/* Card 2: Prediction Status Card */}
          <div className="p-6 rounded-3xl border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-xl dark:bg-neutral-900/70 dark:border-neutral-800/50">
            <h4 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3.5">
              Estado de Predicciones
            </h4>
            
            {prediccion ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-2xl">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold leading-tight">Guardada con Éxito</p>
                    <p className="text-[10px] opacity-80 mt-0.5">La predicción se encuentra en sistema.</p>
                  </div>
                </div>

                <button
                  onClick={handleEditClick}
                  className="w-full py-3 rounded-xl text-xs font-bold text-white bg-neutral-800 hover:bg-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" /> Editar Predicciones
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 p-3 rounded-2xl">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold leading-tight">Pendiente por Enviar</p>
                    <p className="text-[10px] opacity-80 mt-0.5">Completa los datos en el formulario.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Prediction Form or Completed State */}
        <div className="lg:col-span-2 space-y-6">
          
          {prediccion ? (
            /* COMPLETED STATE CARD */
            <div className="p-8 rounded-3xl border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-xl dark:bg-neutral-900/70 dark:border-neutral-800/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 dark:opacity-[0.03] text-neutral-900 dark:text-white">
                <Trophy className="w-64 h-64 rotate-12 transform translate-x-20 translate-y-[-20px]" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-5 mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                    Tus Predicciones Oficiales
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Copa del Mundo FIFA 2026
                  </p>
                </div>
                
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  <Lock className="w-3.5 h-3.5 text-neutral-400" /> Definitivo
                </div>
              </div>

              {/* Podium display */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                {/* 1st Place */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/10 dark:to-neutral-900/50 border border-amber-200/60 dark:border-amber-900/30 text-center flex flex-col items-center justify-center shadow-sm">
                  <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center font-bold text-sm mb-3">
                    1
                  </span>
                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-widest">
                    Campeón
                  </p>
                  <p className="text-base font-black text-neutral-800 dark:text-white mt-1">
                    {prediccion.primerPuesto}
                  </p>
                </div>

                {/* 2nd Place */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-neutral-100/50 to-white dark:from-neutral-800/10 dark:to-neutral-900/50 border border-neutral-200/60 dark:border-neutral-800/30 text-center flex flex-col items-center justify-center shadow-sm">
                  <span className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 flex items-center justify-center font-bold text-sm mb-3">
                    2
                  </span>
                  <p className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
                    Subcampeón
                  </p>
                  <p className="text-base font-black text-neutral-800 dark:text-white mt-1">
                    {prediccion.segundoPuesto}
                  </p>
                </div>

                {/* 3rd Place */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-orange-50/50 to-white dark:from-orange-950/10 dark:to-neutral-900/50 border border-orange-200/60 dark:border-orange-900/30 text-center flex flex-col items-center justify-center shadow-sm">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400 flex items-center justify-center font-bold text-sm mb-3">
                    3
                  </span>
                  <p className="text-[10px] font-bold text-orange-600 dark:text-orange-500 uppercase tracking-widest">
                    Tercer Lugar
                  </p>
                  <p className="text-base font-black text-neutral-800 dark:text-white mt-1">
                    {prediccion.tercerPuesto}
                  </p>
                </div>

              </div>

              {/* Ecuador Card display */}
              <div className="p-5 rounded-2xl border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50 dark:bg-neutral-950/40 mb-6 flex flex-col sm:flex-row items-center gap-4 shadow-inner">
                <div className="w-12 h-12 rounded-xl bg-uleam-green-soft text-uleam-green-primary dark:bg-emerald-950/30 dark:text-emerald-400 flex items-center justify-center shadow-sm flex-shrink-0">
                  <Award className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Posición estimada de Ecuador</p>
                  <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-0.5">¿En qué lugar quedará Ecuador en el Mundial?</p>
                </div>
                <div className="text-2xl font-black text-uleam-green-primary dark:text-emerald-400">
                  Puesto #{prediccion.ecuadorPosicion}
                </div>
              </div>

              {/* Footer date submission */}
              <div className="flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-4 text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                <Calendar className="w-3.5 h-3.5" />
                <span>Enviado oficialmente el: <strong>{new Date(prediccion.creadoEn).toLocaleString('es-EC')}</strong></span>
              </div>

            </div>
          ) : (
            /* INTERACTIVE PREDICCTION FORM */
            <div className="p-8 rounded-3xl border border-neutral-200/60 bg-white/80 backdrop-blur-md shadow-xl dark:bg-neutral-900/70 dark:border-neutral-800/50">
              
              <div className="border-b border-neutral-100 dark:border-neutral-800 pb-4 mb-6">
                <h3 className="text-lg font-black text-neutral-900 dark:text-white">
                  Formulario de Predicciones
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Por favor, selecciona tus elecciones con atención. No podrás modificarlas después de guardarlas.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* FORMULARIO 1: Podio */}
                <div>
                  <h4 className="text-xs font-bold text-uleam-green-primary dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 rounded bg-uleam-green-primary dark:bg-emerald-400 inline-block" />
                    Formulario 1: Predicción del Podio
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    
                    {/* Primer Puesto */}
                    <div className="space-y-2">
                      <label htmlFor="primerPuesto" className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase">
                        1er Puesto (Campeón)
                      </label>
                      <select
                        id="primerPuesto"
                        name="primerPuesto"
                        required
                        value={form.primerPuesto}
                        onChange={handleChange}
                        disabled={saving}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/60 text-sm focus:border-uleam-green-medium focus:ring-1 focus:ring-uleam-green-medium/20 focus:outline-none transition-all cursor-pointer appearance-none"
                      >
                        {renderPaisesOptions()}
                      </select>
                    </div>

                    {/* Segundo Puesto */}
                    <div className="space-y-2">
                      <label htmlFor="segundoPuesto" className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase">
                        2do Puesto (Subcampeón)
                      </label>
                      <select
                        id="segundoPuesto"
                        name="segundoPuesto"
                        required
                        value={form.segundoPuesto}
                        onChange={handleChange}
                        disabled={saving}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/60 text-sm focus:border-uleam-green-medium focus:ring-1 focus:ring-uleam-green-medium/20 focus:outline-none transition-all cursor-pointer appearance-none"
                      >
                        {renderPaisesOptions()}
                      </select>
                    </div>

                    {/* Tercer Puesto */}
                    <div className="space-y-2">
                      <label htmlFor="tercerPuesto" className="text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase">
                        3er Puesto (Tercer Lugar)
                      </label>
                      <select
                        id="tercerPuesto"
                        name="tercerPuesto"
                        required
                        value={form.tercerPuesto}
                        onChange={handleChange}
                        disabled={saving}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/60 text-sm focus:border-uleam-green-medium focus:ring-1 focus:ring-uleam-green-medium/20 focus:outline-none transition-all cursor-pointer appearance-none"
                      >
                        {renderPaisesOptions()}
                      </select>
                    </div>

                  </div>
                </div>

                {/* FORMULARIO 2: Ecuador */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
                  <h4 className="text-xs font-bold text-uleam-green-primary dark:text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 rounded bg-uleam-green-primary dark:bg-emerald-400 inline-block" />
                    Formulario 2: Posición Final de Ecuador
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
                    
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="ecuadorPosicion" className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
                        ¿En qué puesto quedará Ecuador? (Rango 1 a 48)
                      </label>
                      <p className="text-[10px] text-neutral-400 font-medium">
                        El torneo ampliado cuenta con 48 países participantes divididos en 12 grupos.
                      </p>
                    </div>

                    <div className="md:col-span-1">
                      <select
                        id="ecuadorPosicion"
                        name="ecuadorPosicion"
                        required
                        value={form.ecuadorPosicion}
                        onChange={handleChange}
                        disabled={saving}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-950/60 text-sm focus:border-uleam-green-medium focus:ring-1 focus:ring-uleam-green-medium/20 focus:outline-none transition-all cursor-pointer appearance-none"
                      >
                        {renderEcuadorOptions()}
                      </select>
                    </div>

                  </div>
                </div>

                {/* Submit Button */}
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-uleam-green-primary via-uleam-green-medium to-uleam-green-light hover:brightness-110 active:scale-95 disabled:scale-100 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-uleam-green-primary/15 transition-all cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Spinner size="sm" /> Guardando Predicción...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4.5 h-4.5" /> Enviar Predicción Oficial
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-neutral-400 font-medium mt-2">
                    * Al enviar confirmas que tus predicciones son definitivas y no se podrán volver a editar.
                  </p>
                </div>

              </form>

            </div>
          )}

        </div>

      </main>
      
    </div>
  );
}

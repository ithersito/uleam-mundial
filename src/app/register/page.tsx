'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Mail, Lock, User, UserPlus, ArrowLeft, GraduationCap, Briefcase } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { validateUleamEmail } from '@/lib/auth';

export default function Register() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correoInstitucional: '',
    contrasena: '',
    confirmarContrasena: '',
    nivel: '1ro',
    carrera: 'Tecnología de la Información',
  });
  
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { nombreCompleto, correoInstitucional, contrasena, confirmarContrasena, nivel, carrera } = formData;

    // 1. Validar campos obligatorios
    if (!nombreCompleto || !correoInstitucional || !contrasena || !confirmarContrasena || !nivel || !carrera) {
      showToast('Por favor, completa todos los campos del registro.', 'error');
      return;
    }

    // 2. Validar formato correo institucional
    if (!validateUleamEmail(correoInstitucional)) {
      showToast('El correo institucional debe iniciar con "e" y números. Ejemplo: e1234567890@live.uleam.edu.ec', 'error');
      return;
    }

    // 3. Validar contraseñas
    if (contrasena !== confirmarContrasena) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }

    // 4. Validar longitud de contraseña
    if (contrasena.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres.', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Ocurrió un error al procesar el registro.', 'error');
      } else {
        showToast('¡Registro exitoso! Iniciando sesión automáticamente...', 'success');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      showToast('No se pudo establecer conexión con el servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans">
      
      {/* Decorative Blur Background */}
      <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-uleam-green-soft/40 dark:bg-uleam-green-dark/15 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full bg-red-50/20 dark:bg-uleam-red-dark/5 blur-3xl pointer-events-none -z-10" />

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-uleam-green-primary dark:text-neutral-400 dark:hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
      </Link>

      <div className="w-full max-w-lg mt-8 mb-8">
        
        {/* Header Card */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-uleam-green-primary to-uleam-green-medium flex items-center justify-center text-white shadow-lg shadow-uleam-green-primary/20 mb-3">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white text-center">Registro Universitario</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center font-medium mt-1 uppercase tracking-wider">
            Predicciones Copa Mundial 2026
          </p>
        </div>

        {/* Register Card Form */}
        <div className="p-8 rounded-3xl border border-neutral-200/60 bg-white/70 backdrop-blur-md shadow-xl dark:bg-neutral-900/65 dark:border-neutral-800/50">
          
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="nombreCompleto"
                className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block"
              >
                Nombre Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                  <User className="w-4.5 h-4.5" />
                </div>
                <input
                  id="nombreCompleto"
                  name="nombreCompleto"
                  type="text"
                  required
                  placeholder="Ej: Juan Eloy Pérez Delgado"
                  value={formData.nombreCompleto}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 text-sm focus:border-uleam-green-medium dark:focus:border-emerald-500 focus:ring-1 focus:ring-uleam-green-medium/20 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Institutional Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="correoInstitucional"
                className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block"
              >
                Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <input
                  id="correoInstitucional"
                  name="correoInstitucional"
                  type="email"
                  required
                  placeholder="e1234567890@live.uleam.edu.ec"
                  value={formData.correoInstitucional}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 text-sm focus:border-uleam-green-medium dark:focus:border-emerald-500 focus:ring-1 focus:ring-uleam-green-medium/20 focus:outline-none transition-all"
                />
              </div>
              <p className="text-[10px] text-neutral-400 font-medium">
                * Debe iniciar con "e" seguido de tu ID numérico y terminar en @live.uleam.edu.ec
              </p>
            </div>

            {/* Level & Career (Two Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Level Dropdown */}
              <div className="space-y-1.5">
                <label
                  htmlFor="nivel"
                  className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block"
                >
                  Nivel Semestre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                    <GraduationCap className="w-4.5 h-4.5" />
                  </div>
                  <select
                    id="nivel"
                    name="nivel"
                    value={formData.nivel}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 text-sm focus:border-uleam-green-medium dark:focus:border-emerald-500 focus:ring-1 focus:ring-uleam-green-medium/20 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="1ro">1ro</option>
                    <option value="2do">2do</option>
                    <option value="3ro">3ro</option>
                    <option value="4to">4to</option>
                    <option value="5to">5to</option>
                    <option value="6to">6to</option>
                    <option value="7mo">7mo</option>
                    <option value="8vo">8vo</option>
                  </select>
                </div>
              </div>

              {/* Career Dropdown */}
              <div className="space-y-1.5">
                <label
                  htmlFor="carrera"
                  className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block"
                >
                  Carrera
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                    <Briefcase className="w-4.5 h-4.5" />
                  </div>
                  <select
                    id="carrera"
                    name="carrera"
                    value={formData.carrera}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 text-sm focus:border-uleam-green-medium dark:focus:border-emerald-500 focus:ring-1 focus:ring-uleam-green-medium/20 focus:outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="Tecnología de la Información">TI</option>
                    <option value="Ingeniería en Software">Software</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Passwords (Two Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="contrasena"
                  className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <input
                    id="contrasena"
                    name="contrasena"
                    type="password"
                    required
                    placeholder="Min. 6 caracteres"
                    value={formData.contrasena}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 text-sm focus:border-uleam-green-medium dark:focus:border-emerald-500 focus:ring-1 focus:ring-uleam-green-medium/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmarContrasena"
                  className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block"
                >
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                    <Lock className="w-4.5 h-4.5" />
                  </div>
                  <input
                    id="confirmarContrasena"
                    name="confirmarContrasena"
                    type="password"
                    required
                    placeholder="Repite tu contraseña"
                    value={formData.confirmarContrasena}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 text-sm focus:border-uleam-green-medium dark:focus:border-emerald-500 focus:ring-1 focus:ring-uleam-green-medium/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-uleam-green-primary via-uleam-green-medium to-uleam-green-light hover:brightness-110 active:scale-95 disabled:scale-100 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-uleam-green-primary/15 transition-all cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" /> Procesando Registro...
                </>
              ) : (
                <>
                  <UserPlus className="w-4.5 h-4.5" /> Crear Cuenta
                </>
              )}
            </button>

          </form>
          
          <div className="mt-8 pt-6 border-t border-neutral-200/60 dark:border-neutral-800/50 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              ¿Ya tienes una cuenta registrada?{' '}
              <Link
                href="/login"
                className="text-uleam-green-primary dark:text-emerald-400 font-bold hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

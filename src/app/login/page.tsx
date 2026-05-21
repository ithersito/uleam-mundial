'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trophy, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { validateUleamEmail } from '@/lib/auth';

export default function Login() {
  const router = useRouter();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    correoInstitucional: '',
    contrasena: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { correoInstitucional, contrasena } = formData;

    // 1. Validar campos
    if (!correoInstitucional || !contrasena) {
      showToast('Por favor, completa todos los campos.', 'error');
      return;
    }

    // 2. Validar formato correo
    if (!validateUleamEmail(correoInstitucional)) {
      showToast('El formato del correo debe ser: e1234567890@live.uleam.edu.ec', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correoInstitucional, contrasena }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Ocurrió un error al iniciar sesión.', 'error');
      } else {
        showToast('¡Sesión iniciada con éxito! Redirigiendo...', 'success');
        // Redirigir al panel principal
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      showToast('No se pudo conectar con el servidor.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative min-h-screen bg-neutral-50 dark:bg-neutral-950 font-sans">
      
      {/* Decorative Blur Background */}
      <div className="absolute top-[20%] left-[20%] w-[350px] h-[350px] rounded-full bg-uleam-green-soft/40 dark:bg-uleam-green-dark/15 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[20%] w-[350px] h-[350px] rounded-full bg-red-50/20 dark:bg-uleam-red-dark/5 blur-3xl pointer-events-none -z-10" />

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-uleam-green-primary dark:text-neutral-400 dark:hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
      </Link>

      <div className="w-full max-w-md">
        
        {/* Logo Card */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-uleam-green-primary to-uleam-green-medium flex items-center justify-center text-white shadow-lg shadow-uleam-green-primary/20 mb-3">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-neutral-900 dark:text-white text-center">Inicia Sesión</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center font-medium mt-1 uppercase tracking-wider">
            Predicciones Copa Mundial 2026
          </p>
        </div>

        {/* Form Card */}
        <div className="p-8 rounded-3xl border border-neutral-200/60 bg-white/70 backdrop-blur-md shadow-xl dark:bg-neutral-900/65 dark:border-neutral-800/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div className="space-y-2">
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
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 text-sm focus:border-uleam-green-medium dark:focus:border-emerald-500 focus:ring-1 focus:ring-uleam-green-medium/20 focus:outline-none transition-all disabled:opacity-50"
                />
              </div>
              <p className="text-[10px] text-neutral-400 font-medium leading-tight">
                * Debe empezar por "e", contener números y terminar en @live.uleam.edu.ec
              </p>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="contrasena"
                  className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block"
                >
                  Contraseña
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 dark:text-neutral-500">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.contrasena}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-950/60 text-sm focus:border-uleam-green-medium dark:focus:border-emerald-500 focus:ring-1 focus:ring-uleam-green-medium/20 focus:outline-none transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-uleam-green-primary via-uleam-green-medium to-uleam-green-light hover:brightness-110 active:scale-95 disabled:scale-100 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-uleam-green-primary/15 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Spinner size="sm" /> Iniciando Sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" /> Iniciar Sesión
                </>
              )}
            </button>

          </form>
          
          <div className="mt-8 pt-6 border-t border-neutral-200/60 dark:border-neutral-800/50 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              ¿No tienes una cuenta institucional registrada?{' '}
              <Link
                href="/register"
                className="text-uleam-green-primary dark:text-emerald-400 font-bold hover:underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

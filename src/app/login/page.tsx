'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, LogIn, ArrowLeft, Zap } from 'lucide-react';
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

    if (!correoInstitucional || !contrasena) {
      showToast('Por favor, completa todos los campos.', 'error');
      return;
    }
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
        showToast('¡Sesión iniciada con éxito! 🎰 Redirigiendo...', 'success');
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
    <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative min-h-screen font-sans">

      {/* Ambient blobs */}
      <div className="absolute top-[15%] left-[15%] w-[400px] h-[400px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(255,0,128,.14) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[15%] right-[15%] w-[300px] h-[300px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(191,0,255,.1) 0%, transparent 70%)' }} />

      {/* Back button */}
      <Link href="/"
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all hover:scale-105"
        style={{ color: 'rgba(0,229,255,.7)' }}>
        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
      </Link>

      <div className="w-full max-w-md">

        {/* Logo header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 animate-neon-pulse-pink"
            style={{ border: '2px solid rgba(255,0,128,.6)', boxShadow: '0 0 20px rgba(255,0,128,.4)' }}>
            <Image src="/logo-gyps.png" alt="GYPS Logo" width={64} height={64} className="object-contain" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            <span className="neon-text-pink animate-flicker">INICIA</span>{' '}
            <span className="neon-text-cyan">SESIÓN</span>
          </h2>
          <p className="text-[10px] font-bold tracking-widest uppercase mt-2"
            style={{ color: 'rgba(255,214,0,.6)' }}>
            🎰 Predicciones Copa Mundial 2026
          </p>
        </div>

        {/* Form card */}
        <div className="casino-card p-8 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="correoInstitucional"
                className="text-[10px] font-black uppercase tracking-widest block"
                style={{ color: 'rgba(0,229,255,.8)' }}>
                Correo Institucional
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                  style={{ color: 'rgba(255,0,128,.6)' }}>
                  <Mail className="w-4 h-4" />
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
                  className="casino-input w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
                />
              </div>
              <p className="text-[10px] font-medium" style={{ color: 'rgba(240,230,255,.35)' }}>
                * Debe empezar por "e", contener números y terminar en @live.uleam.edu.ec
              </p>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="contrasena"
                className="text-[10px] font-black uppercase tracking-widest block"
                style={{ color: 'rgba(0,229,255,.8)' }}>
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                  style={{ color: 'rgba(255,0,128,.6)' }}>
                  <Lock className="w-4 h-4" />
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
                  className="casino-input w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit-btn"
              disabled={loading}
              className="neon-btn w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
              {loading ? (
                <><Spinner size="sm" /> Iniciando Sesión...</>
              ) : (
                <><LogIn className="w-4 h-4" /> <Zap className="w-4 h-4" /> Entrar al Casino</>
              )}
            </button>

          </form>

          <div className="mt-8 pt-6 text-center border-t" style={{ borderColor: 'rgba(255,0,128,.15)' }}>
            <p className="text-xs font-medium" style={{ color: 'rgba(240,230,255,.4)' }}>
              ¿No tienes una cuenta institucional registrada?{' '}
              <Link href="/register" className="neon-text-pink font-black hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

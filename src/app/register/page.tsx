'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, UserPlus, ArrowLeft, GraduationCap, Briefcase, Zap } from 'lucide-react';
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

    if (!nombreCompleto || !correoInstitucional || !contrasena || !confirmarContrasena || !nivel || !carrera) {
      showToast('Por favor, completa todos los campos del registro.', 'error');
      return;
    }
    if (!validateUleamEmail(correoInstitucional)) {
      showToast('El correo institucional debe iniciar con "e" y números. Ejemplo: e1234567890@live.uleam.edu.ec', 'error');
      return;
    }
    if (contrasena !== confirmarContrasena) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }
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
        showToast('¡Registro exitoso! 🎰 Iniciando sesión automáticamente...', 'success');
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

  const inputClass = 'casino-input w-full pl-11 pr-4 py-3 rounded-xl text-sm';
  const labelClass = 'text-[10px] font-black uppercase tracking-widest block mb-1.5';
  const iconWrap = 'absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none';

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 relative min-h-screen font-sans">

      {/* Ambient blobs */}
      <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(191,0,255,.12) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] rounded-full pointer-events-none -z-10"
        style={{ background: 'radial-gradient(circle, rgba(0,229,255,.08) 0%, transparent 70%)' }} />

      {/* Back button */}
      <Link href="/"
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all hover:scale-105"
        style={{ color: 'rgba(0,229,255,.7)' }}>
        <ArrowLeft className="w-4 h-4" /> Volver al Inicio
      </Link>

      <div className="w-full max-w-lg mt-8 mb-8">

        {/* Logo header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 animate-neon-pulse-purple"
            style={{
              border: '2px solid rgba(191,0,255,.6)',
              boxShadow: '0 0 20px rgba(191,0,255,.4)',
              animation: 'neon-pulse-cyan 2s ease-in-out infinite',
            }}>
            <Image src="/logo-gyps.png" alt="GYPS Logo" width={64} height={64} className="object-contain" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            <span className="neon-text-purple">REGISTRO</span>{' '}
            <span className="neon-text-yellow">UNIVERSITARIO</span>
          </h2>
          <p className="text-[10px] font-bold tracking-widest uppercase mt-2"
            style={{ color: 'rgba(255,109,0,.7)' }}>
            🎯 Predicciones Copa Mundial 2026
          </p>
        </div>

        {/* Form card */}
        <div className="casino-card p-8 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label htmlFor="nombreCompleto" className={labelClass} style={{ color: 'rgba(0,229,255,.8)' }}>
                Nombre Completo
              </label>
              <div className="relative">
                <div className={iconWrap} style={{ color: 'rgba(255,0,128,.6)' }}>
                  <User className="w-4 h-4" />
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
                  className={inputClass}
                />
              </div>
            </div>

            {/* Institutional Email */}
            <div>
              <label htmlFor="correoInstitucional" className={labelClass} style={{ color: 'rgba(0,229,255,.8)' }}>
                Correo Institucional
              </label>
              <div className="relative">
                <div className={iconWrap} style={{ color: 'rgba(255,0,128,.6)' }}>
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
                  className={inputClass}
                />
              </div>
              <p className="text-[10px] font-medium mt-1.5" style={{ color: 'rgba(240,230,255,.35)' }}>
                * Debe iniciar con "e" seguido de tu ID numérico y terminar en @live.uleam.edu.ec
              </p>
            </div>

            {/* Level & Career */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label htmlFor="nivel" className={labelClass} style={{ color: 'rgba(255,214,0,.8)' }}>
                  Nivel Semestre
                </label>
                <div className="relative">
                  <div className={iconWrap} style={{ color: 'rgba(255,214,0,.5)' }}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <select
                    id="nivel"
                    name="nivel"
                    value={formData.nivel}
                    onChange={handleChange}
                    disabled={loading}
                    className="casino-select w-full pl-11 pr-4 py-3 rounded-xl text-sm cursor-pointer"
                  >
                    {['1ro','2do','3ro','4to','5to','6to','7mo','8vo'].map(n => (
                      <option key={n} value={n}>{n} Semestre</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="carrera" className={labelClass} style={{ color: 'rgba(255,214,0,.8)' }}>
                  Carrera
                </label>
                <div className="relative">
                  <div className={iconWrap} style={{ color: 'rgba(255,214,0,.5)' }}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <select
                    id="carrera"
                    name="carrera"
                    value={formData.carrera}
                    onChange={handleChange}
                    disabled={loading}
                    className="casino-select w-full pl-11 pr-4 py-3 rounded-xl text-sm cursor-pointer"
                  >
                    <option value="Tecnología de la Información">TI – Tecnología de la Información</option>
                    <option value="Ingeniería en Software">IS – Ingeniería en Software</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label htmlFor="contrasena" className={labelClass} style={{ color: 'rgba(0,229,255,.8)' }}>
                  Contraseña
                </label>
                <div className="relative">
                  <div className={iconWrap} style={{ color: 'rgba(255,0,128,.6)' }}>
                    <Lock className="w-4 h-4" />
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
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmarContrasena" className={labelClass} style={{ color: 'rgba(0,229,255,.8)' }}>
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <div className={iconWrap} style={{ color: 'rgba(255,0,128,.6)' }}>
                    <Lock className="w-4 h-4" />
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
                    className={inputClass}
                  />
                </div>
              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              id="register-submit-btn"
              disabled={loading}
              className="neon-btn w-full py-4 rounded-xl text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95">
              {loading ? (
                <><Spinner size="sm" /> Procesando Registro...</>
              ) : (
                <><UserPlus className="w-4 h-4" /> <Zap className="w-4 h-4" /> Crear mi Cuenta 🎰</>
              )}
            </button>

          </form>

          <div className="mt-8 pt-6 text-center border-t" style={{ borderColor: 'rgba(255,0,128,.15)' }}>
            <p className="text-xs font-medium" style={{ color: 'rgba(240,230,255,.4)' }}>
              ¿Ya tienes una cuenta registrada?{' '}
              <Link href="/login" className="neon-text-cyan font-black hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

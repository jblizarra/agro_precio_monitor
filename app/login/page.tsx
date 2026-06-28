'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
    } else {
      setMessage('¡Revisa tu email! Te hemos enviado un link para acceder.');
      setEmail('');
    }
  };

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Acceso</p>
          <h1>Inicia sesión con Magic Link</h1>
        </div>
      </header>

      <section className="form-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Autenticación</p>
            <h2>Accede con tu correo electrónico</h2>
          </div>
        </div>

        {error && <div className="status rejected">{error}</div>}
        {message && <div className="status approved">{message}</div>}

        <form className="form-grid" onSubmit={handleMagicLink}>
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="productor@ejemplo.com"
              required
              disabled={loading}
            />
          </label>
          <div className="actions full">
            <button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar link de acceso'}
            </button>
          </div>
        </form>

        <p className="muted">
          Recibirás un email con un link para acceder. No necesitas contraseña.
        </p>
      </section>
    </>
  );
}

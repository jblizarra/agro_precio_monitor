'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const supabase = createClient();

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'admin' | 'producer' | 'viewer'>('producer');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(-8), // Contraseña temporal
        email_confirm: true,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Crear perfil
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            email,
            display_name: displayName,
            role,
          });

        if (profileError) {
          setError(profileError.message);
        } else {
          setMessage(`Usuario ${email} creado como ${role}`);
          setEmail('');
          setDisplayName('');
          setRole('producer');
        }
      }
    } catch (err) {
      setError('Error al crear usuario');
    }

    setLoading(false);
  };

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">Panel Administrativo</p>
          <h1>Gestión de Usuarios</h1>
        </div>
        <button onClick={handleLogout} className="btn-secondary">
          Cerrar sesión
        </button>
      </header>

      <section className="form-panel">
        <div className="section-head">
          <div>
            <p className="eyebrow">Agregar Usuario</p>
            <h2>Crear nuevo productor o administrador</h2>
          </div>
        </div>

        {error && <div className="status rejected">{error}</div>}
        {message && <div className="status approved">{message}</div>}

        <form className="form-grid" onSubmit={handleAddUser}>
          <label>
            Correo electrónico
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
              disabled={loading}
            />
          </label>

          <label>
            Nombre completo
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Juan Pérez"
              disabled={loading}
            />
          </label>

          <label>
            Rol
            <select value={role} onChange={(e) => setRole(e.target.value as any)} disabled={loading}>
              <option value="viewer">Visualizador</option>
              <option value="producer">Productor</option>
              <option value="admin">Administrador</option>
            </select>
          </label>

          <div className="actions full">
            <button type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </form>

        <p className="muted">
          El usuario recibirá un email para confirmar su cuenta y establecer su contraseña.
        </p>
      </section>
    </>
  );
}

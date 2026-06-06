import { useState, useEffect } from 'react';
import { getToken } from '../api'; // Ajusta la ruta

const API_BASE = 'http://localhost:8080';

export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const token = getToken();

    if (!userId || !token) {
      setLoading(false);
      setError('No hay sesión activa');
      return;
    }

    fetch(`${API_BASE}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener datos del usuario');
        return res.json();
      })
      .then((data) => {
        setUser(data);
        // Opcional: guardar también el tenantId en localStorage si se necesita rápido
        if (data.activeTenantId) {
          localStorage.setItem('tenantId', data.activeTenantId);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, error };
}
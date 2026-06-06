// src/pages/TenantRegisterMember.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BASE_URL = 'http://localhost:8080'


const TenantRegisterMember = () => {
  const { tenantId } = useParams(); // ID del tenant desde la URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Dentro de TenantRegisterMember.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await fetch(BASE_URL + '/auth/register-tenant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        tenantId: tenantId,  // viene de useParams()
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Fallo al registrarse en el tenant');
    }

    const data = await response.json();
    // Opcional: guardar el token en localStorage si es necesario
    localStorage.setItem('token', data.token);
    navigate('/');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="register-container">
      <h2>Unirse al espacio de reciclaje</h2>
      <p>Inicia sesión para vincularte a este tenant.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label>Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="usuario@ejemplo.com"
            required
          />
        </div>

        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Tu contraseña"
            required
          />
        </div>

        {error && <div className="server-error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Verificando...' : 'Iniciar sesión y unirme'}
        </button>
      </form>
    </div>
  );
};

export default TenantRegisterMember;
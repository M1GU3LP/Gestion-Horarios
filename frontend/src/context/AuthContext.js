import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No estás autenticado. Por favor, inicia sesión.");
      return;
    }
    if (token) {
      axios.get("http://localhost:5000/api/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => setUsuario(res.data.usuario))
        .catch((err) => {
          console.error("Error al obtener datos del usuario:", err.message);
          setError("Error al autenticar. Por favor, inicia sesión nuevamente.");
          localStorage.removeItem("token");
        });
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Intentando login con:', { email, password: '***' });
      
      // Validaciones básicas
      if (!email || !password) {
        throw new Error('Email y contraseña son requeridos');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('El formato del email no es válido');
      }

      const loginData = { email, password };
      console.log('Datos de login a enviar:', { ...loginData, password: '***' });

      const res = await axios.post("http://localhost:5000/api/auth/login", 
        loginData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Respuesta del servidor:', res.data);
      
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        setUsuario(res.data.usuario);
        setError(null);
      } else {
        throw new Error('No se recibió token en la respuesta');
      }
    } catch (error) {
      console.error("Error detallado:", error);
      console.error("Respuesta del servidor:", error.response?.data);
      
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUsuario(null);
    setError(null);
    window.location.href = "/login"; // Redirigir al login después de cerrar sesión
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

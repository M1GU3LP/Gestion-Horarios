import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("estudiante");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!nombre.trim()) {
      setError("El nombre es requerido");
      return false;
    }
    if (!email.trim()) {
      setError("El email es requerido");
      return false;
    }
    if (!password.trim()) {
      setError("La contraseña es requerida");
      return false;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("El formato del email no es válido");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/register", {
        nombre,
        email,
        password,
        rol
      });
      
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        alert("Registro exitoso. Ahora puedes iniciar sesión.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Error en el registro:", err);
      setError(err.response?.data?.error || "Error en el registro. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    maxWidth: "400px",
    margin: "2rem auto",
    padding: "2rem",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    borderRadius: "8px"
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  };

  const inputStyle = {
    padding: "0.5rem",
    borderRadius: "4px",
    border: "1px solid #ccc"
  };

  const buttonStyle = {
    padding: "0.5rem",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1
  };

  const errorStyle = {
    color: "red",
    marginBottom: "1rem"
  };

  return (
    <div style={containerStyle}>
      <h2>Registro de Estudiante</h2>
      {error && <div style={errorStyle}>{error}</div>}
      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={inputStyle}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          required
        />
        <input
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
          minLength={6}
        />
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </form>
    </div>
  );
};

export default Register;

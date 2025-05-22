import { useState, useContext } from "react";
import AuthContext from "../context/AuthContext"; // Corrección de la ruta
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(""); // Estado para manejar errores
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const validateForm = () => {
    if (!email.trim()) {
      setError("El email es requerido");
      return false;
    }
    if (!password.trim()) {
      setError("La contraseña es requerida");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("El formato del email no es válido");
      return false;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
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
      await login(email, password);
      navigate("/horarios");
    } catch (err) {
      console.error("Error en login:", err);
      if (err.message === "La contraseña es incorrecta") {
        setError("La contraseña ingresada no es correcta. Por favor, intenta nuevamente.");
      } else {
        setError(err.message || "Error al iniciar sesión. Por favor, verifica tus credenciales.");
      }
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: "20px"
  };

  const formContainerStyle = {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "400px"
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "30px"
  };

  const titleStyle = {
    color: "#333",
    fontSize: "24px",
    marginBottom: "10px"
  };

  const subtitleStyle = {
    color: "#666",
    fontSize: "16px"
  };

  const formGroupStyle = {
    marginBottom: "20px"
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    color: "#555",
    fontSize: "14px",
    fontWeight: "500"
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    transition: "border-color 0.3s ease",
    outline: "none"
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    cursor: loading ? "not-allowed" : "pointer",
    opacity: loading ? 0.7 : 1,
    transition: "background-color 0.3s ease"
  };

  const errorStyle = {
    color: "#dc3545",
    textAlign: "center",
    marginTop: "10px",
    fontSize: "14px",
    padding: "10px",
    backgroundColor: "#f8d7da",
    borderRadius: "4px",
    marginBottom: "20px"
  };

  return (
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Bienvenido</h1>
          <p style={subtitleStyle}>Inicia sesión para continuar</p>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              placeholder="ejemplo@escuela.com"
              required
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            style={buttonStyle}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthContext";

const PrivateRoute = ({ rolesPermitidos, children }) => {
  const { usuario } = useContext(AuthContext);
  if (!usuario) return <Navigate to="/login" />;
  if (!rolesPermitidos.includes(usuario.rol)) return <Navigate to="/" />;
  return children;
};

export default PrivateRoute;
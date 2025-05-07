import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, AuthContext } from "../src/context/AuthContext";
import Login from "../src/pages/Login";
import HorarioTable from "../src/pages/HorarioTable";
import DocenteTable from "../src/pages/DocenteTable";
import { useContext } from "react";

// Define las rutas como constantes
const ROUTES = {
  LOGIN: "/login",
  HOME: "/",
  ADMIN: "/admin",
  HORARIOS: "/horarios",
};

const PrivateRoute = ({ rolesPermitidos, children }) => {
  const { usuario } = useContext(AuthContext);
  if (!usuario) return <Navigate to={ROUTES.LOGIN} />;
  if (!rolesPermitidos.includes(usuario.rol)) return <Navigate to={ROUTES.HOME} />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <nav>
          <ul>
            <li><Link to={ROUTES.LOGIN}>Login</Link></li>
            <li><Link to={ROUTES.HORARIOS}>Horarios</Link></li>
            <li><Link to="/docentes">Docentes</Link></li>
            <li><Link to={ROUTES.ADMIN}>Admin</Link></li>
          </ul>
        </nav>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.HOME} element={<Navigate to={ROUTES.LOGIN} />} />
          <Route
            path={ROUTES.ADMIN}
            element={
              <PrivateRoute rolesPermitidos={["director"]}>
                <h2>Panel de Administración</h2>
              </PrivateRoute>
            }
          />
          <Route path={ROUTES.HORARIOS} element={<HorarioTable />} />
          <Route path="/docentes" element={<DocenteTable />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

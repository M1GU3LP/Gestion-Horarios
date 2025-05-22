import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, AuthContext } from "../src/context/AuthContext";
import Login from "../src/pages/Login";
import Register from "../src/pages/Register";
import HorarioTable from "../src/pages/HorarioTable";
import DocenteTable from "../src/pages/DocenteTable";
import MateriaTable from "../src/pages/MateriaTable";
import Navigation from './components/Navigation';
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
        <div className="App">
          <Navigation />
          <Routes>
            <Route path={ROUTES.LOGIN} element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path={ROUTES.HOME} element={<HorarioTable />} />
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
            <Route path="/materias" element={<MateriaTable />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

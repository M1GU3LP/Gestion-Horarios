import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/docentes";

const DocenteTable = () => {
  const { usuario } = useContext(AuthContext);
  const [docentes, setDocentes] = useState([]);
  const [nuevoDocente, setNuevoDocente] = useState({ nombre: "", materias: [], disponibilidad: [],dias:[] });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const res = await axios.get(API_URL);
        setDocentes(res.data);
      } catch (err) {
        setError("Error al cargar los docentes. Por favor, inténtalo de nuevo más tarde.");
      }
    };

    fetchDocentes();
  }, []);

  if (usuario?.rol !== "director") {
    return <p>No tienes permiso para acceder a esta página.</p>;
  }

  const crearDocente = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(API_URL, nuevoDocente, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocentes([...docentes, res.data]);
      setNuevoDocente({ nombre: "", materias: [], disponibilidad: [],dias:[] });
    } catch (err) {
      setError("Error al crear el docente. Por favor, inténtalo de nuevo más tarde.");
    }
  };

  return (
    <div>
      <h2>Gestión de Docentes</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h3>Crear Nuevo Docente</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          crearDocente();
        }}
      >
        <input
          type="text"
          placeholder="Nombre"
          value={nuevoDocente.nombre}
          onChange={(e) => setNuevoDocente({ ...nuevoDocente, nombre: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Materias (separadas por comas)"
          value={nuevoDocente.materias.join(",")}
          onChange={(e) => setNuevoDocente({ ...nuevoDocente, materias: e.target.value.split(",") })}
        />
        <textarea
          placeholder="Disponibilidad (ej: 1,2,3 para Bloques 1, 2 y 3)"
          value={nuevoDocente.disponibilidad.join(",")}
          onChange={(e) =>
            setNuevoDocente({
              ...nuevoDocente,
              disponibilidad: e.target.value
                .split(",")
                .map((bloque) => (isNaN(parseInt(bloque)) ? 0 : parseInt(bloque))),
            })
          }
        />
        <input
          type="text"
          placeholder="Días (separados por comas, ej: Lunes,Martes)"
          value={nuevoDocente.dias.join(",")}
          onChange={(e) => setNuevoDocente({ ...nuevoDocente, dias: e.target.value.split(",") })}
        />
        <button type="submit">Crear Docente</button>
      </form>
      <h3>Lista de Docentes</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Materias</th>
            <th>Disponibilidad</th>
            <th>Días</th>
          </tr>
        </thead>
        <tbody>
          {docentes.map((docente) => (
            <tr key={docente._id}>
              <td>{docente.nombre}</td>
              <td>{docente.materias.join(", ")}</td>
              <td>{docente.disponibilidad.join(", ") || "N/A"}</td>
              <td>{docente.dias?.join(", ") || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DocenteTable;
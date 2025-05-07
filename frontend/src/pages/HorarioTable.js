import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/horarios"; // Uso de variable de entorno

const HorarioTable = () => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false); // Estado de carga
  const [error, setError] = useState(null); // Estado para manejar errores
  const { usuario } = useContext(AuthContext);
  const [nuevoHorario, setNuevoHorario] = useState({
    materia: "",
    docente: "",
    dia: 0,
    bloque: 0,
  });
  const [docentes, setDocentes] = useState([]); // Estado para almacenar docentes

  useEffect(() => {
    const fetchHorarios = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setHorarios(res.data);
      } catch (err) {
        setError("Error al cargar los horarios. Por favor, inténtalo de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchHorarios();
  }, []);

  useEffect(() => {
    const fetchDocentes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/docentes", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setDocentes(res.data);
      } catch (err) {
        setError("Error al cargar los docentes. Por favor, inténtalo de nuevo más tarde.");
      }
    };

    fetchDocentes();
  }, []); // Cargar docentes al montar el componente

  useEffect(() => {
    console.log("Docentes disponibles:", docentes);
  }, [docentes]); // Log para depurar los docentes disponibles

  useEffect(() => {
    console.log("Día seleccionado:", nuevoHorario.dia);
    console.log("Bloque seleccionado:", nuevoHorario.bloque);
  }, [nuevoHorario.dia, nuevoHorario.bloque]); // Log para depurar día y bloque seleccionados

  const docentesDisponibles = docentes.filter((docente) =>
    docente.disponibilidad.some((d) => d.dia === nuevoHorario.dia && d.bloque === nuevoHorario.bloque)
  );

  console.log("Docentes disponibles para el día y bloque seleccionados:", docentesDisponibles);

  const eliminarHorario = async (id) => {
    setError(null);
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setHorarios(horarios.filter((h) => h._id !== id));
    } catch (err) {
      setError("Error al eliminar el horario. Por favor, inténtalo de nuevo más tarde.");
    }
  };

  const crearHorario = async () => {
    try {
      const res = await axios.post(API_URL, nuevoHorario, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setHorarios([...horarios, res.data]);
      setNuevoHorario({ materia: "", docente: "", dia: 0, bloque: 0 });
    } catch (err) {
      setError("Error al crear el horario. Por favor, inténtalo de nuevo más tarde.");
    }
  };

  return (
    <div>
      <h2>Horarios</h2>
      {loading && <p>Cargando horarios...</p>} {/* Indicador de carga */}
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Muestra errores */}
      <h3>Crear Nuevo Horario</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          crearHorario();
        }}
      >
        <input
          type="text"
          placeholder="Materia"
          value={nuevoHorario.materia}
          onChange={(e) => setNuevoHorario({ ...nuevoHorario, materia: e.target.value })}
          required
        />
        <select
          value={nuevoHorario.docente}
          onChange={(e) => setNuevoHorario({ ...nuevoHorario, docente: e.target.value })}
          required
        >
          <option value="">Seleccione un docente</option>
          {docentesDisponibles.map((docente) => (
            <option key={docente._id} value={docente.nombre}>
              {docente.nombre}
            </option>
          ))}
        </select>
        <select
          value={nuevoHorario.dia || ""} // Asegurar que el valor no sea NaN
          onChange={(e) => setNuevoHorario({ ...nuevoHorario, dia: parseInt(e.target.value) || 0 })}
        >
          <option value={0}>Lunes</option>
          <option value={1}>Martes</option>
          <option value={2}>Miércoles</option>
          <option value={3}>Jueves</option>
          <option value={4}>Viernes</option>
        </select>
        <input
          type="number"
          placeholder="Bloque"
          value={nuevoHorario.bloque}
          onChange={(e) => setNuevoHorario({ ...nuevoHorario, bloque: parseInt(e.target.value) })}
          required
        />
        <button type="submit">Crear Horario</button>
      </form>
      <table border="1">
        <thead>
          <tr>
            <th>Materia</th>
            <th>Docente</th>
            <th>Día</th>
            <th>Bloque</th>
            {usuario?.rol === "director" && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {horarios.map((h) => (
            <tr key={h._id}>
              <td>{h.materia}</td>
              <td>{h.docente}</td>
              <td>{["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"][h.dia]}</td>
              <td>{h.bloque + 1}</td>
              {usuario?.rol === "director" && (
                <td>
                  <button onClick={() => eliminarHorario(h._id)} aria-label={`Eliminar horario de ${h.materia}`}>
                    Eliminar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HorarioTable;

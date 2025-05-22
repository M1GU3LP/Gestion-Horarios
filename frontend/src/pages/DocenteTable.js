import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/docentes";

const DocenteTable = () => {
  const { usuario } = useContext(AuthContext);
  const [docentes, setDocentes] = useState([]);
  const [nuevoDocente, setNuevoDocente] = useState({
    nombre: "",
    materias: [],
    cargaHorariaMaxima: 40,
    disponibilidad: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const bloques = Array.from({ length: 8 }, (_, i) => i + 1);

  const fetchDocentes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setDocentes(res.data);
    } catch (err) {
      setError("Error al cargar los docentes");
      console.error("Error al cargar docentes:", err);
    } finally {
      setLoading(false);
    }
  };

  const reinicializarDocentes = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(API_URL + "/reset", {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchDocentes();
      alert("Docentes reinicializados correctamente");
    } catch (err) {
      setError("Error al reinicializar los docentes");
      console.error("Error al reinicializar docentes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocentes();
  }, []);

  // Inicializar disponibilidad al crear un nuevo docente
  useEffect(() => {
    if (!nuevoDocente.disponibilidad.length) {
      const disponibilidadInicial = [];
      for (let dia = 0; dia < 5; dia++) {
        for (let bloque = 0; bloque < 8; bloque++) {
          disponibilidadInicial.push({
            dia,
            bloque,
            disponible: true
          });
        }
      }
      setNuevoDocente(prev => ({
        ...prev,
        disponibilidad: disponibilidadInicial
      }));
    }
  }, []);

  if (usuario?.rol !== "director") {
    return <p>No tienes permiso para acceder a esta página.</p>;
  }

  const crearDocente = async () => {
    try {
      const token = localStorage.getItem("token");

      // Validaciones
      if (!nuevoDocente.nombre.trim()) {
        setError("El nombre del docente es obligatorio.");
        return;
      }
      if (!Array.isArray(nuevoDocente.materias) || nuevoDocente.materias.length === 0) {
        setError("Debes seleccionar al menos una materia.");
        return;
      }
      if (nuevoDocente.cargaHorariaMaxima < 1) {
        setError("La carga horaria máxima debe ser mayor a 0.");
        return;
      }

      const res = await axios.post(API_URL, nuevoDocente, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDocentes([...docentes, res.data]);
      setNuevoDocente({
        nombre: "",
        materias: [],
        cargaHorariaMaxima: 40,
        disponibilidad: nuevoDocente.disponibilidad
      });
      setError(null);
    } catch (err) {
      console.error("Error al crear el docente:", err);
      setError(err.response?.data?.error || "Error al crear el docente.");
    }
  };

  const toggleDisponibilidad = (dia, bloque) => {
    setNuevoDocente(prev => ({
      ...prev,
      disponibilidad: prev.disponibilidad.map(d => 
        d.dia === dia && d.bloque === bloque
          ? { ...d, disponible: !d.disponible }
          : d
      )
    }));
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Gestión de Docentes</h2>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      <div className="actions-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={reinicializarDocentes}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Reinicializando...' : 'Reinicializar Docentes'}
        </button>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h3>Crear Nuevo Docente</h3>
        <form onSubmit={(e) => {
          e.preventDefault();
          crearDocente();
        }}>
          <div style={{ marginBottom: '20px' }}>
            <label>
              Nombre del Docente:
              <input
                type="text"
                value={nuevoDocente.nombre}
                onChange={(e) => setNuevoDocente({ ...nuevoDocente, nombre: e.target.value })}
                style={{ marginLeft: '10px', padding: '5px' }}
                required
              />
            </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>
              Carga Horaria Máxima (horas semanales):
              <input
                type="number"
                min="1"
                max="40"
                value={nuevoDocente.cargaHorariaMaxima}
                onChange={(e) => setNuevoDocente({ ...nuevoDocente, cargaHorariaMaxima: parseInt(e.target.value) })}
                style={{ marginLeft: '10px', padding: '5px' }}
                required
              />
            </label>
          </div>

          <fieldset style={{ marginBottom: '20px', padding: '15px' }}>
            <legend>Materias que imparte:</legend>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px' }}>
              {[
                "Matemáticas",
                "Lenguaje",
                "Inglés",
                "Sociales",
                "Ética",
                "Religion",
                "Informática",
                "Biologia",
                "Quimica",
                "Fisica",
              ].map((materia) => (
                <div key={materia}>
                  <input
                    type="checkbox"
                    id={materia}
                    value={materia}
                    checked={nuevoDocente.materias.includes(materia)}
                    onChange={(e) => {
                      const { value, checked } = e.target;
                      setNuevoDocente((prev) => ({
                        ...prev,
                        materias: checked
                          ? [...prev.materias, value]
                          : prev.materias.filter((m) => m !== value),
                      }));
                    }}
                  />
                  <label htmlFor={materia} style={{ marginLeft: '5px' }}>{materia}</label>
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset style={{ marginBottom: '20px', padding: '15px' }}>
            <legend>Disponibilidad Horaria:</legend>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Bloque</th>
                    {diasSemana.map(dia => (
                      <th key={dia} style={{ padding: '8px', border: '1px solid #ddd' }}>{dia}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bloques.map(bloque => (
                    <tr key={bloque}>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>Bloque {bloque}</td>
                      {[0,1,2,3,4].map(dia => {
                        const disponibilidad = nuevoDocente.disponibilidad.find(
                          d => d.dia === dia && d.bloque === (bloque-1)
                        );
                        return (
                          <td 
                            key={dia}
                            style={{ 
                              padding: '8px', 
                              border: '1px solid #ddd',
                              backgroundColor: disponibilidad?.disponible ? '#e8f5e9' : '#ffebee',
                              cursor: 'pointer'
                            }}
                            onClick={() => toggleDisponibilidad(dia, bloque-1)}
                          >
                            {disponibilidad?.disponible ? '✓' : '✗'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </fieldset>

          <button 
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Crear Docente
          </button>
        </form>
      </div>

      <div>
        <h3>Lista de Docentes</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#f4f4f4' }}>Nombre</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#f4f4f4' }}>Materias</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#f4f4f4' }}>Carga Horaria Máxima</th>
            </tr>
          </thead>
          <tbody>
            {docentes.map((docente) => (
              <tr key={docente._id}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{docente.nombre}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {Array.isArray(docente.materias) ? docente.materias.join(", ") : "Sin materias"}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {docente.cargaHorariaMaxima || 40} horas
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocenteTable;
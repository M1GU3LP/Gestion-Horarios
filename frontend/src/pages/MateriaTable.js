import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const API_URL = "http://localhost:5000/api/materias";

const MateriaTable = () => {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { usuario } = useContext(AuthContext);

  const fetchMaterias = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMaterias(res.data);
    } catch (err) {
      setError("Error al cargar las materias");
      console.error("Error al cargar materias:", err);
    } finally {
      setLoading(false);
    }
  };

  const reinicializarMaterias = async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${API_URL}/reset`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchMaterias();
      alert("Materias reinicializadas correctamente");
    } catch (err) {
      setError("Error al reinicializar las materias");
      console.error("Error al reinicializar materias:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  if (usuario?.rol !== "director") {
    return <p>No tienes permiso para acceder a esta página.</p>;
  }

  return (
    <div className="container">
      <h2>Gestión de Materias</h2>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="actions-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={reinicializarMaterias}
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
          {loading ? 'Reinicializando...' : 'Reinicializar Materias'}
        </button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Nombre</th>
            <th style={tableHeaderStyle}>Horas Semanales</th>
            <th style={tableHeaderStyle}>Carga Horaria</th>
          </tr>
        </thead>
        <tbody>
          {materias.map((materia) => (
            <tr key={materia._id}>
              <td style={tableCellStyle}>{materia.nombre}</td>
              <td style={tableCellStyle}>{materia.horas_semanales}</td>
              <td style={tableCellStyle}>{materia.cargaHoraria}</td>
            </tr>
          ))}
          <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
            <td style={tableCellStyle}>Total</td>
            <td style={tableCellStyle}>
              {materias.reduce((sum, materia) => sum + (materia.horas_semanales || 0), 0)}
            </td>
            <td style={tableCellStyle}>
              {materias.reduce((sum, materia) => sum + (materia.cargaHoraria || 0), 0)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const tableHeaderStyle = {
  backgroundColor: '#f4f4f4',
  padding: '12px',
  borderBottom: '2px solid #ddd',
  textAlign: 'center'
};

const tableCellStyle = {
  padding: '10px',
  border: '1px solid #ddd',
  textAlign: 'center'
};

export default MateriaTable; 
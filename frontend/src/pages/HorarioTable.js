import { useEffect, useState, useContext } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/horarios";

const HorarioTable = () => {
  const { usuario } = useContext(AuthContext);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actualizacionNecesaria, setActualizacionNecesaria] = useState(false);
  const [nuevoHorario, setNuevoHorario] = useState({
    materia: "",
    docente: "",
    dia: 0,
    bloque: 0,
  });
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]);

  const fetchHorarios = async () => {
    console.log('Iniciando fetchHorarios...');
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      console.log('Token disponible:', !!token);
      
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Horarios recibidos:', res.data);
      
      // Filtrar horarios según el rol del usuario
      let horariosFiltrados = res.data;
      if (usuario?.rol === 'profesor') {
        horariosFiltrados = res.data.filter(h => h.docente === usuario.nombre);
      }
      
      setHorarios(horariosFiltrados);
    } catch (err) {
      console.error("Error detallado al cargar horarios:", err);
      setError("Error al cargar los horarios. Por favor, inténtalo de nuevo más tarde.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Componente montado, usuario:', usuario);
    fetchHorarios();
  }, [usuario]);

  useEffect(() => {
    if (actualizacionNecesaria) {
      fetchHorarios();
      setActualizacionNecesaria(false);
    }
  }, [actualizacionNecesaria]);

  // Solo cargar docentes y materias si es director
  useEffect(() => {
    if (usuario?.rol === "director") {
      const fetchDocentes = async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/docentes", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setDocentes(res.data);
        } catch (err) {
          console.error("Error al cargar docentes:", err);
          setError("Error al cargar los docentes. Por favor, inténtalo de nuevo más tarde.");
        }
      };

      const fetchMaterias = async () => {
        try {
          const res = await axios.get("http://localhost:5000/api/materias", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          setMaterias(res.data);
        } catch (err) {
          console.error("Error al cargar materias:", err);
          setError("Error al cargar las materias. Por favor, inténtalo de nuevo más tarde.");
        }
      };

      fetchDocentes();
      fetchMaterias();
    }
  }, [usuario?.rol]);

  useEffect(() => {
    console.log("Docentes disponibles:", docentes);
  }, [docentes]); // Log para depurar los docentes disponibles

  useEffect(() => {
    console.log("Día seleccionado:", nuevoHorario.dia);
    console.log("Bloque seleccionado:", nuevoHorario.bloque);
  }, [nuevoHorario.dia, nuevoHorario.bloque]); // Log para depurar día y bloque seleccionados

  const docentesDisponibles = docentes.filter(
    (docente) => docente.disponibilidad > 0 // Ajustar la lógica para disponibilidad como número
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

  const generarHorario = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos actualizados
      const [docentesRes, materiasRes] = await Promise.all([
        axios.get("http://localhost:5000/api/docentes", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get("http://localhost:5000/api/materias", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      ]);

      // Validar que haya suficientes docentes y materias
      if (!docentesRes.data.length || !materiasRes.data.length) {
        setError("No hay suficientes docentes o materias para generar el horario.");
        return;
      }

      const restricciones = {
        maximoMateriaPorDia: 2,
        minimoBloquesPorDocente: 2,
        distribucionEquitativa: true,
        evitarBloquesSeguidos: true,
        respetarDisponibilidad: true,
        balancearCargaHoraria: true,
        intentosMaximosPorBloque: 10,
        distribucionSemanal: {
          Matemáticas: 8,
          Lenguaje: 6,
          Literatura: 4,
          Inglés: 5,
          Sociales: 4,
          Historia: 3,
          Geografía: 3,
          Ética: 2,
          Religion: 2,
          Filosofía: 2,
          Informática: 3,
          Tecnología: 3,
          Biologia: 5,
          Química: 5,
          Física: 5,
          "Educación Física": 3,
          Deportes: 3,
          Artes: 2,
          Música: 2
        },
        distribucionPorDia: {
          Matemáticas: 2,
          Lenguaje: 2,
          Literatura: 1,
          Inglés: 1,
          Sociales: 1,
          Historia: 1,
          Geografía: 1,
          Ética: 1,
          Religion: 1,
          Filosofía: 1,
          Informática: 1,
          Tecnología: 1,
          Biologia: 1,
          Química: 1,
          Física: 1,
          "Educación Física": 1,
          Deportes: 1,
          Artes: 1,
          Música: 1
        }
      };

      // Preparar datos para la generación
      const datosGeneracion = {
        docentes: docentesRes.data,
        materias: materiasRes.data,
        restricciones
      };

      // Llamar al endpoint de generación optimizada
      const res = await axios.post(`${API_URL}/generate-optimized`, datosGeneracion, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });

      if (res.data && res.data.horarios) {
        if (res.data.horarios.length === 0) {
          setError("No se pudo generar un horario válido con las restricciones actuales.");
          return;
        }

        setHorarios(res.data.horarios);
        console.log("Distribución de carga horaria:", res.data.distribucion);
        console.log("Estadísticas:", res.data.estadisticas);
        
        setTimeout(() => {
          setActualizacionNecesaria(true);
        }, 100);
        
        alert("Horarios generados exitosamente");
      } else {
        throw new Error("No se recibieron horarios en la respuesta");
      }
    } catch (error) {
      console.error("Error en la generación de horarios:", error);
      setError(error.response?.data?.error || "Error al generar los horarios. " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Horarios</h2>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && horarios.length === 0 && (
        <p>No hay horarios disponibles.</p>
      )}

      {usuario?.rol === "director" && (
        <div className="actions-container" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <button
            onClick={generarHorario}
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
            {loading ? 'Generando...' : 'Generar Horarios Automáticamente'}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Cargando horarios...</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr>
              <th style={tableHeaderStyle}>Hora</th>
              <th style={tableHeaderStyle}>Lunes</th>
              <th style={tableHeaderStyle}>Martes</th>
              <th style={tableHeaderStyle}>Miércoles</th>
              <th style={tableHeaderStyle}>Jueves</th>
              <th style={tableHeaderStyle}>Viernes</th>
            </tr>
          </thead>
          <tbody>
            {Array(8).fill().map((_, bloque) => (
              <tr key={bloque}>
                <td style={tableCellStyle}>{`Bloque ${bloque + 1}`}</td>
                {Array(5).fill().map((_, dia) => {
                  const horario = horarios.find(h => h.bloque === bloque && h.dia === dia);
                  return (
                    <td key={dia} style={tableCellStyle}>
                      {horario ? (
                        <div>
                          <div><strong>{horario.materia}</strong></div>
                          {usuario?.rol === "director" && <div>{horario.docente}</div>}
                        </div>
                      ) : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      )}
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

const validarRestriccionesHorario = (horarios) => {
  try {
    const horariosPorDia = {};
    const materiasTotales = {};

    for (const horario of horarios) {
      const { dia, materia } = horario;
      if (!horariosPorDia[dia]) {
        horariosPorDia[dia] = {};
      }
      if (!horariosPorDia[dia][materia]) {
        horariosPorDia[dia][materia] = [];
      }
      horariosPorDia[dia][materia].push(horario.bloque);
      materiasTotales[materia] = (materiasTotales[materia] || 0) + 1;
    }

    for (const dia in horariosPorDia) {
      for (const materia in horariosPorDia[dia]) {
        const bloquesPorMateria = horariosPorDia[dia][materia];
        
        if (bloquesPorMateria.length > 2) {
          console.error(`Día ${dia}: La materia ${materia} tiene ${bloquesPorMateria.length} bloques (máximo permitido: 2)`);
          console.error('Distribución actual de la materia:', horariosPorDia[dia][materia]);
          return false;
        }

        bloquesPorMateria.sort((a, b) => a - b);
        for (let i = 0; i < bloquesPorMateria.length - 1; i++) {
          if (bloquesPorMateria[i + 1] - bloquesPorMateria[i] === 1) {
            console.error(`Día ${dia}: La materia ${materia} tiene bloques consecutivos (${bloquesPorMateria[i]}, ${bloquesPorMateria[i + 1]})`);
            return false;
          }
        }
      }
    }

    console.log('Distribución total de materias:', materiasTotales);
    for (const materia in materiasTotales) {
      if (materiasTotales[materia] > 8) {
        console.error(`La materia ${materia} tiene demasiados bloques en total: ${materiasTotales[materia]}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Error en validación de horarios:", error);
    return false;
  }
};

const compararHorarios = (nuevosHorarios, viejosHorarios) => {
  if (!viejosHorarios || viejosHorarios.length === 0) return true;
  
  try {
    let diferencias = 0;
    const totalBloques = nuevosHorarios.length;
    
    for (let i = 0; i < totalBloques; i++) {
      const horarioNuevo = nuevosHorarios[i];
      const horarioViejo = viejosHorarios.find(
        h => h.dia === horarioNuevo.dia && h.bloque === horarioNuevo.bloque
      );
      
      if (!horarioViejo || 
          horarioViejo.materia !== horarioNuevo.materia || 
          horarioViejo.docente !== horarioNuevo.docente) {
        diferencias++;
      }
    }
    
    const porcentajeDiferencia = (diferencias / totalBloques);
    console.log(`Porcentaje de diferencia entre horarios: ${(porcentajeDiferencia * 100).toFixed(2)}%`);
    
    return porcentajeDiferencia > 0.3;
  } catch (error) {
    console.error("Error en comparación de horarios:", error);
    return true;
  }
};

export default HorarioTable;


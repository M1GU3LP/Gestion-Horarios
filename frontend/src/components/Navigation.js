import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const Navigation = () => {
  const { usuario, logout } = useContext(AuthContext);

  const navStyle = {
    backgroundColor: '#333',
    padding: '1rem',
    marginBottom: '2rem'
  };

  const navListStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    listStyle: 'none',
    margin: 0,
    padding: 0
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem 1rem'
  };

  const buttonStyle = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  };

  return (
    <nav style={navStyle}>
      <ul style={navListStyle}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <li>
            <Link to="/horarios" style={linkStyle}>Horarios</Link>
          </li>
          {usuario?.rol === 'director' && (
            <>
              <li>
                <Link to="/docentes" style={linkStyle}>Docentes</Link>
              </li>
              <li>
                <Link to="/materias" style={linkStyle}>Materias</Link>
              </li>
            </>
          )}
        </div>
        <div>
          {usuario ? (
            <button onClick={logout} style={buttonStyle}>
              Cerrar Sesión
            </button>
          ) : (
            <li>
              <Link to="/login" style={linkStyle}>Iniciar Sesión</Link>
            </li>
          )}
        </div>
      </ul>
    </nav>
  );
};

export default Navigation; 
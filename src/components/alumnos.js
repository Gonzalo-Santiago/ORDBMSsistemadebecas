import React, { useState, useEffect } from 'react';
import './alumnos.css';

// Importamos el nuevo componente (asegúrate de tenerlo en la misma carpeta)
import NuevoAlumno from './Alta/NuevoAlumno/NuevoAlumno';

const Alumnos = () => {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    //const [tutores, setTutores] = useState([]);

    // Cargar alumnos desde el backend
    const fetchAlumnos = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/alumnos');

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                const alumnosFormateados = data.map(alumno => ({
                    ...alumno,
                    promedio: alumno.promedio ? parseFloat(alumno.promedio) : null
                }));
                setAlumnos(alumnosFormateados);
            } else {
                console.error('La API no devolvió un array:', data);
                setAlumnos([]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error cargando alumnos:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    // Cargar tutores para el formulario
    const fetchTutores = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/tutores');
            if (response.ok) {
              
            } else {
                console.error('Error cargando tutores');
            }
        } catch (error) {
            console.error('Error cargando tutores:', error);
        }
    };

    useEffect(() => {
        fetchAlumnos();
        fetchTutores();
    }, []);

    // Manejar cuando se guarda un nuevo alumno
    const handleAlumnoGuardado = (nuevoAlumno) => {
        console.log('Alumno guardado:', nuevoAlumno);
        // Actualizar la lista de alumnos
        fetchAlumnos();
        // Cerrar el formulario
        setShowForm(false);
    };

    // Eliminar alumno - CONEXIÓN REAL CON BASE DE DATOS
    const handleEliminarAlumno = async (alumnoId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este alumno? Esta acción no se puede deshacer.')) {
            try {
                console.log('🗑️ Eliminando alumno ID:', alumnoId);

                const response = await fetch(`http://localhost:5000/api/alumnos/${alumnoId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `Error ${response.status}`);
                }

                const resultado = await response.json();
                console.log('✅ Alumno eliminado:', resultado);

                // Actualizar lista local
                await fetchAlumnos();

                alert('Alumno eliminado exitosamente de la base de datos');

            } catch (error) {
                console.error('❌ Error eliminando alumno:', error);
                alert('Error al eliminar alumno: ' + error.message);
            }
        }
    };

    // Filtrar alumnos basado en la búsqueda
    const filteredAlumnos = alumnos.filter(alumno =>
        alumno.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumno.matricula?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumno.carrera?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Función segura para formatear el promedio
    const formatearPromedio = (promedio) => {
        if (promedio === null || promedio === undefined) return 'N/A';
        const num = parseFloat(promedio);
        return isNaN(num) ? 'N/A' : num.toFixed(2);
    };

    if (loading) {
        return (
            <div className="alumnos-container">
                <div className="loading">Cargando alumnos...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alumnos-container">
                <div className="error">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="alumnos-container">
            {/* Header */}
            <div className="alumnos-header">
                <h1>Gestión de Alumnos</h1>
                <p>Registro y administración de estudiantes</p>
            </div>

            {/* Barra de búsqueda y botón */}
            <div className="controls-bar">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, matrícula o carrera..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button
                    className="btn-nuevo"
                    onClick={() => setShowForm(true)}
                >
                    + Agregar Alumno
                </button>
            </div>

            <div className="separator"></div>

            {/* Información de registros */}
            <div className="registros-info">
                <h2>Listado de Alumnos</h2>
                <span className="registros-count">| {filteredAlumnos.length} registros</span>
            </div>

            {/* Formulario de nuevo alumno - USANDO EL NUEVO COMPONENTE */}
            {showForm && (
                <div className="form-overlay">
                    <div className="nuevo-alumno-modal">
                        <NuevoAlumno
                            onCancel={() => setShowForm(false)}
                            onSave={handleAlumnoGuardado}
                        />
                    </div>
                </div>
            )}

            {/* Tabla de alumnos */}
            <div className="table-container">
                <table className="alumnos-table">
                    <thead>
                        <tr>
                            <th>Matrícula</th>
                            <th>Nombre</th>
                            <th>Edad</th>
                            <th>Carrera</th>
                            <th>Promedio</th>
                            <th>Tutor</th>
                            <th>Status</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAlumnos.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="no-data">
                                    {searchTerm ? 'No se encontraron alumnos que coincidan con la búsqueda' : 'No hay alumnos registrados'}
                                </td>
                            </tr>
                        ) : (
                            filteredAlumnos.map(alumno => (
                                <tr key={alumno.id}>
                                    <td className="matricula">{alumno.matricula || 'N/A'}</td>
                                    <td className="nombre">{alumno.nombre || 'N/A'}</td>
                                    <td className="edad">{alumno.edad ? `${alumno.edad} años` : 'N/A'}</td>
                                    <td className="carrera">
                                        {alumno.carrera || 'N/A'}
                                        {alumno.grupo && <span className="grupo"> Grupo: {alumno.grupo}</span>}
                                    </td>
                                    <td className="promedio">{formatearPromedio(alumno.promedio)}</td>
                                    <td className="tutor">{alumno.tutor_nombre || '-'}</td>
                                    <td className="status">
                                        <span className={`status-badge ${alumno.status || 'active'}`}>
                                            {alumno.status === 'activo' ? 'Activo' :
                                                alumno.status === 'inactivo' ? 'Inactivo' :
                                                    alumno.status === 'egresado' ? 'Egresado' :
                                                        alumno.status === 'baja' ? 'Baja' : 'Activo'}
                                        </span>
                                    </td>
                                    <td className="acciones">
                                        <button className="btn-editar" title="Editar">✏️</button>
                                        <button
                                            className="btn-eliminar"
                                            title="Eliminar"
                                            onClick={() => handleEliminarAlumno(alumno.id)}
                                        >
                                            🗑️
                                        </button>
                                        <button className="btn-ver" title="Ver detalles">👁️</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Alumnos;
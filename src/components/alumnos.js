import React, { useState, useEffect } from 'react';
import './alumnos.css';

const Alumnos = () => {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [tutores, setTutores] = useState([]);
    const [guardando, setGuardando] = useState(false);

    // Estado para el formulario de nuevo alumno
    const [nuevoAlumno, setNuevoAlumno] = useState({
        nombre: '',
        edad: '',
        email: '',
        telefono: '',
        direccion: '',
        grupo: '',
        carrera: '',
        promedio: '',
        matricula: '',
        tutor_id: ''
    });

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
                const data = await response.json();
                setTutores(data);
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

    // Manejar cambio en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoAlumno(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Crear nuevo alumno
    const handleCrearAlumno = async (e) => {
        e.preventDefault();

        if (!nuevoAlumno.nombre.trim()) {
            alert('El nombre es obligatorio');
            return;
        }
        if (!nuevoAlumno.matricula.trim()) {
            alert('La matrícula es obligatoria');
            return;
        }

        setGuardando(true);

        try {
            const datosParaEnviar = {
                tutor_id: nuevoAlumno.tutor_id ? parseInt(nuevoAlumno.tutor_id) : null,
                nombre: nuevoAlumno.nombre,
                edad: nuevoAlumno.edad ? parseInt(nuevoAlumno.edad) : null,
                email: nuevoAlumno.email || '',
                telefono: nuevoAlumno.telefono || '',
                direccion: nuevoAlumno.direccion || '',
                grupo: nuevoAlumno.grupo || '',
                carrera: nuevoAlumno.carrera || '',
                promedio: nuevoAlumno.promedio ? parseFloat(nuevoAlumno.promedio) : null,
                matricula: nuevoAlumno.matricula
            };

            console.log('📤 Enviando datos al servidor:', datosParaEnviar);

            const response = await fetch('http://localhost:5000/api/alumnos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosParaEnviar)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Error ${response.status}`);
            }

            const resultado = await response.json();
            console.log('✅ Respuesta del servidor:', resultado);

            await fetchAlumnos();

            setNuevoAlumno({
                nombre: '',
                edad: '',
                email: '',
                telefono: '',
                direccion: '',
                grupo: '',
                carrera: '',
                promedio: '',
                matricula: '',
                tutor_id: ''
            });

            setShowForm(false);
            alert('Alumno creado exitosamente');

        } catch (error) {
            console.error('❌ Error creando alumno:', error);
            alert('Error al crear alumno: ' + error.message);
        } finally {
            setGuardando(false);
        }
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
                    disabled={guardando}
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

            {/* Formulario de nuevo alumno */}
            {showForm && (
                <div className="form-overlay">
                    <div className="form-container">
                        <div className="form-header">
                            <h3>Nuevo Alumno</h3>
                            <button
                                className="btn-cerrar"
                                onClick={() => !guardando && setShowForm(false)}
                                disabled={guardando}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCrearAlumno}>
                            <div className="form-group">
                                <label>Nombre completo *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={nuevoAlumno.nombre}
                                    onChange={handleInputChange}
                                    required
                                    disabled={guardando}
                                    placeholder="Ej: Juan Pérez García"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Edad</label>
                                    <input
                                        type="number"
                                        name="edad"
                                        value={nuevoAlumno.edad}
                                        onChange={handleInputChange}
                                        min="15"
                                        max="60"
                                        disabled={guardando}
                                        placeholder="Ej: 20"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Matrícula *</label>
                                    <input
                                        type="text"
                                        name="matricula"
                                        value={nuevoAlumno.matricula}
                                        onChange={handleInputChange}
                                        required
                                        disabled={guardando}
                                        placeholder="Ej: A123456"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Grupo</label>
                                    <input
                                        type="text"
                                        name="grupo"
                                        value={nuevoAlumno.grupo}
                                        onChange={handleInputChange}
                                        disabled={guardando}
                                        placeholder="Ej: 301A"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Carrera</label>
                                    <input
                                        type="text"
                                        name="carrera"
                                        value={nuevoAlumno.carrera}
                                        onChange={handleInputChange}
                                        disabled={guardando}
                                        placeholder="Ej: Ingeniería en Sistemas"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Promedio</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="promedio"
                                        value={nuevoAlumno.promedio}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="10"
                                        disabled={guardando}
                                        placeholder="0.00 - 10.00"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Tutor/Responsable</label>
                                    <select
                                        name="tutor_id"
                                        value={nuevoAlumno.tutor_id}
                                        onChange={handleInputChange}
                                        disabled={guardando || tutores.length === 0}
                                    >
                                        <option value="">Seleccionar tutor</option>
                                        {tutores.map(tutor => (
                                            <option key={tutor.id} value={tutor.id}>
                                                {tutor.nombre} {tutor.parentesco ? `- ${tutor.parentesco}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {tutores.length === 0 && (
                                        <small style={{ color: '#e74c3c' }}>No hay tutores disponibles</small>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={nuevoAlumno.email}
                                    onChange={handleInputChange}
                                    disabled={guardando}
                                    placeholder="Ej: juan@email.com"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={nuevoAlumno.telefono}
                                        onChange={handleInputChange}
                                        disabled={guardando}
                                        placeholder="Ej: 555-123-4567"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Dirección</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={nuevoAlumno.direccion}
                                        onChange={handleInputChange}
                                        disabled={guardando}
                                        placeholder="Ej: Av. Universidad 123"
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    disabled={guardando}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={guardando}
                                >
                                    {guardando ? 'Guardando...' : 'Guardar Alumno'}
                                </button>
                            </div>
                        </form>
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
                                        <span className="status-badge active">Activo</span>
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
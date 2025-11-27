import React, { useState, useEffect } from 'react';
import './responsables.css';

const Responsables = () => {
    const [tutores, setTutores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [eliminando, setEliminando] = useState(false); // ← NUEVO

    // Estado para el formulario de nuevo tutor
    const [nuevoTutor, setNuevoTutor] = useState({
        nombre: '',
        ciudad: '',
        telefono: '',
        parentesco: 'Padre/Madre'
    });

    // Cargar tutores desde el backend
    useEffect(() => {
        const fetchTutores = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/tutores');

                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }

                const data = await response.json();

                if (Array.isArray(data)) {
                    setTutores(data);
                } else {
                    console.error('La API no devolvió un array:', data);
                    setTutores([]);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error cargando tutores:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchTutores();
    }, []);

    // Filtrar tutores basado en la búsqueda
    const filteredTutores = tutores.filter(tutor =>
        tutor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.ciudad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.parentesco?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Manejar cambio en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoTutor(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Crear nuevo tutor
    const handleCrearTutor = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/tutores', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoTutor)
            });

            if (!response.ok) {
                throw new Error('Error al crear tutor');
            }

            const tutorCreado = await response.json();

            // Agregar el nuevo tutor a la lista
            setTutores(prev => [tutorCreado, ...prev]);

            // Resetear formulario
            setNuevoTutor({
                nombre: '',
                ciudad: '',
                telefono: '',
                parentesco: 'Padre/Madre'
            });

            setShowForm(false);

        } catch (error) {
            console.error('Error creando tutor:', error);
            alert('Error al crear tutor: ' + error.message);
        }
    };

    // ⭐⭐ ELIMINAR TUTOR (COMPLETO Y REAL) ⭐⭐
    const handleEliminarTutor = async (tutorId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este responsable? Esta acción no se puede deshacer.')) {
            setEliminando(true);

            try {
                console.log("🗑️ Eliminando tutor ID:", tutorId);

                const response = await fetch(`http://localhost:5000/api/tutores/${tutorId}`, {
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
                console.log("✅ Tutor eliminado:", resultado);

                // Actualizar lista
                setTutores(prev => prev.filter(tutor => tutor.id !== tutorId));

                alert("Responsable eliminado exitosamente");

            } catch (error) {
                console.error("❌ Error eliminando responsable:", error);
                alert("Error al eliminar responsable: " + error.message);
            } finally {
                setEliminando(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="responsables-container">
                <div className="loading">Cargando responsables...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="responsables-container">
                <div className="error">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="responsables-container">

            {/* Header */}
            <div className="responsables-header">
                <h1>Gestión de Responsables</h1>
                <p>Registro y administración de tutores/responsables</p>
            </div>

            {/* Barra de búsqueda */}
            <div className="controls-bar">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, ciudad o parentesco..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                <button
                    className="btn-nuevo"
                    onClick={() => setShowForm(true)}
                >
                    + Nuevo Responsable
                </button>
            </div>

            <div className="separator"></div>

            {/* Información de registros */}
            <div className="registros-info">
                <h2>Listado de Responsables</h2>
                <span className="registros-count">| {filteredTutores.length} registros</span>
            </div>

            {/* Formulario de nuevo tutor */}
            {showForm && (
                <div className="form-overlay">
                    <div className="form-container">
                        <div className="form-header">
                            <h3>Nuevo Responsable</h3>
                            <button
                                className="btn-cerrar"
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCrearTutor}>
                            <div className="form-group">
                                <label>Nombre completo *</label>
                                <input
                                    type="text"
                                    name="nombre"
                                    value={nuevoTutor.nombre}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ciudad</label>
                                    <input
                                        type="text"
                                        name="ciudad"
                                        value={nuevoTutor.ciudad}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Teléfono</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={nuevoTutor.telefono}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Parentesco</label>
                                <select
                                    name="parentesco"
                                    value={nuevoTutor.parentesco}
                                    onChange={handleInputChange}
                                >
                                    <option value="Padre/Madre">Padre/Madre</option>
                                    <option value="Tutor">Tutor</option>
                                    <option value="Abuelo/Abuela">Abuelo/Abuela</option>
                                    <option value="Tío/Tía">Tío/Tía</option>
                                    <option value="Hermano/Hermana">Hermano/Hermana</option>
                                    <option value="Otro">Otro</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowForm(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">Guardar Responsable</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabla de tutores */}
            <div className="table-container">
                <table className="responsables-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Ciudad</th>
                            <th>Teléfono</th>
                            <th>Parentesco</th>
                            <th>Fecha Registro</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTutores.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    No se encontraron responsables
                                </td>
                            </tr>
                        ) : (
                            filteredTutores.map(tutor => (
                                <tr key={tutor.id}>
                                    <td className="id">{tutor.id}</td>
                                    <td className="nombre">{tutor.nombre || 'N/A'}</td>
                                    <td className="ciudad">{tutor.ciudad || 'N/A'}</td>
                                    <td className="telefono">{tutor.telefono || 'N/A'}</td>
                                    <td className="parentesco">
                                        <span className="parentesco-badge">{tutor.parentesco}</span>
                                    </td>
                                    <td className="fecha">
                                        {tutor.fecha_creacion ? new Date(tutor.fecha_creacion).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="acciones">
                                        <button className="btn-editar" title="Editar">✏️</button>

                                        {/* BOTÓN DE ELIMINAR */}
                                        <button
                                            className="btn-eliminar"
                                            title="Eliminar"
                                            onClick={() => handleEliminarTutor(tutor.id)}
                                            disabled={eliminando}
                                        >
                                            {eliminando ? "⏳" : "🗑️"}
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

export default Responsables;

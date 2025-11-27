import React, { useState, useEffect } from 'react';
import './programas.css';

const Programas = () => {
    const [programas, setProgramas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [eliminando, setEliminando] = useState(false);

    // Estado para el formulario de nuevo programa
    const [nuevoPrograma, setNuevoPrograma] = useState({
        nombre_programa: '',
        monto: '',
        tipo_beca: 'Académica',
        porcentaje: '',
        promedio_minimo: '',
        requisitos: ''
    });

    // Cargar programas desde el backend
    const fetchProgramas = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/programas-beca');

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                // Asegurarnos que los montos y promedios sean números
                const programasFormateados = data.map(programa => ({
                    ...programa,
                    monto: programa.monto ? parseFloat(programa.monto) : null,
                    promedio_minimo: programa.promedio_minimo ? parseFloat(programa.promedio_minimo) : null,
                    porcentaje: programa.porcentaje ? parseInt(programa.porcentaje) : null
                }));
                setProgramas(programasFormateados);
            } else {
                console.error('La API no devolvió un array:', data);
                setProgramas([]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error cargando programas:', error);
            setError(error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgramas();
    }, []);

    // Filtrar programas basado en la búsqueda y tipo
    const filteredProgramas = programas.filter(programa => {
        const coincideBusqueda =
            programa.nombre_programa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            programa.requisitos?.toLowerCase().includes(searchTerm.toLowerCase());

        const coincideTipo = filtroTipo === 'todos' || programa.tipo_beca === filtroTipo;

        return coincideBusqueda && coincideTipo;
    });

    // Obtener tipos únicos de beca para el filtro
    const tiposBeca = ['todos', ...new Set(programas.map(p => p.tipo_beca).filter(Boolean))];

    // Manejar cambio en el formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNuevoPrograma(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Función segura para formatear montos
    const formatearMonto = (monto) => {
        if (monto === null || monto === undefined) return 'N/A';
        const num = parseFloat(monto);
        return isNaN(num) ? 'N/A' : `$${num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Función segura para formatear porcentajes
    const formatearPorcentaje = (porcentaje) => {
        if (porcentaje === null || porcentaje === undefined) return 'N/A';
        const num = parseInt(porcentaje);
        return isNaN(num) ? 'N/A' : `${num}%`;
    };

    // Función segura para formatear promedios
    const formatearPromedio = (promedio) => {
        if (promedio === null || promedio === undefined) return 'N/A';
        const num = parseFloat(promedio);
        return isNaN(num) ? 'N/A' : num.toFixed(2);
    };

    // Crear nuevo programa
    const handleCrearPrograma = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/programas-beca', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...nuevoPrograma,
                    monto: parseFloat(nuevoPrograma.monto) || null,
                    porcentaje: parseInt(nuevoPrograma.porcentaje) || null,
                    promedio_minimo: parseFloat(nuevoPrograma.promedio_minimo) || null
                })
            });

            if (!response.ok) {
                throw new Error('Error al crear programa');
            }

            const programaCreado = await response.json();

            // Agregar el nuevo programa a la lista
            setProgramas(prev => [programaCreado, ...prev]);

            // Resetear formulario
            setNuevoPrograma({
                nombre_programa: '',
                monto: '',
                tipo_beca: 'Académica',
                porcentaje: '',
                promedio_minimo: '',
                requisitos: ''
            });

            setShowForm(false);

        } catch (error) {
            console.error('Error creando programa:', error);
            alert('Error al crear programa: ' + error.message);
        }
    };

    // Eliminar programa - CONEXIÓN REAL CON BASE DE DATOS
    const handleEliminarPrograma = async (programaId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este programa de beca? Esta acción no se puede deshacer.')) {
            setEliminando(true);

            try {
                console.log('🗑️ Eliminando programa ID:', programaId);

                const response = await fetch(`http://localhost:5000/api/programas-beca/${programaId}`, {
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
                console.log('✅ Programa eliminado:', resultado);

                // Actualizar lista local eliminando el programa
                setProgramas(prev => prev.filter(programa => programa.id !== programaId));

                alert('Programa de beca eliminado exitosamente de la base de datos');

            } catch (error) {
                console.error('❌ Error eliminando programa:', error);
                alert('Error al eliminar programa: ' + error.message);
            } finally {
                setEliminando(false);
            }
        }
    };

    if (loading) {
        return (
            <div className="programas-container">
                <div className="loading">Cargando programas...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="programas-container">
                <div className="error">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="programas-container">
            {/* Header */}
            <div className="programas-header">
                <h1>Programas de Becas</h1>
                <p>Gestión y administración de programas de apoyo estudiantil</p>
            </div>

            {/* Barra de búsqueda y botones */}
            <div className="controls-bar">
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Buscar por nombre del programa o requisitos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="filtros">
                    <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="filtro-select"
                    >
                        {tiposBeca.map(tipo => (
                            <option key={tipo} value={tipo}>
                                {tipo === 'todos' ? 'Todos los tipos' : tipo}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    className="btn-nuevo"
                    onClick={() => setShowForm(true)}
                >
                    + Nuevo Programa
                </button>
            </div>

            <div className="separator"></div>

            {/* Información de registros */}
            <div className="registros-info">
                <h2>Catálogo de Programas</h2>
                <span className="registros-count">| {filteredProgramas.length} programas</span>
            </div>

            {/* Formulario de nuevo programa */}
            {showForm && (
                <div className="form-overlay">
                    <div className="form-container">
                        <div className="form-header">
                            <h3>Nuevo Programa de Beca</h3>
                            <button
                                className="btn-cerrar"
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleCrearPrograma}>
                            <div className="form-group">
                                <label>Nombre del Programa *</label>
                                <input
                                    type="text"
                                    name="nombre_programa"
                                    value={nuevoPrograma.nombre_programa}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Monto</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="monto"
                                        value={nuevoPrograma.monto}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Porcentaje</label>
                                    <input
                                        type="number"
                                        name="porcentaje"
                                        value={nuevoPrograma.porcentaje}
                                        onChange={handleInputChange}
                                        placeholder="0-100"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo de Beca</label>
                                    <select
                                        name="tipo_beca"
                                        value={nuevoPrograma.tipo_beca}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Académica">Académica</option>
                                        <option value="Deportiva">Deportiva</option>
                                        <option value="Socioeconómica">Socioeconómica</option>
                                        <option value="Investigación">Investigación</option>
                                        <option value="Cultural">Cultural</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Promedio Mínimo</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        name="promedio_minimo"
                                        value={nuevoPrograma.promedio_minimo}
                                        onChange={handleInputChange}
                                        placeholder="0.00"
                                        min="0"
                                        max="10"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Requisitos</label>
                                <textarea
                                    name="requisitos"
                                    value={nuevoPrograma.requisitos}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Descripción de los requisitos del programa..."
                                />
                            </div>

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowForm(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    Crear Programa
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Grid de programas */}
            <div className="programas-grid">
                {filteredProgramas.length === 0 ? (
                    <div className="no-data">
                        No se encontraron programas
                    </div>
                ) : (
                    filteredProgramas.map(programa => (
                        <div key={programa.id} className="programa-card">
                            <div className="programa-header">
                                <h3>{programa.nombre_programa}</h3>
                                <span className={`tipo-beca ${programa.tipo_beca?.toLowerCase()}`}>
                                    {programa.tipo_beca}
                                </span>
                            </div>

                            <div className="programa-info">
                                <div className="info-item">
                                    <span className="label">Monto:</span>
                                    <span className="value monto">{formatearMonto(programa.monto)}</span>
                                </div>

                                <div className="info-item">
                                    <span className="label">Porcentaje:</span>
                                    <span className="value porcentaje">{formatearPorcentaje(programa.porcentaje)}</span>
                                </div>

                                <div className="info-item">
                                    <span className="label">Promedio Mínimo:</span>
                                    <span className="value promedio">{formatearPromedio(programa.promedio_minimo)}</span>
                                </div>

                                <div className="info-item full-width">
                                    <span className="label">Requisitos:</span>
                                    <span className="value requisitos">{programa.requisitos || 'No especificado'}</span>
                                </div>
                            </div>

                            <div className="programa-footer">
                                <span className="fecha">
                                    Creado: {programa.fecha_creacion ? new Date(programa.fecha_creacion).toLocaleDateString() : 'N/A'}
                                </span>
                                <div className="acciones">
                                    <button className="btn-editar" title="Editar">✏️</button>
                                    <button
                                        className="btn-eliminar"
                                        title="Eliminar"
                                        onClick={() => handleEliminarPrograma(programa.id)}
                                        disabled={eliminando}
                                    >
                                        {eliminando ? '⏳' : '🗑️'}
                                    </button>
                                    <button className="btn-ver" title="Ver detalles">👁️</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Programas;
import React, { useState, useEffect } from "react";
import NuevaPostulacion from "./Alta/NuevaPostulacion/NuevaPostulacion";
import "./inicio.css";

export default function RegistroBecas() {
    // Estados para controlar la vista actual
    const [currentView, setCurrentView] = useState('inicio');
    const [statsData, setStatsData] = useState({
        total: 0,
        pendientes: 0,
        aprobadas: 0,
        rechazadas: 0,
        monto: "$0"
    });
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("todos");

    // Función para obtener datos de la base de datos
    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/postulaciones');

            if (!response.ok) {
                throw new Error('Error al cargar registros');
            }

            const data = await response.json();
            console.log('📊 Datos recibidos:', data);

            if (Array.isArray(data)) {
                setRegistros(data);

                // Calcular estadísticas
                const total = data.length;
                const pendientes = data.filter(reg => reg.status === 'Pendiente').length;
                const aprobadas = data.filter(reg => reg.status === 'Aprobada' || reg.status === 'Vigente').length;
                const rechazadas = data.filter(reg => reg.status === 'Rechazada').length;

                const montoTotal = data
                    .filter(reg => reg.monto_asignado)
                    .reduce((sum, reg) => sum + parseFloat(reg.monto_asignado || 0), 0);

                setStatsData({
                    total,
                    pendientes,
                    aprobadas,
                    rechazadas,
                    monto: `$${montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                });
            } else {
                setRegistros([]);
                setStatsData({
                    total: 0,
                    pendientes: 0,
                    aprobadas: 0,
                    rechazadas: 0,
                    monto: "$0"
                });
            }

        } catch (error) {
            console.error("Error fetching data:", error);
            setRegistros([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Manejar nueva postulación
    const handleNuevaPostulacion = async (postulacion) => {
        try {
            const response = await fetch('http://localhost:5000/api/postulaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postulacion)
            });

            if (!response.ok) throw new Error('Error al crear postulación');

            await fetchData();
            setCurrentView('inicio');
            alert('Postulación creada exitosamente');

        } catch (error) {
            console.error('Error creando postulación:', error);
            alert('Error al crear postulación: ' + error.message);
        }
    };

    // Manejar cancelación
    const handleCancelarPostulacion = () => setCurrentView('inicio');

    // Navegar a nueva postulación
    const handleIrANuevaPostulacion = () => setCurrentView('nueva-postulacion');

    // Funciones auxiliares para formateo
    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'aprobada':
            case 'vigente':
                return 'status-approved';
            case 'rechazada':
                return 'status-rejected';
            default:
                return 'status-pending';
        }
    };

    const formatearStatus = (status) => {
        switch (status?.toLowerCase()) {
            case 'aprobada': return 'Aprobada';
            case 'vigente': return 'Vigente';
            case 'pendiente': return 'Pendiente';
            case 'rechazada': return 'Rechazada';
            default: return status || 'Desconocido';
        }
    };

    const formatearFecha = (fecha) => fecha ? new Date(fecha).toLocaleDateString('es-MX') : 'N/A';

    const calcularAntiguedad = (fechaAsignacion) => {
        if (!fechaAsignacion) return 'N/A';
        const diffTime = Math.abs(new Date() - new Date(fechaAsignacion));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return `${diffDays} días`;
    };

    // Filtrar registros
    const filteredRegistros = registros.filter(registro => {
        const coincideBusqueda =
            registro.alumno_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            registro.nombre_programa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            registro.matricula?.toLowerCase().includes(searchTerm.toLowerCase());

        const coincideFiltro =
            filterStatus === 'todos' ||
            (filterStatus === 'aprobadas' && (registro.status === 'Aprobada' || registro.status === 'Vigente')) ||
            (filterStatus === 'pendientes' && registro.status === 'Pendiente') ||
            (filterStatus === 'rechazadas' && registro.status === 'Rechazada');

        return coincideBusqueda && coincideFiltro;
    });

    // Función para eliminar registro REAL
    const handleEliminarRegistro = async (registroId) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta postulación? Esta acción no se puede deshacer.")) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/postulaciones/${registroId}`, {
                method: "DELETE"
            });

            if (!response.ok) throw new Error("Error al eliminar la postulación");

            alert("Postulación eliminada correctamente.");
            await fetchData();

        } catch (error) {
            console.error("Error eliminando postulación:", error);
            alert("Error eliminando la postulación: " + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <main className="content">
                    <div className="loading">Cargando...</div>
                </main>
            </div>
        );
    }

    if (currentView === 'nueva-postulacion') {
        return (
            <div className="page-container">
                <main className="content">
                    <NuevaPostulacion
                        onPostular={handleNuevaPostulacion}
                        onCancelar={handleCancelarPostulacion}
                    />
                </main>
            </div>
        );
    }

    // Vista principal
    return (
        <div className="page-container">
            <main className="content">
                <div className="header-section">
                    <h1 className="main-title">Sistema de Registro de Becas</h1>
                    <p className="main-subtitle">Postulación y gestión de becas estudiantiles</p>
                </div>

                {/* Estadísticas */}
                <div className="stats-grid">
                    <div className="stat-card"><div className="stat-number">{statsData.total}</div><div className="stat-label">Total Registros</div></div>
                    <div className="stat-card"><div className="stat-number">{statsData.pendientes}</div><div className="stat-label">Pendientes</div></div>
                    <div className="stat-card"><div className="stat-number">{statsData.aprobadas}</div><div className="stat-label">Aprobadas</div></div>
                    <div className="stat-card"><div className="stat-number">{statsData.rechazadas}</div><div className="stat-label">Rechazadas</div></div>
                    <div className="stat-card amount-card"><div className="stat-number amount-text">{statsData.monto}</div><div className="stat-label">Monto Asignado</div></div>
                </div>

                {/* Barra de acciones */}
                <div className="actions-bar">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar por alumno o programa..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="filter-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        <option value="aprobadas">Aprobadas</option>
                        <option value="pendientes">Pendientes</option>
                        <option value="rechazadas">Rechazadas</option>
                    </select>
                    <button className="new-post-btn" onClick={handleIrANuevaPostulacion}>
                        + Nueva Postulación
                    </button>
                </div>

                {/* Tabla */}
                <div className="table-card">
                    <div className="table-header">
                        <span className="table-title">Registros de Becas</span>
                        <span className="table-count">{filteredRegistros.length} registros</span>
                    </div>

                    {filteredRegistros.length === 0 ? (
                        <div className="empty-state"><p>No hay registros de becas</p></div>
                    ) : (
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Alumno</th>
                                    <th>Programa de Beca</th>
                                    <th>Fecha Postulación</th>
                                    <th>Fecha Asignación</th>
                                    <th>Antigüedad</th>
                                    <th>Monto</th>
                                    <th>Status</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRegistros.map((registro) => (
                                    <tr key={registro.id}>
                                        <td className="alumno-cell">
                                            <div className="alumno-name">{registro.alumno_nombre || 'N/A'}</div>
                                            <div className="oid-text">Matrícula: {registro.matricula || 'N/A'}</div>
                                        </td>
                                        <td>
                                            <div>{registro.nombre_programa || 'N/A'}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{registro.tipo_beca || 'N/A'}</div>
                                        </td>
                                        <td>{formatearFecha(registro.fecha_postulacion)}</td>
                                        <td>{formatearFecha(registro.fecha_asignacion)}</td>
                                        <td>{calcularAntiguedad(registro.fecha_asignacion)}</td>
                                        <td className="monto-cell">
                                            {registro.monto_asignado ?
                                                `$${parseFloat(registro.monto_asignado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                                                : 'N/A'
                                            }
                                        </td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(registro.status)}`}>
                                                {formatearStatus(registro.status)}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icons">
                                                <span
                                                    className="icon-edit"
                                                    onClick={() => console.log("Editar:", registro.id)}
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </span>
                                                <span
                                                    className="icon-delete"
                                                    onClick={() => handleEliminarRegistro(registro.id)}
                                                    title="Eliminar"
                                                >
                                                    🗑️
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>
        </div>
    );
}

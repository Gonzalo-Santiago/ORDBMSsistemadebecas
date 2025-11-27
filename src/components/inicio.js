import React, { useState, useEffect } from "react";
import NuevaPostulacion from "./Alta/NuevaPostulacion/NuevaPostulacion";
import "./inicio.css";

export default function RegistroBecas() {
    // Estados para controlar la vista actual
    const [currentView, setCurrentView] = useState('inicio'); // 'inicio' o 'nueva-postulacion'

    // Estados vacíos listos para conectar con tu API
    const [statsData, setStatsData] = useState({
        total: 0,
        pendientes: 0,
        aprobadas: 0,
        rechazadas: 0,
        monto: "$0"
    });

    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);

    // Función para obtener datos de la base de datos
    const fetchData = async () => {
        try {
            setLoading(true);

            // Aquí irían tus llamadas a la API
            setRegistros([]);
            setStatsData({
                total: 0,
                pendientes: 0,
                aprobadas: 0,
                rechazadas: 0,
                monto: "$0"
            });

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Manejar nueva postulación
    const handleNuevaPostulacion = (postulacion) => {
        // Aquí puedes agregar la lógica para guardar en tu API
        console.log("Nueva postulación:", postulacion);

        // Actualizar estadísticas (ejemplo)
        setStatsData(prev => ({
            ...prev,
            total: prev.total + 1,
            pendientes: prev.pendientes + 1
        }));

        // Volver al inicio
        setCurrentView('inicio');
        alert('Postulación creada exitosamente');
    };

    // Manejar cancelación
    const handleCancelarPostulacion = () => {
        setCurrentView('inicio');
    };

    // Navegar a nueva postulación
    const handleIrANuevaPostulacion = () => {
        setCurrentView('nueva-postulacion');
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Aprobada':
            case 'Vigente':
                return 'status-approved';
            case 'Rechazada':
                return 'status-rejected';
            default:
                return 'status-pending';
        }
    };

    // Función para manejar búsqueda
    const handleSearch = (e) => {
        const searchTerm = e.target.value;
        console.log("Buscando:", searchTerm);
    };

    // Función para manejar filtro
    const handleFilter = (e) => {
        const filterValue = e.target.value;
        console.log("Filtrando por:", filterValue);
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

    // Renderizar vista de Nueva Postulación
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

    // Renderizar vista principal (Inicio)
    return (
        <div className="page-container">
            <main className="content">
                <div className="header-section">
                    <h1 className="main-title">Sistema de Registro de Becas</h1>
                    <p className="main-subtitle">Postulación y gestión de becas estudiantiles</p>
                </div>

                {/* Estadísticas */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-number">{statsData.total}</div>
                        <div className="stat-label">Total Registros</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-number">{statsData.pendientes}</div>
                        <div className="stat-label">Pendientes</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-number">{statsData.aprobadas}</div>
                        <div className="stat-label">Aprobadas</div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-number">{statsData.rechazadas}</div>
                        <div className="stat-label">Rechazadas</div>
                    </div>

                    <div className="stat-card amount-card">
                        <div className="stat-number amount-text">{statsData.monto}</div>
                        <div className="stat-label">Monto Asignado</div>
                    </div>
                </div>

                {/* Barra de acciones */}
                <div className="actions-bar">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Buscar por alumno o programa..."
                            className="search-input"
                            onChange={handleSearch}
                        />
                    </div>
                    <select className="filter-select" onChange={handleFilter}>
                        <option value="todos">Todos</option>
                        <option value="aprobadas">Aprobadas</option>
                        <option value="pendientes">Pendientes</option>
                        <option value="rechazadas">Rechazadas</option>
                    </select>
                    <button
                        className="new-post-btn"
                        onClick={handleIrANuevaPostulacion}
                    >
                        + Nueva Postulación
                    </button>
                </div>

                {/* Tabla de registros */}
                <div className="table-card">
                    <div className="table-header">
                        <span className="table-title">Registros de Becas</span>
                        <span className="table-count">{registros.length} registros</span>
                    </div>

                    {registros.length === 0 ? (
                        <div className="empty-state">
                            <p>No hay registros de becas</p>
                        </div>
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
                                {registros.map((registro, index) => (
                                    <tr key={index}>
                                        <td className="alumno-cell">
                                            <div className="alumno-name">{registro.alumno}</div>
                                            <div className="oid-text">OID: {registro.oid}</div>
                                        </td>
                                        <td>{registro.programa}</td>
                                        <td>{registro.fechaPostulacion}</td>
                                        <td>{registro.fechaAsignacion}</td>
                                        <td>{registro.antiguedad}</td>
                                        <td className="monto-cell">{registro.monto}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(registro.status)}`}>
                                                {registro.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icons">
                                                <span
                                                    className="icon-edit"
                                                    onClick={() => console.log("Editar:", registro.id)}
                                                >
                                                    ✏️
                                                </span>
                                                <span
                                                    className="icon-delete"
                                                    onClick={() => console.log("Eliminar:", registro.id)}
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
import React, { useState } from "react";
import NuevaBeca from "./Alta/NuevaBeca/NuevaBeca";// Importar el componente
import "./programas.css";

export default function Programas() {
    const [selectedPrograma, setSelectedPrograma] = useState(null);
    const [showNuevaBeca, setShowNuevaBeca] = useState(false);
    const [programas, setProgramas] = useState([]);

    // Manejar creación de nueva beca
    const handleCrearBeca = (nuevaBeca) => {
        setProgramas([...programas, nuevaBeca]);
        setShowNuevaBeca(false);
        alert('Beca creada exitosamente');
    };

    // Manejar cancelación
    const handleCancelarBeca = () => {
        setShowNuevaBeca(false);
    };

    // Seleccionar programa de la lista
    const handleSelectPrograma = (programa) => {
        setSelectedPrograma(programa);
    };

    return (
        <div className="page-container">
            <main className="content">
                <div className="header-section">
                    <h1 className="main-title">Gestión de Becas</h1>
                    <p className="main-subtitle">Programas de Beca y Registros</p>
                </div>

                <div className="layout-container">
                    {/* Sidebar - Lista de programas */}
                    <div className="sidebar">
                        <div className="sidebar-header">
                            <h3>Programas de Beca</h3>
                            <span className="badge">{programas.length} programas</span>
                        </div>

                        <div className="programas-list">
                            {programas.length === 0 ? (
                                <div className="empty-programas">
                                    <div className="empty-icon">🎓</div>
                                    <p>No hay programas registrados</p>
                                </div>
                            ) : (
                                programas.map(programa => (
                                    <div
                                        key={programa.id}
                                        className={`programa-item ${selectedPrograma?.id === programa.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectPrograma(programa)}
                                    >
                                        <div className="programa-info">
                                            <h4>{programa.nombrePrograma}</h4>
                                            <span className="programa-tipo">{programa.tipoBeca}</span>
                                        </div>
                                        <div className="programa-monto">
                                            {programa.monto ? `$${programa.monto}` : `${programa.porcentaje}%`}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            className="new-programa-btn"
                            onClick={() => setShowNuevaBeca(true)}
                        >
                            + Nuevo Programa
                        </button>
                    </div>

                    {/* Contenido principal */}
                    <div className="main-content">
                        {showNuevaBeca ? (
                            // Usar el componente separado
                            <NuevaBeca
                                onCrearBeca={handleCrearBeca}
                                onCancelar={handleCancelarBeca}
                            />
                        ) : (
                            // Vista normal de registros
                            <>
                                <div className="content-header">
                                    <h3>Registros de Beca</h3>
                                    <div className="content-actions">
                                        <span className="registros-count">0 registros</span>
                                        <button className="filter-btn">Filtrar</button>
                                        <button className="export-btn">Exportar</button>
                                    </div>
                                </div>

                                {/* Tabla de registros de beca */}
                                <div className="table-card">
                                    <table className="styled-table">
                                        <thead>
                                            <tr>
                                                <th>Alumno (OID Ref)</th>
                                                <th>Programa (OID Ref)</th>
                                                <th>Fecha Asignación</th>
                                                <th>Antigüedad</th>
                                                <th>Status</th>
                                                <th>Monto</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td colSpan="7" className="empty-state">
                                                    <div className="empty-icon">📊</div>
                                                    <h3>No hay registros de becas</h3>
                                                    <p>Los registros aparecerán aquí cuando se asignen becas a los programas</p>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
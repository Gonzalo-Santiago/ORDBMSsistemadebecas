// responsables.js
import React, { useState } from "react";
import NuevoResponsable from "./Alta/NuevoResponsable/NuevoResponsable";
import "./responsables.css";

export default function Responsables() {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [responsables, setResponsables] = useState([]);

    const handleNuevoResponsable = () => {
        setMostrarFormulario(true);
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
    };

    const handleGuardarResponsable = (datosResponsable) => {
        console.log("Guardando responsable:", datosResponsable);
        setResponsables(prev => [...prev, { ...datosResponsable, id: Date.now() }]);
        setMostrarFormulario(false);
    };

    if (mostrarFormulario) {
        return <NuevoResponsable onCancel={handleCancelar} onSave={handleGuardarResponsable} />;
    }

    return (
        <div className="page-container">
            <main className="content">
                <div className="header-section">
                    <h1 className="main-title">Gestión de Responsables</h1>
                    <p className="main-subtitle">Registro y administración de padres, madres y tutores</p>
                </div>

                <div className="actions-bar">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, teléfono o parentesco..."
                        className="search-input"
                    />
                    <button className="new-post-btn" onClick={handleNuevoResponsable}>
                        + Nuevo Responsable
                    </button>
                </div>

                <div className="table-card">
                    <div className="table-header">
                        <span className="table-title">Listado de Responsables</span>
                        <span className="table-count">{responsables.length} registros</span>
                    </div>

                    {responsables.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">👨‍👩‍👧‍👦</div>
                            <h3>No hay responsables registrados</h3>
                            <p>Comienza agregando un nuevo responsable</p>
                        </div>
                    ) : (
                        <table className="styled-table">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Parentesco</th>
                                    <th>Teléfono</th>
                                    <th>Correo</th>
                                    <th>Ocupación</th>
                                    <th>Alumnos Asociados</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {responsables.map((responsable) => (
                                    <tr key={responsable.id}>
                                        <td>{responsable.nombreCompleto || '-'}</td>
                                        <td>{responsable.parentesco || '-'}</td>
                                        <td>{responsable.telefono || '-'}</td>
                                        <td>{responsable.correo || '-'}</td>
                                        <td>{responsable.ocupacion || '-'}</td>
                                        <td>{responsable.alumnosAsociados || '0'}</td>
                                        <td>
                                            <div className="action-icons">
                                                <span className="icon-edit">✏️</span>
                                                <span className="icon-delete">🗑️</span>
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
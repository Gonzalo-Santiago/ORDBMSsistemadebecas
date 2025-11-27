import React, { useState } from "react";
import NuevoAlumno from "./Alta/NuevoAlumno/NuevoAlumno";
import "./alumnos.css";

export default function Alumnos() {
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [alumnos, setAlumnos] = useState([]);

    const handleNuevoAlumno = () => {
        setMostrarFormulario(true);
    };

    const handleCancelar = () => {
        setMostrarFormulario(false);
    };

    const handleGuardarAlumno = (datosAlumno) => {
        console.log("Guardando alumno:", datosAlumno);
        // Aquí guardas en la base de datos
        setAlumnos(prev => [...prev, { ...datosAlumno, id: Date.now() }]);
        setMostrarFormulario(false);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Activo':
                return 'status-active';
            case 'Inactivo':
                return 'status-inactive';
            default:
                return 'status-pending';
        }
    };

    if (mostrarFormulario) {
        return <NuevoAlumno onCancel={handleCancelar} onSave={handleGuardarAlumno} />;
    }

    return (
        <div className="page-container">
            <main className="content">
                <div className="header-section">
                    <h1 className="main-title">Gestión de Alumnos</h1>
                    <p className="main-subtitle">Registro y administración de estudiantes</p>
                </div>

                <div className="actions-bar">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, matrícula o carrera..."
                        className="search-input"
                    />
                    <button className="new-post-btn" onClick={handleNuevoAlumno}>
                        + Nuevo Alumno
                    </button>
                </div>

                <div className="table-card">
                    <div className="table-header">
                        <span className="table-title">Listado de Alumnos</span>
                        <span className="table-count">{alumnos.length} registros</span>
                    </div>

                    {alumnos.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">👨‍🎓</div>
                            <h3>No hay alumnos registrados</h3>
                            <p>Comienza agregando un nuevo alumno</p>
                        </div>
                    ) : (
                        <table className="styled-table">
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
                                {alumnos.map((alumno) => (
                                    <tr key={alumno.id}>
                                        <td>{alumno.matricula}</td>
                                        <td>{alumno.nombre || '-'}</td>
                                        <td>{alumno.edad || '-'}</td>
                                        <td>{alumno.carrera}</td>
                                        <td>{alumno.promedio || '-'}</td>
                                        <td>{alumno.tutor || '-'}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(alumno.status)}`}>
                                                {alumno.status}
                                            </span>
                                        </td>
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
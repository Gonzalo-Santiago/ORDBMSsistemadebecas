// NuevoAlumno.js
import React, { useState } from 'react';
import './NuevoAlumno.css';

const NuevoAlumno = ({ onCancel, onSave }) => {  // ← Cambiado onClose por onCancel
    const [activeSection, setActiveSection] = useState('personales');

    const handleCancel = () => {
        console.log('Cancelar clickeado');
        if (onCancel && typeof onCancel === 'function') {
            onCancel(); // ← Ahora usa onCancel en lugar de onClose
        } else {
            console.error('onCancel no está definido');
        }
    };

    const handleSave = (datos) => {
        if (onSave && typeof onSave === 'function') {
            onSave(datos);
        }
    };

    return (
        <div className="nuevo-alumno-container">
            <h1>Nuevo Alumno</h1>

            <div className="section-buttons">
                <button
                    className={`section-btn ${activeSection === 'personales' ? 'active' : ''}`}
                    onClick={() => setActiveSection('personales')}
                >
                    Datos Personales
                </button>
                <button
                    className={`section-btn ${activeSection === 'academicos' ? 'active' : ''}`}
                    onClick={() => setActiveSection('academicos')}
                >
                    Datos Académicos
                </button>
            </div>

            <div className="section-content">
                {activeSection === 'personales' &&
                    <DatosPersonales onCancel={handleCancel} onSave={handleSave} />
                }
                {activeSection === 'academicos' &&
                    <DatosAcademicos onCancel={handleCancel} onSave={handleSave} />
                }
            </div>
        </div>
    );
};

// Componente de Datos Personales (actualizado)
const DatosPersonales = ({ onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        correo: '',
        telefono: '',
        fechaNacimiento: '',
        direccion: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSaveClick = () => {
        if (!formData.nombreCompleto.trim()) {
            alert('El campo Nombre Completo es obligatorio');
            return;
        }
        console.log('Datos personales guardados:', formData);
        if (onSave) {
            onSave(formData);
        }
        alert('Datos personales guardados correctamente');
    };

    return (
        <div className="form-container">
            <h2>Datos Personales</h2>

            <div className="field-group">
                <label className="field-label required">Nombre Completo</label>
                <input
                    type="text"
                    className="field-input"
                    name="nombreCompleto"
                    value={formData.nombreCompleto}
                    onChange={handleChange}
                    placeholder="Nombre completo"
                />
            </div>

            <div className="field-group">
                <label className="field-label">Información de Contacto</label>
                <input
                    type="email"
                    className="field-input"
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                />
            </div>

            <div className="field-group">
                <label className="field-label">Teléfono</label>
                <input
                    type="tel"
                    className="field-input"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="(xxx) xxx-xxxx"
                />
            </div>

            <div className="field-group">
                <label className="field-label">Fecha de Nacimiento</label>
                <input
                    type="text"
                    className="field-input"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    placeholder="dd/mm/aaaa"
                />
            </div>

            <div className="field-group">
                <label className="field-label">Dirección</label>
                <textarea
                    className="field-textarea"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Dirección completa"
                    rows="3"
                />
            </div>

            <div className="button-group">
                <button
                    className="cancel-btn"
                    onClick={onCancel}
                >
                    Cancelar
                </button>
                <button
                    className="save-btn"
                    onClick={handleSaveClick}
                >
                    Guardar Alumno
                </button>
            </div>
        </div>
    );
};

// Componente de Datos Académicos (actualizado)
const DatosAcademicos = ({ onCancel, onSave }) => {
    const [academicData, setAcademicData] = useState({
        matricula: '',
        carrera: '',
        grupo: '',
        promedio: '',
        institucion: '',
        status: '',
        tutor: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAcademicData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSaveClick = () => {
        if (!academicData.matricula.trim() || !academicData.carrera.trim()) {
            alert('Los campos Matrícula y Carrera son obligatorios');
            return;
        }
        console.log('Datos académicos guardados:', academicData);
        if (onSave) {
            onSave(academicData);
        }
        alert('Datos académicos guardados correctamente');
    };

    return (
        <div className="form-container">
            <h2>Datos Académicos</h2>

            <div className="field-group">
                <label className="field-label required">Matrícula</label>
                <input
                    type="text"
                    className="field-input"
                    name="matricula"
                    value={academicData.matricula}
                    onChange={handleChange}
                    placeholder="A12345678"
                />
            </div>

            <div className="field-group">
                <label className="field-label required">Carrera</label>
                <input
                    type="text"
                    className="field-input"
                    name="carrera"
                    value={academicData.carrera}
                    onChange={handleChange}
                    placeholder="Ingeniería en Sistemas"
                />
            </div>

            <div className="field-group">
                <label className="field-label">Grupo</label>
                <input
                    type="text"
                    className="field-input"
                    name="grupo"
                    value={academicData.grupo}
                    onChange={handleChange}
                    placeholder="6A"
                />
            </div>

            <div className="field-group">
                <label className="field-label">Promedio</label>
                <input
                    type="text"
                    className="field-input"
                    name="promedio"
                    value={academicData.promedio}
                    onChange={handleChange}
                    placeholder="8.5"
                />
            </div>

            <div className="field-group">
                <label className="field-label">Institución</label>
                <input
                    type="text"
                    className="field-input"
                    name="institucion"
                    value={academicData.institucion}
                    onChange={handleChange}
                    placeholder="Universidad..."
                />
            </div>

            <div className="field-group">
                <label className="field-label">Status</label>
                <select
                    className="field-select"
                    name="status"
                    value={academicData.status}
                    onChange={handleChange}
                >
                    <option value="">Seleccionar status</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Baja">Baja</option>
                    <option value="Egresado">Egresado</option>
                </select>
            </div>

            <div className="field-group">
                <label className="field-label">Tutor Asignado</label>
                <input
                    type="text"
                    className="field-input"
                    name="tutor"
                    value={academicData.tutor}
                    onChange={handleChange}
                    placeholder="Seleccionar tutor"
                />
            </div>

            <div className="button-group">
                <button
                    className="cancel-btn"
                    onClick={onCancel}
                >
                    Cancelar
                </button>
                <button
                    className="save-btn"
                    onClick={handleSaveClick}
                >
                    Guardar Alumno
                </button>
            </div>
        </div>
    );
};

export default NuevoAlumno;
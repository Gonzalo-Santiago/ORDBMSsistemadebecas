// NuevoResponsable.js
import React, { useState } from 'react';
import './NuevoResponsable.css';

const NuevoResponsable = ({ onCancel, onSave }) => {
    const [formData, setFormData] = useState({
        nombreCompleto: '',
        parentesco: '',
        telefono: '',
        direccion: '',
        correo: '',
        ocupacion: '',
        registrarConAlumno: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        if (!formData.nombreCompleto.trim() || !formData.parentesco.trim()) {
            alert('Los campos Nombre Completo y Parentesco son obligatorios');
            return;
        }

        console.log('Datos del responsable guardados:', formData);
        if (onSave) {
            onSave(formData);
        }
        alert('Responsable guardado correctamente');
    };

    return (
        <div className="nuevo-responsable-container">
            <h1>Nuevo Responsable</h1>

            <div className="form-container">
                <h2>Datos del Responsable</h2>

                <div className="field-group">
                    <label className="field-label required">Nombre Completo</label>
                    <input
                        type="text"
                        className="field-input"
                        name="nombreCompleto"
                        value={formData.nombreCompleto}
                        onChange={handleChange}
                        placeholder="Nombre del padre/madre/tutor"
                    />
                </div>

                <div className="field-group">
                    <label className="field-label required">Parentesco</label>
                    <select
                        className="field-select"
                        name="parentesco"
                        value={formData.parentesco}
                        onChange={handleChange}
                    >
                        <option value="">Seleccionar</option>
                        <option value="Padre">Padre</option>
                        <option value="Madre">Madre</option>
                        <option value="Tutor">Tutor</option>
                        <option value="Abuelo">Abuelo</option>
                        <option value="Abuela">Abuela</option>
                        <option value="Hermano">Hermano</option>
                        <option value="Hermana">Hermana</option>
                        <option value="Otro">Otro</option>
                    </select>
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

                <div className="field-group">
                    <label className="field-label">Correo</label>
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
                    <label className="field-label">Ocupación</label>
                    <input
                        type="text"
                        className="field-input"
                        name="ocupacion"
                        value={formData.ocupacion}
                        onChange={handleChange}
                        placeholder="Profesión u ocupación"
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
                        onClick={handleSave}
                    >
                        Guardar Responsable
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NuevoResponsable; // ← CORREGIDO (sin "s" al final)
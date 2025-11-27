// NuevaBeca.js
import React, { useState } from 'react';


import './NuevaBeca.css';

const NuevaBeca = ({ onCrearBeca, onCancelar }) => {
    const [formData, setFormData] = useState({
        nombrePrograma: '',
        tipoBeca: '',
        monto: '',
        porcentaje: '',
        promedioMinimo: '',
        requisitos: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombrePrograma.trim()) {
            newErrors.nombrePrograma = 'El nombre del programa es obligatorio';
        }

        if (!formData.tipoBeca) {
            newErrors.tipoBeca = 'Debe seleccionar un tipo de beca';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validateForm()) {
            const nuevaBeca = {
                id: Date.now(),
                ...formData,
                fechaCreacion: new Date().toLocaleDateString()
            };

            onCrearBeca(nuevaBeca);

            // Resetear formulario
            setFormData({
                nombrePrograma: '',
                tipoBeca: '',
                monto: '',
                porcentaje: '',
                promedioMinimo: '',
                requisitos: ''
            });
            setErrors({});
        }
    };

    const handleCancel = () => {
        if (window.confirm('¿Está seguro de que desea cancelar? Se perderán los datos no guardados.')) {
            setFormData({
                nombrePrograma: '',
                tipoBeca: '',
                monto: '',
                porcentaje: '',
                promedioMinimo: '',
                requisitos: ''
            });
            setErrors({});
            onCancelar();
        }
    };

    return (
        <div className="nueva-beca-form-container">
            <div className="form-header">
                <h3>Nuevo Programa de Beca</h3>
                <button
                    className="close-btn"
                    onClick={handleCancel}
                >
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit} className="beca-form">
                <div className="form-group">
                    <label htmlFor="nombrePrograma">
                        Nombre del Programa *
                    </label>
                    <input
                        type="text"
                        id="nombrePrograma"
                        name="nombrePrograma"
                        value={formData.nombrePrograma}
                        onChange={handleChange}
                        className={errors.nombrePrograma ? 'error' : ''}
                        placeholder="Ingrese el nombre del programa"
                    />
                    {errors.nombrePrograma && (
                        <span className="error-message">{errors.nombrePrograma}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="tipoBeca">
                        Tipo de Beca *
                    </label>
                    <select
                        id="tipoBeca"
                        name="tipoBeca"
                        value={formData.tipoBeca}
                        onChange={handleChange}
                        className={errors.tipoBeca ? 'error' : ''}
                    >
                        <option value="">Seleccionar</option>
                        <option value="academica">Académica</option>
                        <option value="deportiva">Deportiva</option>
                        <option value="cultural">Cultural</option>
                        <option value="investigacion">Investigación</option>
                        <option value="socioeconomica">Socioeconómica</option>
                    </select>
                    {errors.tipoBeca && (
                        <span className="error-message">{errors.tipoBeca}</span>
                    )}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="monto">
                            Monto
                        </label>
                        <input
                            type="number"
                            id="monto"
                            name="monto"
                            value={formData.monto}
                            onChange={handleChange}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="porcentaje">
                            Porcentaje (%)
                        </label>
                        <input
                            type="number"
                            id="porcentaje"
                            name="porcentaje"
                            value={formData.porcentaje}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            max="100"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="promedioMinimo">
                        Promedio Mínimo
                    </label>
                    <input
                        type="number"
                        id="promedioMinimo"
                        name="promedioMinimo"
                        value={formData.promedioMinimo}
                        onChange={handleChange}
                        placeholder="0.0"
                        min="0"
                        max="10"
                        step="0.1"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="requisitos">
                        Requisitos
                    </label>
                    <textarea
                        id="requisitos"
                        name="requisitos"
                        value={formData.requisitos}
                        onChange={handleChange}
                        placeholder="Describa los requisitos para la beca..."
                        rows="4"
                    />
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-cancelar"
                        onClick={handleCancel}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-crear"
                    >
                        Crear
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NuevaBeca;
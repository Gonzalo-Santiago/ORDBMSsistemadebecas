import React, { useState } from 'react';
import './NuevaPostulacion.css';

const NuevaPostulacion = ({ onPostular, onCancelar }) => {
    const [formData, setFormData] = useState({
        alumnoId: '',
        programaId: '',
        observaciones: ''
    });

    const [errors, setErrors] = useState({});
    const [isVerificando, setIsVerificando] = useState(false);

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

    const verificarRequisitos = async () => {
        setIsVerificando(true);
        return new Promise((resolve) => {
            setTimeout(() => {
                setIsVerificando(false);
                const cumpleRequisitos = Math.random() > 0.3;
                resolve(cumpleRequisitos);
            }, 1500);
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.alumnoId) {
            newErrors.alumnoId = 'Debe seleccionar un alumno';
        }

        if (!formData.programaId) {
            newErrors.programaId = 'Debe seleccionar un programa de beca';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const cumpleRequisitos = await verificarRequisitos();

            if (cumpleRequisitos) {
                const postulacion = {
                    id: Date.now(),
                    ...formData,
                    fechaPostulacion: new Date().toLocaleDateString(),
                    status: 'pendiente'
                };

                onPostular(postulacion);
            } else {
                alert('El alumno no cumple con los requisitos del programa seleccionado');
            }
        } catch (error) {
            console.error('Error al verificar requisitos:', error);
            alert('Error al verificar los requisitos. Intente nuevamente.');
        }
    };

    const handleCancel = () => {
        if (window.confirm('¿Está seguro de que desea cancelar? Se perderán los datos no guardados.')) {
            onCancelar();
        }
    };

    return (
        <div className="nueva-postulacion-page">
            <div className="form-header">
                <h1 className="main-title">Nueva Postulación a Beca</h1>
                <p className="main-subtitle">Complete los datos para crear una nueva postulación</p>
            </div>

            <div className="nueva-postulacion-container">
                <form onSubmit={handleSubmit} className="postulacion-form">
                    <div className="form-group">
                        <label htmlFor="alumnoId">
                            Alumno (OID Referencia) *
                        </label>
                        <select
                            id="alumnoId"
                            name="alumnoId"
                            value={formData.alumnoId}
                            onChange={handleChange}
                            className={errors.alumnoId ? 'error' : ''}
                            disabled={isVerificando}
                        >
                            <option value="">Seleccionar alumno</option>
                            {/* Los datos de alumnos vendrán de tu API */}
                        </select>
                        {errors.alumnoId && (
                            <span className="error-message">{errors.alumnoId}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="programaId">
                            Programa de Beca (OID Referencia) *
                        </label>
                        <select
                            id="programaId"
                            name="programaId"
                            value={formData.programaId}
                            onChange={handleChange}
                            className={errors.programaId ? 'error' : ''}
                            disabled={isVerificando}
                        >
                            <option value="">Seleccionar programa</option>
                            {/* Los datos de programas vendrán de tu API */}
                        </select>
                        {errors.programaId && (
                            <span className="error-message">{errors.programaId}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="observaciones">
                            Observaciones
                        </label>
                        <textarea
                            id="observaciones"
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            placeholder="Notas adicionales sobre la postulación..."
                            rows="4"
                            disabled={isVerificando}
                        />
                    </div>



                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancelar"
                            onClick={handleCancel}
                            disabled={isVerificando}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-postular"
                            disabled={isVerificando}
                        >
                            {isVerificando ? (
                                <>
                                    <div className="loading-spinner"></div>
                                    Verificando...
                                </>
                            ) : (
                                'Postular a Beca'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NuevaPostulacion;
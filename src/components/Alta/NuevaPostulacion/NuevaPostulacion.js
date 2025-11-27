import React, { useState, useEffect } from 'react';
import './NuevaPostulacion.css';

const NuevaPostulacion = ({ onPostular, onCancelar }) => {
    const [formData, setFormData] = useState({
        alumno_id: '',  // Cambiado a alumno_id para coincidir con tu API
        programa_id: '', // Cambiado a programa_id para coincidir con tu API
        observaciones: ''
    });

    const [alumnos, setAlumnos] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [errors, setErrors] = useState({});
    const [isVerificando, setIsVerificando] = useState(false);
    const [loading, setLoading] = useState(true);

    // Cargar alumnos y programas desde la API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Cargar alumnos y programas en paralelo
                const [alumnosRes, programasRes] = await Promise.all([
                    fetch('http://localhost:5000/api/alumnos'),
                    fetch('http://localhost:5000/api/programas-beca')
                ]);

                if (!alumnosRes.ok || !programasRes.ok) {
                    throw new Error('Error al cargar datos');
                }

                const alumnosData = await alumnosRes.json();
                const programasData = await programasRes.json();

                setAlumnos(alumnosData);
                setProgramas(programasData);
                setLoading(false);

            } catch (error) {
                console.error('Error cargando datos:', error);
                alert('Error al cargar datos: ' + error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    const verificarRequisitos = async (alumnoId, programaId) => {
        try {
            // Usar tu función de verificación de requisitos del backend
            const response = await fetch(`http://localhost:5000/api/verificar-requisitos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    alumno_id: parseInt(alumnoId),
                    programa_id: parseInt(programaId)
                })
            });

            if (response.ok) {
                const result = await response.json();
                return result.cumple_requisitos;
            } else {
                // Si no existe el endpoint, hacer verificación básica
                const alumno = alumnos.find(a => a.id === parseInt(alumnoId));
                const programa = programas.find(p => p.id === parseInt(programaId));

                if (alumno && programa) {
                    return alumno.promedio >= programa.promedio_minimo;
                }
                return false;
            }
        } catch (error) {
            console.error('Error verificando requisitos:', error);
            // Verificación básica como fallback
            const alumno = alumnos.find(a => a.id === parseInt(alumnoId));
            const programa = programas.find(p => p.id === parseInt(programaId));

            if (alumno && programa) {
                return alumno.promedio >= (programa.promedio_minimo || 0);
            }
            return false;
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.alumno_id) {
            newErrors.alumno_id = 'Debe seleccionar un alumno';
        }

        if (!formData.programa_id) {
            newErrors.programa_id = 'Debe seleccionar un programa de beca';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsVerificando(true);

            const cumpleRequisitos = await verificarRequisitos(formData.alumno_id, formData.programa_id);

            if (cumpleRequisitos) {
                const postulacion = {
                    alumno_id: parseInt(formData.alumno_id),
                    programa_id: parseInt(formData.programa_id),
                    observaciones: formData.observaciones,
                    estado: 'Pendiente'  // Usar 'estado' en lugar de 'status' si es necesario
                };

                onPostular(postulacion);
            } else {
                alert('El alumno no cumple con los requisitos del programa seleccionado');
            }
        } catch (error) {
            console.error('Error al verificar requisitos:', error);
            alert('Error al verificar los requisitos. Intente nuevamente.');
        } finally {
            setIsVerificando(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('¿Está seguro de que desea cancelar? Se perderán los datos no guardados.')) {
            onCancelar();
        }
    };

    if (loading) {
        return (
            <div className="nueva-postulacion-page">
                <div className="loading">Cargando datos...</div>
            </div>
        );
    }

    return (
        <div className="nueva-postulacion-page">
            <div className="form-header">
                <h1 className="main-title">Nueva Postulación a Beca</h1>
                <p className="main-subtitle">Complete los datos para crear una nueva postulación</p>
            </div>

            <div className="nueva-postulacion-container">
                <form onSubmit={handleSubmit} className="postulacion-form">
                    <div className="form-group">
                        <label htmlFor="alumno_id">
                            Alumno *
                        </label>
                        <select
                            id="alumno_id"
                            name="alumno_id"
                            value={formData.alumno_id}
                            onChange={handleChange}
                            className={errors.alumno_id ? 'error' : ''}
                            disabled={isVerificando}
                        >
                            <option value="">Seleccionar alumno</option>
                            {alumnos.map(alumno => (
                                <option key={alumno.id} value={alumno.id}>
                                    {alumno.nombre} - {alumno.matricula} (Promedio: {alumno.promedio ? parseFloat(alumno.promedio).toFixed(2) : 'N/A'})
                                </option>
                            ))}
                        </select>
                        {errors.alumno_id && (
                            <span className="error-message">{errors.alumno_id}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="programa_id">
                            Programa de Beca *
                        </label>
                        <select
                            id="programa_id"
                            name="programa_id"
                            value={formData.programa_id}
                            onChange={handleChange}
                            className={errors.programa_id ? 'error' : ''}
                            disabled={isVerificando}
                        >
                            <option value="">Seleccionar programa</option>
                            {programas.map(programa => (
                                <option key={programa.id} value={programa.id}>
                                    {programa.nombre_programa} - {programa.tipo_beca} (Mín: {programa.promedio_minimo || 0})
                                </option>
                            ))}
                        </select>
                        {errors.programa_id && (
                            <span className="error-message">{errors.programa_id}</span>
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
                                    Verificando requisitos...
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
import React, { useState, useEffect } from 'react';
import './NuevaPostulacion.css'; // Reutiliza los mismos estilos

const EditarPostulacion = ({ postulacion, onActualizar, onCancelar }) => {
    const [formData, setFormData] = useState({
        alumno_id: '',
        programa_id: '',
        status: 'Pendiente',
        monto_asignado: '',
        observaciones: '',
        fecha_asignacion: ''
    });

    const [alumnos, setAlumnos] = useState([]);
    const [programas, setProgramas] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Cargar alumnos, programas y datos de la postulación
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

                // Cargar datos de la postulación actual
                if (postulacion) {
                    setFormData({
                        alumno_id: postulacion.alumno_id?.toString() || '',
                        programa_id: postulacion.programa_id?.toString() || '',
                        status: postulacion.status || 'Pendiente',
                        monto_asignado: postulacion.monto_asignado?.toString() || '',
                        observaciones: postulacion.observaciones || '',
                        fecha_asignacion: postulacion.fecha_asignacion ?
                            new Date(postulacion.fecha_asignacion).toISOString().split('T')[0] : ''
                    });
                }

                setLoading(false);

            } catch (error) {
                console.error('Error cargando datos:', error);
                alert('Error al cargar datos: ' + error.message);
                setLoading(false);
            }
        };

        fetchData();
    }, [postulacion]);

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

        if (!formData.alumno_id) {
            newErrors.alumno_id = 'Debe seleccionar un alumno';
        }

        if (!formData.programa_id) {
            newErrors.programa_id = 'Debe seleccionar un programa de beca';
        }

        if (formData.monto_asignado && isNaN(parseFloat(formData.monto_asignado))) {
            newErrors.monto_asignado = 'El monto debe ser un número válido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setSaving(true);

            const datosActualizados = {
                alumno_id: parseInt(formData.alumno_id),
                programa_id: parseInt(formData.programa_id),
                status: formData.status,
                observaciones: formData.observaciones
            };

            // Solo incluir monto_asignado si tiene valor
            if (formData.monto_asignado) {
                datosActualizados.monto_asignado = parseFloat(formData.monto_asignado);
            }

            // Solo incluir fecha_asignacion si tiene valor
            if (formData.fecha_asignacion) {
                datosActualizados.fecha_asignacion = formData.fecha_asignacion;
            }

            const response = await fetch(`http://localhost:5000/api/postulaciones/${postulacion.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizados)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar postulación');
            }

            const result = await response.json();
            console.log('✅ Postulación actualizada:', result);

            onActualizar(result.postulacion);
            alert('Postulación actualizada exitosamente');

        } catch (error) {
            console.error('Error actualizando postulación:', error);
            alert('Error al actualizar postulación: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('¿Está seguro de que desea cancelar? Se perderán los cambios no guardados.')) {
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
                <h1 className="main-title">Editar Postulación</h1>
                <p className="main-subtitle">Modifique los datos de la postulación</p>
            </div>

            <div className="nueva-postulacion-container">
                <form onSubmit={handleSubmit} className="postulacion-form">
                    <div className="form-group">
                        <label htmlFor="alumno_id">Alumno *</label>
                        <select
                            id="alumno_id"
                            name="alumno_id"
                            value={formData.alumno_id}
                            onChange={handleChange}
                            className={errors.alumno_id ? 'error' : ''}
                            disabled={saving}
                        >
                            <option value="">Seleccionar alumno</option>
                            {alumnos.map(alumno => (
                                <option key={alumno.id} value={alumno.id}>
                                    {alumno.nombre} - {alumno.matricula}
                                </option>
                            ))}
                        </select>
                        {errors.alumno_id && (
                            <span className="error-message">{errors.alumno_id}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="programa_id">Programa de Beca *</label>
                        <select
                            id="programa_id"
                            name="programa_id"
                            value={formData.programa_id}
                            onChange={handleChange}
                            className={errors.programa_id ? 'error' : ''}
                            disabled={saving}
                        >
                            <option value="">Seleccionar programa</option>
                            {programas.map(programa => (
                                <option key={programa.id} value={programa.id}>
                                    {programa.nombre_programa} - {programa.tipo_beca}
                                </option>
                            ))}
                        </select>
                        {errors.programa_id && (
                            <span className="error-message">{errors.programa_id}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Estado</label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            disabled={saving}
                        >
                            <option value="Pendiente">Pendiente</option>
                            <option value="Aprobada">Aprobada</option>
                            <option value="Vigente">Vigente</option>
                            <option value="Rechazada">Rechazada</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="monto_asignado">Monto Asignado</label>
                        <input
                            type="number"
                            id="monto_asignado"
                            name="monto_asignado"
                            value={formData.monto_asignado}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className={errors.monto_asignado ? 'error' : ''}
                            disabled={saving}
                        />
                        {errors.monto_asignado && (
                            <span className="error-message">{errors.monto_asignado}</span>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="fecha_asignacion">Fecha de Asignación</label>
                        <input
                            type="date"
                            id="fecha_asignacion"
                            name="fecha_asignacion"
                            value={formData.fecha_asignacion}
                            onChange={handleChange}
                            disabled={saving}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="observaciones">Observaciones</label>
                        <textarea
                            id="observaciones"
                            name="observaciones"
                            value={formData.observaciones}
                            onChange={handleChange}
                            placeholder="Notas adicionales sobre la postulación..."
                            rows="4"
                            disabled={saving}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancelar"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="btn-postular"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <div className="loading-spinner"></div>
                                    Guardando...
                                </>
                            ) : (
                                'Actualizar Postulación'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarPostulacion;
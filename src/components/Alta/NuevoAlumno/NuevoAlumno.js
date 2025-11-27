import React, { useState, useEffect } from 'react';
import './NuevoAlumno.css';

const NuevoAlumno = ({ onCancel, onSave }) => {
    const [tutores, setTutores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Datos Personales
        nombreCompleto: '',
        correo: '',
        telefono: '',
        direccion: '',
        fechaNacimiento: '',
        // Datos Académicos
        matricula: '',
        grupo: '',
        institucion: '',
        tutor_id: '',
        carrera: '',
        promedio: '',
        status: 'activo'
    });

    // Cargar tutores para el selector
    useEffect(() => {
        const fetchTutores = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/tutores');
                if (response.ok) {
                    const data = await response.json();
                    setTutores(data);
                }
            } catch (error) {
                console.error('Error cargando tutores:', error);
            }
        };

        fetchTutores();
    }, []);

    const handleCancel = () => {
        if (onCancel && typeof onCancel === 'function') {
            onCancel();
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);

            // Validaciones
            if (!formData.nombreCompleto.trim()) {
                alert('El campo Nombre Completo es obligatorio');
                setLoading(false);
                return;
            }

            if (!formData.matricula.trim()) {
                alert('El campo Matrícula es obligatorio');
                setLoading(false);
                return;
            }

            if (!formData.carrera.trim()) {
                alert('El campo Carrera es obligatorio');
                setLoading(false);
                return;
            }

            const datosParaAPI = {
                nombre: formData.nombreCompleto,
                email: formData.correo,
                telefono: formData.telefono,
                direccion: formData.direccion,
                grupo: formData.grupo,
                carrera: formData.carrera,
                promedio: parseFloat(formData.promedio) || null,
                matricula: formData.matricula,
                tutor_id: parseInt(formData.tutor_id) || null,
                institucion: formData.institucion,
                status: formData.status,
                fecha_nacimiento: formData.fechaNacimiento
            };

            console.log('Enviando datos a la API:', datosParaAPI);

            const response = await fetch('http://localhost:5000/api/alumnos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosParaAPI)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear alumno');
            }

            const resultado = await response.json();

            if (onSave && typeof onSave === 'function') {
                onSave(resultado);
            }

            alert('Alumno creado exitosamente');

        } catch (error) {
            console.error('Error creando alumno:', error);
            alert('Error al crear alumno: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="nuevo-alumno-compact">
            <div className="modal-header">
                <h2>Nuevo Alumno</h2>
                <button className="btn-cerrar" onClick={handleCancel}>×</button>
            </div>

            <div className="form-compact-grid">
                {/* Columna izquierda - Datos Personales */}
                <div className="form-compact-column">
                    <div className="section-compact">
                        <h3>Datos Personales</h3>
                        <div className="field-compact">
                            <label className="field-label required">Nombre Completo</label>
                            <input
                                type="text"
                                className="field-input"
                                name="nombreCompleto"
                                value={formData.nombreCompleto}
                                onChange={handleChange}
                                placeholder="Nombre completo"
                                disabled={loading}
                            />
                        </div>

                        <div className="field-compact">
                            <label className="field-label">Correo</label>
                            <input
                                type="email"
                                className="field-input"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                placeholder="correo@ejemplo.com"
                                disabled={loading}
                            />
                        </div>

                        <div className="field-compact">
                            <label className="field-label">Teléfono</label>
                            <input
                                type="tel"
                                className="field-input"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                placeholder="(xxx) xxx-xxxx"
                                disabled={loading}
                            />
                        </div>

                        <div className="field-compact">
                            <label className="field-label">Fecha Nacimiento</label>
                            <input
                                type="date"
                                className="field-input"
                                name="fechaNacimiento"
                                value={formData.fechaNacimiento}
                                onChange={handleChange}
                                disabled={loading}
                            />
                        </div>

                        <div className="field-compact">
                            <label className="field-label">Dirección</label>
                            <textarea
                                className="field-textarea"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                placeholder="Dirección completa"
                                rows="2"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                {/* Columna derecha - Datos Académicos */}
                <div className="form-compact-column">
                    <div className="section-compact">
                        <h3>Datos Académicos</h3>
                        <div className="field-compact">
                            <label className="field-label required">Matrícula</label>
                            <input
                                type="text"
                                className="field-input"
                                name="matricula"
                                value={formData.matricula}
                                onChange={handleChange}
                                placeholder="A12345678"
                                disabled={loading}
                            />
                        </div>

                        <div className="field-compact">
                            <label className="field-label">Grupo</label>
                            <input
                                type="text"
                                className="field-input"
                                name="grupo"
                                value={formData.grupo}
                                onChange={handleChange}
                                placeholder="6A"
                                disabled={loading}
                            />
                        </div>

                        <div className="field-compact">
                            <label className="field-label">Institución</label>
                            <input
                                type="text"
                                className="field-input"
                                name="institucion"
                                value={formData.institucion}
                                onChange={handleChange}
                                placeholder="Universidad..."
                                disabled={loading}
                            />
                        </div>

                        <div className="field-compact">
                            <label className="field-label">Tutor</label>
                            <select
                                className="field-select"
                                name="tutor_id"
                                value={formData.tutor_id}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="">Seleccionar tutor</option>
                                {tutores.map(tutor => (
                                    <option key={tutor.id} value={tutor.id}>
                                        {tutor.nombre} {tutor.parentesco ? `- ${tutor.parentesco}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="field-compact">
                            <label className="field-label required">Carrera</label>
                            <input
                                type="text"
                                className="field-input"
                                name="carrera"
                                value={formData.carrera}
                                onChange={handleChange}
                                placeholder="Ingeniería en Sistemas"
                                disabled={loading}
                            />
                        </div>

                        <div className="field-compact">
                            <label className="field-label">Promedio</label>
                            <input
                                type="number"
                                step="0.01"
                                className="field-input"
                                name="promedio"
                                value={formData.promedio}
                                onChange={handleChange}
                                placeholder="8.5"
                                min="0"
                                max="10"
                                disabled={loading}
                            />
                        </div>

                        <div className="field-compact">
                            <label className="field-label">Status</label>
                            <select
                                className="field-select"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={loading}
                            >
                                <option value="activo">Activo</option>
                                <option value="inactivo">Inactivo</option>
                                <option value="egresado">Egresado</option>
                                <option value="baja">Baja</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="modal-actions">
                <button
                    className="btn-cancel"
                    onClick={handleCancel}
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    className="btn-save"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? 'Guardando...' : 'Guardar Alumno'}
                </button>
            </div>
        </div>
    );
};

export default NuevoAlumno;
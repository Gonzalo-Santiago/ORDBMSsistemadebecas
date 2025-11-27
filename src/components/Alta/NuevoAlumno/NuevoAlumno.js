import React, { useState, useEffect } from 'react';
import './NuevoAlumno.css';

const NuevoAlumno = ({ onCancel, onSave }) => {
    const [activeSection, setActiveSection] = useState('personales');
    const [tutores, setTutores] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        // Datos Personales
        nombreCompleto: '',
        fechaNacimiento: '',
        edad: '',
        correo: '',
        telefono: '',
        direccion: '',
        // Datos Académicos
        matricula: '',
        institucion: '',
        carrera: '',
        grupo: '',
        promedio: '',
        tutor_id: '',
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

    // Calcular edad automáticamente desde fecha de nacimiento
    useEffect(() => {
        if (formData.fechaNacimiento) {
            const birthDate = new Date(formData.fechaNacimiento);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }

            setFormData(prev => ({ ...prev, edad: age.toString() }));
        }
    }, [formData.fechaNacimiento]);

    const handleCancel = () => {
        console.log('Cancelar clickeado');
        if (onCancel && typeof onCancel === 'function') {
            onCancel();
        } else {
            console.error('onCancel no está definido');
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
                edad: parseInt(formData.edad) || null,
                email: formData.correo,
                telefono: formData.telefono,
                direccion: formData.direccion,
                grupo: formData.grupo,
                carrera: formData.carrera,
                promedio: parseFloat(formData.promedio) || null,
                matricula: formData.matricula,
                tutor_id: parseInt(formData.tutor_id) || null,
                institucion: formData.institucion,
                status: formData.status
            };

            console.log('Enviando datos a la API:', datosParaAPI);

            // Llamar a la API para crear el alumno
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
            console.log('Alumno creado exitosamente:', resultado);

            // Llamar al callback onSave si existe
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

    const updateFormData = (sectionData) => {
        setFormData(prev => ({
            ...prev,
            ...sectionData
        }));
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
                    <DatosPersonales
                        formData={formData}
                        onUpdate={updateFormData}
                        onCancel={handleCancel}
                        loading={loading}
                        onNext={() => setActiveSection('academicos')}
                    />
                }
                {activeSection === 'academicos' &&
                    <DatosAcademicos
                        formData={formData}
                        onUpdate={updateFormData}
                        onCancel={handleCancel}
                        onSave={handleSave}
                        tutores={tutores}
                        loading={loading}
                        onBack={() => setActiveSection('personales')}
                    />
                }
            </div>
        </div>
    );
};

// Componente de Datos Personales (completo)
const DatosPersonales = ({ formData, onUpdate, onCancel, loading, onNext }) => {
    const [localData, setLocalData] = useState(formData);

    useEffect(() => {
        setLocalData(formData);
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newData = {
            ...localData,
            [name]: value
        };
        setLocalData(newData);
        onUpdate(newData);
    };

    const handleNext = () => {
        if (!localData.nombreCompleto.trim()) {
            alert('El campo Nombre Completo es obligatorio');
            return;
        }
        onNext();
    };

    return (
        <div className="form-container">
            <h2>Datos Personales</h2>

            <div className="form-grid">
                <div className="form-column">
                    <div className="field-group">
                        <label className="field-label required">Nombre Completo</label>
                        <input
                            type="text"
                            className="field-input"
                            name="nombreCompleto"
                            value={localData.nombreCompleto}
                            onChange={handleChange}
                            placeholder="Nombre completo"
                            disabled={loading}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Fecha de Nacimiento</label>
                        <input
                            type="date"
                            className="field-input"
                            name="fechaNacimiento"
                            value={localData.fechaNacimiento}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Edad</label>
                        <input
                            type="number"
                            className="field-input"
                            name="edad"
                            value={localData.edad}
                            onChange={handleChange}
                            placeholder="Edad"
                            min="15"
                            max="60"
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="form-column">
                    <div className="field-group">
                        <label className="field-label">Correo Electrónico</label>
                        <input
                            type="email"
                            className="field-input"
                            name="correo"
                            value={localData.correo}
                            onChange={handleChange}
                            placeholder="correo@ejemplo.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Teléfono</label>
                        <input
                            type="tel"
                            className="field-input"
                            name="telefono"
                            value={localData.telefono}
                            onChange={handleChange}
                            placeholder="(xxx) xxx-xxxx"
                            disabled={loading}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Dirección</label>
                        <textarea
                            className="field-textarea"
                            name="direccion"
                            value={localData.direccion}
                            onChange={handleChange}
                            placeholder="Dirección completa"
                            rows="3"
                            disabled={loading}
                        />
                    </div>
                </div>
            </div>

            <div className="button-group">
                <button
                    className="cancel-btn"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    className="next-btn"
                    onClick={handleNext}
                    disabled={loading}
                >
                    Siguiente - Datos Académicos
                </button>
            </div>
        </div>
    );
};

// Componente de Datos Académicos (completo)
const DatosAcademicos = ({ formData, onUpdate, onCancel, onSave, tutores, loading, onBack }) => {
    const [localData, setLocalData] = useState(formData);

    useEffect(() => {
        setLocalData(formData);
    }, [formData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newData = {
            ...localData,
            [name]: value
        };
        setLocalData(newData);
        onUpdate(newData);
    };

    const handleSave = () => {
        if (!localData.matricula.trim()) {
            alert('El campo Matrícula es obligatorio');
            return;
        }

        if (!localData.carrera.trim()) {
            alert('El campo Carrera es obligatorio');
            return;
        }

        onSave();
    };

    return (
        <div className="form-container">
            <h2>Datos Académicos</h2>

            <div className="form-grid">
                <div className="form-column">
                    <div className="field-group">
                        <label className="field-label required">Matrícula</label>
                        <input
                            type="text"
                            className="field-input"
                            name="matricula"
                            value={localData.matricula}
                            onChange={handleChange}
                            placeholder="A12345678"
                            disabled={loading}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Grupo</label>
                        <input
                            type="text"
                            className="field-input"
                            name="grupo"
                            value={localData.grupo}
                            onChange={handleChange}
                            placeholder="6A"
                            disabled={loading}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Institución</label>
                        <input
                            type="text"
                            className="field-input"
                            name="institucion"
                            value={localData.institucion}
                            onChange={handleChange}
                            placeholder="Universidad..."
                            disabled={loading}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Tutor Asignado</label>
                        <select
                            className="field-select"
                            name="tutor_id"
                            value={localData.tutor_id}
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
                </div>

                <div className="form-column">
                    <div className="field-group">
                        <label className="field-label required">Carrera</label>
                        <input
                            type="text"
                            className="field-input"
                            name="carrera"
                            value={localData.carrera}
                            onChange={handleChange}
                            placeholder="Ingeniería en Sistemas"
                            disabled={loading}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Promedio</label>
                        <input
                            type="number"
                            step="0.01"
                            className="field-input"
                            name="promedio"
                            value={localData.promedio}
                            onChange={handleChange}
                            placeholder="8.5"
                            min="0"
                            max="10"
                            disabled={loading}
                        />
                    </div>

                    <div className="field-group">
                        <label className="field-label">Status</label>
                        <select
                            className="field-select"
                            name="status"
                            value={localData.status}
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

            <div className="button-group">
                <button
                    className="back-btn"
                    onClick={onBack}
                    disabled={loading}
                >
                    Atrás
                </button>
                <button
                    className="cancel-btn"
                    onClick={onCancel}
                    disabled={loading}
                >
                    Cancelar
                </button>
                <button
                    className="save-btn"
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
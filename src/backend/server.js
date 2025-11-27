import express from 'express';
import cors from 'cors';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'sistema_becas',
    password: '6011',
    port: 5433,
});

// Verificar conexión a la base de datos
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error conectando a PostgreSQL:', err.stack);
    } else {
        console.log('✅ Conectado a PostgreSQL correctamente');
        release();
    }
});

// Ruta de prueba del servidor
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Backend del Sistema de Becas funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Ruta para verificar conexión a la base de datos
app.get('/api/db-test', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW() as current_time');
        res.json({
            message: 'Conexión a PostgreSQL exitosa',
            currentTime: result.rows[0].current_time
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📚 RUTAS PARA ALUMNOS
app.get('/api/alumnos', async (req, res) => {
    try {
        console.log('🔍 Solicitando lista de alumnos...');
        const result = await pool.query(`
            SELECT 
                p.id,
                p.nombre,
                p.edad,
                (p.contacto).correo as email,
                (p.contacto).telefono,
                (p.contacto).direccion,
                a.grupo,
                a.carrera,
                a.promedio,
                a.matricula,
                t.nombre as tutor_nombre
            FROM sistema_becas.Persona p
            JOIN sistema_becas.Alumno a ON p.id = a.persona_id
            LEFT JOIN sistema_becas.Tutor t ON a.tutor_id = t.id
            ORDER BY p.id DESC
        `);
        console.log(`✅ Alumnos encontrados: ${result.rows.length}`);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error en /api/alumnos:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/alumnos/:id', async (req, res) => {
    try {
        const alumnoId = parseInt(req.params.id);
        console.log('🔍 Solicitando alumno ID:', alumnoId);

        const result = await pool.query(`
            SELECT 
                p.id,
                p.nombre,
                p.edad,
                (p.contacto).correo as email,
                (p.contacto).telefono,
                (p.contacto).direccion,
                a.grupo,
                a.carrera,
                a.promedio,
                a.matricula,
                a.tutor_id
            FROM sistema_becas.Persona p
            JOIN sistema_becas.Alumno a ON p.id = a.persona_id
            WHERE p.id = $1
        `, [alumnoId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        console.log('✅ Alumno encontrado:', result.rows[0]);
        res.json(result.rows[0]);

    } catch (err) {
        console.error('❌ Error en GET /api/alumnos/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/alumnos', async (req, res) => {
    try {
        console.log('📥 Recibiendo datos para nuevo alumno:', req.body);

        const { tutor_id, nombre, edad, email, telefono, direccion, grupo, carrera, promedio, matricula } = req.body;

        if (!nombre || !matricula) {
            return res.status(400).json({ error: 'Nombre y matrícula son campos obligatorios' });
        }

        console.log('🔧 Intentando crear alumno con datos:', {
            tutor_id, nombre, edad, email, telefono, direccion, grupo, carrera, promedio, matricula
        });

        // Inserción directa
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Insertar en Persona (superclase)
            const personaResult = await client.query(
                `INSERT INTO sistema_becas.Persona (nombre, edad, contacto) 
                 VALUES ($1, $2, ROW($3, $4, $5)::sistema_becas.TipoContacto) 
                 RETURNING id`,
                [nombre, edad, email, telefono, direccion]
            );

            const personaId = personaResult.rows[0].id;

            // 2. Insertar en Alumno (subclase)
            await client.query(
                `INSERT INTO sistema_becas.Alumno (persona_id, grupo, carrera, promedio, matricula, tutor_id) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [personaId, grupo, carrera, promedio, matricula, tutor_id]
            );

            await client.query('COMMIT');

            console.log('✅ Alumno creado con inserción directa. ID:', personaId);

            res.json({
                message: 'Alumno creado exitosamente',
                alumno_id: personaId
            });

        } catch (insertError) {
            await client.query('ROLLBACK');
            throw insertError;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error('❌ Error en POST /api/alumnos:', err);
        res.status(500).json({ error: err.message });
    }
});

// 📝 RUTA PARA ACTUALIZAR ALUMNOS
app.put('/api/alumnos/:id', async (req, res) => {
    try {
        const alumnoId = parseInt(req.params.id);
        const { nombre, edad, email, telefono, direccion, grupo, carrera, promedio, matricula, tutor_id } = req.body;

        console.log('✏️ Actualizando alumno ID:', alumnoId, 'con datos:', req.body);

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Actualizar Persona
            await client.query(
                `UPDATE sistema_becas.Persona 
                 SET nombre = $1, edad = $2, contacto = ROW($3, $4, $5)::sistema_becas.TipoContacto
                 WHERE id = $6`,
                [nombre, edad, email, telefono, direccion, alumnoId]
            );

            // 2. Actualizar Alumno
            await client.query(
                `UPDATE sistema_becas.Alumno 
                 SET grupo = $1, carrera = $2, promedio = $3, matricula = $4, tutor_id = $5
                 WHERE persona_id = $6`,
                [grupo, carrera, promedio, matricula, tutor_id, alumnoId]
            );

            await client.query('COMMIT');

            console.log('✅ Alumno actualizado correctamente ID:', alumnoId);
            res.json({
                message: 'Alumno actualizado exitosamente',
                alumno_id: alumnoId
            });

        } catch (updateError) {
            await client.query('ROLLBACK');
            throw updateError;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error('❌ Error en PUT /api/alumnos/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/alumnos/:id', async (req, res) => {
    try {
        const alumnoId = parseInt(req.params.id);
        console.log('🗑️ Solicitando eliminar alumno ID:', alumnoId);

        if (!alumnoId) {
            return res.status(400).json({ error: 'ID de alumno inválido' });
        }

        const result = await pool.query(
            'DELETE FROM sistema_becas.Persona WHERE id = $1 RETURNING *',
            [alumnoId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Alumno no encontrado' });
        }

        console.log('✅ Alumno eliminado correctamente ID:', alumnoId);
        res.json({
            message: 'Alumno eliminado exitosamente',
            alumno_eliminado: result.rows[0]
        });

    } catch (err) {
        console.error('❌ Error en DELETE /api/alumnos:', err);
        res.status(500).json({ error: err.message });
    }
});

// 🎓 RUTAS PARA PROGRAMAS DE BECA
app.get('/api/programas-beca', async (req, res) => {
    try {
        console.log('🔍 Solicitando programas de beca...');
        const result = await pool.query(`
            SELECT * FROM sistema_becas.ProgramaBeca 
            ORDER BY id DESC
        `);
        console.log(`✅ Programas encontrados: ${result.rows.length}`);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error en /api/programas-beca:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/programas-beca/:id', async (req, res) => {
    try {
        const programaId = parseInt(req.params.id);
        console.log('🔍 Solicitando programa ID:', programaId);

        const result = await pool.query(
            'SELECT * FROM sistema_becas.ProgramaBeca WHERE id = $1',
            [programaId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Programa no encontrado' });
        }

        console.log('✅ Programa encontrado:', result.rows[0]);
        res.json(result.rows[0]);

    } catch (err) {
        console.error('❌ Error en GET /api/programas-beca/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/programas-beca', async (req, res) => {
    try {
        const { nombre_programa, monto, tipo_beca, porcentaje, promedio_minimo, requisitos } = req.body;

        const result = await pool.query(
            `INSERT INTO sistema_becas.ProgramaBeca 
                (nombre_programa, monto, tipo_beca, porcentaje, promedio_minimo, requisitos) 
                VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [nombre_programa, monto, tipo_beca, porcentaje, promedio_minimo, requisitos]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error creando programa:', err);
        res.status(500).json({ error: err.message });
    }
});

// 📝 RUTA PARA ACTUALIZAR PROGRAMAS DE BECA
app.put('/api/programas-beca/:id', async (req, res) => {
    try {
        const programaId = parseInt(req.params.id);
        const { nombre_programa, monto, tipo_beca, porcentaje, promedio_minimo, requisitos } = req.body;

        console.log('✏️ Actualizando programa ID:', programaId, 'con datos:', req.body);

        const result = await pool.query(
            `UPDATE sistema_becas.ProgramaBeca 
             SET nombre_programa = $1, monto = $2, tipo_beca = $3, 
                 porcentaje = $4, promedio_minimo = $5, requisitos = $6
             WHERE id = $7 RETURNING *`,
            [nombre_programa, monto, tipo_beca, porcentaje, promedio_minimo, requisitos, programaId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Programa no encontrado' });
        }

        console.log('✅ Programa actualizado correctamente ID:', programaId);
        res.json({
            message: 'Programa actualizado exitosamente',
            programa: result.rows[0]
        });

    } catch (err) {
        console.error('❌ Error en PUT /api/programas-beca/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/programas-beca/:id', async (req, res) => {
    try {
        const programaId = parseInt(req.params.id);
        const result = await pool.query(
            'DELETE FROM sistema_becas.ProgramaBeca WHERE id = $1 RETURNING *',
            [programaId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Programa no encontrado' });
        }

        res.json({ message: 'Programa eliminado exitosamente', programa_eliminado: result.rows[0] });
    } catch (err) {
        console.error('❌ Error eliminando programa:', err);
        res.status(500).json({ error: err.message });
    }
});

// 👨‍🏫 RUTAS PARA TUTORES
app.get('/api/tutores', async (req, res) => {
    try {
        console.log('🔍 Solicitando tutores...');
        const result = await pool.query(`
            SELECT * FROM sistema_becas.Tutor 
            ORDER BY id DESC
        `);
        console.log(`✅ Tutores encontrados: ${result.rows.length}`);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error en /api/tutores:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/tutores/:id', async (req, res) => {
    try {
        const tutorId = parseInt(req.params.id);
        console.log('🔍 Solicitando tutor ID:', tutorId);

        const result = await pool.query(
            'SELECT * FROM sistema_becas.Tutor WHERE id = $1',
            [tutorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tutor no encontrado' });
        }

        console.log('✅ Tutor encontrado:', result.rows[0]);
        res.json(result.rows[0]);

    } catch (err) {
        console.error('❌ Error en GET /api/tutores/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tutores', async (req, res) => {
    try {
        const { nombre, ciudad, telefono, parentesco } = req.body;

        const result = await pool.query(
            `INSERT INTO sistema_becas.Tutor (nombre, ciudad, telefono, parentesco) 
                VALUES ($1, $2, $3, $4) RETURNING *`,
            [nombre, ciudad, telefono, parentesco]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Error creando tutor:', err);
        res.status(500).json({ error: err.message });
    }
});

// 📝 RUTA PARA ACTUALIZAR TUTORES
app.put('/api/tutores/:id', async (req, res) => {
    try {
        const tutorId = parseInt(req.params.id);
        const { nombre, ciudad, telefono, parentesco } = req.body;

        console.log('✏️ Actualizando tutor ID:', tutorId, 'con datos:', req.body);

        const result = await pool.query(
            `UPDATE sistema_becas.Tutor 
             SET nombre = $1, ciudad = $2, telefono = $3, parentesco = $4
             WHERE id = $5 RETURNING *`,
            [nombre, ciudad, telefono, parentesco, tutorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tutor no encontrado' });
        }

        console.log('✅ Tutor actualizado correctamente ID:', tutorId);
        res.json({
            message: 'Tutor actualizado exitosamente',
            tutor: result.rows[0]
        });

    } catch (err) {
        console.error('❌ Error en PUT /api/tutores/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tutores/:id', async (req, res) => {
    try {
        const tutorId = parseInt(req.params.id);
        const result = await pool.query(
            'DELETE FROM sistema_becas.Tutor WHERE id = $1 RETURNING *',
            [tutorId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tutor no encontrado' });
        }

        res.json({ message: 'Tutor eliminado exitosamente', tutor_eliminado: result.rows[0] });
    } catch (err) {
        console.error('❌ Error eliminando tutor:', err);
        res.status(500).json({ error: err.message });
    }
});

// 📝 RUTAS PARA POSTULACIONES (RegistroBeca)
app.get('/api/postulaciones', async (req, res) => {
    try {
        console.log('🔍 Solicitando postulaciones...');
        const result = await pool.query(`
            SELECT 
                rb.id,
                rb.alumno_id,
                rb.programa_id,
                rb.fecha_postulacion,
                rb.fecha_asignacion,
                rb.status,
                rb.monto_asignado,
                rb.observaciones,
                p.nombre as alumno_nombre,
                a.matricula,
                pb.nombre_programa,
                pb.tipo_beca
            FROM sistema_becas.RegistroBeca rb
            JOIN sistema_becas.Alumno a ON rb.alumno_id = a.persona_id
            JOIN sistema_becas.Persona p ON a.persona_id = p.id
            JOIN sistema_becas.ProgramaBeca pb ON rb.programa_id = pb.id
            ORDER BY rb.fecha_postulacion DESC
        `);
        console.log(`✅ Postulaciones encontradas: ${result.rows.length}`);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error en /api/postulaciones:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/postulaciones/:id', async (req, res) => {
    try {
        const postulacionId = parseInt(req.params.id);
        console.log('🔍 Solicitando postulación ID:', postulacionId);

        const result = await pool.query(`
            SELECT 
                rb.id,
                rb.alumno_id,
                rb.programa_id,
                rb.fecha_postulacion,
                rb.fecha_asignacion,
                rb.status,
                rb.monto_asignado,
                rb.observaciones,
                p.nombre as alumno_nombre,
                a.matricula,
                pb.nombre_programa,
                pb.tipo_beca
            FROM sistema_becas.RegistroBeca rb
            JOIN sistema_becas.Alumno a ON rb.alumno_id = a.persona_id
            JOIN sistema_becas.Persona p ON a.persona_id = p.id
            JOIN sistema_becas.ProgramaBeca pb ON rb.programa_id = pb.id
            WHERE rb.id = $1
        `, [postulacionId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Postulación no encontrada' });
        }

        console.log('✅ Postulación encontrada:', result.rows[0]);
        res.json(result.rows[0]);

    } catch (err) {
        console.error('❌ Error en GET /api/postulaciones/:id:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/postulaciones', async (req, res) => {
    try {
        const { alumno_id, programa_id, estado, observaciones } = req.body;

        console.log('📝 Creando nueva postulación:', { alumno_id, programa_id, estado, observaciones });

        const result = await pool.query(
            `INSERT INTO sistema_becas.RegistroBeca 
                (alumno_id, programa_id, status, observaciones) 
                VALUES ($1, $2, $3, $4) RETURNING *`,
            [alumno_id, programa_id, estado || 'Pendiente', observaciones]
        );

        res.json({
            message: 'Postulación creada exitosamente',
            postulacion: result.rows[0]
        });

    } catch (err) {
        console.error('❌ Error creando postulación:', err);
        res.status(500).json({ error: err.message });
    }
});

// 📝 RUTA PARA ACTUALIZAR POSTULACIONES
app.put('/api/postulaciones/:id', async (req, res) => {
    try {
        const postulacionId = parseInt(req.params.id);
        const { alumno_id, programa_id, status, monto_asignado, observaciones, fecha_asignacion } = req.body;

        console.log('✏️ Actualizando postulación ID:', postulacionId, 'con datos:', req.body);

        // Construir la consulta dinámicamente
        let updateFields = [];
        let values = [];
        let paramCount = 1;

        if (alumno_id !== undefined) {
            updateFields.push(`alumno_id = $${paramCount}`);
            values.push(alumno_id);
            paramCount++;
        }

        if (programa_id !== undefined) {
            updateFields.push(`programa_id = $${paramCount}`);
            values.push(programa_id);
            paramCount++;
        }

        if (status !== undefined) {
            updateFields.push(`status = $${paramCount}`);
            values.push(status);
            paramCount++;
        }

        if (monto_asignado !== undefined) {
            updateFields.push(`monto_asignado = $${paramCount}`);
            values.push(monto_asignado);
            paramCount++;
        }

        if (observaciones !== undefined) {
            updateFields.push(`observaciones = $${paramCount}`);
            values.push(observaciones);
            paramCount++;
        }

        if (fecha_asignacion !== undefined) {
            updateFields.push(`fecha_asignacion = $${paramCount}`);
            values.push(fecha_asignacion);
            paramCount++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'No hay campos para actualizar' });
        }

        // Agregar el ID al final
        values.push(postulacionId);

        const query = `
            UPDATE sistema_becas.RegistroBeca 
            SET ${updateFields.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Postulación no encontrada' });
        }

        console.log('✅ Postulación actualizada correctamente ID:', postulacionId);
        res.json({
            message: 'Postulación actualizada exitosamente',
            postulacion: result.rows[0]
        });

    } catch (err) {
        console.error('❌ Error actualizando postulación:', err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/postulaciones/:id', async (req, res) => {
    try {
        const postulacionId = parseInt(req.params.id);
        const result = await pool.query(
            'DELETE FROM sistema_becas.RegistroBeca WHERE id = $1 RETURNING *',
            [postulacionId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Postulación no encontrada' });
        }

        res.json({ message: 'Postulación eliminada exitosamente', postulacion_eliminada: result.rows[0] });
    } catch (err) {
        console.error('❌ Error eliminando postulación:', err);
        res.status(500).json({ error: err.message });
    }
});

// 📊 RUTA SIMPLIFICADA PARA VISTA DE ALUMNOS
app.get('/api/vista-alumnos-completa', async (req, res) => {
    try {
        console.log('🔍 Solicitando vista completa de alumnos...');
        const result = await pool.query(`
            SELECT 
                p.id,
                p.nombre,
                p.edad,
                (p.contacto).correo,
                (p.contacto).telefono,
                a.grupo,
                a.carrera,
                a.promedio,
                a.matricula,
                t.nombre as tutor_nombre,
                'Alumno' as tipo_persona
            FROM sistema_becas.Persona p
            JOIN sistema_becas.Alumno a ON p.id = a.persona_id
            LEFT JOIN sistema_becas.Tutor t ON a.tutor_id = t.id
            ORDER BY p.id DESC
        `);
        console.log(`✅ Vista alumnos: ${result.rows.length} registros`);
        res.json(result.rows);
    } catch (err) {
        console.error('❌ Error en /api/vista-alumnos-completa:', err);
        res.status(500).json({ error: err.message });
    }
});

// Ruta para obtener datos combinados para el dashboard
app.get('/api/dashboard', async (req, res) => {
    try {
        console.log('📊 Solicitando datos del dashboard...');

        const [alumnosRes, programasRes, tutoresRes, postulacionesRes] = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM sistema_becas.Alumno'),
            pool.query('SELECT COUNT(*) as count FROM sistema_becas.ProgramaBeca'),
            pool.query('SELECT COUNT(*) as count FROM sistema_becas.Tutor'),
            pool.query(`
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN status = 'Pendiente' THEN 1 END) as pendientes,
                    COUNT(CASE WHEN status IN ('Aprobada', 'Vigente') THEN 1 END) as aprobadas,
                    COUNT(CASE WHEN status = 'Rechazada' THEN 1 END) as rechazadas,
                    COALESCE(SUM(monto_asignado), 0) as monto_total
                FROM sistema_becas.RegistroBeca
            `)
        ]);

        const dashboardData = {
            totalAlumnos: parseInt(alumnosRes.rows[0].count),
            totalProgramas: parseInt(programasRes.rows[0].count),
            totalTutores: parseInt(tutoresRes.rows[0].count),
            postulaciones: {
                total: parseInt(postulacionesRes.rows[0].total),
                pendientes: parseInt(postulacionesRes.rows[0].pendientes),
                aprobadas: parseInt(postulacionesRes.rows[0].aprobadas),
                rechazadas: parseInt(postulacionesRes.rows[0].rechazadas),
                montoTotal: parseFloat(postulacionesRes.rows[0].monto_total)
            }
        };

        console.log('✅ Datos del dashboard:', dashboardData);
        res.json(dashboardData);
    } catch (err) {
        console.error('❌ Error en /api/dashboard:', err);
        res.status(500).json({ error: err.message });
    }
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('🔥 Error global:', err.stack);
    res.status(500).json({ error: 'Algo salió mal en el servidor!' });
});

// Ruta no encontrada
app.use((req, res) => {
    console.log('❌ Ruta no encontrada:', req.url);
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
    console.log(`📊 Endpoints completos:`);
    console.log(`   ALUMNOS:`);
    console.log(`     GET    http://localhost:${PORT}/api/alumnos`);
    console.log(`     GET    http://localhost:${PORT}/api/alumnos/:id`);
    console.log(`     POST   http://localhost:${PORT}/api/alumnos`);
    console.log(`     PUT    http://localhost:${PORT}/api/alumnos/:id`);
    console.log(`     DELETE http://localhost:${PORT}/api/alumnos/:id`);
    console.log(`   PROGRAMAS:`);
    console.log(`     GET    http://localhost:${PORT}/api/programas-beca`);
    console.log(`     GET    http://localhost:${PORT}/api/programas-beca/:id`);
    console.log(`     POST   http://localhost:${PORT}/api/programas-beca`);
    console.log(`     PUT    http://localhost:${PORT}/api/programas-beca/:id`);
    console.log(`     DELETE http://localhost:${PORT}/api/programas-beca/:id`);
    console.log(`   TUTORES:`);
    console.log(`     GET    http://localhost:${PORT}/api/tutores`);
    console.log(`     GET    http://localhost:${PORT}/api/tutores/:id`);
    console.log(`     POST   http://localhost:${PORT}/api/tutores`);
    console.log(`     PUT    http://localhost:${PORT}/api/tutores/:id`);
    console.log(`     DELETE http://localhost:${PORT}/api/tutores/:id`);
    console.log(`   POSTULACIONES:`);
    console.log(`     GET    http://localhost:${PORT}/api/postulaciones`);
    console.log(`     GET    http://localhost:${PORT}/api/postulaciones/:id`);
    console.log(`     POST   http://localhost:${PORT}/api/postulaciones`);
    console.log(`     PUT    http://localhost:${PORT}/api/postulaciones/:id`);
    console.log(`     DELETE http://localhost:${PORT}/api/postulaciones/:id`);
    console.log(`   OTROS:`);
    console.log(`     GET    http://localhost:${PORT}/api/dashboard`);
    console.log(`     GET    http://localhost:${PORT}/api/test`);
});
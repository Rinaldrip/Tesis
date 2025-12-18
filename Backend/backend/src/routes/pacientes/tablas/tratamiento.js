import { Router } from "express";
import pool from "../../../pool.js";

const router = Router();

const safeValue = (value, type = 'string') => {
    if (value === null || value === undefined || value === '' || value === 'null') {
        return null;
    }

        switch (type) {
        case 'number':
            const num = Number(value);
            return isNaN(num) ? null : num;
        case 'boolean':
            if (typeof value === 'string') {
                if (value.toLowerCase() === 'true' || value === '1') return true;
                if (value.toLowerCase() === 'false' || value === '0') return false;
                return null;
            }
            return Boolean(value);
        case 'date':
            // Validar que sea una fecha válida
            if (value instanceof Date && !isNaN(value)) return value;
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : value;
        default:
            return String(value).trim() === '' ? null : value;
    }
};

// CORRECTO: Usar GET para obtener datos
router.get("/pacientes/tratamientos/:cedula", async (req, res) => {
    try {
        const { cedula } = req.params;
        const client = await pool.connect();

        try {
            const tratamientoResult = await client.query(
                'SELECT * FROM tratamientos WHERE cedula_paciente = $1 ORDER BY fecha DESC', 
                [cedula]
            );

            res.json({ 
                success: true,
                tratamientos: tratamientoResult.rows
            });

        } finally {
            client.release();
        }
    } catch (err) {
        console.error("❌ Error obteniendo tests de orina:", err);
        res.status(500).json({ 
            success: false,
            error: "Error obteniendo tests de orina",
            details: err.message 
        });
    }
});

router.post("/pacientes/tratamientos", async (req, res) => {
    const client = await pool.connect();
    try {
        console.log('Datos recibidos:', req.body);

        if (!req.body.paciente || !req.body.paciente.cedula) {
            return res.status(400).json({ 
                error: "La cédula del paciente es requerida"
            });
        }
        const { paciente, ...testData } = req.body;

        await client.query("BEGIN");

        // Usar RETURNING id para obtener el ID generado automáticamente
        const query = `
            INSERT INTO tratamientos
            (cedula_paciente, fecha, tratamiento)
            VALUES ($1, $2, $3)
            RETURNING id
        `;
        
        const values = [
            paciente.cedula,
            safeValue(testData.fecha, 'date'),
            safeValue(testData.tratamiento, 'string')
        ];

        console.log('Ejecutando query con valores:', values);

        const result = await client.query(query, values);
        const testId = result.rows[0].id;

        await client.query("COMMIT");
        
        res.status(201).json({ 
            success: true,
            message: "Evolución guardado correctamente ✅",
            id: testId,
            cedula: paciente.cedula 
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error completo al registrar la evolución:", error);
        res.status(500).json({ 
            error: "Error al registrar la evolución",
            details: error.message 
        });
    } finally {
        client.release();
    }
});

// DELETE - Eliminar test de orina (VERSIÓN SIMPLIFICADA)
router.delete("/pacientes/tratamientos/eliminate/:id", async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ 
                success: false,
                error: "ID no proporcionado",
                details: "El parámetro 'id' es requerido en la URL",
                received: req.params
            });
        }

        if (id === 'undefined' || id === 'null' || id === '') {
            return res.status(400).json({ 
                success: false,
                error: "ID inválido",
                details: `El ID '${id}' no es válido`,
                received: id
            });
        }

        // Intentar convertir a número
        const testId = parseInt(id);

        if (isNaN(testId)) {
            return res.status(400).json({ 
                success: false,
                error: "ID debe ser un número",
                details: `El ID '${id}' no es un número válido`,
                received: id,
                parsed: testId
            });
        }

        await client.query("BEGIN");
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'tratamientos'
            );
        `);

        if (!tableCheck.rows[0].exists) {
            await client.query("ROLLBACK");
            return res.status(500).json({ 
                success: false,
                error: "Error de configuración",
                details: "La tabla 'evoluciones' no existe en la base de datos"
            });
        }

        // SEGUNDO: Verificar si el registro existe
        const checkQuery = 'SELECT id, cedula_paciente FROM tratamientos WHERE id = $1';
        const checkResult = await client.query(checkQuery, [testId]);

        if (checkResult.rows.length === 0) {
            await client.query("ROLLBACK");
            
            // Verificar qué IDs existen en la tabla
            const allIds = await client.query('SELECT id FROM tratamientos ORDER BY id');
            console.log('📋 IDs existentes en la tabla:', allIds.rows.map(row => row.id));
            
            return res.status(404).json({ 
                success: false,
                error: "Registro no encontrado",
                details: `No existe ninguna evolución con ID ${testId}`,
                availableIds: allIds.rows.map(row => row.id)
            });
        }

        // TERCERO: Eliminar el registro
        const deleteQuery = 'DELETE FROM tratamientos WHERE id = $1 RETURNING id, cedula_paciente';

        const deleteResult = await client.query(deleteQuery, [testId]);
        const deletedRecord = deleteResult.rows[0];

        await client.query("COMMIT");

        res.json({ 
            success: true,
            message: "Orden medica eliminado correctamente ✅",
            id: deletedRecord.id,
            cedula_paciente: deletedRecord.cedula_paciente,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        await client.query("ROLLBACK");
        
        res.status(500).json({ 
            success: false,
            error: "Error interno del servidor",
            details: error.message,
            code: error.code,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    } finally {
        client.release();
    }
});

export default router;
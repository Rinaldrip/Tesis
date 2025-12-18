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
            if (value instanceof Date && !isNaN(value)) return value;
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : value;
        default:
            return String(value).trim() === '' ? null : value;
    }
};

// GET - Obtener todos los laboratorios de un paciente
router.get("/pacientes/laboratorios/:cedula", async (req, res) => {
    try {
        const { cedula } = req.params;
        const client = await pool.connect();

        console.log(`📋 Obteniendo laboratorios para cédula: ${cedula}`);

        try {
            const laboratoriosResults = await client.query(
                `SELECT * FROM laboratorios 
                WHERE cedula_paciente = $1 
                ORDER BY fecha DESC`, 
                [cedula]
            );

            console.log(`✅ Encontrados ${laboratoriosResults.rows.length} laboratorios`);

            res.json({ 
                success: true,
                laboratorios: laboratoriosResults.rows
            });

        } finally {
            client.release();
        }
    } catch (err) {
        console.error("❌ Error obteniendo laboratorios:", err);
        res.status(500).json({ 
            success: false,
            error: "Error obteniendo laboratorios",
            details: err.message 
        });
    }
});

// POST - Crear nuevo laboratorio
router.post("/pacientes/laboratorios", async (req, res) => {
    const client = await pool.connect();
    try {
        console.log('📝 Datos recibidos para nuevo laboratorio:', req.body);

        if (!req.body.paciente || !req.body.paciente.cedula) {
            return res.status(400).json({ 
                success: false,
                error: "La cédula del paciente es requerida"
            });
        }

        const { paciente, ...labData } = req.body;

        await client.query("BEGIN");

        const query = `
            INSERT INTO laboratorios (
                cedula_paciente, fecha, 
                hb, hto, gb, neut, linf, eos, plt,
                glicemia, urea, creatinina, proteinas_t, albumina, globulinas,
                colesterol, trigliceridos, ac_urico,
                tgo, tgp, bt, bd, bi,
                na, k, cl, ca, p, mg,
                pt, ptt
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31)
            RETURNING id
        `;
        
        const values = [
            // Datos básicos
            paciente.cedula,
            safeValue(labData.fecha, 'date'),
            
            // Hemograma
            safeValue(labData.hb, 'string'),
            safeValue(labData.hto, 'string'),
            safeValue(labData.gb, 'string'),
            safeValue(labData.neut, 'string'),
            safeValue(labData.linf, 'string'),
            safeValue(labData.eos, 'string'),
            safeValue(labData.plt, 'string'),
            
            // Bioquímica básica
            safeValue(labData.glicemia, 'string'),
            safeValue(labData.urea, 'string'),
            safeValue(labData.creatinina, 'string'),
            safeValue(labData.proteinas_t, 'string'),
            safeValue(labData.albumina, 'string'),
            safeValue(labData.globulinas, 'string'),
            
            // Lípidos
            safeValue(labData.colesterol, 'string'),
            safeValue(labData.trigliceridos, 'string'),
            safeValue(labData.ac_urico, 'string'),
            
            // Pruebas hepáticas
            safeValue(labData.tgo, 'string'),
            safeValue(labData.tgp, 'string'),
            safeValue(labData.bt, 'string'),
            safeValue(labData.bd, 'string'),
            safeValue(labData.bi, 'string'),
            
            // Electrolitos
            safeValue(labData.na, 'string'),
            safeValue(labData.k, 'string'),
            safeValue(labData.cl, 'string'),
            safeValue(labData.ca, 'string'),
            safeValue(labData.p, 'string'),
            safeValue(labData.mg, 'string'),
            
            // Coagulación
            safeValue(labData.pt, 'string'),
            safeValue(labData.ptt, 'string')
        ];

        console.log('🔧 Ejecutando query con valores:', values);

        const result = await client.query(query, values);
        const labId = result.rows[0].id;

        await client.query("COMMIT");
        
        console.log('✅ Laboratorio guardado correctamente, ID:', labId);

        res.status(201).json({ 
            success: true,
            message: "Laboratorio guardado correctamente ✅",
            id: labId,
            cedula: paciente.cedula 
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Error completo al registrar laboratorio:", error);
        res.status(500).json({ 
            success: false,
            error: "Error al registrar laboratorio",
            details: error.message 
        });
    } finally {
        client.release();
    }
});

// PUT - Actualizar laboratorio existente
router.put("/pacientes/laboratorios/:id", async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        console.log('📝 Actualizando laboratorio ID:', id, 'Datos:', req.body);

        const { ...labData } = req.body;

        await client.query("BEGIN");

        // Verificar que el laboratorio existe
        const checkResult = await client.query(
            'SELECT id FROM laboratorios WHERE id = $1',
            [id]
        );

        if (checkResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ 
                success: false,
                error: "Laboratorio no encontrado"
            });
        }

        const query = `
            UPDATE laboratorios SET
                fecha = $1,
                hb = $2, hto = $3, gb = $4, neut = $5, linf = $6, eos = $7, plt = $8,
                glicemia = $9, urea = $10, creatinina = $11, prot_total = $12, 
                albumina = $13, globulinas = $14,
                colesterol = $15, trigliceridos = $16, acido_urico = $17,
                tgo = $18, tgp = $19, bt = $20, bd = $21, bi = $22,
                sodio = $23, potasio = $24, cloro = $25, calcio = $26, 
                fosforo = $27, magnesio = $28,
                pt = $29, ptt = $30,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $31
            RETURNING id
        `;
        
        const values = [
            // Datos básicos
            safeValue(labData.fecha, 'date'),
            
            // Hemograma
            safeValue(labData.hb, 'string'),
            safeValue(labData.hto, 'string'),
            safeValue(labData.gb, 'string'),
            safeValue(labData.neut, 'string'),
            safeValue(labData.linf, 'string'),
            safeValue(labData.eos, 'string'),
            safeValue(labData.plt, 'string'),
            
            // Bioquímica básica
            safeValue(labData.glicemia, 'string'),
            safeValue(labData.urea, 'string'),
            safeValue(labData.creatinina, 'string'),
            safeValue(labData.prot_total, 'string'),
            safeValue(labData.albumina, 'string'),
            safeValue(labData.globulinas, 'string'),
            
            // Lípidos
            safeValue(labData.colesterol, 'string'),
            safeValue(labData.trigliceridos, 'string'),
            safeValue(labData.acido_urico, 'string'),
            
            // Pruebas hepáticas
            safeValue(labData.tgo, 'string'),
            safeValue(labData.tgp, 'string'),
            safeValue(labData.bt, 'string'),
            safeValue(labData.bd, 'string'),
            safeValue(labData.bi, 'string'),
            
            // Electrolitos
            safeValue(labData.sodio, 'string'),
            safeValue(labData.potasio, 'string'),
            safeValue(labData.cloro, 'string'),
            safeValue(labData.calcio, 'string'),
            safeValue(labData.fosforo, 'string'),
            safeValue(labData.magnesio, 'string'),
            
            // Coagulación
            safeValue(labData.pt, 'string'),
            safeValue(labData.ptt, 'string'),
            
            // ID
            id
        ];

        const result = await client.query(query, values);

        await client.query("COMMIT");
        
        console.log('✅ Laboratorio actualizado correctamente');

        res.json({ 
            success: true,
            message: "Laboratorio actualizado correctamente ✅",
            id: result.rows[0].id
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Error actualizando laboratorio:", error);
        res.status(500).json({ 
            success: false,
            error: "Error al actualizar laboratorio",
            details: error.message 
        });
    } finally {
        client.release();
    }
});

// DELETE - Eliminar laboratorio
router.delete("/pacientes/laboratorios/eliminate/:id", async (req, res) => {
    const client = await pool.connect();
    
    try {
        const { id } = req.params;

        console.log(`🗑️ Eliminando laboratorio con ID: ${id}`);

        if (!id || id === 'undefined' || id === 'null' || id === '') {
            return res.status(400).json({ 
                success: false,
                error: "ID no proporcionado o inválido"
            });
        }

        const labId = parseInt(id);

        if (isNaN(labId)) {
            return res.status(400).json({ 
                success: false,
                error: "ID debe ser un número válido"
            });
        }

        await client.query("BEGIN");

        // Verificar si el registro existe
        const checkQuery = 'SELECT id, cedula_paciente FROM laboratorios WHERE id = $1';
        const checkResult = await client.query(checkQuery, [labId]);

        if (checkResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ 
                success: false,
                error: "Laboratorio no encontrado",
                details: `No existe ningún laboratorio con ID ${labId}`
            });
        }

        // Eliminar el registro
        const deleteQuery = 'DELETE FROM laboratorios WHERE id = $1 RETURNING id, cedula_paciente';
        const deleteResult = await client.query(deleteQuery, [labId]);
        const deletedRecord = deleteResult.rows[0];

        await client.query("COMMIT");

        console.log('✅ Laboratorio eliminado:', deletedRecord);

        res.json({ 
            success: true,
            message: "Laboratorio eliminado correctamente ✅",
            id: deletedRecord.id,
            cedula_paciente: deletedRecord.cedula_paciente
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("❌ Error eliminando laboratorio:", error);
        res.status(500).json({ 
            success: false,
            error: "Error interno del servidor al eliminar laboratorio",
            details: error.message 
        });
    } finally {
        client.release();
    }
});

export default router;
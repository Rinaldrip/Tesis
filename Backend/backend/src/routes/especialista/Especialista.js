import { Router } from "express";
import pool from "../../pool.js";

const router = Router();

// Función para manejar valores nulos/undefined
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
                if (value.toLowerCase() === 'true' || value === '1' || value === 'si') return true;
                if (value.toLowerCase() === 'false' || value === '0' || value === 'no') return false;
                return null;
            }
            return Boolean(value);
        case 'date':
            if (!value) return null;
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : value;
        default:
            return value;
    }
};

// POST - Crear nuevo especialista
router.post("/especialista/add", async (req, res) => {
    const client = await pool.connect();
    try {
        
        if (!req.body.cedula) {
            return res.status(400).json({ error: "La cédula del especialista es requerida" });
        }

        const { 
            cedula,
            full_name,
            date_of_birth,
            specialty,
            graduation_year,
            university,
            email,
            phone,
            num_colegio,
            num_mpps,
            direction
        } = req.body;
        
        await client.query("BEGIN");

        // Insertar especialista (con manejo de valores nulos)
        await client.query(
            `INSERT INTO especialistas 
            (cedula, full_name, date_of_birth, specialty, graduation_year, university, 
             email, phone, num_colegio, num_mpps, direction) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (cedula) DO UPDATE SET
                full_name = EXCLUDED.full_name,
                date_of_birth = EXCLUDED.date_of_birth,
                specialty = EXCLUDED.specialty,
                graduation_year = EXCLUDED.graduation_year,
                university = EXCLUDED.university,
                email = EXCLUDED.email,
                phone = EXCLUDED.phone,
                num_colegio = EXCLUDED.num_colegio,
                num_mpps = EXCLUDED.num_mpps,
                direction = EXCLUDED.direction`,
            [
                cedula,
                safeValue(full_name),
                safeValue(date_of_birth, 'date'),
                safeValue(specialty),
                safeValue(graduation_year, 'number'),
                safeValue(university),
                safeValue(email),
                safeValue(phone),
                safeValue(num_colegio),
                safeValue(num_mpps),
                safeValue(direction)
            ]
        );

        await client.query("COMMIT");
        
        res.status(201).json({ 
            success: true, 
            message: "Especialista agregado/actualizado exitosamente",
            cedula: cedula 
        });

    } catch (error) {
        await client.query("ROLLBACK");
        
        console.error("Error al agregar especialista:", error);
        
        // Manejar errores de constraint único
        if (error.code === '23505') {
            let field = 'campo único';
            if (error.detail.includes('email')) field = 'email';
            if (error.detail.includes('num_colegio')) field = 'número de colegio';
            if (error.detail.includes('num_mpps')) field = 'número de MPPS';
            
            return res.status(409).json({ 
                error: `El ${field} ya existe en el sistema` 
            });
        }
        
        res.status(500).json({ 
            error: "Error interno del servidor al agregar especialista",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        client.release();
    }
});

// GET - Obtener todos los especialistas
router.get("/especialistas", async (req, res) => {
    const client = await pool.connect();
    try {
        const result = await client.query(
            `SELECT *
            FROM especialistas 
            ORDER BY full_name`
        );

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (error) {
        console.error("Error al obtener especialistas:", error);
        res.status(500).json({ 
            error: "Error interno del servidor al obtener especialistas" 
        });
    } finally {
        client.release();
    }
});


// PUT - Actualizar especialista
router.put("/especialista/update/:cedula", async (req, res) => {
    const client = await pool.connect();
    try {
        const { cedula } = req.params;
        const { 
            full_name,
            date_of_birth,
            specialty,
            graduation_year,
            university,
            email,
            phone,
            num_colegio,
            num_mpps,
            direction
        } = req.body;

        await client.query("BEGIN");

        const result = await client.query(
            `UPDATE especialistas 
             SET full_name = $1, 
                 date_of_birth = $2, 
                 specialty = $3, 
                 graduation_year = $4,
                 university = $5, 
                 email = $6, 
                 phone = $7, 
                 num_colegio = $8, 
                 num_mpps = $9,
                 direction = $10
             WHERE cedula = $11
             RETURNING *`,
            [
                safeValue(full_name),
                safeValue(date_of_birth, 'date'),
                safeValue(specialty),
                safeValue(graduation_year, 'number'),
                safeValue(university),
                safeValue(email),
                safeValue(phone),
                safeValue(num_colegio),
                safeValue(num_mpps),
                safeValue(direction),
                cedula
            ]
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ 
                error: "Especialista no encontrado" 
            });
        }

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Especialista actualizado exitosamente",
            data: result.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");
        
        console.error("Error al actualizar especialista:", error);
        
        if (error.code === '23505') {
            return res.status(409).json({ 
                error: "Conflicto con campos únicos (email, número de colegio o MPPS)" 
            });
        }
        
        res.status(500).json({ 
            error: "Error interno del servidor al actualizar especialista" 
        });
    } finally {
        client.release();
    }
});

// POST /especialista/set-active/:cedula
// PUT - Establecer médico activo (Corregido)
router.put('/especialista/set-active/:cedula', async (req, res) => {
    const { cedula } = req.params;
    const client = await pool.connect(); // <--- IMPORTANTE: Conectar al pool
    
    try {
        await client.query('BEGIN'); // Usar client, no db

        // 1. Desactivar a todos
        await client.query('UPDATE especialistas SET is_active = false');

        // 2. Activar al seleccionado
        await client.query('UPDATE especialistas SET is_active = true WHERE cedula = $1', [cedula]);

        await client.query('COMMIT');

        res.json({ success: true, message: "Médico en servicio actualizado" });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error al activar especialista:", error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release(); // Ahora sí existe client para liberarlo
    }
});

// DELETE - Eliminar especialista
router.delete("/especialista/delete/:cedula", async (req, res) => {
    const client = await pool.connect();
    try {
        const { cedula } = req.params;

        await client.query("BEGIN");

        const result = await client.query(
            'DELETE FROM especialistas WHERE cedula = $1 RETURNING *',
            [cedula]
        );

        if (result.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ 
                error: "Especialista no encontrado" 
            });
        }

        await client.query("COMMIT");

        res.json({
            success: true,
            message: "Especialista eliminado exitosamente",
            data: result.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");
        
        console.error("Error al eliminar especialista:", error);
        res.status(500).json({ 
            error: "Error interno del servidor al eliminar especialista" 
        });
    } finally {
        client.release();
    }
});

export default router;
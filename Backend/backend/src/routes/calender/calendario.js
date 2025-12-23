import { Router } from "express";
import pool from "../../pool.js";

const router = Router();

// ==========================================
// GET - Obtener todos los eventos
// ==========================================
router.get("/calendar/events", async (req, res) => {
    try {
        const client = await pool.connect();

        try {
            // No necesitamos renombrar columnas porque en tu tabla ya se llaman
            // igual que en la interfaz de React (title, description, etc.)
            const query = `
                SELECT * FROM calendar_events 
                ORDER BY start_date ASC
            `;

            const result = await client.query(query);

            // Formateamos las fechas a ISO String para que el frontend las entienda bien
            const formattedEvents = result.rows.map(event => ({
                id: event.id, // UUID ya viene como string generalmente
                title: event.title,
                description: event.description || "",
                start_date: new Date(event.start_date).toISOString(),
                end_date: new Date(event.end_date).toISOString(),
                category: event.category
            }));

            res.json({
                success: true,
                events: formattedEvents
            });

        } finally {
            client.release();
        }
    } catch (err) {
        console.error("❌ Error obteniendo eventos:", err);
        res.status(500).json({
            success: false,
            error: "Error interno obteniendo el calendario",
            details: err.message
        });
    }
});

// ==========================================
// POST - Crear un nuevo evento
// ==========================================
router.post("/calendar/events", async (req, res) => {
    try {
        const { title, description, start_date, end_date, category } = req.body;
        
        // Validación básica
        if (!title || !start_date || !end_date || !category) {
            return res.status(400).json({ 
                success: false, 
                error: "Faltan campos obligatorios (title, start_date, end_date, category)" 
            });
        }

        const client = await pool.connect();

        try {
            // ID se genera automático en BD con gen_random_uuid()
            const query = `
                INSERT INTO calendar_events 
                (title, description, start_date, end_date, category)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;

            const values = [title, description, start_date, end_date, category];
            const result = await client.query(query, values);
            const newEvent = result.rows[0];

            res.status(201).json({
                success: true,
                message: "Evento creado exitosamente",
                event: {
                    ...newEvent,
                    start_date: new Date(newEvent.start_date).toISOString(),
                    end_date: new Date(newEvent.end_date).toISOString()
                }
            });

        } finally {
            client.release();
        }
    } catch (err) {
        console.error("❌ Error creando evento:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// PUT - Actualizar un evento (Por ID UUID)
// ==========================================
router.put("/calendar/events/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, start_date, end_date, category } = req.body;
        
        const client = await pool.connect();

        try {
            const query = `
                UPDATE calendar_events
                SET title = $1, 
                    description = $2, 
                    start_date = $3, 
                    end_date = $4, 
                    category = $5
                WHERE id = $6
                RETURNING *
            `;

            // PostgreSQL maneja la conversión de string a UUID automáticamente
            const values = [title, description, start_date, end_date, category, id];
            const result = await client.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, error: "Evento no encontrado" });
            }

            const updatedEvent = result.rows[0];

            res.json({
                success: true,
                message: "Evento actualizado",
                event: {
                    ...updatedEvent,
                    start_date: new Date(updatedEvent.start_date).toISOString(),
                    end_date: new Date(updatedEvent.end_date).toISOString()
                }
            });

        } finally {
            client.release();
        }
    } catch (err) {
        console.error("❌ Error actualizando evento:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// DELETE - Eliminar un evento
// ==========================================
router.delete("/calendar/events/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const client = await pool.connect();

        try {
            const result = await client.query("DELETE FROM calendar_events WHERE id = $1", [id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ success: false, error: "Evento no encontrado" });
            }

            res.json({ success: true, message: "Evento eliminado correctamente" });

        } finally {
            client.release();
        }
    } catch (err) {
        console.error("❌ Error eliminando evento:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
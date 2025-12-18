import { Router } from "express";
import pool from "../../pool.js";

const router = Router();

router.get("/pacientes/stats/:cedula/:range", async (req, res) => {
    const { cedula, range } = req.params; // <- CAMBIO: range ahora viene de req.params

    // Mapeo más robusto
    const rangeMap = {
        "3meses": "3 months", 
        "6meses": "6 months",
        "1año": "1 year",
        "todo": "100 years"
    };

    // Validación más estricta
    let validRange;
    if (rangeMap[range]) {
        validRange = rangeMap[range];
    } else {
        // Si el range no es válido, usar por defecto
        console.warn(`Range no válido: ${range}, usando 3meses por defecto`);
        validRange = rangeMap["3meses"];
    }

    console.log(`Consultando rango: ${range} -> ${validRange} para cédula: ${cedula}`);

    try {
        const result = await pool.query(
            `
            SELECT 
                fecha,
                hb, hto, glicemia, urea, creatinina, albumina, ca, p
            FROM laboratorios
            WHERE cedula_paciente = $1
            AND fecha >= NOW() - INTERVAL '${validRange}'
            ORDER BY fecha DESC
            `,
            [cedula]
        );

        res.json({
            success: true,
            range: range,
            rangeSQL: validRange,
            count: result.rowCount,
            data: result.rows,
        });
    } catch (error) {
        console.error("Error al obtener laboratorios por rango:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error interno del servidor",
            error: error.message,
            details: {
                cedula: cedula,
                range: range,
                validRange: validRange
            }
        });
    }
});

router.get("/pacientes/stats/avg/:cedula/:range", async (req, res) => {
    const { cedula, range } = req.params;
    
    // Mapeo más robusto
    const rangeMap = {
        "3meses": "3 months", 
        "6meses": "6 months",
        "1año": "1 year",
        "todo": "100 years"
    };

    // Validación más estricta
    let validRange;
    if (rangeMap[range]) {
        validRange = rangeMap[range];
    } else {
        // Si el range no es válido, usar por defecto
        console.warn(`Range no válido: ${range}, usando 3meses por defecto`);
        validRange = rangeMap["3meses"];
    }

    try {
        const client = await pool.connect();

        try {
            const { start, end } = getDateRange(range);

            const query = `
                WITH stats AS (
                    SELECT
                        -- Estadísticas
                        AVG(hb) AS hb_avg, MIN(hb) AS hb_min, MAX(hb) AS hb_max,
                        AVG(hto) AS hto_avg, MIN(hto) AS hto_min, MAX(hto) AS hto_max,
                        AVG(glicemia) AS glicemia_avg, MIN(glicemia) AS glicemia_min, MAX(glicemia) AS glicemia_max,
                        AVG(urea) AS urea_avg, MIN(urea) AS urea_min, MAX(urea) AS urea_max,
                        AVG(creatinina) AS creatinina_avg, MIN(creatinina) AS creatinina_min, MAX(creatinina) AS creatinina_max,
                        AVG(albumina) AS albumina_avg, MIN(albumina) AS albumina_min, MAX(albumina) AS albumina_max,
                        AVG(ca) AS ca_avg, MIN(ca) AS ca_min, MAX(ca) AS ca_max,
                        AVG(p) AS p_avg, MIN(p) AS p_min, MAX(p) AS p_max,
                        -- Últimos valores (más recientes)
                        (SELECT hb FROM laboratorios WHERE cedula_paciente = $1 AND fecha >= NOW() - INTERVAL '${validRange}' ORDER BY fecha DESC LIMIT 1) AS hb_last,
                        (SELECT hto FROM laboratorios WHERE cedula_paciente = $1 AND fecha >= NOW() - INTERVAL '${validRange}' ORDER BY fecha DESC LIMIT 1) AS hto_last,
                        (SELECT glicemia FROM laboratorios WHERE cedula_paciente = $1 AND fecha >= NOW() - INTERVAL '${validRange}' ORDER BY fecha DESC LIMIT 1) AS glicemia_last,
                        (SELECT urea FROM laboratorios WHERE cedula_paciente = $1 AND fecha >= NOW() - INTERVAL '${validRange}' ORDER BY fecha DESC LIMIT 1) AS urea_last,
                        (SELECT creatinina FROM laboratorios WHERE cedula_paciente = $1 AND fecha >= NOW() - INTERVAL '${validRange}' ORDER BY fecha DESC LIMIT 1) AS creatinina_last,
                        (SELECT albumina FROM laboratorios WHERE cedula_paciente = $1 AND fecha >= NOW() - INTERVAL '${validRange}' ORDER BY fecha DESC LIMIT 1) AS albumina_last,
                        (SELECT ca FROM laboratorios WHERE cedula_paciente = $1 AND fecha >= NOW() - INTERVAL '${validRange}' ORDER BY fecha DESC LIMIT 1) AS ca_last,
                        (SELECT p FROM laboratorios WHERE cedula_paciente = $1 AND fecha >= NOW() - INTERVAL '${validRange}' ORDER BY fecha DESC LIMIT 1) AS p_last
                    FROM laboratorios
                    WHERE cedula_paciente = $1
                    AND fecha >= NOW() - INTERVAL '${validRange}'
                )
                SELECT * FROM stats
            `;

            const statsResult = await client.query(query, [cedula]);
            const statsRow = statsResult.rows[0];

            // Obtener todas las muestras para calcular tendencia
            const trendQuery = `
                SELECT fecha, hb, hto, glicemia, urea, creatinina, albumina, ca, p
                FROM laboratorios
                WHERE cedula_paciente = $1
                AND fecha >= NOW() - INTERVAL '${validRange}'
                ORDER BY fecha ASC
            `;
            const trends = await client.query(trendQuery, [cedula]);

            const first = trends.rows.at(0);
            const last = trends.rows.at(-1);

            const calculateTrend = (key) => {
                if (!first || !last || first[key] == null || last[key] == null) return 0;
                return Number((last[key] - first[key]).toFixed(2));
            };

            const response = {
                success: true,
                cedula,
                range,
                rangeSQL: validRange,
                stats: {
                    hb: {
                        current: Number(statsRow.hb_last || 0),
                        average: Number(statsRow.hb_avg || 0),
                        min: Number(statsRow.hb_min || 0),
                        max: Number(statsRow.hb_max || 0),
                        trend: calculateTrend("hb"),
                    },
                    hto: {
                        current: Number(statsRow.hto_last || 0),
                        average: Number(statsRow.hto_avg || 0),
                        min: Number(statsRow.hto_min || 0),
                        max: Number(statsRow.hto_max || 0),
                        trend: calculateTrend("hto"),
                    },
                    glicemia: {
                        current: Number(statsRow.glicemia_last || 0),
                        average: Number(statsRow.glicemia_avg || 0),
                        min: Number(statsRow.glicemia_min || 0),
                        max: Number(statsRow.glicemia_max || 0),
                        trend: calculateTrend("glicemia"),
                    },
                    urea: {
                        current: Number(statsRow.urea_last || 0),
                        average: Number(statsRow.urea_avg || 0),
                        min: Number(statsRow.urea_min || 0),
                        max: Number(statsRow.urea_max || 0),
                        trend: calculateTrend("urea"),
                    },
                    creatinina: {
                        current: Number(statsRow.creatinina_last || 0),
                        average: Number(statsRow.creatinina_avg || 0),
                        min: Number(statsRow.creatinina_min || 0),
                        max: Number(statsRow.creatinina_max || 0),
                        trend: calculateTrend("creatinina"),
                    },
                    albumina: {
                        current: Number(statsRow.albumina_last || 0),
                        average: Number(statsRow.albumina_avg || 0),
                        min: Number(statsRow.albumina_min || 0),
                        max: Number(statsRow.albumina_max || 0),
                        trend: calculateTrend("albumina"),
                    },
                    ca: {
                        current: Number(statsRow.ca_last || 0),
                        average: Number(statsRow.ca_avg || 0),
                        min: Number(statsRow.ca_min || 0),
                        max: Number(statsRow.ca_max || 0),
                        trend: calculateTrend("ca"),
                    },
                    p: {
                        current: Number(statsRow.p_last || 0),
                        average: Number(statsRow.p_avg || 0),
                        min: Number(statsRow.p_min || 0),
                        max: Number(statsRow.p_max || 0),
                        trend: calculateTrend("p"),
                    },
                }
            };
            res.json(response);

        } finally {
            client.release();
        }

    } catch (err) {
        console.error("❌ Error en /pacientes/stats/avg:", err);
        res.status(500).json({
            success: false,
            error: "Error al obtener estadísticas de laboratorio",
            details: err.message
        });
    }
});

// Función helper para calcular rangos de fecha (si la necesitas para otra cosa)
function getDateRange(range) {
    const now = new Date();
    let start = new Date();

    switch (range) {
        case '3meses':
            start.setMonth(now.getMonth() - 3);
            break;
        case '6meses':
            start.setMonth(now.getMonth() - 6);
            break;
        case '1año':
            start.setFullYear(now.getFullYear() - 1);
            break;
        case 'todo':
            start = new Date('2000-01-01');
            break;
        default:
            start.setMonth(now.getMonth() - 3);
    }

    return {
        start: start.toISOString().split('T')[0],
        end: now.toISOString().split('T')[0]
    };
}



export default router;
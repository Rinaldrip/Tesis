// routes/dashboard.js
import { Router } from "express";
import pool from "../pool.js";

const router = Router();

// Función para convertir mes numérico a nombre
const getMonthName = (monthNumber) => {
    const months = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return months[monthNumber - 1] || "Mes inválido";
};

// Endpoint unificado para el dashboard
router.get("/dashboard", async (req, res) => {
    try {
        // 1. Estadísticas generales - SIN la tabla eventos
        const statsQuery = `
            SELECT 
                COUNT(*) as "pacientesActivos",
                COUNT(CASE WHEN dm.hipertension_arterial = true THEN 1 END) as "pacientesHipertensos",
                COUNT(CASE WHEN p.estado = 'Critico' THEN 1 END) as "casosCriticos",
                0 as "proximosEventos"
            FROM pacientes p
            LEFT JOIN datos_medicos dm ON p.cedula = dm.cedula_paciente
            WHERE p.cedula IS NOT NULL
        `;

        const statsResult = await pool.query(statsQuery);
        const statsData = statsResult.rows[0];

// Esta versión funcionará mejor con tus datos actuales
const chartQuery = `
    SELECT 
        EXTRACT(MONTH FROM COALESCE(di.fecha_ingreso, CURRENT_DATE)) as month,
        EXTRACT(YEAR FROM COALESCE(di.fecha_ingreso, CURRENT_DATE)) as year,
        COUNT(CASE WHEN UPPER(dm.tipo_dialisis) = 'HEMODIALISIS' THEN 1 END) as "Hemodialisis",
        COUNT(CASE WHEN UPPER(dm.tipo_dialisis) = 'PERITONEAL' THEN 1 END) as "Peritonial"
    FROM datos_medicos dm
    LEFT JOIN datos_ingreso di ON dm.cedula_paciente = di.cedula_paciente
    WHERE dm.tipo_dialisis IS NOT NULL
    AND dm.tipo_dialisis IN ('Hemodialisis', 'Peritoneal', 'hemodialisis', 'peritoneal')
    GROUP BY EXTRACT(YEAR FROM COALESCE(di.fecha_ingreso, CURRENT_DATE)), 
             EXTRACT(MONTH FROM COALESCE(di.fecha_ingreso, CURRENT_DATE))
    ORDER BY year DESC, month DESC
    LIMIT 6
`;

        const chartResult = await pool.query(chartQuery);
        const chartData = chartResult.rows.map(row => ({
            month: getMonthName(parseInt(row.month)),
            Hemodialisis: parseInt(row.Hemodialisis) || 0,
            Peritonial: parseInt(row.Peritonial) || 0
        })).reverse();

        console.log("Datos procesados para el frontend:", chartData);

        // 3. Pacientes para el carrusel (últimos 8 pacientes)
        const patientsQuery = `
            SELECT 
                p.cedula,
                p.nombre,
                p.apellido,
                p.fecha_nacimiento,
                di.etiologia_enfermedad_renal as enfermedad,
                p.estado,
                di.fecha_ingreso as ultima_visita,
                l.creatinina,
                l.proteinas_t
            FROM pacientes p
            LEFT JOIN datos_ingreso di ON p.cedula = di.cedula_paciente
            LEFT JOIN datos_medicos dm ON p.cedula = dm.cedula_paciente
            LEFT JOIN (
                SELECT 
                    cedula_paciente,
                    creatinina,
                    proteinas_t,
                    fecha,
                    ROW_NUMBER() OVER (PARTITION BY cedula_paciente ORDER BY fecha DESC) as rn
                FROM laboratorios
            ) l ON p.cedula = l.cedula_paciente AND l.rn = 1
            WHERE p.cedula IS NOT NULL
            ORDER BY di.fecha_ingreso DESC NULLS LAST, p.nombre, p.apellido
            LIMIT 9
        `;

        const patientsResult = await pool.query(patientsQuery);
        
        const patientsData = patientsResult.rows.map((row, index) => ({
            id: index + 1,
            cedula: row.cedula || 'N/A',
            nombre: row.nombre || 'No especificado',
            apellido: row.apellido || 'No especificado',
            fechaNacimiento: row.fecha_nacimiento, // Enviar fecha_nacimiento para calcular edad en frontend
            enfermedad: row.enfermedad || 'Enfermedad renal crónica',
            estado: row.estado || 'Estable',
            ultimaVisita: row.ultima_visita || new Date().toISOString(),
            creatina: row.creatinina ? `${row.creatinina} mg/dL` : 'No disponible',
            proteinasT: row.proteinas_t ? `${row.proteinas_t} g/dL` : 'No disponible'
        }));

        // Respuesta unificada
        res.json({
            success: true,
            data: {
                stats: {
                    pacientesActivos: parseInt(statsData.pacientesActivos) || 0,
                    proximosEventos: parseInt(statsData.proximosEventos) || 0, // Será 0 por ahora
                    casosCriticos: parseInt(statsData.casosCriticos) || 0,
                    pacientesHipertensos: parseInt(statsData.pacientesHipertensos) || 0
                },
                chart: chartData,
                patients: patientsData
            }
        });

    } catch (error) {
        console.error("Error en endpoint dashboard:", error);
        res.status(500).json({ 
            success: false,
            error: "Error interno del servidor",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

router.get("/test-chart-data", async (req, res) => {
    try {
        // 1. Ver cuántos pacientes tienen datos_medicos con tipo_dialisis
        const query1 = `
            SELECT 
                COUNT(*) as total_pacientes,
                COUNT(CASE WHEN tipo_dialisis IS NOT NULL THEN 1 END) as con_dialisis,
                COUNT(CASE WHEN tipo_dialisis = 'hemodialisis' THEN 1 END) as hemodialisis,
                COUNT(CASE WHEN tipo_dialisis = 'peritoneal' THEN 1 END) as peritoneal
            FROM datos_medicos
        `;
        
        // 2. Ver pacientes con datos en ambas tablas
        const query2 = `
            SELECT 
                COUNT(*) as pacientes_con_ambos
            FROM datos_medicos dm
            INNER JOIN datos_ingreso di ON dm.cedula_paciente = di.cedula_paciente
            WHERE dm.tipo_dialisis IS NOT NULL
        `;
        
        // 3. Ver distribución por fecha
        const query3 = `
            SELECT 
                di.fecha_ingreso,
                dm.tipo_dialisis,
                p.nombre,
                p.apellido
            FROM datos_medicos dm
            LEFT JOIN datos_ingreso di ON dm.cedula_paciente = di.cedula_paciente
            LEFT JOIN pacientes p ON dm.cedula_paciente = p.cedula
            WHERE dm.tipo_dialisis IS NOT NULL
            ORDER BY di.fecha_ingreso DESC
            LIMIT 20
        `;

        const [result1, result2, result3] = await Promise.all([
            pool.query(query1),
            pool.query(query2),
            pool.query(query3)
        ]);

        res.json({
            estadisticas_dialisis: result1.rows[0],
            pacientes_con_ambos_registros: result2.rows[0],
            ultimos_pacientes_con_dialisis: result3.rows
        });

    } catch (error) {
        console.error("Error en test-chart-data:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
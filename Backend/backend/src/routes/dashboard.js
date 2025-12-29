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
        // 1. Estadísticas generales
        const statsQuery = `
            SELECT 
                COUNT(*) as "pacientesActivos",
                COUNT(CASE WHEN dm.hipertension_arterial = true THEN 1 END) as "pacientesHipertensos",
                COUNT(CASE WHEN p.estado = 'Critico' THEN 1 END) as "casosCriticos"
            FROM pacientes p
            LEFT JOIN datos_medicos dm ON p.cedula = dm.cedula_paciente
            WHERE p.cedula IS NOT NULL
        `;

        const statsResult = await pool.query(statsQuery);
        const statsData = statsResult.rows[0];

        // 2. Datos para el Gráfico
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

        // 3. Datos del Especialista (para mostrar "Médico en Servicio" si lo deseas)
        const especialistaQuery = `
            SELECT full_name, specialty, phone, email, direction
            FROM especialistas 
            WHERE is_active = true 
            LIMIT 1
        `; 

        const especialistaResult = await pool.query(especialistaQuery);
        const especialistaData = especialistaResult.rows[0] || null;

        // 4. EVENTOS DE HOY (Nuevo código agregado)
        // Obtenemos la lista y la cantidad (rowCount) en una sola consulta
        const eventosQuery = `
            SELECT 
                id,
                title as nombre,
                description as descripcion,
                category as categoria,
                TO_CHAR(start_date, 'HH12:MI AM') as hora
            FROM calendar_events
            WHERE start_date::date = CURRENT_DATE
            ORDER BY start_date ASC
        `;
        
        const eventosResult = await pool.query(eventosQuery);
        const eventosData = eventosResult.rows;
        const cantidadEventosHoy = eventosResult.rowCount;

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
            fechaNacimiento: row.fecha_nacimiento,
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
                    proximosEventos: cantidadEventosHoy, 
                    casosCriticos: parseInt(statsData.casosCriticos) || 0,
                    pacientesHipertensos: parseInt(statsData.pacientesHipertensos) || 0
                },
                chart: chartData,
                patients: patientsData,
                // Agregamos los eventos detallados para mostrarlos en la UI
                events: eventosData,
                // Agregamos al especialista por si lo necesitas mostrar en el dashboard
                specialist: especialistaData 
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

// ... (El resto de tus rutas de prueba se mantienen igual)
router.get("/test-chart-data", async (req, res) => {

    try {

        res.json({ message: "Test route ok" }); 
    } catch (e) { res.status(500).send(e.message) }
});

export default router;
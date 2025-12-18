import express from "express";
import pool from "../../../pool.js";

const router = express.Router();

// Mapeo de rangos a intervalos de PostgreSQL
const getDateRange = (range) => {
    switch (range) {
        case '3meses':
            return "3 months";
        case '6meses':
            return "6 months";
        case '12meses':
            return "1 year";
        case 'todo':
            return null; // No filtrar por fecha
        default:
            return "3 months";
    }
};

// Función para obtener el período en formato "MesInicio - MesFin Año"
const getPeriodoLabel = (range) => {
    const hoy = new Date();
    
    if (range === 'todo') {
        return 'Todo el historial';
    }
    
    const fechaInicio = new Date();
    switch (range) {
        case '3meses':
            fechaInicio.setMonth(hoy.getMonth() - 3);
            break;
        case '6meses':
            fechaInicio.setMonth(hoy.getMonth() - 6);
            break;
        case '12meses':
            fechaInicio.setFullYear(hoy.getFullYear() - 1);
            break;
        case 'todo':
            return null;
        default:
            fechaInicio.setMonth(hoy.getMonth() - 3);
    }
    
    const formatoMes = { month: 'long', year: 'numeric' };
    const mesInicio = fechaInicio.toLocaleDateString('es-ES', formatoMes);
    const mesFin = hoy.toLocaleDateString('es-ES', formatoMes);
    
    // Capitalizar la primera letra de cada mes
    const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    
    return `${capitalizar(mesInicio)} - ${capitalizar(mesFin)}`;
};

// ====================== ENDPOINT PRINCIPAL ======================
router.get("/reporte/ReporteGeneral/:range", async (req, res) => {
  try {
    const client = await pool.connect();

    // =========================
    // OBTENER PARÁMETROS DE RANGO DESDE LA URL
    // =========================
    const { range = '3meses' } = req.params;
    const intervalo = getDateRange(range);
    const periodo = getPeriodoLabel(range);
    
    // 1️⃣ Pacientes activos por mes (filtrado por rango)
    const activosPorMesQuery = intervalo 
      ? `
        SELECT 
          TO_CHAR(DATE_TRUNC('month', di.fecha_ingreso), 'TMMonth') AS mes,
          COUNT(DISTINCT p.cedula) AS cantidad
        FROM pacientes p
        JOIN datos_ingreso di ON di.cedula_paciente = p.cedula
        WHERE p.estado <> 'Inactivo'
          AND di.fecha_ingreso >= (CURRENT_DATE - INTERVAL '${intervalo}')
        GROUP BY DATE_TRUNC('month', di.fecha_ingreso)
        ORDER BY DATE_TRUNC('month', di.fecha_ingreso);
      `
      : `
        SELECT 
          TO_CHAR(DATE_TRUNC('month', di.fecha_ingreso), 'TMMonth') AS mes,
          COUNT(DISTINCT p.cedula) AS cantidad
        FROM pacientes p
        JOIN datos_ingreso di ON di.cedula_paciente = p.cedula
        WHERE p.estado <> 'Inactivo' 
          AND di.fecha_ingreso >= (CURRENT_DATE - INTERVAL '6 months')
        GROUP BY DATE_TRUNC('month', di.fecha_ingreso)
        ORDER BY DATE_TRUNC('month', di.fecha_ingreso);
      `;

    // 2️⃣ Pacientes por estado clínico (filtrado por rango)
    const estadosClinicosQuery = intervalo
      ? `
        SELECT estado, COUNT(DISTINCT p.cedula) AS cantidad
        FROM pacientes p
        JOIN datos_ingreso di ON p.cedula = di.cedula_paciente
        WHERE estado IN ('Estable', 'Mejorando', 'Critico')
          AND di.fecha_ingreso >= (CURRENT_DATE - INTERVAL '${intervalo}')
        GROUP BY estado;
      `
      : `
        SELECT estado, COUNT(*) AS cantidad
        FROM pacientes
        WHERE estado IN ('Estable', 'Mejorando', 'Critico')
        GROUP BY estado;
      `;

    // 3️⃣ Pacientes por tipo de diálisis (filtrado por rango)
    const dialisisQuery = intervalo
      ? `
        SELECT dm.tipo_dialisis, COUNT(DISTINCT dm.cedula_paciente) AS cantidad
        FROM datos_medicos dm
        JOIN datos_ingreso di ON dm.cedula_paciente = di.cedula_paciente
        WHERE dm.tipo_dialisis IN ('Hemodialisis', 'Peritoneal')
          AND di.fecha_ingreso >= (CURRENT_DATE - INTERVAL '${intervalo}')
        GROUP BY dm.tipo_dialisis;
      `
      : `
        SELECT tipo_dialisis, COUNT(*) AS cantidad
        FROM datos_medicos
        WHERE tipo_dialisis IN ('Hemodialisis', 'Peritoneal')
        GROUP BY tipo_dialisis;
      `;

    // 4️⃣ Pacientes por tipo de acceso vascular (filtrado por rango)
    const accesosQuery = intervalo
      ? `
        SELECT av.tipo, COUNT(DISTINCT av.cedula_paciente) AS cantidad
        FROM accesos_vasculares av
        JOIN datos_ingreso di ON av.cedula_paciente = di.cedula_paciente
        WHERE av.tipo IN ('cateter-tem', 'cateter-per', 'fistula')
          AND di.fecha_ingreso >= (CURRENT_DATE - INTERVAL '${intervalo}')
        GROUP BY av.tipo;
      `
      : `
        SELECT tipo, COUNT(DISTINCT cedula_paciente) AS cantidad
        FROM accesos_vasculares
        WHERE tipo IN ('cateter-tem', 'cateter-per', 'fistula')
        GROUP BY tipo;
      `;

    // Ejecutar todas las consultas en paralelo
    const [
      activosPorMes,
      estadosClinicos,
      dialisis,
      accesos
    ] = await Promise.all([
      client.query(activosPorMesQuery),
      client.query(estadosClinicosQuery),
      client.query(dialisisQuery),
      client.query(accesosQuery)
    ]);

    client.release();

    res.json({
      success: true,
      data: {
        pacientes_activos: activosPorMes.rows,
        estados_clinicos: estadosClinicos.rows,
        tipo_dialisis: dialisis.rows,
        accesos_vasculares: accesos.rows,
        periodo: periodo,
      },
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error interno del servidor" 
    });
  }
});

export default router;
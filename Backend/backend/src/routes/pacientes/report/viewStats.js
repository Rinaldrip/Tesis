import express from "express";
import pool from "../../../pool.js";

const router = express.Router();

// Mapeo de rangos a fechas (igual que en el frontend)
const getDateRange = (range) => {
    const hoy = new Date();
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
    
    return fechaInicio;
};

const getPeriodoLabel = (range) => {
    const hoy = new Date();
    const fechaInicio = getDateRange(range);
    
    if (range === 'todo') {
        return 'Todo el historial';
    }
    
    if (fechaInicio) {
        const formatoMes = { month: 'long', year: 'numeric' };
        const mesInicio = fechaInicio.toLocaleDateString('es-ES', formatoMes);
        const mesFin = hoy.toLocaleDateString('es-ES', formatoMes);
        
        // Capitalizar la primera letra de cada mes
        const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);
        
        return `${capitalizar(mesInicio)} - ${capitalizar(mesFin)}`;
    }
    
    return 'Últimos 3 meses';
};

// Endpoint actualizado con parámetro en la URL
router.get("/reporte/viewStats/:range", async (req, res) => {
  try {
    const client = await pool.connect();

    const { range } = req.params;
    
    // Obtener fecha de inicio basada en el rango
    const fechaInicio = getDateRange(range);
    const periodo = getPeriodoLabel(range);

    const activosQuery = `
      SELECT 
        COUNT(*) AS total,
        AVG(EXTRACT(YEAR FROM AGE(fecha_nacimiento)))::NUMERIC(5,2) AS edad_promedio,
        SUM(CASE WHEN sexo THEN 1 ELSE 0 END) AS hombres,
        SUM(CASE WHEN NOT sexo THEN 1 ELSE 0 END) AS mujeres
      FROM pacientes
      WHERE estado != 'Inactivo'
    `;

    // Cambios según el período seleccionado
    const activosVariacion = `
      SELECT
        SUM(CASE WHEN fecha_ingreso >= $1 THEN 1 ELSE 0 END) AS nuevos,
        SUM(CASE WHEN fecha_egreso >= $1 THEN 1 ELSE 0 END) AS egresos
      FROM datos_ingreso di
      INNER JOIN pacientes p ON p.cedula = di.cedula_paciente
      WHERE p.estado != 'Inactivo'
    `;

    // 2️⃣ Pacientes hipertensos (filtrados por fecha de ingreso)
    const hipertensosQuery = `
      SELECT 
        COUNT(DISTINCT p.cedula) AS total,
        AVG(EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)))::NUMERIC(5,2) AS edad_promedio,
        SUM(CASE WHEN p.sexo THEN 1 ELSE 0 END) AS hombres,
        SUM(CASE WHEN NOT p.sexo THEN 1 ELSE 0 END) AS mujeres
      FROM datos_medicos dm
      INNER JOIN pacientes p ON p.cedula = dm.cedula_paciente
      INNER JOIN datos_ingreso di ON p.cedula = di.cedula_paciente
      WHERE dm.hipertension_arterial = TRUE
        AND ($1::DATE IS NULL OR di.fecha_ingreso >= $1)
    `;

    const hipertensosVariacion = `
      SELECT 
        COUNT(DISTINCT di.cedula_paciente) FILTER (WHERE di.fecha_ingreso >= $1) AS nuevos
      FROM datos_ingreso di
      INNER JOIN datos_medicos dm ON di.cedula_paciente = dm.cedula_paciente
      WHERE dm.hipertension_arterial = TRUE
    `;

    // 3️⃣ Pacientes diabéticos (filtrados por fecha de ingreso)
    const diabeticosQuery = `
      SELECT 
        COUNT(DISTINCT p.cedula) AS total,
        AVG(EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)))::NUMERIC(5,2) AS edad_promedio,
        SUM(CASE WHEN p.sexo THEN 1 ELSE 0 END) AS hombres,
        SUM(CASE WHEN NOT p.sexo THEN 1 ELSE 0 END) AS mujeres,
        SUM(CASE WHEN LOWER(dm.diabetes) = 'diabetes1' THEN 1 ELSE 0 END) AS tipo1,
        SUM(CASE WHEN LOWER(dm.diabetes) = 'diabetes2' THEN 1 ELSE 0 END) AS tipo2
      FROM datos_medicos dm
      INNER JOIN pacientes p ON p.cedula = dm.cedula_paciente
      INNER JOIN datos_ingreso di ON p.cedula = di.cedula_paciente
      WHERE dm.diabetes != 'NA'
        AND ($1::DATE IS NULL OR di.fecha_ingreso >= $1)
    `;

    const diabeticosVariacion = `
      SELECT COUNT(DISTINCT di.cedula_paciente) FILTER (WHERE di.fecha_ingreso >= $1) AS nuevos
      FROM datos_ingreso di
      INNER JOIN datos_medicos dm ON di.cedula_paciente = dm.cedula_paciente
      WHERE dm.diabetes != 'NA'
    `;

    // 4️⃣ Pacientes con catéter temporal (filtrados por fecha)
    const cateterQuery = `
      SELECT COUNT(DISTINCT av.cedula_paciente) AS total
      FROM accesos_vasculares av
      INNER JOIN datos_ingreso di ON av.cedula_paciente = di.cedula_paciente
      WHERE LOWER(av.tipo) = 'cateter-tem'
        AND ($1::DATE IS NULL OR di.fecha_ingreso >= $1)
    `;

    const cateterVariacion = `
      SELECT COUNT(DISTINCT cedula_paciente) AS nuevos
      FROM accesos_vasculares
      WHERE LOWER(tipo) = 'cateter-tem' 
        AND fecha_realizada >= $1
    `;

    // 5️⃣ Pacientes inactivos (filtrados por fecha de egreso)
    const inactivosQuery = `
      SELECT COUNT(*) AS total
      FROM pacientes p
      INNER JOIN datos_ingreso di ON p.cedula = di.cedula_paciente
      WHERE p.estado = 'Inactivo'
        AND ($1::DATE IS NULL OR di.fecha_egreso >= $1)
    `;

    const inactivosVariacion = `
      SELECT COUNT(*) AS nuevos
      FROM pacientes p
      INNER JOIN datos_ingreso di ON p.cedula = di.cedula_paciente
      WHERE p.estado = 'Inactivo' 
        AND di.fecha_egreso >= $1
    `;

    // 6️⃣ Pacientes críticos (filtrados por fecha de ingreso)
    const criticosQuery = `
      SELECT COUNT(*) AS total
      FROM pacientes p
      INNER JOIN datos_ingreso di ON p.cedula = di.cedula_paciente
      WHERE p.estado = 'Critico'
        AND ($1::DATE IS NULL OR di.fecha_ingreso >= $1)
    `;

    const criticosVariacion = `
      SELECT COUNT(*) AS nuevos
      FROM pacientes p
      INNER JOIN datos_ingreso di ON p.cedula = di.cedula_paciente
      WHERE p.estado = 'Critico' 
        AND di.fecha_ingreso >= $1
    `;

    // 7️⃣ Diálisis Peritoneal (filtrados por fecha de ingreso)
    const peritonealQuery = `
      SELECT COUNT(DISTINCT dm.cedula_paciente) AS total
      FROM datos_medicos dm
      INNER JOIN datos_ingreso di ON dm.cedula_paciente = di.cedula_paciente
      WHERE LOWER(dm.tipo_dialisis) = 'peritoneal'
        AND ($1::DATE IS NULL OR di.fecha_ingreso >= $1)
    `;

    const peritonealVariacion = `
      SELECT COUNT(DISTINCT dm.cedula_paciente) AS nuevos
      FROM datos_medicos dm
      INNER JOIN datos_ingreso di ON dm.cedula_paciente = di.cedula_paciente
      WHERE LOWER(dm.tipo_dialisis) = 'peritoneal' 
        AND di.fecha_ingreso >= $1
    `;

    // 8️⃣ Hemodiálisis (filtrados por fecha de ingreso)
    const hemodialisisQuery = `
      SELECT COUNT(DISTINCT dm.cedula_paciente) AS total
      FROM datos_medicos dm
      INNER JOIN datos_ingreso di ON dm.cedula_paciente = di.cedula_paciente
      WHERE LOWER(dm.tipo_dialisis) = 'hemodialisis'
        AND ($1::DATE IS NULL OR di.fecha_ingreso >= $1)
    `;

    const hemodialisisVariacion = `
      SELECT COUNT(DISTINCT dm.cedula_paciente) AS nuevos
      FROM datos_medicos dm
      INNER JOIN datos_ingreso di ON dm.cedula_paciente = di.cedula_paciente
      WHERE LOWER(dm.tipo_dialisis) = 'hemodialisis' 
        AND di.fecha_ingreso >= $1
    `;

    // =========================
    // EJECUTAR TODAS LAS CONSULTAS
    // =========================
    const [
      activos,
      activosVar,
      hipertensos,
      hipertensosVar,
      diabeticos,
      diabeticosVar,
      cateter,
      cateterVar,
      inactivos,
      inactivosVar,
      criticos,
      criticosVar,
      peritoneal,
      peritonealVar,
      hemodialisis,
      hemodialisisVar,
    ] = await Promise.all([
      client.query(activosQuery),
      client.query(activosVariacion, [fechaInicio]),
      client.query(hipertensosQuery, [fechaInicio]),
      client.query(hipertensosVariacion, [fechaInicio]),
      client.query(diabeticosQuery, [fechaInicio]),
      client.query(diabeticosVariacion, [fechaInicio]),
      client.query(cateterQuery, [fechaInicio]),
      client.query(cateterVariacion, [fechaInicio]),
      client.query(inactivosQuery, [fechaInicio]),
      client.query(inactivosVariacion, [fechaInicio]),
      client.query(criticosQuery, [fechaInicio]),
      client.query(criticosVariacion, [fechaInicio]),
      client.query(peritonealQuery, [fechaInicio]),
      client.query(peritonealVariacion, [fechaInicio]),
      client.query(hemodialisisQuery, [fechaInicio]),
      client.query(hemodialisisVariacion, [fechaInicio]),
    ]);

    // Total de pacientes (para calcular %) - siempre todos los pacientes
    const totalPacientes = parseInt(activos.rows[0].total) + parseInt(inactivos.rows[0].total);

    // =========================
    // FORMAR RESPUESTA JSON
    // =========================
    const data = {
      pacientes_activos: {
        total: parseInt(activos.rows[0].total),
        edad_promedio: parseFloat(activos.rows[0].edad_promedio),
        hombres: parseInt(activos.rows[0].hombres),
        mujeres: parseInt(activos.rows[0].mujeres),
        aumento_periodo: parseInt(activosVar.rows[0].nuevos),
        disminuyo_periodo: parseInt(activosVar.rows[0].egresos),
      },
      hipertensos: {
        total: parseInt(hipertensos.rows[0].total),
        edad_promedio: parseFloat(hipertensos.rows[0].edad_promedio),
        hombres: parseInt(hipertensos.rows[0].hombres),
        mujeres: parseInt(hipertensos.rows[0].mujeres),
        aumento_periodo: parseInt(hipertensosVar.rows[0].nuevos),
        porcentaje: ((parseInt(hipertensos.rows[0].total) / totalPacientes) * 100).toFixed(2),
      },
      diabeticos: {
        total: parseInt(diabeticos.rows[0].total),
        edad_promedio: parseFloat(diabeticos.rows[0].edad_promedio),
        hombres: parseInt(diabeticos.rows[0].hombres),
        mujeres: parseInt(diabeticos.rows[0].mujeres),
        tipo1: parseInt(diabeticos.rows[0].tipo1),
        tipo2: parseInt(diabeticos.rows[0].tipo2),
        aumento_periodo: parseInt(diabeticosVar.rows[0].nuevos),
        porcentaje: ((parseInt(diabeticos.rows[0].total) / totalPacientes) * 100).toFixed(2),
      },
      cateter_temporal: {
        total: parseInt(cateter.rows[0].total),
        aumento_periodo: parseInt(cateterVar.rows[0].nuevos),
        porcentaje: ((parseInt(cateter.rows[0].total) / totalPacientes) * 100).toFixed(2),
      },
      inactivos: {
        total: parseInt(inactivos.rows[0].total),
        aumento_periodo: parseInt(inactivosVar.rows[0].nuevos),
        porcentaje: ((parseInt(inactivos.rows[0].total) / totalPacientes) * 100).toFixed(2),
      },
      criticos: {
        total: parseInt(criticos.rows[0].total),
        aumento_periodo: parseInt(criticosVar.rows[0].nuevos),
        porcentaje: ((parseInt(criticos.rows[0].total) / totalPacientes) * 100).toFixed(2),
      },
      dialisis_peritoneal: {
        total: parseInt(peritoneal.rows[0].total),
        aumento_periodo: parseInt(peritonealVar.rows[0].nuevos),
        porcentaje: ((parseInt(peritoneal.rows[0].total) / totalPacientes) * 100).toFixed(2),
      },
      hemodialisis: {
        total: parseInt(hemodialisis.rows[0].total),
        aumento_periodo: parseInt(hemodialisisVar.rows[0].nuevos),
        porcentaje: ((parseInt(hemodialisis.rows[0].total) / totalPacientes) * 100).toFixed(2),
      },
      periodo: periodo
    };

    client.release();
    res.json({ 
      success: true, 
      periodo,
      data 
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: "Error obteniendo estadísticas" 
    });
  }
});

export default router;
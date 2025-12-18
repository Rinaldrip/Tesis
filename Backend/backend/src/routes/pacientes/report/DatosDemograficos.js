import express from "express";
import pool from "../../../pool.js";

const router = express.Router();

router.get("/reporte/datosDemograficos", async (req, res) => {
  try {
    const client = await pool.connect();

    // =========================
    // 1. DISTRIBUCIÓN POR GRUPOS DE EDAD
    // =========================
    const distribucionEdadQuery = `
      SELECT 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) <= 18 THEN '0-18'
          WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) <= 30 THEN '19-30'
          WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) <= 45 THEN '31-45'
          WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) <= 60 THEN '46-60'
          ELSE '61+'
        END as grupo,
        COUNT(*) as cantidad
      FROM pacientes 
      WHERE fecha_nacimiento IS NOT NULL
      GROUP BY 
        CASE 
          WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) <= 18 THEN '0-18'
          WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) <= 30 THEN '19-30'
          WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) <= 45 THEN '31-45'
          WHEN EXTRACT(YEAR FROM AGE(fecha_nacimiento)) <= 60 THEN '46-60'
          ELSE '61+'
        END
      ORDER BY 
        MIN(EXTRACT(YEAR FROM AGE(fecha_nacimiento)))
    `;

    // =========================
    // 2. DISTRIBUCIÓN POR SEXO
    // =========================
    const distribucionSexoQuery = `
      SELECT 
        CASE 
          WHEN sexo = true THEN 'Hombre' 
          ELSE 'Mujer' 
        END as sexo,
        COUNT(*) as cantidad
      FROM pacientes 
      WHERE sexo IS NOT NULL
      GROUP BY sexo
    `;

    // =========================
    // 3. ESTADÍSTICAS DE EDAD GENERAL
    // =========================
    const estadisticasEdadQuery = `
      SELECT 
        ROUND(AVG(EXTRACT(YEAR FROM AGE(fecha_nacimiento)))::NUMERIC, 1) as media,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(YEAR FROM AGE(fecha_nacimiento))) as mediana
      FROM pacientes 
      WHERE fecha_nacimiento IS NOT NULL
    `;

    // =========================
    // 4. ESTADÍSTICAS DE EDAD POR SEXO
    // =========================
    const estadisticasEdadSexoQuery = `
      SELECT 
        CASE 
          WHEN sexo = true THEN 'hombres'
          ELSE 'mujeres'
        END as grupo,
        ROUND(AVG(EXTRACT(YEAR FROM AGE(fecha_nacimiento)))::NUMERIC, 1) as media,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(YEAR FROM AGE(fecha_nacimiento))) as mediana
      FROM pacientes 
      WHERE fecha_nacimiento IS NOT NULL AND sexo IS NOT NULL
      GROUP BY sexo
    `;

    // =========================
    // 5. COMPOSICIÓN ÉTNICA
    // =========================
    const composicionEtnicaQuery = `
      SELECT 
        etnia,
        COUNT(*) as cantidad
      FROM pacientes 
      WHERE etnia IS NOT NULL
      GROUP BY etnia
    `;

    // =========================
    // EJECUTAR TODAS LAS CONSULTAS
    // =========================
    const [
      distribucionEdadResult,
      distribucionSexoResult,
      estadisticasEdadResult,
      estadisticasEdadSexoResult,
      composicionEtnicaResult
    ] = await Promise.all([
      client.query(distribucionEdadQuery),
      client.query(distribucionSexoQuery),
      client.query(estadisticasEdadQuery),
      client.query(estadisticasEdadSexoQuery),
      client.query(composicionEtnicaQuery)
    ]);

    // =========================
    // PROCESAR RESULTADOS
    // =========================

    // Calcular total de pacientes para porcentajes
    const totalPacientes = distribucionEdadResult.rows.reduce((sum, row) => sum + parseInt(row.cantidad), 0);

    // 1. Distribución por edad
    const distribucion_edad = distribucionEdadResult.rows.map(row => ({
      grupo: row.grupo,
      cantidad: parseInt(row.cantidad),
      porcentaje: totalPacientes > 0 ? Math.round((parseInt(row.cantidad) / totalPacientes) * 100) / 10 : 0
    }));

    // 2. Distribución por sexo
    const distribucion_sexo = distribucionSexoResult.rows.map(row => ({
      sexo: row.sexo,
      cantidad: parseInt(row.cantidad),
      porcentaje: totalPacientes > 0 ? Math.round((parseInt(row.cantidad) / totalPacientes) * 100) / 10 : 0
    }));

    // 3. Estadísticas de edad general
    const estadisticas_general = {
      media: parseFloat(estadisticasEdadResult.rows[0]?.media) || 0,
      mediana: parseFloat(estadisticasEdadResult.rows[0]?.mediana) || 0
    };

    // 4. Estadísticas de edad por sexo
    const estadisticas_por_sexo = {};
    estadisticasEdadSexoResult.rows.forEach(row => {
      estadisticas_por_sexo[row.grupo] = {
        media: parseFloat(row.media) || 0,
        mediana: parseFloat(row.mediana) || 0
      };
    });

    // 5. Composición étnica
    const composicion_etnica = composicionEtnicaResult.rows.map(row => ({
      etnia: row.etnia,
      cantidad: parseInt(row.cantidad),
      porcentaje: totalPacientes > 0 ? Math.round((parseInt(row.cantidad) / totalPacientes) * 100) / 10 : 0
    }));

    // =========================
    // FORMAR RESPUESTA JSON
    // =========================
    const data = {
      distribucion_edad,
      distribucion_sexo,
      estadisticas_edad: {
        general: estadisticas_general,
        hombres: estadisticas_por_sexo.hombres || { media: 0, mediana: 0 },
        mujeres: estadisticas_por_sexo.mujeres || { media: 0, mediana: 0 }
      },
      composicion_etnica
    };

    client.release();
    res.json({ success: true, data });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Error obteniendo datos demográficos" });
  }
});

export default router;
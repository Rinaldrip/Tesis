import express from "express";
import pool from "../../../pool.js";

const router = express.Router();

// Mapeo de rangos a fechas
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
        case '1año':
            fechaInicio.setFullYear(hoy.getFullYear() - 1);
            break;
        case 'todo':
            // Para "todo", retornamos null para no filtrar por fecha
            return null;
        default:
            fechaInicio.setMonth(hoy.getMonth() - 3);
    }
    
    return fechaInicio;
};

const getPeriodoLabel = (range) => {
    const hoy = new Date();
    
    if (range === 'todo') {
        return 'Todo el historial';
    }
    
    const fechaInicio = getDateRange(range);
    
    const formatoMes = { month: 'long', year: 'numeric' };
    const mesInicio = fechaInicio.toLocaleDateString('es-ES', formatoMes);
    const mesFin = hoy.toLocaleDateString('es-ES', formatoMes);
    
    // Capitalizar la primera letra de cada mes
    const capitalizar = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    
    return `${capitalizar(mesInicio)} - ${capitalizar(mesFin)}`;
};

// Función auxiliar para determinar estabilidad basada en desviación estándar
function calcularEstabilidad(desviacionEstandar) {
  if (desviacionEstandar < 0.5) return "Muy Estable";
  if (desviacionEstandar < 1.0) return "Estable";
  if (desviacionEstandar < 2.0) return "Moderadamente Variable";
  return "Variable";
}

// ====================== ENDPOINT PRINCIPAL ======================
router.get("/reporte/DatosClinicos/:range", async (req, res) => {
  try {
    const client = await pool.connect();

    // =========================
    // OBTENER PARÁMETROS DE RANGO DESDE LA URL
    // =========================
    const { range = '3meses' } = req.params;
    const fechaInicio = getDateRange(range);
    const periodo = getPeriodoLabel(range);

    // =========================
    // FUNCIÓN PARA OBTENER DATOS HISTÓRICOS POR PARÁMETRO
    // =========================
    const getDatosHistoricos = async (columna, nombreParametro) => {
      // Determinar límite de meses basado en el rango
      let limiteMeses;
      switch (range) {
        case '3meses':
          limiteMeses = 3;
          break;
        case '6meses':
          limiteMeses = 6;
          break;
        case '12meses':
          limiteMeses = 12;
          break;
        case 'todo':
          limiteMeses = 24; // Límite más alto para "todo"
          break;
        default:
          limiteMeses = 3;
      }

      const query = fechaInicio 
        ? `
          SELECT 
            TO_CHAR(fecha, 'YYYY-MM') AS mes,
            EXTRACT(YEAR FROM fecha) AS anio,
            EXTRACT(MONTH FROM fecha) AS mes_numero,
            ROUND(AVG(${columna})::NUMERIC, 2) AS promedio_mensual,
            COUNT(${columna}) AS total_muestras
          FROM laboratorios 
          WHERE fecha >= $1
            AND ${columna} IS NOT NULL
            AND ${columna} > 0
          GROUP BY EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha), TO_CHAR(fecha, 'YYYY-MM')
          ORDER BY anio DESC, mes_numero DESC
          LIMIT $2
        `
        : `
          SELECT 
            TO_CHAR(fecha, 'YYYY-MM') AS mes,
            EXTRACT(YEAR FROM fecha) AS anio,
            EXTRACT(MONTH FROM fecha) AS mes_numero,
            ROUND(AVG(${columna})::NUMERIC, 2) AS promedio_mensual,
            COUNT(${columna}) AS total_muestras
          FROM laboratorios 
          WHERE ${columna} IS NOT NULL
            AND ${columna} > 0
          GROUP BY EXTRACT(YEAR FROM fecha), EXTRACT(MONTH FROM fecha), TO_CHAR(fecha, 'YYYY-MM')
          ORDER BY anio DESC, mes_numero DESC
          LIMIT $1
        `;

      const params = fechaInicio ? [fechaInicio, limiteMeses] : [limiteMeses];
      const result = await client.query(query, params);

      // Ordenar cronológicamente por año y mes
      const mesesOrdenados = result.rows
        .sort((a, b) => {
          if (a.anio === b.anio) {
            return a.mes_numero - b.mes_numero;
          }
          return a.anio - b.anio;
        })
        .map(row => ({
          month: row.mes,
          value: parseFloat(row.promedio_mensual) || 0
        }));

      return mesesOrdenados;
    };

    // =========================
    // CONSULTAS PARA PROMEDIOS GENERALES
    // =========================
    const getPromedioGeneral = async (columna) => {
      const query = fechaInicio
        ? `
          SELECT 
            ROUND(AVG(${columna})::NUMERIC, 2) as promedio,
            COUNT(${columna}) as total_muestras,
            ROUND(STDDEV(${columna})::NUMERIC, 2) as desviacion_estandar
          FROM laboratorios 
          WHERE fecha >= $1
            AND ${columna} IS NOT NULL
            AND ${columna} > 0
        `
        : `
          SELECT 
            ROUND(AVG(${columna})::NUMERIC, 2) as promedio,
            COUNT(${columna}) as total_muestras,
            ROUND(STDDEV(${columna})::NUMERIC, 2) as desviacion_estandar
          FROM laboratorios 
          WHERE ${columna} IS NOT NULL
            AND ${columna} > 0
        `;

      const params = fechaInicio ? [fechaInicio] : [];
      const result = await client.query(query, params);
      return result.rows[0];
    };

    // =========================
    // EJECUTAR TODAS LAS CONSULTAS
    // =========================
    const [
      hemoglobinaHistorico,
      hematocritoHistorico,
      glicemiaHistorico,
      ureaHistorico,
      creatininaHistorico,
      albuminaHistorico,
      calcioHistorico,
      fosforoHistorico,
      hemoglobinaGeneral,
      hematocritoGeneral,
      glicemiaGeneral,
      ureaGeneral,
      creatininaGeneral,
      albuminaGeneral,
      calcioGeneral,
      fosforoGeneral
    ] = await Promise.all([
      getDatosHistoricos('hb', 'Hemoglobina'),
      getDatosHistoricos('hto', 'Hematocrito'),
      getDatosHistoricos('glicemia', 'Glicemia'),
      getDatosHistoricos('urea', 'Urea'),
      getDatosHistoricos('creatinina', 'Creatinina'),
      getDatosHistoricos('albumina', 'Albumina'),
      getDatosHistoricos('ca', 'Calcio'),
      getDatosHistoricos('p', 'Fosforo'),
      getPromedioGeneral('hb'),
      getPromedioGeneral('hto'),
      getPromedioGeneral('glicemia'),
      getPromedioGeneral('urea'),
      getPromedioGeneral('creatinina'),
      getPromedioGeneral('albumina'),
      getPromedioGeneral('ca'),
      getPromedioGeneral('p')
    ]);

    // =========================
    // PROCESAR RESULTADOS
    // =========================
    const data = {
      hemoglobina: {
        promedio: parseFloat(hemoglobinaGeneral?.promedio) || 0,
        total_muestras: parseInt(hemoglobinaGeneral?.total_muestras) || 0,
        desviacion_estandar: parseFloat(hemoglobinaGeneral?.desviacion_estandar) || 0,
        unidad: "g/dL",
        rango_referencia: "12.0 - 16.0 g/dL",
        estabilidad: calcularEstabilidad(parseFloat(hemoglobinaGeneral?.desviacion_estandar) || 0),
        datos_historicos: hemoglobinaHistorico
      },
      hematocrito: {
        promedio: parseFloat(hematocritoGeneral?.promedio) || 0,
        total_muestras: parseInt(hematocritoGeneral?.total_muestras) || 0,
        desviacion_estandar: parseFloat(hematocritoGeneral?.desviacion_estandar) || 0,
        unidad: "%",
        rango_referencia: "36% - 48%",
        estabilidad: calcularEstabilidad(parseFloat(hematocritoGeneral?.desviacion_estandar) || 0),
        datos_historicos: hematocritoHistorico
      },
      glicemia: {
        promedio: parseFloat(glicemiaGeneral?.promedio) || 0,
        total_muestras: parseInt(glicemiaGeneral?.total_muestras) || 0,
        desviacion_estandar: parseFloat(glicemiaGeneral?.desviacion_estandar) || 0,
        unidad: "mg/dL",
        rango_referencia: "70 - 100 mg/dL",
        estabilidad: calcularEstabilidad(parseFloat(glicemiaGeneral?.desviacion_estandar) || 0),
        datos_historicos: glicemiaHistorico
      },
      urea: {
        promedio: parseFloat(ureaGeneral?.promedio) || 0,
        total_muestras: parseInt(ureaGeneral?.total_muestras) || 0,
        desviacion_estandar: parseFloat(ureaGeneral?.desviacion_estandar) || 0,
        unidad: "mg/dL",
        rango_referencia: "10 - 50 mg/dL",
        estabilidad: calcularEstabilidad(parseFloat(ureaGeneral?.desviacion_estandar) || 0),
        datos_historicos: ureaHistorico
      },
      creatinina: {
        promedio: parseFloat(creatininaGeneral?.promedio) || 0,
        total_muestras: parseInt(creatininaGeneral?.total_muestras) || 0,
        desviacion_estandar: parseFloat(creatininaGeneral?.desviacion_estandar) || 0,
        unidad: "mg/dL",
        rango_referencia: "0.6 - 1.2 mg/dL",
        estabilidad: calcularEstabilidad(parseFloat(creatininaGeneral?.desviacion_estandar) || 0),
        datos_historicos: creatininaHistorico
      },
      albumina: {
        promedio: parseFloat(albuminaGeneral?.promedio) || 0,
        total_muestras: parseInt(albuminaGeneral?.total_muestras) || 0,
        desviacion_estandar: parseFloat(albuminaGeneral?.desviacion_estandar) || 0,
        unidad: "g/dL",
        rango_referencia: "3.4 - 5.4 g/dL",
        estabilidad: calcularEstabilidad(parseFloat(albuminaGeneral?.desviacion_estandar) || 0),
        datos_historicos: albuminaHistorico
      },
      calcio: {
        promedio: parseFloat(calcioGeneral?.promedio) || 0,
        total_muestras: parseInt(calcioGeneral?.total_muestras) || 0,
        desviacion_estandar: parseFloat(calcioGeneral?.desviacion_estandar) || 0,
        unidad: "mg/dL",
        rango_referencia: "8.5 - 10.5 mg/dL",
        estabilidad: calcularEstabilidad(parseFloat(calcioGeneral?.desviacion_estandar) || 0),
        datos_historicos: calcioHistorico
      },
      fosforo: {
        promedio: parseFloat(fosforoGeneral?.promedio) || 0,
        total_muestras: parseInt(fosforoGeneral?.total_muestras) || 0,
        desviacion_estandar: parseFloat(fosforoGeneral?.desviacion_estandar) || 0,
        unidad: "mg/dL",
        rango_referencia: "2.5 - 4.5 mg/dL",
        estabilidad: calcularEstabilidad(parseFloat(fosforoGeneral?.desviacion_estandar) || 0),
        datos_historicos: fosforoHistorico
      }
    };

    // =========================
    // FORMAR RESPUESTA JSON
    // =========================
    const response = {
      success: true,
      periodo: periodo,
      data
    };

    client.release();
    res.json(response);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: "Error obteniendo estadísticas de laboratorio" 
    });
  }
});

export default router;
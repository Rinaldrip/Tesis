import { procesarDatosMensuales } from "transformarmes.js";

function transformarDatosParaExcel(estadisticas, estados, demograficos, laboratorios) {
    const datosMensuales = procesarDatosMensuales(laboratorios);
    
    return {
        // ===== DATOS DEL PRIMER ENDPOINT =====
        pacientesActivos: {
            total: estadisticas.data.pacientes_activos.total,
            edadPromedio:estadisticas.data.pacientes_activos.edad_promedio,
            hombres: estadisticas.data.pacientes_activos.hombres,
            mujeres: estadisticas.data.pacientes_activos.mujeres,
            variacion: estadisticas.data.pacientes_activos.aumento_periodo
        },
        pacientesHipertensos: {
            total: estadisticas.data.hipertensos.total,
            edadPromedio: estadisticas.data.hipertensos.edad_promedio,
            hombres: estadisticas.data.hipertensos.hombres,
            mujeres: estadisticas.data.hipertensos.mujeres,
            variacion: estadisticas.data.hipertensos.aumento_periodo
        },
        pacientesDiabeticos: {
            total: estadisticas.data.diabeticos.total,
            edadPromedio:estadisticas.data.diabeticos.edad_promedio,
            hombres: estadisticas.data.diabeticos.hombres,
            mujeres: estadisticas.data.diabeticos.mujeres,
            variacion: estadisticas.data.diabeticos.aumento_periodo
        },
        
        // ===== DATOS DEL SEGUNDO ENDPOINT =====
        estado: {
            critico: parseInt(estados.data.estados_clinicos.find(e => e.estado === 'Critico')?.cantidad || 0),
            estable: parseInt(estados.data.estados_clinicos.find(e => e.estado === 'Estable')?.cantidad || 0),
            mejorando: parseInt(estados.data.estados_clinicos.find(e => e.estado === 'Mejorando')?.cantidad || 0)
        },
        tipo: {
            hemodialisis: parseInt(estados.data.tipo_dialisis.find(t => t.tipo_dialisis === 'Hemodialisis')?.cantidad || 0),
            peritoneal: parseInt(estados.data.tipo_dialisis.find(t => t.tipo_dialisis === 'Peritoneal')?.cantidad || 0)
        },
        accesoVascular: {
            cateterPeritoneal: parseInt(estados.data.accesos_vasculares.find(a => a.tipo === 'cateter-per')?.cantidad || 0),
            cateterTemporal: parseInt(estados.data.accesos_vasculares.find(a => a.tipo === 'cateter-tem')?.cantidad || 0),
            fistulaVA: parseInt(estados.data.accesos_vasculares.find(a => a.tipo === 'fistula')?.cantidad || 0),
        },
        
        // ===== DATOS DEL TERCER ENDPOINT =====
        etnias: {
            caucasico: {
                cantidad: demograficos.data.composicion_etnica.find(e => e.etnia === 'Caucasico')?.cantidad || 0,
                porcentaje: `${demograficos.data.composicion_etnica.find(e => e.etnia === 'Caucasico')?.porcentaje}%` || '0%'
            },
            afro: {
                cantidad: demograficos.data.composicion_etnica.find(e => e.etnia === 'Afro')?.cantidad || 0,
                porcentaje: `${demograficos.data.composicion_etnica.find(e => e.etnia === 'Afro')?.porcentaje}%` || '0%'
            },
            asiatico: {
                cantidad: demograficos.data.composicion_etnica.find(e => e.etnia === 'Asiatico')?.cantidad || 0,
                porcentaje: `${demograficos.data.composicion_etnica.find(e => e.etnia === 'Asiatico')?.porcentaje}%` || '0%'
            }
        },
        distribucionEdad: {
            "0-18": {
                cantidad: demograficos.data.distribucion_edad.find(g => g.grupo === '0-18')?.cantidad || 0,
                porcentaje: `${demograficos.data.distribucion_edad.find(g => g.grupo === '0-18')?.porcentaje}%` || '0%'
            },
            "19-30": {
                cantidad: demograficos.data.distribucion_edad.find(g => g.grupo === '19-30')?.cantidad || 0,
                porcentaje: `${demograficos.data.distribucion_edad.find(g => g.grupo === '19-30')?.porcentaje}%` || '0%'
            },
            "31-45": {
                cantidad: demograficos.data.distribucion_edad.find(g => g.grupo === '31-45')?.cantidad || 0,
                porcentaje: `${demograficos.data.distribucion_edad.find(g => g.grupo === '31-45')?.porcentaje}%` || '0%'
            },
            "46-60": {
                cantidad: demograficos.data.distribucion_edad.find(g => g.grupo === '46-60')?.cantidad || 0,
                porcentaje: `${demograficos.data.distribucion_edad.find(g => g.grupo === '46-60')?.porcentaje}%` || '0%'
            }
        },
        distribucionSexo: {
            hombre: {
                cantidad: demograficos.data.distribucion_sexo.find(s => s.sexo === 'Hombre')?.cantidad || 0,
                porcentaje: `${demograficos.data.distribucion_sexo.find(s => s.sexo === 'Hombre')?.porcentaje}%` || '0%'
            },
            mujer: {
                cantidad: demograficos.data.distribucion_sexo.find(s => s.sexo === 'Mujer')?.cantidad || 0,
                porcentaje: `${demograficos.data.distribucion_sexo.find(s => s.sexo === 'Mujer')?.porcentaje}%` || '0%'
            }
        },
        
        // ===== DATOS DEL CUARTO ENDPOINT =====
        laboratorio: {
            hemoglobina: { promedio: laboratorios.data.hemoglobina.promedio },
            hematocrito: { promedio: laboratorios.data.hematocrito.promedio },
            glicemia: { promedio: laboratorios.data.glicemia.promedio },
            urea: { promedio: laboratorios.data.urea.promedio },
            creatinina: { promedio: laboratorios.data.creatinina.promedio },
            albumina: { promedio: laboratorios.data.albumina.promedio },
            calcio: { promedio: laboratorios.data.calcio.promedio },
            fosforo: { promedio: laboratorios.data.fosforo.promedio }
        },
        
        // Datos históricos mensuales DINÁMICOS
        datosMensuales: datosMensuales
    };
}

export default transformarDatosParaExcel;

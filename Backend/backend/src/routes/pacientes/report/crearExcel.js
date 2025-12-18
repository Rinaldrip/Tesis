import ExcelJS from 'exceljs';

// Función principal para generar el reporte completo
export async function generarReporteCompleto(datosEndpoint1, datosEndpoint2, datosEndpoint3, datosEndpoint4, excelBuffer) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(excelBuffer);

    // 🔧 Asegurar que los datos sean objetos (no strings)
    const parsed1 = typeof datosEndpoint1 === 'string' ? JSON.parse(datosEndpoint1) : datosEndpoint1;
    const parsed2 = typeof datosEndpoint2 === 'string' ? JSON.parse(datosEndpoint2) : datosEndpoint2;
    const parsed3 = typeof datosEndpoint3 === 'string' ? JSON.parse(datosEndpoint3) : datosEndpoint3;
    const parsed4 = typeof datosEndpoint4 === 'string' ? JSON.parse(datosEndpoint4) : datosEndpoint4;


    // Procesar cada endpoint
    if (parsed1) await procesarEndpoint1(workbook, parsed1);
    if (parsed2) await procesarEndpoint2(workbook, parsed2);
    if (parsed3) await procesarEndpoint3(workbook, parsed3);
    if (parsed4) await procesarEndpoint4(workbook, parsed4);

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;

  } catch (error) {
    throw new Error(`Error generando Excel: ${error.message}`);
  }
}


// Función para procesar el endpoint 1 (datos generales)
export async function procesarEndpoint1(workbook, data) {
    const worksheet = workbook.getWorksheet('VISION GENERAL');
    if (!worksheet) {
        throw new Error('Hoja "VISION GENERAL" no encontrada');
    }

    // Insertar período general
    if (data.periodo) {
        worksheet.getCell('E4').value = `Período: ${data.periodo}`;
    }

    // --- PACIENTES ACTIVOS ---
    if (data.data.pacientes_activos) {
        const pa = data.data.pacientes_activos;
        worksheet.getCell('D7').value = pa.total ?? 0;
        worksheet.getCell('E7').value = pa.edad_promedio ?? 0;
        worksheet.getCell('F7').value = pa.hombres ?? 0;
        worksheet.getCell('G7').value = pa.mujeres ?? 0;

        // Variación = aumento - disminución (si existe)
        const variacion = (pa.aumento_periodo || 0) - (pa.disminuyo_periodo || 0);
        worksheet.getCell('H7').value = variacion;
    }

    // --- HIPERTENSOS ---
    if (data.data.hipertensos) {
        const ht = data.data.hipertensos;
        worksheet.getCell('D8').value = ht.total ?? 0;
        worksheet.getCell('E8').value = ht.edad_promedio ?? 0;
        worksheet.getCell('F8').value = ht.hombres ?? 0;
        worksheet.getCell('G8').value = ht.mujeres ?? 0;

        const variacion = (ht.aumento_periodo || 0) - (ht.disminuyo_periodo || 0);
        worksheet.getCell('H8').value = variacion;
    }

    // --- DIABÉTICOS ---
    if (data.data.diabeticos) {
        const db = data.data.diabeticos;
        worksheet.getCell('D9').value = db.total ?? 0;
        worksheet.getCell('E9').value = db.edad_promedio ?? 0;
        worksheet.getCell('F9').value = db.hombres ?? 0;
        worksheet.getCell('G9').value = db.mujeres ?? 0;

        const variacion = (db.aumento_periodo || 0) - (db.disminuyo_periodo || 0);
        worksheet.getCell('H9').value = variacion;

        // Distribución adicional
        worksheet.getCell('B12').value = `• Diabetes Tipo 1: ${db.tipo1 ?? 0} pacientes`;
        worksheet.getCell('B13').value = `• Diabetes Tipo 2: ${db.tipo2 ?? 0} pacientes`;
    }
}

// Función para procesar el endpoint 2 (datos dinámicos)
export async function procesarEndpoint2(workbook, data) {
    // Procesar pacientes activos por mes (hoja DATOS OCULTOS)
    if (data.data.pacientes_activos && Array.isArray(data.data.pacientes_activos)) {
        const worksheetOcultos = workbook.getWorksheet('DATOS OCULTOS');
        if (!worksheetOcultos) {
            throw new Error('Hoja "DATOS OCULTOS" no encontrada');
        }

        // Mapeo de meses a filas
        const mapeoMeses = {
            'Septiembre': { fila: 2 },
            'Octubre': { fila: 3 },
            'Noviembre': { fila: 4 }
        };

        data.data.pacientes_activos.forEach(item => {
            const mesInfo = mapeoMeses[item.mes];
            if (mesInfo) {
                // Mes en columna I, cantidad en columna K
                worksheetOcultos.getCell(`I${mesInfo.fila}`).value = item.mes;
                worksheetOcultos.getCell(`K${mesInfo.fila}`).value = parseInt(item.cantidad);
            }
        });
    }

    // Procesar estados clínicos (hoja VISIÓN GENERAL)
    if (data.data.estados_clinicos && Array.isArray(data.data.estados_clinicos)) {
        const worksheetVision = workbook.getWorksheet('VISION GENERAL');
        
        const mapeoEstados = {
            'Critico': { fila: 19 },
            'Estable': { fila: 20 },
            'Mejorando': { fila: 21 }
        };

        data.data.estados_clinicos.forEach(item => {
            const estadoInfo = mapeoEstados[item.estado];
            if (estadoInfo) {
                worksheetVision.getCell(`D${estadoInfo.fila}`).value = parseInt(item.cantidad);
            }
        });
    }

    // Procesar tipos de diálisis (hoja VISIÓN GENERAL)
    if (data.data.tipo_dialisis && Array.isArray(data.data.tipo_dialisis)) {
        const worksheetVision = workbook.getWorksheet('VISION GENERAL');
        
        const mapeoDialisis = {
            'Hemodialisis': { fila: 19 },
            'Peritoneal': { fila: 20 }
        };

        data.data.tipo_dialisis.forEach(item => {
            const dialisisInfo = mapeoDialisis[item.tipo_dialisis];
            if (dialisisInfo) {
                worksheetVision.getCell(`H${dialisisInfo.fila}`).value = parseInt(item.cantidad);
            }
        });
    }

    // Procesar accesos vasculares (hoja DATOS OCULTOS)
    if (data.data.accesos_vasculares && Array.isArray(data.data.accesos_vasculares)) {
        const worksheetOcultos = workbook.getWorksheet('DATOS OCULTOS');
        
        const mapeoAccesos = {
            'cateter-per': { fila: 16, descripcion: 'Catéter Peritoneal' },
            'cateter-tem': { fila: 17, descripcion: 'Catéter Temporal' },
            'fistula': { fila: 18, descripcion: 'Fistula VA' }
        };

        data.data.accesos_vasculares.forEach(item => {
            const accesoInfo = mapeoAccesos[item.tipo];
            if (accesoInfo) {
                // Actualizar la descripción y la cantidad
                worksheetOcultos.getCell(`B${accesoInfo.fila}`).value = accesoInfo.descripcion;
                worksheetOcultos.getCell(`C${accesoInfo.fila}`).value = parseInt(item.cantidad);
            }
        });
    }
}

// Función para procesar el endpoint 3 (datos demográficos)
export async function procesarEndpoint3(workbook, data) {
    // Procesar distribución por edad (hoja DATOS OCULTOS)
    if (data.data.distribucion_edad && Array.isArray(data.data.distribucion_edad)) {
        const worksheetOcultos = workbook.getWorksheet('DATOS OCULTOS');
        if (!worksheetOcultos) {
            throw new Error('Hoja "DATOS OCULTOS" no encontrada');
        }

        const mapeoEdades = {
            '0-18': { fila: 5 },
            '19-30': { fila: 6 },
            '31-45': { fila: 7 },
            '46-60': { fila: 8 }
        };

        data.data.distribucion_edad.forEach(item => {
            const edadInfo = mapeoEdades[item.grupo];
            if (edadInfo) {
                // Cantidad en columna B, porcentaje en columna C
                worksheetOcultos.getCell(`B${edadInfo.fila}`).value = parseInt(item.cantidad);
                worksheetOcultos.getCell(`C${edadInfo.fila}`).value = `${item.porcentaje}%`;
            }
        });
    }

    // Procesar distribución por sexo (hoja DATOS OCULTOS)
    if (data.data.distribucion_sexo && Array.isArray(data.data.distribucion_sexo)) {
        const worksheetOcultos = workbook.getWorksheet('DATOS OCULTOS');
        
        const mapeoSexo = {
            'Hombre': { fila: 5 },
            'Mujer': { fila: 6 }
        };

        data.data.distribucion_sexo.forEach(item => {
            const sexoInfo = mapeoSexo[item.sexo];
            if (sexoInfo) {
                // Cantidad en columna F, porcentaje en columna G
                worksheetOcultos.getCell(`F${sexoInfo.fila}`).value = parseInt(item.cantidad);
                worksheetOcultos.getCell(`G${sexoInfo.fila}`).value = `${item.porcentaje}%`;
            }
        });
    }

    // Procesar composición étnica (hoja VISIÓN GENERAL)
    if (data.data.composicion_etnica && Array.isArray(data.data.composicion_etnica)) {
        const worksheetVision = workbook.getWorksheet('VISION GENERAL');
        if (!worksheetVision) {
            throw new Error('Hoja "VISIÓN GENERAL" no encontrada');
        }

        const mapeoEtnias = {
            'Caucasico': { fila: 54 },
            'Afro': { fila: 55 },
            'Asiatico': { fila: 56 }
        };

        data.data.composicion_etnica.forEach(item => {
            const etniaInfo = mapeoEtnias[item.etnia];
            if (etniaInfo) {
                // Actualizar etnia en columna D, cantidad en F, porcentaje en G
                worksheetVision.getCell(`D${etniaInfo.fila}`).value = item.etnia;
                worksheetVision.getCell(`F${etniaInfo.fila}`).value = parseInt(item.cantidad);
                worksheetVision.getCell(`G${etniaInfo.fila}`).value = `${item.porcentaje}%`;
            }
        });
    }
}

// Función para procesar el endpoint 4 (datos clínicos y laboratorio)
export async function procesarEndpoint4(workbook, data) {
    const worksheetOcultos = workbook.getWorksheet('DATOS OCULTOS');
    if (!worksheetOcultos) {
        throw new Error('Hoja "DATOS OCULTOS" no encontrada');
    }

    const mapeoParametros = {
        'hemoglobina': {
            promedio: 'B21',
            datosHistoricos: {
                month: { inicio: 'A22' },
                value: { inicio: 'C22' }
            }
        },
        'hematocrito': {
            promedio: 'F21',
            datosHistoricos: {
                month: { inicio: 'E22' },
                value: { inicio: 'G22' }
            }
        },
        'glicemia': {
            promedio: 'J21',
            datosHistoricos: {
                month: { inicio: 'I22' },
                value: { inicio: 'K22' }
            }
        },
        'urea': {
            promedio: 'N21',
            datosHistoricos: {
                month: { inicio: 'M22' },
                value: { inicio: 'O22' }
            }
        },
        'creatinina': {
            promedio: 'R21',
            datosHistoricos: {
                month: { inicio: 'Q22' },
                value: { inicio: 'S22' }
            }
        },
        'albumina': {
            promedio: 'V21',
            datosHistoricos: {
                month: { inicio: 'U22' },
                value: { inicio: 'W22' }
            }
        },
        'calcio': {
            promedio: 'Z21',
            datosHistoricos: {
                month: { inicio: 'Y22' },
                value: { inicio: 'E13' }
            }
        },
        'fosforo': {
            promedio: 'AD21',
            datosHistoricos: {
                month: { inicio: 'AC22' },
                value: { inicio: 'AE22' }
            }
        }
    };

    // Procesar cada parámetro clínico
    for (const [parametro, config] of Object.entries(mapeoParametros)) {
        if (data.data[parametro]) {
            const parametroData = data.data[parametro];
            
            // Insertar promedio
            worksheetOcultos.getCell(config.promedio).value = parseFloat(parametroData.promedio);
            
            // Insertar datos históricos
            if (parametroData.datos_historicos && Array.isArray(parametroData.datos_historicos)) {
                parametroData.datos_historicos.forEach((dato, index) => {
                    const fila = 22 + index; // A22, A23, A24, etc.
                    
                    // Insertar mes (formato YYYY-MM)
                    const columnaMes = config.datosHistoricos.month.inicio.charAt(0);
                    worksheetOcultos.getCell(`${columnaMes}${fila}`).value = dato.month;
                    
                    // Insertar valor
                    const columnaValor = config.datosHistoricos.value.inicio.charAt(0);
                    worksheetOcultos.getCell(`${columnaValor}${fila}`).value = parseFloat(dato.value);
                });
            }
        }
    }
}
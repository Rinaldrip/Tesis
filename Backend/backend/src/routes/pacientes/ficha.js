// src/routes/ficha.js
import { Router } from "express";
import pool from "../../pool.js";

const router = Router();

// Función para manejar valores nulos/undefined
const safeValue = (value, type = 'string') => {
    if (value === null || value === undefined || value === '' || value === 'null') {
        return null;
    }
    
    switch (type) {
        case 'number':
            const num = Number(value);
            return isNaN(num) ? null : num;
        case 'boolean':
            if (typeof value === 'string') {
                if (value.toLowerCase() === 'true' || value === '1' || value === 'si') return true;
                if (value.toLowerCase() === 'false' || value === '0' || value === 'no') return false;
                return null;
            }
            return Boolean(value);
        case 'date':
            if (!value) return null;
            const date = new Date(value);
            return isNaN(date.getTime()) ? null : value;
        default:
            return value;
    }
};

router.post("/paciente/add", async (req, res) => {
    const client = await pool.connect();
    try {
        
        if (!req.body.paciente || !req.body.paciente.cedula) {
            return res.status(400).json({ error: "La cédula del paciente es requerida" });
        }

        const { paciente, datosIngreso, datosMedicos, contactoEmergencia, accesoVascular, laboratorio, tratamientos } = req.body;
        
        await client.query("BEGIN");

        // 1. Insertar paciente (con manejo de valores nulos)
        await client.query(
            `INSERT INTO pacientes 
            (cedula, nombre, apellido, telefono, fecha_nacimiento, lugar_nacimiento, direccion, estado, sexo, etnia) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9,$10)
            ON CONFLICT (cedula) DO UPDATE SET
                nombre=EXCLUDED.nombre,
                apellido=EXCLUDED.apellido,
                telefono=EXCLUDED.telefono,
                fecha_nacimiento=EXCLUDED.fecha_nacimiento,
                lugar_nacimiento=EXCLUDED.lugar_nacimiento,
                direccion=EXCLUDED.direccion,
                estado=EXCLUDED.estado,
                sexo=EXCLUDED.sexo,
                etnia=EXCLUDED.etnia`,
            [
                paciente.cedula,
                paciente.nombre || '',
                paciente.apellido || '',
                safeValue(paciente.telefono),
                safeValue(paciente.fecha_nacimiento, 'date'),
                safeValue(paciente.lugar_nacimiento),
                safeValue(paciente.direccion),
                safeValue(paciente.estado),
                safeValue(paciente.sexo, 'boolean'),
                safeValue(paciente.etnia)
            ]
        );

        // 2. Datos de ingreso (con validación)
        if (datosIngreso) {
            await client.query(
                `INSERT INTO datos_ingreso
                (cedula_paciente, fecha_ingreso, fecha_egreso, etiologia_enfermedad_renal, causa_egreso, peso_ingreso_kg, talla_cm, volumen_residual_cc)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                ON CONFLICT (cedula_paciente) DO UPDATE SET
                    fecha_ingreso=EXCLUDED.fecha_ingreso,
                    fecha_egreso=EXCLUDED.fecha_egreso,
                    etiologia_enfermedad_renal=EXCLUDED.etiologia_enfermedad_renal,
                    causa_egreso=EXCLUDED.causa_egreso,
                    peso_ingreso_kg=EXCLUDED.peso_ingreso_kg,
                    talla_cm=EXCLUDED.talla_cm,
                    volumen_residual_cc=EXCLUDED.volumen_residual_cc`,
                [
                    paciente.cedula,
                    safeValue(datosIngreso.fecha_ingreso, 'date'),
                    safeValue(datosIngreso.fecha_egreso, 'date'),
                    safeValue(datosIngreso.etiologia_enfermedad_renal),
                    safeValue(datosIngreso.causa_egreso),
                    safeValue(datosIngreso.peso_ingreso_kg, 'number'),
                    safeValue(datosIngreso.talla_cm, 'number'),
                    safeValue(datosIngreso.volumen_residual_cc, 'number'),
                ]
            );
        }

        // 3. Datos médicos (con conversión de booleanos)
        if (datosMedicos) {
            await client.query(
                `INSERT INTO datos_medicos
                (cedula_paciente, hipertension_arterial, tiempo_diagnostico, tratamiento_hipertension,diabetes, tipo_dialisis, vih, vdrl, hbsag, anticore, hc, covid19, turno)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
                ON CONFLICT (cedula_paciente) DO UPDATE SET
                    hipertension_arterial=EXCLUDED.hipertension_arterial,
                    tiempo_diagnostico=EXCLUDED.tiempo_diagnostico,
                    tratamiento_hipertension=EXCLUDED.tratamiento_hipertension,
                    diabetes=EXCLUDED.diabetes,
                    tipo_dialisis=EXCLUDED.tipo_dialisis,
                    vih=EXCLUDED.vih,
                    vdrl=EXCLUDED.vdrl,
                    hbsag=EXCLUDED.hbsag,
                    anticore=EXCLUDED.anticore,
                    hc=EXCLUDED.hc,
                    covid19=EXCLUDED.covid19,
                    turno=EXCLUDED.turno`,
                [
                    paciente.cedula,
                    safeValue(datosMedicos.hipertension_arterial, 'boolean'),
                    safeValue(datosMedicos.tiempo_diagnostico, 'date'),
                    safeValue(datosMedicos.tratamiento_hipertension),
                    safeValue(datosMedicos.diabetes),
                    safeValue(datosMedicos.tipo_dialisis),
                    safeValue(datosMedicos.vih, 'boolean'),
                    safeValue(datosMedicos.vdrl, 'boolean'),
                    safeValue(datosMedicos.hbsag, 'boolean'),
                    safeValue(datosMedicos.anticore, 'boolean'),
                    safeValue(datosMedicos.hc, 'boolean'),
                    safeValue(datosMedicos.covid19, 'boolean'),
                    safeValue(datosMedicos.turno)
                ]
            );
        }

        // 4. Contacto emergencia (solo si tiene nombre)
        if (contactoEmergencia && contactoEmergencia.nombre) {
            await client.query(
                `INSERT INTO contactos_emergencia (cedula_paciente, nombre, telefono, parentesco)
                VALUES ($1,$2,$3,$4)`,
                [
                    paciente.cedula, 
                    safeValue(contactoEmergencia.nombre),
                    safeValue(contactoEmergencia.telefono),
                    safeValue(contactoEmergencia.parentesco)
                ]
            );
        }

        // 5. Acceso vascular (solo si tiene tipo)
        if (accesoVascular && accesoVascular.tipo) {
            await client.query(
                `INSERT INTO accesos_vasculares (cedula_paciente, tipo, fecha_realizada, ubicacion)
                VALUES ($1,$2,$3,$4)`,
                [
                    paciente.cedula,
                    safeValue(accesoVascular.tipo),
                    safeValue(accesoVascular.fecha_realizada, 'date'),
                    safeValue(accesoVascular.ubicacion),
                ]
            );
        }

        // 6. Laboratorio (solo si tiene datos)
        if (laboratorio && (laboratorio.fecha || laboratorio.hb)) {
            await client.query(
                `INSERT INTO laboratorios 
                (cedula_paciente, fecha, hb, hto, plt, gb, neut, linf, glicemia, urea, creatinina, proteinas_t, albumina, globulinas, na, k, cl, ca, p)
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
                [
                    paciente.cedula,
                    safeValue(laboratorio.fecha, 'date'),
                    safeValue(laboratorio.hb, 'number'),
                    safeValue(laboratorio.hto, 'number'),
                    safeValue(laboratorio.plt, 'number'),
                    safeValue(laboratorio.gb, 'number'),
                    safeValue(laboratorio.neut, 'number'),
                    safeValue(laboratorio.linf, 'number'),
                    safeValue(laboratorio.glicemia, 'number'),
                    safeValue(laboratorio.urea, 'number'),
                    safeValue(laboratorio.creatinina, 'number'),
                    safeValue(laboratorio.proteinas_t, 'number'),
                    safeValue(laboratorio.albumina, 'number'),
                    safeValue(laboratorio.globulinas, 'number'),
                    safeValue(laboratorio.na, 'number'),
                    safeValue(laboratorio.k, 'number'),
                    safeValue(laboratorio.cl, 'number'),
                    safeValue(laboratorio.ca, 'number'),
                    safeValue(laboratorio.p, 'number'),
                ]
            );
        }

        if (tratamientos && tratamientos.tratamiento) {
            await client.query(
                `INSERT INTO tratamientos (cedula_paciente, fecha, tratamiento)
                VALUES ($1,$2,$3)`,
                [
                    paciente.cedula, 
                    safeValue(datosIngreso.fecha_ingreso, 'date'),
                    safeValue(tratamientos.tratamiento)
                ]
            );
        }

        await client.query("COMMIT");
        res.json({ 
            success: true,
            message: "Ficha registrada correctamente ✅",
            cedula: paciente.cedula 
        });

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ Error al registrar ficha:", err);
        
        // Manejo específico de errores de PostgreSQL
        if (err.code === '23505') {
            res.status(400).json({ error: "La cédula ya existe en el sistema" });
        } else if (err.code === '23503') {
            res.status(400).json({ error: "Error de referencia en los datos" });
        } else if (err.code === '22007') {
            res.status(400).json({ error: "Formato de fecha inválido" });
        } else if (err.code === '22P02') {
            res.status(400).json({ error: "Tipo de dato inválido" });
        } else {
            res.status(500).json({ 
                error: "Error al registrar ficha",
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
    } finally {
        client.release();
    }
});

// Ruta de prueba para verificar que el endpoint funciona
router.get("/test", (req, res) => {
    res.json({ message: "✅ Ruta /api/paciente/add está funcionando" });
});

export default router;
import { Router } from "express";
import pool from "../../pool.js";

const router = Router();

// ENDPOINT 3: Obtener un paciente específico por cédula (información completa)
router.get("/pacientes/:cedula", async (req, res) => {
    try {
        const { cedula } = req.params;
        
        // Verificar que la cédula sea válida
        if (!cedula || !/^\d+$/.test(cedula)) {
            return res.status(400).json({ error: "Cédula inválida" });
        }

        const client = await pool.connect();
        
        try {
            // Obtener información del paciente
            const pacienteResult = await client.query(
                'SELECT * FROM pacientes WHERE cedula = $1', 
                [cedula]
            );
            
            if (pacienteResult.rows.length === 0) {
                return res.status(404).json({ error: "Paciente no encontrado" });
            }

            const paciente = pacienteResult.rows[0];

            // Obtener datos de ingreso
            const ingresoResult = await client.query(
                'SELECT * FROM datos_ingreso WHERE cedula_paciente = $1',
                [cedula]
            );

            // Obtener datos médicos
            const medicosResult = await client.query(
                'SELECT * FROM datos_medicos WHERE cedula_paciente = $1',
                [cedula]
            );

            // Obtener contactos de emergencia
            const contactosResult = await client.query(
                'SELECT * FROM contactos_emergencia WHERE cedula_paciente = $1 ORDER BY id',
                [cedula]
            );

            // Obtener accesos vasculares
            const accesosResult = await client.query(
                'SELECT * FROM accesos_vasculares WHERE cedula_paciente = $1 ORDER BY fecha_realizada DESC',
                [cedula]
            );

            // Obtener laboratorios (último registro)
            const laboratorioResult = await client.query(
                'SELECT fecha, hb, hto, plt, gb, neut, linf, glicemia, urea, creatinina, proteinas_t, albumina, globulinas, na, k, cl, ca, p FROM laboratorios WHERE cedula_paciente = $1 ORDER BY fecha DESC LIMIT 1',
                [cedula]
            );

            // Obtener tratamientos (último registro)
            const tratamientoResult = await client.query(
                'SELECT * FROM tratamientos WHERE cedula_paciente = $1 ORDER BY fecha DESC LIMIT 1',
                [cedula]
            );

            // Obtener evolución (último registro) - CORREGIDO: variable bien declarada
            const evolucionResult = await client.query(
                'SELECT * FROM evoluciones WHERE cedula_paciente = $1 ORDER BY fecha DESC LIMIT 1',
                [cedula]
            );

            // Obtener órdenes médicas (último registro)
            const ordenesResult = await client.query(
                'SELECT * FROM ordenes_medicas WHERE cedula_paciente = $1 ORDER BY fecha DESC LIMIT 1',
                [cedula]
            );

            // Obtener exámenes de orina (último registro)
            const orinaResult = await client.query(
                'SELECT * FROM examenes_orina WHERE cedula_paciente = $1 ORDER BY fecha DESC LIMIT 1',
                [cedula]
            );

            res.json({
                success: true,
                paciente: paciente,
                datosIngreso: ingresoResult.rows[0] || null,
                datosMedicos: medicosResult.rows[0] || null,
                contactosEmergencia: contactosResult.rows,
                accesosVasculares: accesosResult.rows,
                ultimoLaboratorio: laboratorioResult.rows[0] || null,
                ultimoTratamiento: tratamientoResult.rows[0] || null,
                ultimaEvolucion: evolucionResult.rows[0] || null,
                ultimaOrden: ordenesResult.rows[0] || null,
                ultimoExamenOrina: orinaResult.rows[0] || null
            });

        } finally {
            client.release();
        }

    } catch (err) {
        console.error("❌ Error al obtener paciente:", err);
        res.status(500).json({ 
            error: "Error al obtener información del paciente",
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

export default router;
import { Router } from "express";
import pool from "../../pool.js";

const router = Router();

// GET - Obtener datos del paciente en el formato de la interfaz
router.get("/pacientes/header/:cedula", async (req, res) => {
    try {
        const { cedula } = req.params;
        const client = await pool.connect();

        try {
            // Query que une pacientes + datos_ingreso + datos_medicos
            const query = `
                SELECT 
                    p.nombre,
                    p.apellido,
                    p.cedula,
                    p.telefono,
                    p.fecha_nacimiento,
                    p.estado,
                    di.fecha_ingreso,
                    av.tipo,
                    av.fecha_realizada,
                    dm.tipo_dialisis,
                    dm.diabetes,
                    di.etiologia_enfermedad_renal,
                    dm.hipertension_arterial
                FROM pacientes p
                LEFT JOIN datos_ingreso di ON p.cedula = di.cedula_paciente
                LEFT JOIN datos_medicos dm ON p.cedula = dm.cedula_paciente
                LEFT JOIN accesos_vasculares av ON p.cedula = av.cedula_paciente
                WHERE p.cedula = $1
                ORDER BY av.fecha_realizada DESC
                LIMIT 1
            `;

            const result = await client.query(query, [cedula]);

            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    error: "Paciente no encontrado",
                    cedula: cedula
                });
            }

            const patientData = result.rows[0];

            // Formatear los datos según la interfaz
            const formattedData = {
                nombre: patientData.nombre || '',
                apellido: patientData.apellido || '',
                cedula: patientData.cedula ? patientData.cedula.toString() : '',
                telefono: patientData.telefono || '',
                fecha_nacimiento: patientData.fecha_nacimiento ? 
                    new Date(patientData.fecha_nacimiento).toISOString().split('T')[0] : '',
                estado: patientData.estado || 'Activo',
                fecha_ingreso: patientData.fecha_ingreso ? 
                    new Date(patientData.fecha_ingreso).toISOString().split('T')[0] : '',
                tipo: patientData.tipo || '',
                fecha_realizada: patientData.fecha_realizada ? 
                    new Date(patientData.fecha_realizada).toISOString().split('T')[0] : '',
                tipo_dialisis:patientData.tipo_dialisis ||'',
                etiologia_enfermedad_renal: patientData.etiologia_enfermedad_renal || '',
                hipertension_arterial: patientData.hipertension_arterial || false,
                diabetes: patientData.diabetes || ''
            };

            res.json({ 
                success: true,
                patientData: formattedData
            });

        } finally {
            client.release();
        }
    } catch (err) {
        console.error("❌ Error obteniendo PatientData:", err);
        res.status(500).json({ 
            success: false,
            error: "Error obteniendo datos del paciente",
            details: err.message 
        });
    }
});

export default router
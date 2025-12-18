import { Router } from "express";
import pool from "../../pool.js";

const router = Router();

router.get("/pacientes", async (req, res) => {
    try {
        const query = `
            SELECT 
                p.cedula,
                p.nombre,
                p.apellido,
                p.fecha_nacimiento AS "fechaNacimiento",
                di.etiologia_enfermedad_renal AS enfermedad,
                dm.tipo_dialisis,
                av.tipo,
                dm.hipertension_arterial,
                p.estado,
                di.fecha_ingreso AS "ultimaVisita",
                l.creatinina,
                l.proteinas_t AS "proteinasT"
            FROM pacientes p
            LEFT JOIN datos_ingreso di ON p.cedula = di.cedula_paciente
            LEFT JOIN datos_medicos dm ON p.cedula = dm.cedula_paciente
            LEFT JOIN accesos_vasculares av ON p.cedula = av.cedula_paciente
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
        `;

        const result = await pool.query(query);

        res.json({
            data: result.rows,
            total: result.rows.length,
        });

    } catch (error) {
        console.error("Error al obtener pacientes:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

export default router;

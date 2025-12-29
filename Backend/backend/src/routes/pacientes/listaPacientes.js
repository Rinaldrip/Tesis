import { Router } from "express";
import pool from "../../pool.js";

const router = Router();
// Backend - Agrega parámetros de filtro
// GET - Obtener pacientes con filtros y paginación
router.get("/pacientes", async (req, res) => {
    try {
        const {
            search,
            estado,
            dialisis,
            hipertension,
            acceso_vascular,
            page = 1,
            limit = 20,
            sortBy = 'fecha_ingreso',
            sortOrder = 'DESC'
        } = req.query;

        // 1. Construcción de Filtros
        const conditions = ["p.estado != 'Inactivo'"];
        const params = [];
        let paramCount = 0;

        if (search) {
            paramCount++;
            conditions.push(`(
                p.nombre ILIKE $${paramCount} OR 
                p.apellido ILIKE $${paramCount} OR 
                p.cedula::text ILIKE $${paramCount} OR
                di.etiologia_enfermedad_renal ILIKE $${paramCount} OR
                p.estado ILIKE $${paramCount}
            )`);
            params.push(`%${search}%`);
        }

        if (estado && estado !== 'Todos') {
            paramCount++;
            conditions.push(`p.estado = $${paramCount}`);
            params.push(estado);
        }

        if (dialisis) {
            paramCount++;
            conditions.push(`dm.tipo_dialisis = $${paramCount}`);
            let val = dialisis;
            if (dialisis === 'Peritonial') val = 'Peritoneal';
            else if (dialisis === 'Hemodialisis') val = 'Hemodialisis';
            params.push(val);
        }

        if (hipertension) {
            // Nota: Quemamos el valor booleano en el string para simplificar
            if (hipertension === 'true') conditions.push(`dm.hipertension_arterial = true`);
            else if (hipertension === 'false') conditions.push(`(dm.hipertension_arterial = false OR dm.hipertension_arterial IS NULL)`);
        }

        if (acceso_vascular) {
            paramCount++;
            let val = acceso_vascular;
            if (acceso_vascular === 'Fistula') val = 'fistula';
            else if (acceso_vascular === 'cateter-per') val = 'cateter-per';
            else if (acceso_vascular === 'Cateter') val = 'cateter-tem';
            conditions.push(`av.tipo = $${paramCount}`);
            params.push(val);
        }

        // 2. Ordenamiento
        const sortMapping = {
            'nombre': 'p.nombre',
            'cedula': 'p.cedula',
            'estado': 'p.estado',
            'fecha-ingreso': 'di.fecha_ingreso'
        };
        const orderByField = sortMapping[sortBy] || 'di.fecha_ingreso';
        const orderDirection = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        // 3. Consultas SQL
        const baseQuery = `
            FROM pacientes p
            LEFT JOIN datos_ingreso di ON p.cedula = di.cedula_paciente
            LEFT JOIN datos_medicos dm ON p.cedula = dm.cedula_paciente
            LEFT JOIN accesos_vasculares av ON p.cedula = av.cedula_paciente
            LEFT JOIN (
                SELECT cedula_paciente, creatinina, proteinas_t, fecha,
                ROW_NUMBER() OVER (PARTITION BY cedula_paciente ORDER BY fecha DESC) as rn
                FROM laboratorios
            ) l ON p.cedula = l.cedula_paciente AND l.rn = 1
            WHERE ${conditions.join(' AND ')}
        `;

        const dataQuery = `
            SELECT 
                p.cedula, p.nombre, p.apellido, p.fecha_nacimiento AS "fechaNacimiento",
                di.etiologia_enfermedad_renal AS enfermedad,
                dm.tipo_dialisis, av.tipo AS acceso_vascular,
                dm.hipertension_arterial, p.estado,
                di.fecha_ingreso AS "ultimaVisita",
                l.creatinina, l.proteinas_t AS "proteinasT",
                EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) AS edad
            ${baseQuery}
            ORDER BY ${orderByField} ${orderDirection} NULLS LAST, p.nombre ASC
            LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
        `;

        const countQuery = `SELECT COUNT(*) as total ${baseQuery}`;

        // Paginación
        const limitNum = parseInt(limit) || 20;
        const pageNum = parseInt(page) || 1;
        const offset = (pageNum - 1) * limitNum;

        // 4. Ejecución (CORREGIDO: Eliminamos la línea pool.query(query))
        const [dataResult, countResult] = await Promise.all([
            pool.query(dataQuery, [...params, limitNum, offset]),
            pool.query(countQuery, params)
        ]);

        // Parsear total
        const totalItems = parseInt(countResult.rows[0]?.total || '0', 10);
        const totalPages = Math.ceil(totalItems / limitNum);

        res.json({
            success: true,
            data: dataResult.rows,
            pagination: {
                total: totalItems,
                page: pageNum,
                limit: limitNum,
                totalPages: totalPages
            }
        });

    } catch (error) {
        console.error("Error en GET /pacientes:", error);
        res.status(500).json({ 
            success: false, 
            error: "Error interno del servidor", 
            details: error.message 
        });
    }
});

export default router;

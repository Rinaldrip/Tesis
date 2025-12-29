import { Router } from "express";
import pool from "../../pool.js"; 
import bcrypt from "bcrypt";
import { exec } from "child_process";
import path from "path";
import fs from "fs";
import "dotenv/config";
import multer from "multer";

const router = Router();

router.post("/backup/last", (req, res) => {
    const { path: folderPath } = req.body;

    if (!folderPath) {
        return res.status(400).json({ success: false, error: "La ruta es obligatoria" });
    }

    try {
        // 1. Verificar si la carpeta existe
        if (!fs.existsSync(folderPath)) {
            return res.json({ success: true, lastBackup: null, message: "La carpeta no existe aún" });
        }

        // 2. Leer archivos de la carpeta
        const files = fs.readdirSync(folderPath);

        // 3. Filtrar solo archivos de respaldo (ej: .sql o .backup)
        const backupFiles = files.filter(file => file.endsWith('.sql') || file.endsWith('.backup'));

        if (backupFiles.length === 0) {
            return res.json({ success: true, lastBackup: null, message: "No hay respaldos en esta ruta" });
        }

        // 4. Obtener estadísticas (fechas) de cada archivo
        const fileStats = backupFiles.map(file => {
            const fullPath = path.join(folderPath, file);
            const stats = fs.statSync(fullPath);
            return {
                file: file,
                time: stats.mtime.getTime() // Fecha de modificación en milisegundos
            };
        });

        // 5. Ordenar por fecha descendente (el más nuevo primero)
        fileStats.sort((a, b) => b.time - a.time);

        // 6. Tomar el primero
        const lastFile = fileStats[0];
        const lastDate = new Date(lastFile.time).toLocaleString(); // Convertir a formato legible

        res.json({ 
            success: true, 
            lastBackup: lastDate, 
            filename: lastFile.file 
        });

    } catch (error) {
        console.error("Error buscando último respaldo:", error);
        res.status(500).json({ success: false, error: "Error al leer directorio de respaldos" });
    }
});

router.get("/users", async (req, res) => {
    try {
        // Seleccionamos solo usuario y pregunta. NUNCA contraseña ni respuesta.
        const result = await pool.query(
            "SELECT usuario, pregunta_seguridad FROM usuarios ORDER BY usuario ASC"
        );
        
        res.json({ success: true, data: result.rows });
    } catch (error) {
        console.error("Error obteniendo usuarios:", error);
        res.status(500).json({ success: false, error: "Error al cargar la lista de usuarios" });
    }
});

const upload = multer({ dest: "uploads/" });

router.post("/restore", upload.single("backupFile"), async (req, res) => {
    // 1. Validar que llegó el archivo
    if (!req.file) {
        console.log("❌ No llegó ningún archivo en el request");
        return res.status(400).json({ success: false, error: "No se ha subido ningún archivo." });
    }

    const filePath = req.file.path; // Ruta temporal del archivo subido
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        fs.unlinkSync(filePath);
        return res.status(500).json({ success: false, error: "Falta DATABASE_URL en .env" });
    }

    try {
        const dbUrl = new URL(connectionString);
        const dbUser = dbUrl.username;
        const dbPassword = dbUrl.password;
        const dbHost = dbUrl.hostname;
        const dbPort = dbUrl.port || "5432";
        const dbName = dbUrl.pathname.split("/")[1];

        // Matar conexiones activas (Evita error: database is being accessed)
        try {
            const client = await pool.connect();
            await client.query(`
                SELECT pg_terminate_backend(pg_stat_activity.pid)
                FROM pg_stat_activity
                WHERE pg_stat_activity.datname = $1 AND pid <> pg_backend_pid();
            `, [dbName]);
            client.release();
        } catch (e) { console.log("Info: No se pudieron cerrar conexiones previas"); }

        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log(`♻️ Restaurando desde: ${filePath}`);

        const command = `pg_restore -U ${dbUser} -h ${dbHost} -p ${dbPort} -d ${dbName} -c -v --no-owner --no-privileges "${filePath}"`;

        exec(command, {
            env: { ...process.env, PGPASSWORD: dbPassword }
        }, (error, stdout, stderr) => {
            // Limpieza del archivo temporal
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            if (error && !stderr.includes("finished")) {
                console.error("❌ Error pg_restore:", error);
                return res.status(500).json({ success: false, error: "Error al procesar el archivo de respaldo" });
            }

            res.json({ success: true, message: "Restauración exitosa" });
        });

    } catch (error) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        console.error(error);
        res.status(500).json({ success: false, error: "Error interno" });
    }
});

router.post("/backup", async (req, res) => {
    const { path: userPath } = req.body;
    const connectionString = process.env.DATABASE_URL;

    // 1. Validaciones básicas
    if (!connectionString) {
        return res.status(500).json({ success: false, error: "Falta DATABASE_URL en .env" });
    }
    if (!userPath) {
        return res.status(400).json({ success: false, error: "La ruta es obligatoria" });
    }

    try {
        // 2. Parsear URL de conexión
        const dbUrl = new URL(connectionString);
        const dbUser = dbUrl.username;
        const dbPassword = dbUrl.password;
        const dbHost = dbUrl.hostname;
        const dbPort = dbUrl.port || "5432";
        const dbName = dbUrl.pathname.split("/")[1];

        // 3. VERIFICAR Y CREAR CARPETA SI NO EXISTE
        if (!fs.existsSync(userPath)) {
            try {
                console.log(`📂 La carpeta no existe. Creando ruta: ${userPath}`);
                // recursive: true permite crear rutas anidadas (ej: C:/A/B/C)
                fs.mkdirSync(userPath, { recursive: true });
            } catch (mkdirError) {
                console.error("Error creando carpeta:", mkdirError);
                return res.status(500).json({ 
                    success: false, 
                    error: "No se pudo crear la carpeta de destino.",
                    details: "Verifique que el sistema tenga permisos de escritura en esa ubicación."
                });
            }
        }

        // 4. Preparar comando
        const date = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `backup_nefrocare_${date}.sql`;
        const fullPath = path.join(userPath, fileName);

        console.log(`🔌 Generando respaldo en: ${fullPath}`);

        const command = `pg_dump -U ${dbUser} -h ${dbHost} -p ${dbPort} -F c -b -v -f "${fullPath}" ${dbName}`;

        // 5. Ejecutar pg_dump
        exec(command, {
            env: {
                ...process.env,
                PGPASSWORD: dbPassword 
            }
        }, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error pg_dump: ${error.message}`);
                return res.status(500).json({ success: false, error: "Falló el respaldo", details: error.message });
            }

            // 6. Verificar integridad
            try {
                if (fs.existsSync(fullPath)) {
                    const stats = fs.statSync(fullPath);
                    if (stats.size === 0) {
                        fs.unlinkSync(fullPath);
                        return res.status(500).json({ success: false, error: "El archivo se generó vacío." });
                    }

                    console.log(`✅ Backup completado (${(stats.size / 1024).toFixed(2)} KB)`);
                    return res.json({ success: true, message: "Respaldo creado correctamente", path: fullPath });
                }
            } catch (err) {
                return res.status(500).json({ success: false, error: "Error verificando archivo final" });
            }
        });

    } catch (error) {
        console.error("Error general:", error);
        res.status(500).json({ success: false, error: "Error interno al procesar respaldo" });
    }
});

// ==========================================
// 3. ELIMINAR BASE DE DATOS
// ==========================================
router.delete("/database", async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Lista de tablas a limpiar
        const tablesToClean = [
            "pacientes",
            "datos_ingreso",
            "datos_medicos",
            "laboratorios",
            "accesos_vasculares",
            "contactos_emergencia",
            "tratamientos",
            "evoluciones",
            // "usuarios" // Descomenta si quieres borrar también a los usuarios
        ];

        // Construir query TRUNCATE
        const query = `TRUNCATE TABLE ${tablesToClean.join(", ")} RESTART IDENTITY CASCADE;`;
        
        await client.query(query);
        await client.query("COMMIT");
        
        res.json({ success: true, message: "Datos eliminados correctamente." });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Error vaciando DB:", error);
        res.status(500).json({ success: false, error: "No se pudo limpiar la base de datos" });
    } finally {
        client.release();
    }
});

export default router;
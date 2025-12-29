import { Router } from "express";
import pool from "../pool.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro_cambiar_en_produccion';

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            error: "Acceso denegado. Token no proporcionado." 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            error: "Token inválido o expirado." 
        });
    }
};

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Buscar usuario por nombre de usuario
        const result = await pool.query(
            "SELECT * FROM usuarios WHERE usuario = $1",
            [username]
        );

        if (result.rows.length === 0) {
            return res.json({
                success: false,
                error: "Usuario no encontrado"
            });
        }

        const user = result.rows[0];

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.contraseña);
        if (!isMatch) {
            console.log(await bcrypt.hash("admin123", 10))
            return res.json({
                success: false,
                error: "Contraseña incorrecta"
            });
        }

        // Crear token JWT
        const token = jwt.sign(
            { usuario: user.usuario },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Respuesta correcta al frontend
        res.json({
            success: true,
            data: {
                token,
                user: {
                    usuario: user.usuario
                }
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({
            success: false,
            error: "Error interno del servidor"
        });
    }
});

router.post("/register", async (req, res) => {
    try {
        // 1. AQUI ESTA LA CLAVE: 
        // Tu Frontend envía 'question' y 'answer'.
        // Tu Backend estaba esperando 'securityQuestion' (por eso daba null).
        const { username, password, question, answer } = req.body;

        console.log("Datos llegando al backend:", req.body); // Verás que ahora sí llegan

        if (!username || !password || !question || !answer) {
            return res.status(400).json({ success: false, error: "Todos los campos son obligatorios" });
        }

        // 2. Verificar usuario existente
        const userCheck = await pool.query("SELECT * FROM usuarios WHERE usuario = $1", [username]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ success: false, error: "El usuario ya existe" });
        }

        // 3. Encriptar
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const answerHash = await bcrypt.hash(answer.toLowerCase(), salt);

        // 4. Insertar usando las variables correctas
        const newUser = await pool.query(
            `INSERT INTO usuarios (usuario, contraseña, pregunta_seguridad, respuesta_seguridad) 
             VALUES ($1, $2, $3, $4) 
             RETURNING usuario`,
            [username, passwordHash, question, answerHash] // <--- AQUÍ usamos 'question'
        );

        res.json({ success: true, user: newUser.rows[0] });

    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({ success: false, error: "Error de base de datos", details: error.message });
    }
});

// 4. VERIFICAR TOKEN (para mantener sesión activa en frontend)
router.get("/verify-token", verifyToken, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user,
                isValid: true
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: "Token inválido"
        });
    }
});

router.post("/logout", verifyToken, (req, res) => {
    res.json({
        success: true,
        message: "Sesión cerrada exitosamente."
    });
});

// 8. OBTENER PREGUNTA DE SEGURIDAD
router.get("/security-question/:username", async (req, res) => {
    try {
        const { username } = req.params;

        const query = `
            SELECT pregunta_seguridad 
            FROM usuarios 
            WHERE usuario = $1
        `;
        
        const result = await pool.query(query, [username]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Usuario no encontrado."
            });
        }

        const question = result.rows[0].pregunta_seguridad;
        
        if (!question) {
            return res.status(400).json({
                success: false,
                error: "El usuario no tiene pregunta de seguridad configurada."
            });
        }

        res.json({
            success: true,
            data: {
                securityQuestion: question
            }
        });

    } catch (error) {
        console.error("Error obteniendo pregunta de seguridad:", error);
        res.status(500).json({ 
            success: false,
            error: "Error interno del servidor" 
        });
    }
});

export default router;
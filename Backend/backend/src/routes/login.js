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



// 2. REGISTRAR NUEVO USUARIO (solo administradores)
router.post("/register", verifyToken, async (req, res) => {
    try {
        const { 
            username, 
            password, 
            securityQuestion, 
            securityAnswer 
        } = req.body;

        // Validaciones
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: "Usuario y contraseña son requeridos."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                error: "La contraseña debe tener al menos 8 caracteres."
            });
        }

        // Verificar si el usuario ya existe
        const checkUserQuery = `
            SELECT usuario FROM usuarios WHERE usuario = $1
        `;
        const existingUser = await pool.query(checkUserQuery, [username]);
        
        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                success: false,
                error: "El usuario ya existe."
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Encriptar respuesta de seguridad (opcional)
        const hashedSecurityAnswer = securityAnswer 
            ? await bcrypt.hash(securityAnswer.toLowerCase(), saltRounds)
            : null;

        // Insertar nuevo usuario
        const insertQuery = `
            INSERT INTO usuarios (
                usuario, 
                contraseña, 
                pregunta_seguridad, 
                respuesta_seguridad
            ) VALUES ($1, $2, $3, $4)
            RETURNING usuario
        `;
        
        const values = [
            username,
            hashedPassword,
            securityQuestion || null,
            hashedSecurityAnswer
        ];

        const result = await pool.query(insertQuery, values);

        res.status(201).json({
            success: true,
            message: "Usuario creado exitosamente",
            data: {
                username: result.rows[0].usuario
            }
        });

    } catch (error) {
        console.error("Error registrando usuario:", error);
        res.status(500).json({ 
            success: false,
            error: "Error interno del servidor" 
        });
    }
});

// 3. CREAR USUARIO ADMIN POR DEFECTO (solo una vez)
router.post("/create-default-admin", async (req, res) => {
    try {
        const adminUsername = 'admin';
        const adminPassword = 'Admin@2024!';
        const securityQuestion = '¿Cuál es tu mascota favorita?';
        const securityAnswer = 'perro';

        // Verificar si ya existe el admin
        const checkAdminQuery = `
            SELECT usuario FROM usuarios WHERE usuario = $1
        `;
        const existingAdmin = await pool.query(checkAdminQuery, [adminUsername]);
        
        if (existingAdmin.rows.length > 0) {
            return res.json({
                success: false,
                message: "El usuario administrador ya existe.",
                note: "Si necesitas resetear la contraseña, usa el endpoint de recuperación."
            });
        }

        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
        const hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase(), saltRounds);

        // Crear usuario admin
        const insertQuery = `
            INSERT INTO usuarios (
                usuario, 
                contraseña, 
                pregunta_seguridad, 
                respuesta_seguridad
            ) VALUES ($1, $2, $3, $4)
            RETURNING usuario
        `;
        
        const result = await pool.query(insertQuery, [
            adminUsername,
            hashedPassword,
            securityQuestion,
            hashedSecurityAnswer
        ]);

        console.log("Usuario administrador creado exitosamente");
        
        res.json({
            success: true,
            message: "Usuario administrador creado exitosamente",
            data: {
                username: adminUsername,
                password: adminPassword, // Mostrar solo en desarrollo
                note: "¡Guarda esta contraseña en un lugar seguro!"
            }
        });

    } catch (error) {
        console.error("Error creando admin:", error);
        res.status(500).json({ 
            success: false,
            error: "Error interno del servidor" 
        });
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

// 5. CAMBIAR CONTRASEÑA
router.post("/change-password", verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const username = req.user.username;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "La contraseña actual y nueva son requeridas."
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                success: false,
                error: "La nueva contraseña debe tener al menos 8 caracteres."
            });
        }

        // Obtener usuario actual
        const userQuery = `
            SELECT contraseña FROM usuarios WHERE usuario = $1
        `;
        const userResult = await pool.query(userQuery, [username]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Usuario no encontrado."
            });
        }

        // Verificar contraseña actual
        const user = userResult.rows[0];
        const isValidPassword = await bcrypt.compare(currentPassword, user.contraseña);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: "Contraseña actual incorrecta."
            });
        }

        // Encriptar nueva contraseña
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar en base de datos
        const updateQuery = `
            UPDATE usuarios 
            SET contraseña = $1 
            WHERE usuario = $2
        `;
        
        await pool.query(updateQuery, [hashedNewPassword, username]);

        res.json({
            success: true,
            message: "Contraseña actualizada exitosamente."
        });

    } catch (error) {
        console.error("Error cambiando contraseña:", error);
        res.status(500).json({ 
            success: false,
            error: "Error interno del servidor" 
        });
    }
});

// 6. RECUPERAR CONTRASEÑA (con pregunta de seguridad)
router.post("/forgot-password", async (req, res) => {
    try {
        const { username, securityAnswer, newPassword } = req.body;

        if (!username || !securityAnswer || !newPassword) {
            return res.status(400).json({
                success: false,
                error: "Todos los campos son requeridos."
            });
        }

        // Obtener usuario y respuesta de seguridad
        const userQuery = `
            SELECT respuesta_seguridad, contraseña 
            FROM usuarios 
            WHERE usuario = $1
        `;
        const userResult = await pool.query(userQuery, [username]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Usuario no encontrado."
            });
        }

        const user = userResult.rows[0];

        // Verificar si tiene pregunta de seguridad configurada
        if (!user.respuesta_seguridad) {
            return res.status(400).json({
                success: false,
                error: "Este usuario no tiene configurada recuperación por pregunta de seguridad."
            });
        }

        // Verificar respuesta de seguridad
        const isValidAnswer = await bcrypt.compare(
            securityAnswer.toLowerCase(), 
            user.respuesta_seguridad
        );
        
        if (!isValidAnswer) {
            return res.status(401).json({
                success: false,
                error: "Respuesta de seguridad incorrecta."
            });
        }

        // Encriptar nueva contraseña
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar contraseña
        const updateQuery = `
            UPDATE usuarios 
            SET contraseña = $1 
            WHERE usuario = $2
        `;
        
        await pool.query(updateQuery, [hashedNewPassword, username]);

        res.json({
            success: true,
            message: "Contraseña restablecida exitosamente."
        });

    } catch (error) {
        console.error("Error en recuperación de contraseña:", error);
        res.status(500).json({ 
            success: false,
            error: "Error interno del servidor" 
        });
    }
});

// 7. LOGOUT (manejado en frontend, pero puedes invalidar tokens si usas blacklist)
router.post("/logout", verifyToken, (req, res) => {
    // En una implementación real, podrías agregar el token a una blacklist
    // Por ahora, el logout es manejado por el frontend eliminando el token
    
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
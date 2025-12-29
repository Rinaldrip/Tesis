import express from "express";
import cors from "cors";
import multer from "multer";
import pool from "./pool.js";
import dotenv from "dotenv";
import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

import fichaShowRoutes from "./routes/pacientes/ficha-paciente.js";
import listaPacientesRoutes from "./routes/pacientes/listaPacientes.js";
import guardarPacientRoutes from "./routes/pacientes/ficha.js";
import dashboardRoutes from "./routes/dashboard.js";
import headerRoutes from "./routes/pacientes/header.js";

import testOrinaRoutes from "./routes/pacientes/tablas/test-orina.js";
import ordenMedicaRoutes from "./routes/pacientes/tablas/orden-medica.js";
import evolucionRoutes from "./routes/pacientes/tablas/evolucion.js";
import tratamientoRoutes from "./routes/pacientes/tablas/tratamiento.js";
import laboratorioRoutes from "./routes/pacientes/tablas/laboratorio.js"

import statsPacienteRoutes from "./routes/pacientes/stats-paciente.js"
import reporteRoutes from "./routes/pacientes/report/viewStats.js";
import reporteGeneralRoutes from "./routes/pacientes/report/ReporteGeneral.js";
import reporteDatosRoutes from "./routes/pacientes/report/DatosDemograficos.js";
import reporteDatosClinicos from "./routes/pacientes/report/DatosClinicos.js";
import { generarReporteCompleto } from './routes/pacientes/report/crearExcel.js';
import loginRoutes from "./routes/login.js";  
import calenderioRoutes from "./routes/calender/calendario.js";
import configRoutes from "./routes/confi/configuration.js";

import especialistaRoutes from "./routes/especialista/Especialista.js";
// CAMBIO: Usar import en lugar de require
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));  // ← PARA JSON
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.post('/api/generar-reporte', async (req, res) => {
    try {
        console.log('📦 Generando reporte con archivo local...');
        
        const { datosEndpoint1, datosEndpoint2, datosEndpoint3, datosEndpoint4 } = req.body;

        if (!datosEndpoint1 && !datosEndpoint2 && !datosEndpoint3 && !datosEndpoint4) {
            return res.status(400).json({ error: 'No se proporcionaron datos' });
        }

        const excelPath = path.join(__dirname, 'assets', 'Reporte_Nefrologia3meses.xlsx');
        const excelBuffer = await fs.readFile(excelPath);

        // 🔧 Ya no parseamos nada porque llegan como objetos
        const reporteBuffer = await generarReporteCompleto(
            datosEndpoint1,
            datosEndpoint2,
            datosEndpoint3,
            datosEndpoint4,
            excelBuffer
        );

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_nefrologia.xlsx');
        res.send(reporteBuffer);
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: 'Error interno del servidor', detalles: error.message });
    }
});

// Ruta de prueba
app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.send(`Servidor funcionando 🚀 ${result.rows[0].now}`);
    } catch (err) {
        res.status(500).send("Error conectando a la BD");
    }
});

// ✅ Usar las rutas
app.use("/api",
    fichaShowRoutes,
    dashboardRoutes, 
    listaPacientesRoutes, 
    testOrinaRoutes,
    guardarPacientRoutes,
    ordenMedicaRoutes,
    evolucionRoutes,
    tratamientoRoutes,
    laboratorioRoutes,
    headerRoutes,
    statsPacienteRoutes,
    reporteRoutes,
    reporteGeneralRoutes,
    reporteDatosRoutes,
    reporteDatosClinicos,
    especialistaRoutes,
    loginRoutes,
    calenderioRoutes,
    configRoutes
);

// Manejo de rutas no encontradas
app.use((req, res) => {
    console.log("❌ Ruta no encontrada:", req.method, req.originalUrl);
    res.status(404).json({ 
        error: "Ruta no encontrada",
        path: req.originalUrl,
        method: req.method
    });
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error("Error global:", err);
    res.status(500).json({ error: "Error interno del servidor" });
});

// Arrancar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📋 Endpoints disponibles:`);
    console.log(`   - GET  http://localhost:${PORT}/`);
});
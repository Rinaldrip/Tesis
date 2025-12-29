import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

// Configuración de la conexión
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err, client) => {

  if (err.code === '57P01') {
    console.log('ℹ️ Aviso: Se cerró una conexión inactiva (Normal durante restauración).');
    return; // Ignoramos el error, no hacemos nada.
  }

dos
  console.error('⚠️ Error inesperado en el pool de PostgreSQL:', err.message);

});

pool.connect()
  .then((client) => {
    console.log("✅ Conectado a PostgreSQL exitosamente");
    client.release(); // Liberamos el cliente inmediatamente
  })
  .catch(err => console.error("❌ Error crítico al iniciar la base de datos:", err.message));

export default pool;
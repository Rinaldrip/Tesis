import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => console.log("✅ Conectado a PostgreSQL"))
  .catch(err => console.error("❌ Error de conexión:", err));

export default pool;

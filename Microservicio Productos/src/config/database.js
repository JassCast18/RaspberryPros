import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "productos_db"
});

export const probarConexion = async () => {
  let client;

  try {
    client = await pool.connect();

    await client.query("SELECT 1");

    console.log("Conexión a PostgreSQL exitosa");
  } catch (error) {
    console.error(
      "Error al conectar con PostgreSQL:",
      error.message
    );

    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productRoutes from "./routes/productRoutes.js";
import { probarConexion } from "./config/database.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.status(200).json({
    servicio: "Microservicio de Productos - RaspberryPros",
    estado: "activo"
  });
});

// Ruta para verificar el servicio
app.get("/health", (req, res) => {
  res.status(200).json({
    servicio: "microservicio-productos",
    estado: "OK"
  });
});

// Rutas del microservicio de productos
app.use("/api/productos", productRoutes);

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    await probarConexion();

    app.listen(PORT, () => {
      console.log(
        `Microservicio Productos ejecutándose en puerto ${PORT}`
      );
    });
  } catch (error) {
    console.error(
      "No fue posible iniciar el microservicio de productos."
    );

    process.exit(1);
  }
};

iniciarServidor();

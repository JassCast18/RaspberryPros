import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3002;

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    mensaje: "Microservicio de Productos - RaspberryPros",
    estado: "activo"
  });
});

// Ruta para comprobar que el servicio está funcionando
app.get("/health", (req, res) => {
  res.status(200).json({
    servicio: "microservicio-productos",
    estado: "OK"
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Microservicio Productos ejecutándose en puerto ${PORT}`);
});

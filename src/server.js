import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./db.js"; // Asegúrate de agregar la extensión ".js"
import productsRoute from "./routes/productsroute.js"; // Agregar extensión ".js"
import cartsRoute from "./routes/cartsroute.js"; // Asegúrate de agregar la extensión ".js"



dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar a MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", productsRoute);
app.use("/api", cartsRoute);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

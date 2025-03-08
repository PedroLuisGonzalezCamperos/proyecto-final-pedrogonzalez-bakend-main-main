import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // 👈 Cargar variables de entorno

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("❌ Error: No se encontró MONGO_URI en .env");
  process.exit(1); // Detener la ejecución si no hay conexión
}

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log("✅ Conectado a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error de conexión a MongoDB", error);
    process.exit(1);
  }
};

export default connectDB;

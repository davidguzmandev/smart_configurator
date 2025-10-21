import express from 'express';
import { testConnection } from './db/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

//Middleware base
app.use(express.json());

//Ruta de prueba temporal
app.get("/", (req, res) => {
    res.send("✅ Smart Configurator Backend is running");
});

// Iniciar el servidor + probar conexion a DB
app.listen(PORT, async () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    await testConnection();
})
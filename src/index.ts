import express, { type Request, type Response } from 'express';
import { testConnection } from './db/db';
import cors from 'cors';

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

//Middleware base
app.use(express.json());
app.use(cors());

//Ruta de prueba temporal
app.get("/", (request: Request, response: Response): void=> {
    response.send("✅ Smart Configurator Backend is running");
});

// Iniciar el servidor + probar conexion a DB
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    void testConnection();
})
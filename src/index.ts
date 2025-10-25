import express, { type Application } from 'express';
import { testConnection } from './db/db';
import cors from 'cors';
import morgan from 'morgan';
import tasksRouter from './routes/tasks.routes';
import partsRoutes from "./routes/parts.routes";
import { errorHandler } from './middleware/errorHandler';

const app: Application =  express();
const PORT: number = Number(process.env.PORT) || 3000;

//Middleware base
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', tasksRouter);
app.use("/api", partsRoutes);
app.use(errorHandler);

// Iniciar el servidor + probar conexion a DB
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    void testConnection();
})
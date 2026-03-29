import express, { Express } from "express";
import routes from "./routes";
import { errorMiddleware } from "./middleware/errorMiddleware";
import cors from 'cors';
import { adminRouter } from './routes/admin';

const app: Express = express();

const corsOrigins =
  process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean) ?? [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

// Middleware
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routes);

app.use('/api/admin', adminRouter);

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;

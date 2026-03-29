import express, { Express } from "express";
import cors from "cors";
import routes from "./routes";
import { errorMiddleware } from "./middleware/errorMiddleware";

const app: Express = express();

// Enable CORS for frontend local development
app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Hello from Express + TypeScript!' });
});

// Error handling middleware (optional)
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;

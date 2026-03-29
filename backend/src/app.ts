import express, { Express } from "express";
import routes from "./routes";
import { errorMiddleware } from "./middleware/errorMiddleware";

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routes);

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;

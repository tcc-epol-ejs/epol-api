import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import candidatosRoutes from "./routes/candidatos.routes.js";
import partidosRoutes from "./routes/partidos.routes.js";
import perguntasRoutes from "./routes/perguntas.routes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/candidatos", candidatosRoutes);
app.use("/api/partidos", partidosRoutes);
app.use("/api/perguntas", perguntasRoutes);
app.use(errorHandler);

export default app;
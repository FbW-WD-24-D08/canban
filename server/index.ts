import express from "express";
import cors from "cors";
import { PrismaClient } from "../generated/prisma";
import boardsRouter from "./routes/boards.ts";
import columnsRouter from "./routes/columns.ts";
import tasksRouter from "./routes/tasks.ts";
import usersRouter from "./routes/users.ts";

const app = express();
const port = process.env.PORT || 3001;

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/api/boards", boardsRouter);
app.use("/api/columns", columnsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/users", usersRouter);

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

import express from "express";
import { PrismaClient } from "../../generated/prisma";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const columnId = req.query.columnId as string;
    const boardId = req.query.boardId as string;
    const includeArchived = req.query.includeArchived === "true";

    let where: any = {};
    if (columnId) where.columnId = columnId;
    if (boardId) where = { column: { boardId } };

    // Filter out archived tasks unless explicitly requested
    if (!includeArchived) {
      where.archived = false;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        column: true,
        attachments: true,
        checklistItems: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        column: true,
        attachments: true,
        checklistItems: true,
      },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch task" });
  }
});

router.post("/", async (req, res) => {
  try {
    const task = await prisma.task.create({
      data: req.body,
      include: {
        column: true,
        attachments: true,
        checklistItems: true,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    console.log(`Updating task ${req.params.id} with data:`, req.body);

    // Extract attachments and checklistItems from body as they are handled separately
    const { attachments, checklistItems, ...taskData } = req.body;

    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: taskData,
      include: {
        column: true,
        attachments: true,
        checklistItems: true,
      },
    });

    // TODO: Handle attachments and checklistItems separately if needed

    console.log("Task updated successfully:", task.id);
    res.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;

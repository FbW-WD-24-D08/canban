import express from "express";
import { PrismaClient } from "../../generated/prisma";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const boardId = req.query.boardId as string;
    const where = boardId ? { boardId } : {};

    const columns = await prisma.column.findMany({
      where,
      include: {
        tasks: true,
      },
      orderBy: {
        position: "asc",
      },
    });

    res.json(columns);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch columns" });
  }
});

router.put("/positions", async (req, res) => {
  try {
    const { updates } = req.body;
    console.log("Updating column positions with:", updates);

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: "Updates array is required" });
    }

    // Use a transaction to update all positions atomically
    await prisma.$transaction(
      updates.map((update: { id: string; position: number }) => {
        console.log(
          `Updating column ${update.id} to position ${update.position}`
        );
        return prisma.column.update({
          where: { id: update.id },
          data: { position: update.position },
        });
      })
    );

    console.log("Column positions updated successfully");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating column positions:", error);
    res.status(500).json({ error: "Failed to update column positions" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const column = await prisma.column.findUnique({
      where: { id: req.params.id },
      include: {
        tasks: true,
      },
    });

    if (!column) {
      return res.status(404).json({ error: "Column not found" });
    }

    res.json(column);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch column" });
  }
});

router.post("/", async (req, res) => {
  try {
    const column = await prisma.column.create({
      data: req.body,
      include: {
        tasks: true,
      },
    });

    res.status(201).json(column);
  } catch (error) {
    res.status(500).json({ error: "Failed to create column" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const column = await prisma.column.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        tasks: true,
      },
    });

    res.json(column);
  } catch (error) {
    res.status(500).json({ error: "Failed to update column" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.column.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete column" });
  }
});

export default router;

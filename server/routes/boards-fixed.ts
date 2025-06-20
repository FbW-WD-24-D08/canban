import express from "express";
import { PrismaClient } from "../../generated/prisma";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    let whereClause = {};
    if (userId) {
      whereClause = {
        members: {
          some: {
            userId: userId,
          },
        },
      };
    }

    const [boards, total] = await Promise.all([
      prisma.board.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          members: true,
          columns: {
            include: {
              tasks: true,
            },
          },
        },
      }),
      prisma.board.count({ where: whereClause }),
    ]);

    res.json({
      boards,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch boards" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: req.params.id },
      include: {
        members: true,
        columns: {
          include: {
            tasks: true,
          },
        },
      },
    });

    if (!board) {
      return res.status(404).json({ error: "Board not found" });
    }

    res.json(board);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch board" });
  }
});

router.get("/:id/access", async (req, res) => {
  try {
    const boardId = req.params.id;
    const userId = req.query.userId as string;

    const membership = await prisma.boardMember.findFirst({
      where: {
        boardId,
        userId,
      },
    });

    if (!membership) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({ access: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to check access" });
  }
});

router.get("/:id/members", async (req, res) => {
  try {
    const members = await prisma.boardMember.findMany({
      where: { boardId: req.params.id },
    });

    res.json(members);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

router.post("/", async (req, res) => {
  try {
    const board = await prisma.board.create({
      data: req.body,
      include: {
        members: true,
        columns: {
          include: {
            tasks: true,
          },
        },
      },
    });

    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ error: "Failed to create board" });
  }
});

router.post("/:id/members", async (req, res) => {
  try {
    const { userId } = req.body;
    const member = await prisma.boardMember.create({
      data: {
        boardId: req.params.id,
        userId,
      },
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ error: "Failed to add member" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const board = await prisma.board.update({
      where: { id: req.params.id },
      data: req.body,
      include: {
        members: true,
        columns: {
          include: {
            tasks: true,
          },
        },
      },
    });

    res.json(board);
  } catch (error) {
    res.status(500).json({ error: "Failed to update board" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.board.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete board" });
  }
});

router.delete("/:id/members/:userId", async (req, res) => {
  try {
    await prisma.boardMember.deleteMany({
      where: {
        boardId: req.params.id,
        userId: req.params.userId,
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to remove member" });
  }
});

export default router;

import express from "express";
import { PrismaClient } from "../../generated/prisma";

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const userNames = await prisma.userName.findMany();
    const userEmails = await prisma.userEmail.findMany();

    const users = userNames.map((user) => ({
      id: user.id,
      username: user.username,
      email: userEmails.find((email) => email.id === user.id)?.email || "",
    }));

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/:id/name", async (req, res) => {
  try {
    const userName = await prisma.userName.findUnique({
      where: { id: req.params.id },
    });

    if (!userName) {
      return res.status(404).json({ error: "Username not found" });
    }

    res.json(userName);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch username" });
  }
});

router.get("/:id/email", async (req, res) => {
  try {
    const userEmail = await prisma.userEmail.findUnique({
      where: { id: req.params.id },
    });

    if (!userEmail) {
      return res.status(404).json({ error: "User email not found" });
    }

    res.json(userEmail);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user email" });
  }
});

router.get("/email/:email", async (req, res) => {
  try {
    const email = decodeURIComponent(req.params.email);
    const userEmail = await prisma.userEmail.findFirst({
      where: { email: email },
    });

    if (!userEmail) {
      return res.status(404).json({ error: "User not found by email" });
    }

    res.json({ id: userEmail.id, email: userEmail.email });
  } catch (error) {
    console.error("Error finding user by email:", error);
    res.status(500).json({ error: "Failed to find user by email" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const userName = await prisma.userName.findUnique({
      where: { id: req.params.id },
    });
    const userEmail = await prisma.userEmail.findUnique({
      where: { id: req.params.id },
    });

    if (!userName) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = {
      id: userName.id,
      username: userName.username,
      email: userEmail?.email || "",
    };

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.post("/name", async (req, res) => {
  try {
    const { id, username } = req.body;
    const userName = await prisma.userName.create({
      data: { id, username },
    });

    res.status(201).json(userName);
  } catch (error) {
    res.status(500).json({ error: "Failed to create username" });
  }
});

router.post("/email", async (req, res) => {
  try {
    const { id, email } = req.body;
    const userEmail = await prisma.userEmail.create({
      data: { id, email },
    });

    res.status(201).json(userEmail);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user email" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { id, username, email } = req.body;

    const userName = await prisma.userName.create({
      data: { id, username },
    });

    if (email) {
      await prisma.userEmail.create({
        data: { id, email },
      });
    }

    const user = {
      id: userName.id,
      username: userName.username,
      email: email || "",
    };

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { username, email } = req.body;

    const userName = await prisma.userName.update({
      where: { id: req.params.id },
      data: { username },
    });

    if (email !== undefined) {
      await prisma.userEmail.upsert({
        where: { id: req.params.id },
        update: { email },
        create: { id: req.params.id, email },
      });
    }

    const userEmail = await prisma.userEmail.findUnique({
      where: { id: req.params.id },
    });

    const user = {
      id: userName.id,
      username: userName.username,
      email: userEmail?.email || "",
    };

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.userName.delete({
      where: { id: req.params.id },
    });

    await prisma.userEmail.deleteMany({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;

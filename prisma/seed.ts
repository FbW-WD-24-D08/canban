import { PrismaClient } from "../generated/prisma";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

interface DbData {
  boards: Array<{
    id: string;
    title: string;
    description?: string;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
  }>;
  boardMembers: Array<{
    id: string;
    boardId: string;
    userId: string;
  }>;
  columns: Array<{
    id: string;
    title: string;
    boardId: string;
    position: number;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    columnId: string;
    position?: number;
    status?: string;
    priority?: string;
    dueDate?: string;
    assignedTo?: string;
    createdAt?: string;
    updatedAt?: string;
    archived?: boolean;
  }>;
  attachments?: Array<{
    id: string;
    taskId: string;
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    uploadedAt: string;
  }>;
  checklistItems?: Array<{
    id: string;
    taskId: string;
    title: string;
    completed: boolean;
    position: number;
    createdAt: string;
  }>;
  usernames: Array<{
    id: string;
    username: string;
  }>;
  useremails: Array<{
    id: string;
    email: string;
  }>;
}

async function main() {
  console.log("🌱 Starting database seed...");

  const dbPath = path.join(process.cwd(), "db", "db.json");
  const rawData = fs.readFileSync(dbPath, "utf-8");
  const data: DbData = JSON.parse(rawData);

  console.log("📊 Data loaded from db.json");

  console.log("🧹 Cleaning existing data...");

  await prisma.checklistItem.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.userEmail.deleteMany();
  await prisma.userName.deleteMany();

  console.log("✅ Existing data cleaned");

  console.log("👤 Loading usernames...");
  for (const user of data.usernames) {
    await prisma.userName.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        username: user.username,
      },
    });
  }
  console.log(`✅ Created ${data.usernames.length} usernames`);

  console.log("📧 Loading user emails...");
  for (const userEmail of data.useremails) {
    await prisma.userEmail.upsert({
      where: { id: userEmail.id },
      update: {},
      create: {
        id: userEmail.id,
        email: userEmail.email,
      },
    });
  }
  console.log(`✅ Created ${data.useremails.length} user emails`);

  console.log("📋 Loading boards...");
  for (const board of data.boards) {
    await prisma.board.create({
      data: {
        id: board.id,
        title: board.title,
        description: board.description || "",
        ownerId: board.ownerId,
        createdAt: new Date(board.createdAt),
        updatedAt: new Date(board.updatedAt),
      },
    });
  }
  console.log(`✅ Created ${data.boards.length} boards`);

  console.log("👥 Loading board members...");
  for (const member of data.boardMembers) {
    await prisma.boardMember.create({
      data: {
        id: member.id,
        boardId: member.boardId,
        userId: member.userId,
      },
    });
  }
  console.log(`✅ Created ${data.boardMembers.length} board members`);

  console.log("📄 Loading columns...");
  for (const column of data.columns) {
    await prisma.column.create({
      data: {
        id: column.id,
        title: column.title,
        boardId: column.boardId,
        position: column.position,
      },
    });
  }
  console.log(`✅ Created ${data.columns.length} columns`);

  console.log("📝 Loading tasks...");
  for (const task of data.tasks) {
    await prisma.task.create({
      data: {
        id: task.id,
        title: task.title,
        description: task.description || "",
        columnId: task.columnId,
        position: task.position || 0,
        status: task.status || "todo",
        priority: task.priority || "medium",
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        assignees: task.assignedTo ? [task.assignedTo] : [],
        archived: task.archived || false,
      },
    });
  }
  console.log(`✅ Created ${data.tasks.length} tasks`);

  if (data.attachments && data.attachments.length > 0) {
    console.log("📎 Loading attachments...");
    for (const attachment of data.attachments) {
      await prisma.attachment.create({
        data: {
          id: attachment.id,
          taskId: attachment.taskId,
          name: attachment.fileName,
          type: "file",
          data: attachment.fileUrl,
        },
      });
    }
    console.log(`✅ Created ${data.attachments.length} attachments`);
  }

  if (data.checklistItems && data.checklistItems.length > 0) {
    console.log("☑️ Loading checklist items...");
    for (const item of data.checklistItems) {
      await prisma.checklistItem.create({
        data: {
          id: item.id,
          taskId: item.taskId,
          text: item.title,
          completed: item.completed,
        },
      });
    }
    console.log(`✅ Created ${data.checklistItems.length} checklist items`);
  }

  console.log("🎉 Database seeding completed successfully!");

  const stats = {
    boards: await prisma.board.count(),
    boardMembers: await prisma.boardMember.count(),
    columns: await prisma.column.count(),
    tasks: await prisma.task.count(),
    userNames: await prisma.userName.count(),
    userEmails: await prisma.userEmail.count(),
  };

  console.log("📊 Final database statistics:");
  console.log(stats);
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

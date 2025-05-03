"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const getUserProjects = async () => {
  const { userId } = auth();
  if (!userId) return [];

  const projects = await db.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return projects;
};

export const createProject = async (name: string) => {
  const { userId } = auth();
  if (!userId) return;

  const project = await db.project.create({
    data: { name, userId },
  });

  return project;
};

export const getProjectById = async (id: string) => {
  const { userId } = auth();
  if (!userId) return null;

  const project = await db.project.findUnique({
    where: {
      id,
      userId,
    },
  });

  return project;
};

export const getProjectChats = async (projectId: string) => {
  const { userId } = auth();
  if (!userId) return [];

  const chats = await db.chat.findMany({
    where: {
      userId,
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return chats;
};

// ====== ✅ NEW FUNCTION ADDED BELOW THIS LINE ======

export async function moveChatToProject(chatId: string, projectId?: string) {
  if (!chatId || !projectId) {
    throw new Error("Both chatId and projectId are required.");
  }

  await db.chat.update({
    where: { id: chatId },
    data: { projectId },
  });

  return { success: true };
}

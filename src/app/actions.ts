"use server";

import { isCategory } from "@/lib/categories";
import { revalidatePath } from "next/cache";
import { Prisma, Priority } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

type Result = { ok: true } | { ok: false; error: string };

function validName(name: unknown): name is string {
  return typeof name === "string" && name.trim().length > 0 && name.trim().length <= 200;
}

function validId(id: unknown): id is string {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

async function mutate(operation: () => Promise<unknown>): Promise<Result> {
  try {
    await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      revalidatePath("/");
      return { ok: false, error: "This task was already deleted. Refresh the list to continue." };
    }
    console.error("Task mutation failed", error);
    return { ok: false, error: "Couldn't save your change. Please try again." };
  }
  revalidatePath("/");
  return { ok: true };
}

export async function createTask(name: string, category: string): Promise<Result> {
  if (!validName(name)) return { ok: false, error: "Enter a task name between 1 and 200 characters." };
  if (!isCategory(category)) return { ok: false, error: "Choose a valid category." };
  return mutate(() => getPrisma().task.create({ data: { name: name.trim(), category } }));
}

export async function updateTask(id: string, name: string): Promise<Result> {
  if (!validId(id)) return { ok: false, error: "Invalid task ID." };
  if (!validName(name)) return { ok: false, error: "Enter a task name between 1 and 200 characters." };
  return mutate(() => getPrisma().task.update({ where: { id }, data: { name: name.trim() } }));
}

export async function deleteTask(id: string): Promise<Result> {
  if (!validId(id)) return { ok: false, error: "Invalid task ID." };
  return mutate(() => getPrisma().task.delete({ where: { id } }));
}

export async function updateDueDate(id: string, value: string): Promise<Result> {
  if (!validId(id)) return { ok: false, error: "Invalid task ID." };
  if (typeof value !== "string") return { ok: false, error: "Choose a valid date." };
  let dueAt: Date | null = null;
  if (value !== "") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return { ok: false, error: "Choose a valid date." };
    dueAt = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(dueAt.getTime()) || dueAt.toISOString().slice(0, 10) !== value) {
      return { ok: false, error: "Choose a valid date." };
    }
  }
  return mutate(() => getPrisma().task.update({ where: { id }, data: { dueAt } }));
}

export async function setTaskPriority(id: string, priority: Priority): Promise<Result> {
  if (!validId(id)) return { ok: false, error: "Invalid task ID." };
  if (!Object.values(Priority).includes(priority)) return { ok: false, error: "Choose Low, Medium, or High priority." };
  return mutate(() => getPrisma().task.update({ where: { id }, data: { priority } }));
}

export async function setTaskCompleted(id: string, completed: boolean): Promise<Result> {
  if (!validId(id)) return { ok: false, error: "Invalid task ID." };
  if (typeof completed !== "boolean") return { ok: false, error: "Invalid completion state." };
  return mutate(() => getPrisma().task.update({ where: { id }, data: { completed } }));
}

export async function updateCategory(id: string, category: string): Promise<Result> {
  if (!validId(id)) return { ok: false, error: "Invalid task ID." };
  if (!isCategory(category)) return { ok: false, error: "Choose a valid category." };
  return mutate(() => getPrisma().task.update({ where: { id }, data: { category } }));
}

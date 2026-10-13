import { getPrisma } from "@/lib/prisma";
import { TaskList } from "./task-list";

export const dynamic = "force-dynamic";

export default async function Home() {
  const tasks = await getPrisma().task.findMany({ orderBy: [{ createdAt: "desc" }, { id: "desc" }] });
  return <TaskList tasks={tasks.map((task) => ({ ...task, createdAt: task.createdAt.toISOString(), dueAt: task.dueAt?.toISOString() ?? null }))} />;
}

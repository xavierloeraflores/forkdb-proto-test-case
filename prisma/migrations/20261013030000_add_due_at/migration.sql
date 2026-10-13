-- Add optional due dates while preserving every existing task.
ALTER TABLE "tasks" ADD COLUMN "dueAt" TIMESTAMPTZ(3);

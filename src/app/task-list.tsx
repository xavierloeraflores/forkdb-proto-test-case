"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { createTask, deleteTask, updateTask, updateDueDate, setTaskPriority, setTaskCompleted } from "./actions";

type Task = { id: string; name: string; createdAt: string; dueAt: string | null; priority: "LOW" | "MEDIUM" | "HIGH"; completed: boolean };
const priorityLabels = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };

type Result = { ok: true } | { ok: false; error: string };

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
});

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [dateEditingId, setDateEditingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const addForm = useRef<HTMLFormElement>(null);

  function run(operation: () => Promise<Result>, success: () => void, message: string) {
    setError("");
    setNotice("");
    startTransition(async () => {
      try {
        const result = await operation();
        if (!result.ok) { setError(result.error); return; }
        success();
        setNotice(message);
      } catch {
        setError("Couldn't reach the server. Please try again.");
      }
    });
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    run(() => createTask(name), () => { addForm.current?.reset(); }, "Task added.");
  }

  function save(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    run(() => updateTask(id, name), () => setEditingId(null), "Task updated.");
  }

  return (
    <>
      <div className="schedule-summary">
        <div><span className="summary-number">{tasks.filter((task) => task.completed).length} / {tasks.length}</span><span>tasks complete</span><progress value={tasks.filter((task) => task.completed).length} max={tasks.length || 1} aria-label="Completed tasks" /></div>
        <div><span className="summary-number">{tasks.filter((task) => task.priority === "HIGH").length}</span><span>high priority</span></div>
        <div><span className="summary-number">{tasks.filter((task) => task.dueAt).length}</span><span>tasks scheduled</span></div>
        <div><span className="summary-number">{tasks.filter((task) => !task.dueAt).length}</span><span>still open-ended</span></div>

      </div>
      <section className="card" aria-label="Task list" aria-busy={pending}>
        <form className="add-form" ref={addForm} onSubmit={add}>
          <label htmlFor="task-name">What&apos;s next?</label>
          <div className="form-line">
            <input id="task-name" name="name" placeholder="Add a task…" required maxLength={200} disabled={pending} autoComplete="off" />
            <button className="primary" disabled={pending} type="submit"><span aria-hidden="true">+</span> Add task</button>
          </div>
        </form>
        <div className="list-heading">
          <h2>Your tasks <span className="count">{tasks.length}</span></h2>
          <span className="list-hint">Newest first</span>
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
        {tasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon" aria-hidden="true">≡</span>
            <h3>No tasks yet</h3>
            <p>Add your first task above.</p>
          </div>
        ) : (
          <ul className="tasks">
            {tasks.map((task) => (
              <li key={task.id} className={task.completed ? "completed" : undefined}>
                {editingId === task.id ? (
                  <form className="edit-form" onSubmit={(event) => save(event, task.id)}>
                    <label className="sr-only" htmlFor={`edit-${task.id}`}>Task name</label>
                    <input id={`edit-${task.id}`} name="name" defaultValue={task.name} required maxLength={200} autoFocus disabled={pending} onKeyDown={(event) => { if (event.key === "Escape" && !pending) setEditingId(null); }} />
                    <div className="row-actions">
                      <button className="primary small" type="submit" disabled={pending}>Save</button>
                      <button className="quiet" type="button" disabled={pending} onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="task-main">
                      <input className="completion-checkbox" type="checkbox" checked={task.completed} disabled={pending} aria-label={`Mark ${task.name} ${task.completed ? "incomplete" : "complete"}`} onChange={(event) => { const completed = event.currentTarget.checked; run(() => setTaskCompleted(task.id, completed), () => {}, completed ? "Task completed." : "Task marked incomplete."); }} />
                    <div className="task-content">
                      <h3>{task.name}</h3>
                      <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>{priorityLabels[task.priority]}</span>
                      <time dateTime={task.createdAt} title={task.createdAt}>Created {dateFormat.format(new Date(task.createdAt))}</time>
                    </div>
                    </div>
                    <div className="task-controls">
<select className="priority-select" aria-label={`Priority for ${task.name}`} value={task.priority} disabled={pending} onChange={(event) => { const priority = event.currentTarget.value as Task["priority"]; run(() => setTaskPriority(task.id, priority), () => {}, "Priority saved."); }}>
                        <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                      </select>

                      {dateEditingId === task.id ? (
                        <form className="date-editor" onSubmit={(event) => {
                          event.preventDefault();
                          const value = String(new FormData(event.currentTarget).get("dueAt") ?? "");
                          run(() => updateDueDate(task.id, value), () => setDateEditingId(null), "Due date saved.");
                        }}>
                          <label htmlFor={`due-${task.id}`}>Due date</label>
                          <input id={`due-${task.id}`} aria-label={`Due date for ${task.name}`} type="date" name="dueAt" defaultValue={task.dueAt?.slice(0, 10) ?? ""} disabled={pending} autoFocus />
                          <div className="date-buttons">
                            <button className="primary small" disabled={pending} type="submit">Save date</button>
                            <button className="quiet" disabled={pending} type="button" onClick={() => run(() => updateDueDate(task.id, ""), () => setDateEditingId(null), "Due date cleared.")}>Clear</button>
                            <button className="quiet" disabled={pending} type="button" onClick={() => setDateEditingId(null)}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <button className={`due-chip ${task.dueAt ? "scheduled" : "unscheduled"}`} disabled={pending} aria-label={`Change due date for ${task.name}`} onClick={() => { setDateEditingId(task.id); setEditingId(null); setDeletingId(null); }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v5m10-5v5M3 11h18" /></svg>
                          {task.dueAt ? `Due ${dateFormat.format(new Date(task.dueAt))}` : "Set due date"}
                        </button>
                      )}
                    <div className="row-actions">
                      {deletingId === task.id ? (
                        <>
                          <span className="delete-prompt">Delete task?</span>
                          <button className="danger" disabled={pending} onClick={() => run(() => deleteTask(task.id), () => setDeletingId(null), "Task deleted.")}>Delete</button>
                          <button className="quiet" disabled={pending} onClick={() => setDeletingId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="quiet" aria-label={`Edit ${task.name}`} disabled={pending} onClick={() => { setEditingId(task.id); setDateEditingId(null); setDeletingId(null); setError(""); }}>Edit</button>
                          <button className="quiet delete" aria-label={`Delete ${task.name}`} disabled={pending} onClick={() => { setDeletingId(task.id); setDateEditingId(null); setEditingId(null); setError(""); }}>Delete</button>
                        </>
                      )}
                    </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="status" role="status" aria-live="polite">{pending ? "Saving…" : notice || "Changes are saved automatically."}</p>
    </>
  );
}

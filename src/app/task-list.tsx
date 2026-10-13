"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { createTask, deleteTask, updateTask, setTaskCompleted } from "./actions";

type Task = { id: string; name: string; createdAt: string; completed: boolean };
type Result = { ok: true } | { ok: false; error: string };

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
});

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const addForm = useRef<HTMLFormElement>(null);
  const completedCount = tasks.filter((task) => task.completed).length;
  const progress = tasks.length ? Math.round(completedCount / tasks.length * 100) : 0;

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
      <section className="progress-card" aria-label="Completion progress">
        <div className="progress-top">
          <div><span className="progress-label">Your progress</span><p><strong>{completedCount}</strong> of {tasks.length} tasks complete</p></div>
          <span className="progress-percent">{progress}%</span>
        </div>
        <progress value={completedCount} max={tasks.length || 1} aria-label={`${completedCount} of ${tasks.length} tasks complete`} />
        <p className="progress-note">{tasks.length === 0 ? "Add a task to get started." : completedCount === tasks.length ? "Everything is checked off. Nicely done." : `${tasks.length - completedCount} tasks left to check off.`}</p>
      </section>
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
                    <input className="completion-checkbox" type="checkbox" checked={task.completed} disabled={pending} aria-label={`Mark ${task.name} ${task.completed ? "incomplete" : "complete"}`} onChange={(event) => {
                      const checked = event.currentTarget.checked;
                      run(() => setTaskCompleted(task.id, checked), () => {}, checked ? "Task completed." : "Task marked incomplete.");
                    }} />
                    <div className="task-content">
                      <h3>{task.name}</h3>
                      <time dateTime={task.createdAt} title={task.createdAt}>Created {dateFormat.format(new Date(task.createdAt))}</time>
                    </div>
                    </div>
                    <div className="row-actions">
                      {deletingId === task.id ? (
                        <>
                          <span className="delete-prompt">Delete task?</span>
                          <button className="danger" disabled={pending} onClick={() => run(() => deleteTask(task.id), () => setDeletingId(null), "Task deleted.")}>Delete</button>
                          <button className="quiet" disabled={pending} onClick={() => setDeletingId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="quiet" aria-label={`Edit ${task.name}`} disabled={pending} onClick={() => { setEditingId(task.id); setDeletingId(null); setError(""); }}>Edit</button>
                          <button className="quiet delete" aria-label={`Delete ${task.name}`} disabled={pending} onClick={() => { setDeletingId(task.id); setEditingId(null); setError(""); }}>Delete</button>
                        </>
                      )}
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

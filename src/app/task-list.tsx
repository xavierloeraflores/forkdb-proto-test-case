"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { createTask, deleteTask, updateTask, updateCategory } from "./actions";

import { categories } from "@/lib/categories";

type Task = { id: string; name: string; createdAt: string; category: string };
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
    const category = String(new FormData(event.currentTarget).get("category") ?? "Personal");
    run(() => createTask(name, category), () => { addForm.current?.reset(); }, "Task added.");
  }

  function save(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    run(() => updateTask(id, name), () => setEditingId(null), "Task updated.");
  }

  return (
    <>
      <section className="card" aria-label="Task list" aria-busy={pending}>
        <form className="add-form" ref={addForm} onSubmit={add}>
          <label htmlFor="task-name">What&apos;s next?</label>
          <div className="form-line">
            <input id="task-name" name="name" placeholder="Add a task…" required maxLength={200} disabled={pending} autoComplete="off" />
            <select name="category" aria-label="New task category" defaultValue="Personal" disabled={pending}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
            <button className="primary" disabled={pending} type="submit"><span aria-hidden="true">+</span> Add task</button>
          </div>
        </form>
        <div className="list-heading">
          <h2>Your tasks <span className="count">{tasks.length}</span></h2>
          <span className="list-hint">Choose a category to save it</span>
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
              <li key={task.id}>
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
                    <div className="task-content">
                      <h3>{task.name}</h3>
                      <span className={`category-chip category-${task.category.toLowerCase()}`}>{task.category}</span>
                      <time dateTime={task.createdAt} title={task.createdAt}>Created {dateFormat.format(new Date(task.createdAt))}</time>
                    </div>
                    <div className="row-actions">
                      <select aria-label={`Category for ${task.name}`} value={task.category} disabled={pending} onChange={(event) => { const category = event.currentTarget.value; run(() => updateCategory(task.id, category), () => {}, "Category saved."); }}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
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

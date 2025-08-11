"use client"

import { useEffect, useMemo, useState } from "react"

type Item = {
  id: number
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [editingId, setEditingId] = useState<number | null>(null)

  const isEditing = useMemo(() => editingId !== null, [editingId])

  async function fetchItems() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/items", { cache: "no-store" })
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
      const data: Item[] = await res.json()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchItems()
  }, [])

  function resetForm() {
    setName("")
    setDescription("")
    setEditingId(null)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      setError(null)
      const payload = { name: name.trim(), description: description.trim() || null }
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Create failed: ${res.status}`)
      }
      resetForm()
      await fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (editingId === null) return
    try {
      setError(null)
      const payload = { name: name.trim(), description: description.trim() || null }
      const res = await fetch(`/api/items/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Update failed: ${res.status}`)
      }
      resetForm()
      await fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  async function handleDelete(id: number) {
    try {
      setError(null)
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `Delete failed: ${res.status}`)
      }
      if (editingId === id) resetForm()
      await fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  function startEdit(item: Item) {
    setEditingId(item.id)
    setName(item.name)
    setDescription(item.description ?? "")
  }

  return (
    <div className="font-sans min-h-screen p-8 sm:p-12">
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <h1 className="text-2xl font-semibold">Items</h1>

        <form
          onSubmit={isEditing ? handleUpdate : handleCreate}
          className="flex flex-col gap-3 border border-black/10 dark:border-white/15 rounded-lg p-4"
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
              className="border rounded px-3 py-2 bg-transparent"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              className="border rounded px-3 py-2 bg-transparent min-h-[80px]"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm"
            >
              {isEditing ? "Update" : "Create"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </form>

        <div className="border border-black/10 dark:border-white/15 rounded-lg">
          <div className="px-4 py-3 border-b border-black/10 dark:border-white/15 flex items-center justify-between">
            <span className="text-sm font-medium">All Items</span>
            {loading && <span className="text-xs opacity-70">Loading…</span>}
          </div>
          <ul className="divide-y divide-black/10 dark:divide-white/15">
            {items.length === 0 && !loading ? (
              <li className="px-4 py-6 text-sm opacity-70">No items yet</li>
            ) : (
              items.map((item) => (
                <li key={item.id} className="px-4 py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-sm opacity-80 whitespace-pre-wrap">{item.description}</p>
                    )}
                    <p className="text-xs opacity-60 mt-1">
                      #{item.id} • Updated {new Date(item.updated_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="rounded-md border px-3 py-1.5 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => void handleDelete(item.id)}
                      className="rounded-md bg-red-600 text-white px-3 py-1.5 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

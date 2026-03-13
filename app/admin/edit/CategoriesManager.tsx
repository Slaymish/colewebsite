"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoriesManagerProps {
  initialCategories: string[];
  settingsId?: string;
}

export default function CategoriesManager({
  initialCategories,
  settingsId,
}: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const normalized = useMemo(
    () => categories.map((category) => category.trim()).filter(Boolean),
    [categories],
  );

  async function save(nextCategories: string[]) {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settingsId, categories: nextCategories }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save categories");
      }

      setCategories(nextCategories);
      setMessage("Saved");
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save categories");
    } finally {
      setSaving(false);
    }
  }

  function handleAdd() {
    const value = draft.trim();
    if (!value) return;
    if (normalized.includes(value)) {
      setDraft("");
      return;
    }
    void save([...normalized, value]);
    setDraft("");
  }

  function handleRemove(category: string) {
    void save(normalized.filter((item) => item !== category));
  }

  return (
    <section className="rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900">Categories</h2>
          <p className="mt-1 text-sm text-neutral-500">
            These control the grouped project navigation order.
          </p>
        </div>
        {message && (
          <span className="text-xs text-neutral-400">{message}</span>
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add category"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <Button type="button" onClick={handleAdd} disabled={saving || !draft.trim()}>
          Add
        </Button>
      </div>

      {normalized.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {normalized.map((category) => (
            <div
              key={category}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-700"
            >
              <span>{category}</span>
              <button
                type="button"
                onClick={() => handleRemove(category)}
                className="text-neutral-400 transition-colors hover:text-neutral-900"
                disabled={saving}
                aria-label={`Remove ${category}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-neutral-400">No categories yet.</p>
      )}
    </section>
  );
}

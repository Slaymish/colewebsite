"use client";

import { useState } from "react";
import Link from "next/link";
import type { SanityImage, SiteSettings, SocialLink } from "../../../../types";
import ImageUploadField from "../[slug]/ImageUploadField";

export type SiteSettingsMode = "about" | "contact";

interface SiteSettingsEditorProps {
  initialSettings: SiteSettings | null;
  mode: SiteSettingsMode;
}

type CvFileRef = {
  _type: "file";
  asset: { _type: "reference"; _ref: string; url?: string };
} | null;

type FormState = {
  name: string;
  bio: string;
  logo: SanityImage | undefined;
  contact_email: string;
  contact_phone: string;
  copyright: string;
  cv_url: string;
  cv_file: CvFileRef;
  social_links: SocialLink[];
};

function toFormState(settings: SiteSettings | null): FormState {
  const rawFile = settings?.cv?.file as
    | { asset?: { _id?: string; _ref?: string; url?: string } }
    | undefined;
  const fileRef: CvFileRef =
    rawFile?.asset && (rawFile.asset._ref || rawFile.asset._id)
      ? {
          _type: "file",
          asset: {
            _type: "reference",
            _ref: (rawFile.asset._ref ?? rawFile.asset._id) as string,
            url: rawFile.asset.url,
          },
        }
      : null;
  return {
    name: settings?.name ?? "",
    bio: settings?.bio ?? "",
    logo: settings?.logo,
    contact_email: settings?.contact_email ?? "",
    contact_phone: settings?.contact_phone ?? "",
    copyright: settings?.copyright ?? "",
    cv_url: settings?.cv?.url ?? "",
    cv_file: fileRef,
    social_links: settings?.social_links ?? [],
  };
}

const PLATFORM_OPTIONS: { value: string; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "twitter", label: "Twitter / X" },
  { value: "vimeo", label: "Vimeo" },
  { value: "youtube", label: "YouTube" },
  { value: "behance", label: "Behance" },
  { value: "dribbble", label: "Dribbble" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

const DRAG_MIME = "application/x-social-key";

export default function SiteSettingsEditor({ initialSettings, mode }: SiteSettingsEditorProps) {
  const [form, setForm] = useState<FormState>(toFormState(initialSettings));
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvUploadError, setCvUploadError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
    setSaveSuccess(false);
  };

  const addSocialLink = () => {
    const link: SocialLink = {
      _key: `social-${Date.now()}`,
      platform: "website",
      label: "",
      url: "",
    };
    update("social_links", [...form.social_links, link]);
  };

  const updateSocial = (key: string, patch: Partial<SocialLink>) => {
    update(
      "social_links",
      form.social_links.map((l) => (l._key === key ? { ...l, ...patch } : l)),
    );
  };

  const removeSocial = (key: string) => {
    update(
      "social_links",
      form.social_links.filter((l) => l._key !== key),
    );
  };

  const uploadCvFile = async (file: File) => {
    setCvUploading(true);
    setCvUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Upload failed");
      }
      const asset = (await res.json()) as { _id: string; _ref: string; url?: string };
      update("cv_file", {
        _type: "file",
        asset: {
          _type: "reference",
          _ref: asset._ref ?? asset._id,
          url: asset.url,
        },
      });
    } catch (err) {
      setCvUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setCvUploading(false);
    }
  };

  const reorderSocial = (sourceKey: string, targetKey: string) => {
    if (sourceKey === targetKey) return;
    const arr = [...form.social_links];
    const from = arr.findIndex((l) => l._key === sourceKey);
    const to = arr.findIndex((l) => l._key === targetKey);
    if (from === -1 || to === -1) return;
    const [moved] = arr.splice(from, 1);
    arr.splice(to, 0, moved);
    update("social_links", arr);
  };

  const save = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    // Build partial payload so each editor only writes fields it owns.
    const payload: Record<string, unknown> = {};
    if (mode === "about") {
      payload.name = form.name;
      payload.bio = form.bio;
      payload.logo = form.logo ?? null;
      // Send only the `_type` + `asset: { _type, _ref }` shape; strip any
      // expanded `url` field that was kept for preview purposes.
      const cvFileForSave = form.cv_file
        ? {
            _type: "file" as const,
            asset: {
              _type: "reference" as const,
              _ref: form.cv_file.asset._ref,
            },
          }
        : null;
      payload.cv = {
        url: form.cv_url || undefined,
        file: cvFileForSave,
      };
    }
    if (mode === "contact") {
      payload.contact_email = form.contact_email;
      payload.contact_phone = form.contact_phone;
    }
    // Social links + copyright are shared between both editors
    payload.social_links = form.social_links;
    payload.copyright = form.copyright;

    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Save failed");
      }
      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const title = mode === "about" ? "Edit About Page" : "Edit Contact Page";
  const previewHref = mode === "about" ? "/about" : "/contact";

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <Link
              href="/admin/edit"
              className="text-xs tracking-[0.1em] text-black/40 uppercase hover:text-black"
            >
              ← All projects
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-neutral-900">{title}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              These fields come from the shared Site Settings document. Changes publish immediately.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saveError && <span className="text-xs text-red-600">{saveError}</span>}
            {saveSuccess && <span className="text-xs text-green-700">Saved</span>}
            <a
              href={previewHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              Preview ↗
            </a>
            <button
              type="button"
              onClick={save}
              disabled={isSaving || !isDirty}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          {mode === "about" && (
            <>
              <Field label="Name">
                <TextInput
                  value={form.name}
                  onChange={(v) => update("name", v)}
                  placeholder="Cole Anderson"
                />
              </Field>

              <Field label="Bio / Tagline">
                <textarea
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  placeholder="Short bio…"
                  rows={4}
                  className="w-full resize-none rounded border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none"
                />
              </Field>

              <Field label="Portrait / Logo">
                <ImageUploadField
                  image={form.logo}
                  onChange={(img) => update("logo", img)}
                  label=""
                />
              </Field>

              <Field label="CV / Resume">
                <div className="space-y-2">
                  {form.cv_file?.asset?.url && (
                    <div className="flex items-center gap-2 rounded border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-xs">
                      <span className="truncate text-neutral-600">PDF uploaded</span>
                      <a
                        href={form.cv_file.asset.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View ↗
                      </a>
                      <button
                        type="button"
                        onClick={() => update("cv_file", null)}
                        className="ml-auto text-neutral-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <label className="flex w-full cursor-pointer items-center justify-center rounded border border-dashed border-neutral-300 px-3 py-2 text-xs text-neutral-500 transition-colors hover:border-blue-400 hover:text-blue-600">
                    {cvUploading ? "Uploading…" : "Upload PDF"}
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      disabled={cvUploading}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadCvFile(f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {cvUploadError && <p className="text-xs text-red-600">{cvUploadError}</p>}
                  <div className="flex items-center gap-2 pt-1 text-[0.65rem] tracking-wider text-neutral-400 uppercase">
                    <div className="h-px flex-1 bg-neutral-100" /> OR URL{" "}
                    <div className="h-px flex-1 bg-neutral-100" />
                  </div>
                  <TextInput
                    value={form.cv_url}
                    onChange={(v) => update("cv_url", v)}
                    placeholder="https://…"
                  />
                  <p className="text-xs text-neutral-400">
                    The uploaded PDF takes priority if both are set.
                  </p>
                </div>
              </Field>
            </>
          )}

          {mode === "contact" && (
            <>
              <Field label="Email">
                <TextInput
                  value={form.contact_email}
                  onChange={(v) => update("contact_email", v)}
                  placeholder="you@example.com"
                />
              </Field>

              <Field label="Phone (optional)">
                <TextInput
                  value={form.contact_phone}
                  onChange={(v) => update("contact_phone", v)}
                  placeholder="+64…"
                />
              </Field>
            </>
          )}

          <SectionDivider label="Social links" />

          <div className="space-y-2">
            {form.social_links.length === 0 && (
              <p className="text-xs text-neutral-400">No social links yet.</p>
            )}
            {form.social_links.map((link) => {
              const isDragged = draggingKey === link._key;
              const isDropTarget = dragOverKey === link._key && draggingKey !== link._key;

              return (
                <div
                  key={link._key}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData(DRAG_MIME, link._key);
                    e.dataTransfer.setData("text/plain", link._key);
                    setDraggingKey(link._key);
                  }}
                  onDragEnd={() => {
                    setDraggingKey(null);
                    setDragOverKey(null);
                  }}
                  onDragOver={(e) => {
                    if (!e.dataTransfer.types.includes(DRAG_MIME)) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    setDragOverKey(link._key);
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget === e.target && dragOverKey === link._key) {
                      setDragOverKey(null);
                    }
                  }}
                  onDrop={(e) => {
                    const sourceKey = e.dataTransfer.getData(DRAG_MIME);
                    if (!sourceKey) return;
                    e.preventDefault();
                    reorderSocial(sourceKey, link._key);
                    setDraggingKey(null);
                    setDragOverKey(null);
                  }}
                  className={`flex items-center gap-2 rounded border p-2 transition-colors ${
                    isDragged ? "opacity-40" : ""
                  } ${isDropTarget ? "border-blue-400 bg-blue-50/40" : "border-neutral-200"}`}
                >
                  <span className="shrink-0 cursor-grab text-neutral-400" aria-hidden="true">
                    <svg viewBox="0 0 6 10" width="10" height="14" fill="currentColor">
                      <circle cx="1" cy="1" r="1" />
                      <circle cx="5" cy="1" r="1" />
                      <circle cx="1" cy="5" r="1" />
                      <circle cx="5" cy="5" r="1" />
                      <circle cx="1" cy="9" r="1" />
                      <circle cx="5" cy="9" r="1" />
                    </svg>
                  </span>

                  <select
                    value={link.platform}
                    onChange={(e) => updateSocial(link._key, { platform: e.target.value })}
                    className="w-28 shrink-0 rounded border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-neutral-400 focus:outline-none"
                  >
                    {PLATFORM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={link.label ?? ""}
                    onChange={(e) => updateSocial(link._key, { label: e.target.value })}
                    placeholder="Label (optional)"
                    className="w-32 shrink-0 rounded border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-neutral-400 focus:outline-none"
                  />

                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateSocial(link._key, { url: e.target.value })}
                    placeholder="https://…"
                    className="flex-1 rounded border border-neutral-200 bg-white px-2 py-1 text-xs focus:border-neutral-400 focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => removeSocial(link._key)}
                    className="shrink-0 px-1 text-xs text-neutral-400 hover:text-red-500"
                    title="Remove link"
                    aria-label="Remove link"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={addSocialLink}
              className="w-full rounded border border-dashed border-neutral-300 px-3 py-2 text-xs text-neutral-500 transition-colors hover:border-blue-400 hover:text-blue-600"
            >
              + Add link
            </button>
          </div>

          <SectionDivider label="Shared" />

          <Field label="Copyright line">
            <TextInput
              value={form.copyright}
              onChange={(v) => update("copyright", v)}
              placeholder={`© ${new Date().getFullYear()} Cole Anderson`}
            />
          </Field>
        </div>
      </div>
    </div>
  );
}

// === Small form primitives (kept local to this editor) ===

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium tracking-wide text-neutral-500 uppercase">
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none"
    />
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-3">
      <span className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
        {label}
      </span>
      <div className="h-px flex-1 bg-neutral-100" />
    </div>
  );
}

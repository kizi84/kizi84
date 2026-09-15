"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Uploads to /api/admin/upload, which re-encodes everything to capped WebP.
 * The parent form reads the resulting paths from the hidden input named `images`.
 */
export function ImageUploader({
  name = "images",
  initial = [],
}: {
  name?: string;
  initial?: string[];
}) {
  const [images, setImages] = useState<string[]>(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    setError("");

    const body = new FormData();
    list.forEach((file) => body.append("files", file));

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(payload.error ?? "Качването се провали");
      } else {
        setImages((prev) => [...prev, ...(payload.urls as string[])]);
        if (payload.errors?.length) setError(payload.errors.join("; "));
      }
    } catch {
      setError("Няма връзка със сървъра");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  /** The first image is the one shown on cards and in search results. */
  function makePrimary(index: number) {
    setImages((prev) => {
      const next = [...prev];
      const [picked] = next.splice(index, 1);
      return [picked, ...next];
    });
  }

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files.length > 0) upload(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          dragging ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-cream",
        )}
      >
        <UploadCloud
          className={cn("mx-auto size-9", dragging ? "text-brand-600" : "text-ink-300")}
          aria-hidden
        />
        <p className="mt-3 text-sm font-semibold text-ink-800">
          Плъзнете снимки тук или ги изберете
        </p>
        <p className="mt-1 text-xs text-ink-400">
          JPG, PNG, WebP или AVIF · до 12 MB на файл · автоматично се смаляват и оптимизират
        </p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800 disabled:opacity-60"
        >
          {uploading ? (
            <><Loader2 className="size-4 animate-spin" aria-hidden /> Качване…</>
          ) : (
            <><ImagePlus className="size-4" aria-hidden /> Избери снимки</>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && upload(e.target.files)}
        />
      </div>

      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

      {images.length > 0 && (
        <>
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {images.map((src, index) => (
              <li
                key={src}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-xl border-2 bg-cream-dark",
                  index === 0 ? "border-brand-500" : "border-ink-100",
                )}
              >
                <Image src={src} alt="" fill sizes="160px" className="object-cover" />

                {index === 0 && (
                  <span className="absolute top-1.5 left-1.5 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    Основна
                  </span>
                )}

                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-ink-900/60 opacity-0 transition-opacity group-hover:opacity-100">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => makePrimary(index)}
                      className="grid size-9 place-items-center rounded-full bg-white/90 text-ink-800 hover:bg-white"
                      aria-label="Направи основна снимка"
                      title="Направи основна"
                    >
                      <Star className="size-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="grid size-9 place-items-center rounded-full bg-white/90 text-rose-600 hover:bg-white"
                    aria-label="Премахни снимката"
                    title="Премахни"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-400">
            Първата снимка се показва в каталога. Задръжте върху снимка, за да я смените или премахнете.
          </p>
        </>
      )}
    </div>
  );
}

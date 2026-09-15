"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  if (images.length === 0) {
    return (
      <div className="grid aspect-square place-items-center rounded-2xl border border-ink-100 bg-cream-dark text-7xl opacity-40">
        <span aria-hidden>🐾</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <ul className="no-scrollbar flex gap-2.5 overflow-x-auto sm:max-h-[32rem] sm:flex-col sm:overflow-y-auto">
          {images.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Снимка ${index + 1} от ${images.length}`}
                aria-current={index === active}
                className={cn(
                  "relative size-18 shrink-0 overflow-hidden rounded-xl border-2 transition-all sm:size-20",
                  index === active
                    ? "border-brand-500 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        className="relative aspect-square flex-1 overflow-hidden rounded-2xl border border-ink-100 bg-white"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
      >
        <Image
          key={images[active]}
          src={images[active]}
          alt={name}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 45vw"
          className={cn(
            "object-contain p-4 transition-transform duration-500 ease-out",
            zoom && "scale-110",
          )}
        />
      </div>
    </div>
  );
}

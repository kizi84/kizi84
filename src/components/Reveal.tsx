"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll reveal that can never leave content permanently hidden.
 *
 * Three independent paths make an element visible:
 *   1. it is already at or above the fold when it mounts,
 *   2. the IntersectionObserver fires as it scrolls into view,
 *   3. a safety timer elapses — so a missed observer callback, an unsupported
 *      API or an unusual layout still ends with readable content.
 */
const SAFETY_MS = 2500;

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let observer: IntersectionObserver | undefined;
    const safety = setTimeout(() => setVisible(true), SAFETY_MS);

    const show = () => {
      setVisible(true);
      clearTimeout(safety);
      observer?.disconnect();
    };

    // Already on screen (or scrolled past) — show it without waiting.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      show();
      return () => clearTimeout(safety);
    }

    if (typeof IntersectionObserver === "undefined") {
      show();
      return () => clearTimeout(safety);
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) show();
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(node);

    return () => {
      clearTimeout(safety);
      observer?.disconnect();
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

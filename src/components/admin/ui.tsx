import Link from "next/link";
import { FIELD_HINT, FIELD_INPUT, FIELD_LABEL } from "@/lib/form-styles";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900 lg:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-ink-100 bg-white", className)}>{children}</div>
  );
}

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        className ?? "bg-ink-100 text-ink-700",
      )}
    >
      {children}
    </span>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
    >
      {children}
    </Link>
  );
}

export function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-14 text-center text-sm text-ink-400">
        {text}
      </td>
    </tr>
  );
}

export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = false,
  placeholder,
  hint,
  step,
  min,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  step?: string;
  min?: number;
}) {
  return (
    <div>
      <label htmlFor={name} className={FIELD_LABEL}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        min={min}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue ?? undefined}
        className={FIELD_INPUT}
      />
      {hint && <p className={FIELD_HINT}>{hint}</p>}
    </div>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  placeholder,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={FIELD_LABEL}>
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue ?? undefined}
        className={FIELD_INPUT}
      />
      {hint && <p className={FIELD_HINT}>{hint}</p>}
    </div>
  );
}

export function Select({
  label,
  name,
  defaultValue,
  options,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className={FIELD_LABEL}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        className={FIELD_INPUT}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
}

export function Toggle({
  label,
  name,
  defaultChecked = false,
  hint,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink-200 bg-cream p-3.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
      />
      <span>
        <span className={FIELD_LABEL}>{label}</span>
        {hint && <span className="block text-xs text-ink-400">{hint}</span>}
      </span>
    </label>
  );
}

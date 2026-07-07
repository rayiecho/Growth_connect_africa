import { InputHTMLAttributes, SelectHTMLAttributes } from "react";

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export function Field({ label, required, hint, error, children }: FieldProps) {
  return (
    <div className="mb-5">
      <label className="block font-semibold text-brand-charcoal mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-sm text-brand-slate mb-2">{hint}</p>}
      {children}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-brand-charcoal
        focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent
        placeholder:text-gray-400"
    />
  );
}

export function Select({
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full rounded-lg border border-brand-line px-4 py-2.5 text-brand-charcoal bg-white
        focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
    >
      {children}
    </select>
  );
}

export function CheckboxField({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-start gap-3 text-sm text-brand-slate">
      <input
        type="checkbox"
        {...props}
        className="mt-1 h-4 w-4 rounded border-brand-line text-brand-green focus:ring-brand-green"
      />
      <span>{label}</span>
    </label>
  );
}
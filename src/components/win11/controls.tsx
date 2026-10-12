"use client";

/** Windows 11 toggle switch */
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={`win-toggle ${on ? "is-on" : ""}`}>
      <span />
    </button>
  );
}

/** Segmented choice — used where Windows shows a dropdown with a few options */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="win-segmented" role="radiogroup">
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={value === o.value} className={value === o.value ? "is-on" : ""} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

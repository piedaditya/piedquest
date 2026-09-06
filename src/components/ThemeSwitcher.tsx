import { Palette } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { THEMES, useTheme } from "@/contexts/ThemeContext";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change theme"
        aria-expanded={open}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card/60 px-3.5 py-2 font-display text-xs uppercase tracking-wider text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
      >
        <Palette className="h-3.5 w-3.5" />
        {active.label}
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-44 rounded-2xl border border-border p-1.5 shadow-2xl backdrop-blur-xl"
          style={{ background: "var(--color-card)" }}
          role="menu"
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setTheme(t.id);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left font-display text-xs uppercase tracking-wider transition-colors ${
                t.id === theme
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <span
                className="h-4 w-4 shrink-0 rounded-full border border-border"
                style={{ background: t.swatch }}
              />
              <span>{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeSwitcher;

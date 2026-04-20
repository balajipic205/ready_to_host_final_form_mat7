import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { ProblemStatement } from "@/lib/problemStatements";

type Props = {
  items: ProblemStatement[];
  value: string;
  onChange: (text: string) => void;
  onSelect: (ps: ProblemStatement) => void;
  field: "id" | "name";
  placeholder?: string;
};

/**
 * Searchable combobox for Problem Statements.
 * - field="id": shows the PS ID (e.g. HW0101) in the chip and filters by id substring.
 * - field="name": shows the PS name and filters by name substring (case-insensitive).
 */
export function PSCombobox({ items, value, onChange, onSelect, field, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = (value || "").trim().toLowerCase();
    if (!q) return items.slice(0, 50);
    return items
      .filter((p) =>
        field === "id"
          ? p.id.toLowerCase().includes(q)
          : p.name.toLowerCase().includes(q),
      )
      .slice(0, 80);
  }, [items, value, field]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    setActiveIdx(0);
  }, [value, open]);

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          className="input pl-10 pr-8"
          style={{ paddingLeft: "2.5rem" }}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIdx((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter" && open && filtered[activeIdx]) {
              e.preventDefault();
              onSelect(filtered[activeIdx]);
              setOpen(false);
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          autoComplete="off"
        />

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-30 mt-1 w-full max-h-72 overflow-auto rounded-md border border-border bg-background/95 backdrop-blur shadow-xl">
          {filtered.map((p, i) => (
            <button
              type="button"
              key={p.id}
              onClick={() => {
                onSelect(p);
                setOpen(false);
              }}
              onMouseEnter={() => setActiveIdx(i)}
              className={`w-full text-left px-3 py-2 text-sm border-b border-border/40 last:border-0 ${
                i === activeIdx ? "bg-spider/10" : "hover:bg-surface-2"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono-ui text-xs text-amber shrink-0">{p.id}</span>
                <span className="text-foreground truncate">{p.name}</span>
              </div>
              <div className="text-[11px] font-mono-ui text-muted-foreground mt-0.5 truncate">
                {p.category}
                {p.company ? ` · ${p.company}` : ""}
              </div>
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-border bg-background/95 backdrop-blur p-3 text-xs font-mono-ui text-muted-foreground">
          No matching problem statements
        </div>
      )}
    </div>
  );
}

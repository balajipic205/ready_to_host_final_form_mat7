import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { step1Schema, type Step1 } from "@/lib/validation";
import { Field } from "@/routes/login";
import { clean } from "@/lib/sanitize";
import { useEffect, useMemo, useState } from "react";
import { Cpu, Code2, Factory, ArrowRight } from "lucide-react";
import { PROBLEM_STATEMENTS, getStatementsByTrack } from "@/lib/problemStatements";
import { PSCombobox } from "@/components/PSCombobox";

export function Step1Form({
  defaultValues,
  onNext,
}: {
  defaultValues?: Partial<Step1>;
  onNext: (v: Step1) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Step1>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      ...defaultValues,
    },
  });

  const isSvce = watch("is_svce");
  const teamSize = watch("team_size");
  const category = watch("category");
  const psId = watch("problem_statement_id") || "";
  const psName = watch("problem_statement_name") || "";
  const company = watch("company_name") || "";

  // Local state mirrors so the comboboxes can show the typed text live.
  const [psIdText, setPsIdText] = useState(psId);
  const [psNameText, setPsNameText] = useState(psName);
  const [companyText, setCompanyText] = useState(company);

  useEffect(() => setPsIdText(psId), [psId]);
  useEffect(() => setPsNameText(psName), [psName]);
  useEffect(() => setCompanyText(company), [company]);

  useEffect(() => {
    if (isSvce === true) setValue("college_name", "");
  }, [isSvce, setValue]);

  // Reset PS fields when category changes so users don't keep stale IDs.
  useEffect(() => {
    setValue("problem_statement_id", "");
    setValue("problem_statement_name", "");
    setValue("company_name", "");
    setPsIdText("");
    setPsNameText("");
    setCompanyText("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  const trackItems = useMemo(
    () => (category ? getStatementsByTrack(category) : PROBLEM_STATEMENTS),
    [category],
  );
  const companies = useMemo(() => {
    const set = new Set<string>();
    PROBLEM_STATEMENTS.filter((p) => p.track === "Industry Problem Statement").forEach((p) => {
      if (p.company) set.add(p.company);
    });
    return Array.from(set).sort();
  }, []);

  const applyPs = (id: string, name: string, comp?: string) => {
    setValue("problem_statement_id", id, { shouldValidate: true });
    setValue("problem_statement_name", name, { shouldValidate: true });
    setPsIdText(id);
    setPsNameText(name);
    if (comp) {
      setValue("company_name", comp, { shouldValidate: true });
      setCompanyText(comp);
    }
  };

  const submit = handleSubmit((v) => {
    onNext({
      ...v,
      team_name: clean(v.team_name),
      college_name: v.is_svce ? "Sri Venkateswara College of Engineering" : clean(v.college_name || ""),
      problem_statement_id: clean(v.problem_statement_id),
      problem_statement_name: clean(v.problem_statement_name),
      company_name: clean(v.company_name || ""),
    });
  });

  const categories = [
    { v: "Hardware", icon: Cpu, hint: "Build with circuits" },
    { v: "Software", icon: Code2, hint: "Build with code" },
    { v: "Industry Problem Statement", icon: Factory, hint: "Solve real problems" },
  ] as const;

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <div className="font-display text-lg text-foreground">Team Information</div>
        <div className="font-mono-ui text-[11px] uppercase tracking-[0.2em] text-cyan-edge mt-0.5">
          Step 1 / 6
        </div>
      </div>

      <Field label="Team Name" error={errors.team_name?.message}>
        <input
          className="input"
          maxLength={50}
          placeholder="e.g. Quantum Coders"
          {...register("team_name")}
        />
      </Field>

      <div>
        <span className="block text-xs font-mono-ui uppercase tracking-wider text-muted-foreground mb-2">
          Team Size
        </span>
        <div className="grid grid-cols-3 gap-2">
          {[4, 5, 6].map((n) => {
            const sel = teamSize === n;
            return (
              <button
                type="button"
                key={n}
                onClick={() => setValue("team_size", n as 4 | 5 | 6)}
                className={`min-h-[52px] rounded-md border font-mono-ui text-sm transition-all ${
                  sel
                    ? "border-spider text-spider bg-spider/10 shadow-[0_0_18px_color-mix(in_oklab,var(--spider)_30%,transparent)]"
                    : "border-border text-muted-foreground hover:border-cyan-edge"
                }`}
              >
                {n} Members
              </button>
            );
          })}
        </div>
        {errors.team_size?.message && (
          <p className="text-xs text-destructive font-mono-ui mt-1">{errors.team_size.message}</p>
        )}
      </div>

      <div>
        <span className="block text-xs font-mono-ui uppercase tracking-wider text-muted-foreground mb-2">
          College
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setValue("is_svce", true);
              setValue("college_name", "");
            }}
            className={`min-h-[52px] rounded-md border font-mono-ui text-sm transition-all ${
              isSvce === true
                ? "border-spider text-spider bg-spider/10 shadow-[0_0_18px_color-mix(in_oklab,var(--spider)_30%,transparent)]"
                : "border-border text-muted-foreground hover:border-cyan-edge"
            }`}
          >
            SVCE
          </button>
          <button
            type="button"
            onClick={() => setValue("is_svce", false)}
            className={`min-h-[52px] rounded-md border font-mono-ui text-sm transition-all ${
              isSvce === false
                ? "border-spider text-spider bg-spider/10 shadow-[0_0_18px_color-mix(in_oklab,var(--spider)_30%,transparent)]"
                : "border-border text-muted-foreground hover:border-cyan-edge"
            }`}
          >
            Other College
          </button>
        </div>
        {errors.is_svce?.message && (
          <p className="text-xs text-destructive font-mono-ui mt-1">{errors.is_svce.message}</p>
        )}
        {isSvce === false && (
          <div className="mt-3">
            <Field label="College name" error={errors.college_name?.message}>
              <input
                className="input"
                maxLength={120}
                placeholder="e.g. Anna University"
                {...register("college_name")}
              />
            </Field>
            <p className="text-xs text-muted-foreground mt-2 font-mono-ui">
              Note: inter-college teams are NOT allowed — all members must be from the same college.
            </p>
          </div>
        )}
      </div>

      <div>
        <span className="block text-xs font-mono-ui uppercase tracking-wider text-muted-foreground mb-2">
          Category
        </span>
        <div className="grid sm:grid-cols-3 gap-2">
          {categories.map(({ v, icon: Icon, hint }) => {
            const sel = category === v;
            return (
              <button
                type="button"
                key={v}
                onClick={() => setValue("category", v)}
                className={`p-3 rounded-md border text-left transition-all ${
                  sel
                    ? "border-spider bg-spider/10 shadow-[0_0_18px_color-mix(in_oklab,var(--spider)_30%,transparent)]"
                    : "border-border hover:border-cyan-edge"
                }`}
              >
                <Icon className={`h-5 w-5 ${sel ? "text-spider" : "text-cyan-edge"}`} />
                <div className="mt-2 font-display text-sm">{v}</div>
                <div className="text-[11px] text-muted-foreground font-mono-ui mt-0.5">{hint}</div>
              </button>
            );
          })}
        </div>
        {errors.category?.message && (
          <p className="text-xs text-destructive font-mono-ui mt-1">{errors.category.message}</p>
        )}
      </div>

      {category && (
        <div className="rounded-md border border-cyan-edge/30 bg-cyan-edge/5 p-4">
          <div className="font-display text-sm text-cyan-edge mb-3 uppercase tracking-wider">
            Problem Statement
          </div>
          <p className="text-[11px] font-mono-ui text-muted-foreground mb-3">
            Start typing the ID or name — both fields auto-fill once you pick a problem statement.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Problem statement ID" error={errors.problem_statement_id?.message}>
              <PSCombobox
                items={trackItems}
                field="id"
                value={psIdText}
                onChange={(t) => {
                  setPsIdText(t);
                  setValue("problem_statement_id", t);
                }}
                onSelect={(p) => applyPs(p.id, p.name, p.company)}
                placeholder="e.g. HW0101"
              />
            </Field>
            <Field label="Problem statement name" error={errors.problem_statement_name?.message}>
              <PSCombobox
                items={trackItems}
                field="name"
                value={psNameText}
                onChange={(t) => {
                  setPsNameText(t);
                  setValue("problem_statement_name", t);
                }}
                onSelect={(p) => applyPs(p.id, p.name, p.company)}
                placeholder="Search by problem name"
              />
            </Field>
            {category === "Industry Problem Statement" && (
              <div className="sm:col-span-2">
                <Field label="Company name" error={errors.company_name?.message}>
                  <input
                    list="company-list"
                    className="input"
                    maxLength={120}
                    placeholder="e.g. Ford Motor Company"
                    value={companyText}
                    onChange={(e) => {
                      setCompanyText(e.target.value);
                      setValue("company_name", e.target.value);
                    }}
                  />
                  <datalist id="company-list">
                    {companies.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </Field>
              </div>
            )}
          </div>
        </div>
      )}

      <NextBar />
    </form>
  );
}

export function NextBar({ label = "Save & continue", disabled }: { label?: string; disabled?: boolean }) {
  return (
    <div className="sticky bottom-0 -mx-4 sm:mx-0 sm:static border-t border-spider/20 bg-background/95 backdrop-blur px-4 py-3 sm:p-0 sm:border-0 sm:bg-transparent sm:backdrop-blur-0">
      <button
        type="submit"
        disabled={disabled}
        className="w-full sm:w-auto sm:ml-auto sm:flex inline-flex items-center justify-center gap-2 btn-spider rounded-md px-6 py-3 font-display font-semibold disabled:opacity-50 min-h-[44px]"
      >
        {label} <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

import { Check } from "lucide-react";

const STEPS = ["Team", "Members", "Mentor", "Photos", "Payment", "Review"];

export function Stepper({ current, completed }: { current: number; completed: number }) {
  return (
    <div className="sticky top-[60px] z-20 -mx-4 mb-6 border-b border-spider/20 bg-background/85 backdrop-blur px-4 py-3">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center gap-1 overflow-x-auto">
          {STEPS.map((label, i) => {
            const stepNo = i + 1;
            const isDone = stepNo <= completed;
            const isActive = stepNo === current;
            return (
              <div key={label} className="flex items-center min-w-fit">
                <div
                  className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 transition-all ${
                    isActive
                      ? "border border-spider bg-spider/10 shadow-[0_0_18px_color-mix(in_oklab,var(--spider)_30%,transparent)]"
                      : isDone
                        ? "border border-success/40 bg-surface-2"
                        : "border border-border bg-surface"
                  }`}
                >
                  <div
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-mono-ui ${
                      isActive
                        ? "bg-spider text-spider-foreground"
                        : isDone
                          ? "bg-success text-background"
                          : "bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {isDone && !isActive ? <Check className="h-3 w-3" /> : stepNo}
                  </div>
                  <span
                    className={`text-xs font-mono-ui hidden sm:inline ${
                      isActive ? "text-foreground" : isDone ? "text-success" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-px w-3 mx-0.5 ${stepNo < completed + 1 ? "bg-success/50" : "bg-border"}`} />
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-2 sm:hidden font-mono-ui text-xs text-muted-foreground">
          Step {current} of 6 — <span className="text-spider">{STEPS[current - 1]}</span>
        </div>
      </div>
    </div>
  );
}

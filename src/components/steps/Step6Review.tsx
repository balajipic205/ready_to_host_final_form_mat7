import { useEffect, useRef, useState } from "react";
import type { RegState } from "@/store/registration";
import { POC_CONTACTS } from "@/lib/contacts";
import { CheckCircle2, MessageCircle, Phone, AlertTriangle, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Step6Review({
  state,
  onSubmit,
  onBack,
  submitting,
  serverError,
}: {
  state: RegState;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
  serverError: string | null;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [showModal, setShowModal] = useState(false);
  // Suppress error UI for the first ~12s of submission so transient slowness
  // doesn't show "something went wrong" while the request is still in flight.
  const [showErrorUi, setShowErrorUi] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const s1 = state.step1!;
  const s2 = state.step2!;
  const s3 = state.step3!;
  const s4 = state.step4!;
  const s5 = state.step5!;

  const handleSubmit = () => {
    if (honeypot) return;
    setShowErrorUi(false);
    setShowModal(true);
  };

  // When the modal opens, lock body scroll and bring it into the user's view.
  useEffect(() => {
    if (!showModal) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      modalRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    });
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  // Only reveal the error block once the request has actually been pending
  // long enough that we're confident it's a real failure (12 seconds).
  useEffect(() => {
    if (!submitting) return;
    setShowErrorUi(false);
    const t = window.setTimeout(() => setShowErrorUi(true), 12000);
    return () => window.clearTimeout(t);
  }, [submitting]);

  const whatsapp = import.meta.env.VITE_WHATSAPP_GROUP_URL as string;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-display text-xl">Review & submit</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Verify everything below. Once submitted, the registration cannot be edited.
        </p>
      </div>

      <SummaryCard title="Team">
        <Row label="Team name" value={s1.team_name} />
        <Row label="Size" value={`${s1.team_size} members`} />
        <Row label="College" value={s1.is_svce ? "SVCE" : s1.college_name || "Other"} />
        <Row label="Category" value={s1.category} />
        <Row label="Problem ID" value={s1.problem_statement_id} />
        <Row label="Problem name" value={s1.problem_statement_name} />
        <Row label="Company" value={s1.company_name} />
      </SummaryCard>

      <SummaryCard title="Members">
        <div className="space-y-3">
          {s2.members.map((m, i) => (
            <div key={i} className="rounded-md border border-border p-3">
              <div className="text-xs font-mono-ui text-muted-foreground">
                M{i + 1} {i === 0 && "· Team Leader"}
              </div>
              <div className="font-medium">{m.full_name}</div>
              <div className="text-sm text-muted-foreground">
                {m.department} · Year {m.year_of_study} · {m.college_email}
              </div>
            </div>
          ))}
        </div>
      </SummaryCard>

      <SummaryCard title="Mentor">
        <Row label="Name" value={s3.mentor_name} />
        <Row label="Department" value={s3.mentor_department} />
        <Row label="Designation" value={s3.mentor_designation} />
        <Row label="Phone" value={s3.mentor_phone} />
        <Row label="Email" value={s3.mentor_email} />
      </SummaryCard>

      <SummaryCard title="Photos">
        <div className="grid gap-3 sm:grid-cols-2">
          {s2.members.map((member, i) => {
            const photo = s4.photos[i];
            return (
              <div key={i} className="rounded-md border border-border bg-surface-2/40 p-3">
                <div className="flex items-start gap-3">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-surface-2">
                    {photo?.url ? (
                      <img src={photo.url} alt={member.full_name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-xs font-mono-ui text-muted-foreground">
                      M{i + 1} {i === 0 && "· Team Leader"}
                    </div>
                    <div className="font-medium">{member.full_name}</div>
                    <div className="text-sm text-muted-foreground break-words">
                      {member.department} · Year {member.year_of_study}
                    </div>
                    <div className="text-sm text-muted-foreground break-all">{member.college_email}</div>
                    <div className="text-xs font-mono-ui text-muted-foreground">
                      Phone: {member.phone_number}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SummaryCard>

      <SummaryCard title="Payment">
        <Row label="UPI UTR number" value={s5.payment_transaction_id} />
        <Row label="Mobile" value={s5.payment_mobile_number} />
        <Row label="GPay account holder" value={s5.payment_account_holder_name} />
        {s5.payment_screenshot_url && (
          <div className="mt-2">
            <div className="text-xs font-mono-ui text-muted-foreground mb-1">Screenshot</div>
            <img
              src={s5.payment_screenshot_url}
              alt="Payment screenshot"
              className="max-h-48 rounded border border-border"
            />
          </div>
        )}
      </SummaryCard>

      {/* WhatsApp */}
      <div className="panel rounded-xl p-4 corner-frame">
        <div className="font-display font-semibold mb-2">Join the official WhatsApp group</div>
        <p className="text-sm text-muted-foreground mb-3">
          All event updates will be shared here. Mandatory for the team leader.
        </p>
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md bg-success px-4 py-2 text-background font-medium hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" /> Join WhatsApp group
        </a>
      </div>

      {/* POC contacts */}
      <div className="panel rounded-xl p-4 corner-frame">
        <div className="font-display font-semibold mb-3">Point of contact</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {POC_CONTACTS.map((c) => (
            <a
              key={c.phone}
              href={`tel:${c.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 hover:border-primary/60"
            >
              <Phone className="h-4 w-4 text-primary" />
              <div className="text-sm">
                <div className="font-medium">
                  {c.name}
                  {c.role && <span className="text-amber font-mono-ui text-xs"> · {c.role}</span>}
                </div>
                <div className="text-xs font-mono-ui text-muted-foreground">{c.phone}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* honeypot */}
      <input
        type="text"
        name="hp_company"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        style={{ position: "absolute", left: "-9999px", width: 0, height: 0, opacity: 0 }}
        aria-hidden
      />

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1 accent-primary"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <span>I confirm that all the above information is accurate and complete.</span>
      </label>

      {/* Inline error stays only when modal is closed */}
      {serverError && !showModal && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive font-mono-ui inline-flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5" /> {serverError}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border border-border px-4 py-2.5 hover:bg-surface-2 min-h-[44px]"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!confirmed || submitting}
          className="ml-auto inline-flex items-center justify-center gap-2 rounded-md bg-amber px-6 py-3 font-display font-semibold text-amber-foreground hover:opacity-90 disabled:opacity-50 min-h-[44px]"
        >
          <CheckCircle2 className="h-4 w-4" /> Submit registration
        </button>
      </div>

      {showModal && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur p-4 overflow-y-auto"
        >
          <div className="w-full max-w-lg panel rounded-2xl p-6 corner-frame my-auto">
            {!submitting && !serverError && (
              <>
                <h3 className="font-display text-xl">Final confirmation</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Submitting will lock your registration. You won't be able to edit it. Continue?
                </p>
              </>
            )}

            {submitting && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <div>
                    <div className="font-display text-lg">Finalising your registration…</div>
                    <div className="text-xs font-mono-ui text-muted-foreground mt-0.5">
                      Locking team data, members, photos and payment proof. Please don't close this tab.
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>

                {showErrorUi && (
                  <div className="rounded-md border border-amber/40 bg-amber/5 p-3 text-xs font-mono-ui text-amber">
                    Still working… this is taking longer than usual. Please keep this tab open.
                  </div>
                )}
              </div>
            )}

            {serverError && !submitting && showErrorUi && (
              <div className="space-y-3">
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive font-mono-ui inline-flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {serverError}
                </div>
                <div className="rounded-md border border-border bg-surface-2/50 p-3">
                  <div className="text-xs font-mono-ui uppercase tracking-wider text-muted-foreground mb-2">
                    Need help? WhatsApp our team
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {POC_CONTACTS.slice(0, 4).map((c) => {
                      const num = c.phone.replace(/\s+/g, "");
                      return (
                        <a
                          key={num}
                          href={`https://wa.me/91${num}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 hover:border-primary/60 text-sm"
                        >
                          <MessageCircle className="h-4 w-4 text-success" />
                          <div>
                            <div className="font-medium">{c.name}</div>
                            <div className="text-[11px] font-mono-ui text-muted-foreground">{c.phone}</div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* If error happened but threshold hasn't elapsed yet, keep showing the loader */}
            {serverError && !submitting && !showErrorUi && (
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div className="text-sm font-mono-ui text-muted-foreground">
                  Verifying your submission…
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={submitting || (!!serverError && !showErrorUi)}
                className="rounded-md border border-border px-4 py-2 hover:bg-surface-2 disabled:opacity-50"
              >
                {serverError && showErrorUi ? "Close" : "Cancel"}
              </button>
              {!submitting && (!serverError || showErrorUi) && (
                <button
                  type="button"
                  onClick={() => onSubmit()}
                  className="rounded-md bg-amber px-4 py-2 text-amber-foreground hover:opacity-90 inline-flex items-center gap-2"
                >
                  {serverError ? "Retry submission" : "Yes, submit"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel rounded-xl p-4 corner-frame">
      <div className="font-mono-ui text-xs uppercase tracking-wider text-primary mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}
function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between gap-3 py-1 text-sm border-b border-border/40 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value || "—"}</span>
    </div>
  );
}

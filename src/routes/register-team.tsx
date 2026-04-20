import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Stepper } from "@/components/Stepper";
import { FieldStyles } from "./login";
import { Step1Form } from "@/components/steps/Step1Form";
import { Step2Form } from "@/components/steps/Step2Form";
import { Step3Form } from "@/components/steps/Step3Form";
import { Step4Photos } from "@/components/steps/Step4Photos";
import { Step5Payment } from "@/components/steps/Step5Payment";
import { Step6Review } from "@/components/steps/Step6Review";
import { useReg } from "@/store/registration";
import { supabase } from "@/lib/supabase";
import { loadDraft, saveDraft } from "@/lib/drafts";
import { useAuth } from "@/store/auth";

export const Route = createFileRoute("/register-team")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      throw redirect({ to: "/login" });
    }
    // If user has already submitted, send them to their summary page.
    const { data: existing } = await supabase
      .from("teams")
      .select("id")
      .eq("user_id", data.session.user.id)
      .maybeSingle();
    if (existing) {
      throw redirect({ to: "/my-team" });
    }
  },
  component: RegisterTeamPage,
  head: () => ({ meta: [{ title: "Team Registration — Make-a-Thon 7.0" }] }),
});

function RegisterTeamPage() {
  const { user } = useAuth();
  const reg = useReg();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // (Resubmission is now blocked at the route guard above.)

  // Hydrate from Supabase draft
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const d = await loadDraft(user.id);
        if (d) {
          reg.hydrate({
            step1: d.step1 ?? undefined,
            step2: d.step2 ?? undefined,
            step3: d.step3 ?? undefined,
            step4: d.step4 ?? undefined,
            step5: d.step5 ?? undefined,
            lastCompletedStep: d.last_completed_step ?? 0,
          });
          // Resume one step after the last completed one (cap at 6)
          setStep(Math.min((d.last_completed_step ?? 0) + 1, 6));
        }
      } catch {
        // ignore — start fresh
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const persist = async (newStep: number, completed: number) => {
    if (!user) return;
    try {
      await saveDraft(user.id, {
        step1: useReg.getState().step1,
        step2: useReg.getState().step2,
        step3: useReg.getState().step3,
        step4: useReg.getState().step4,
        step5: useReg.getState().step5,
        last_completed_step: completed,
      });
    } catch (e) {
      // non-fatal — UX continues
    }
    reg.setLastCompleted(completed);
    setStep(newStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!reg.step1 || !reg.step2 || !reg.step3 || !reg.step4 || !reg.step5) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const teamPayload = {
        team_name: reg.step1.team_name,
        team_size: reg.step1.team_size,
        is_svce: reg.step1.is_svce,
        college_name: reg.step1.college_name,
        category: reg.step1.category,
        problem_statement_id: reg.step1.problem_statement_id,
        problem_statement_name: reg.step1.problem_statement_name,
        company_name: reg.step1.company_name,
        mentor_name: reg.step3.mentor_name,
        mentor_department: reg.step3.mentor_department,
        mentor_designation: reg.step3.mentor_designation,
        mentor_phone: reg.step3.mentor_phone,
        mentor_email: reg.step3.mentor_email,
        payment_transaction_id: reg.step5.payment_transaction_id,
        payment_bank_name: "GPay",
        payment_mobile_number: reg.step5.payment_mobile_number,
        payment_account_holder_name: reg.step5.payment_account_holder_name,
        payment_amount_confirmed: reg.step5.payment_amount_confirmed,
        payment_screenshot_url: reg.step5.payment_screenshot_path, // store storage path
      };
      const membersPayload = reg.step2.members.map((m, i) => ({
        full_name: m.full_name,
        department: m.department,
        year_of_study: m.year_of_study,
        registration_number: m.registration_number,
        phone_number: m.phone_number,
        whatsapp_number: m.whatsapp_number,
        college_email: m.college_email,
        personal_email: m.personal_email,
        photo_url: reg.step4!.photos[i]?.storagePath ?? null,
      }));
      const ua = navigator.userAgent;
      const { data, error } = await supabase.rpc("submit_registration", {
        p_team: teamPayload,
        p_members: membersPayload,
        p_ip: null,
        p_user_agent: ua,
      });
      if (error) throw error;
      if (data && typeof data === "object" && "success" in data && !(data as { success?: boolean }).success) {
        throw new Error((data as { error?: string }).error || "Submission failed. Please try again.");
      }
      // success — write sessionStorage and give the browser a beat to flush
      // before navigating, otherwise the success page can race the storage
      // write and briefly trigger the global error boundary.
      sessionStorage.setItem("mat7_submitted", "1");
      sessionStorage.setItem("mat7_result", JSON.stringify(data));
      const leaderEmail = reg.step2.members[0]?.college_email ?? "";
      sessionStorage.setItem("mat7_leader_email", leaderEmail);
      
      // Clear draft since it's now a team
      reg.reset();
      
      // Wait for session storage to be robustly written
      await new Promise((r) => setTimeout(r, 600));
      navigate({ to: "/success" });
    } catch (e: any) {
      console.error("Submission error:", e);
      setServerError(e.message || "Submission failed. Please try again.");
      setSubmitting(false);
      return;
    }

    // Keep `submitting` true through navigation so the modal stays in its
    // loading state and the user never sees a flash of the global error UI.
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-muted-foreground font-mono-ui">
          Loading your draft...
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center pt-8">
            <div className="font-mono-ui text-[10px] uppercase tracking-[0.3em] text-primary/80">
              ECE Department · SVCE
            </div>
            <h1 className="glitch font-display text-3xl md:text-4xl font-bold mt-2">
              MAKE-A-THON <span className="text-primary text-glow-cyan">7.0</span>
            </h1>
            <p className="text-xs font-mono-ui text-muted-foreground mt-1">
              Final Registration · Step {step} of 6
            </p>
          </div>
          <Stepper current={step} completed={reg.lastCompletedStep} />
          <div className="panel rounded-2xl p-4 sm:p-6 corner-frame mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {step === 1 && (
                  <Step1Form
                    defaultValues={reg.step1}
                    onNext={(v) => {
                      reg.setStep1(v);
                      persist(2, Math.max(reg.lastCompletedStep, 1));
                    }}
                  />
                )}
                {step === 2 && reg.step1 && (
                  <Step2Form
                    teamSize={reg.step1.team_size}
                    isSvce={reg.step1.is_svce}
                    defaultValues={reg.step2}
                    onNext={(v) => {
                      reg.setStep2(v);
                      persist(3, Math.max(reg.lastCompletedStep, 2));
                    }}
                    onBack={goBack}
                  />
                )}
                {step === 3 && reg.step1 && (
                  <Step3Form
                    isSvce={reg.step1.is_svce}
                    defaultValues={reg.step3}
                    onNext={(v) => {
                      reg.setStep3(v);
                      persist(4, Math.max(reg.lastCompletedStep, 3));
                    }}
                    onBack={goBack}
                  />
                )}
                {step === 4 && reg.step2 && (
                  <Step4Photos
                    members={reg.step2.members}
                    initial={reg.step4?.photos}
                    onNext={(photos) => {
                      reg.setStep4({ photos });
                      persist(5, Math.max(reg.lastCompletedStep, 4));
                    }}
                    onBack={goBack}
                  />
                )}
                {step === 5 && reg.step1 && (
                  <Step5Payment
                    teamSize={reg.step1.team_size}
                    defaultValues={reg.step5}
                    onNext={(v) => {
                      reg.setStep5(v);
                      persist(6, Math.max(reg.lastCompletedStep, 5));
                    }}
                    onBack={goBack}
                  />
                )}
                {step === 6 && (
                  <Step6Review
                    state={useReg.getState()}
                    onSubmit={submit}
                    onBack={goBack}
                    submitting={submitting}
                    serverError={serverError}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer />
      <FieldStyles />
    </div>
  );
}

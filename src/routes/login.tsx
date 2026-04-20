import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authLoginSchema } from "@/lib/validation";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { LogIn, ShieldAlert } from "lucide-react";
import type { z } from "zod";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [{ title: "Login — Makeathon 7.0" }],
  }),
});

type Form = z.infer<typeof authLoginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [lockMsg, setLockMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(authLoginSchema) });

  const onSubmit = async (v: Form) => {
    setServerError(null);
    setLockMsg(null);
    setSubmitting(true);
    try {
      // 1) Pre-check lockout for this email
      const lock = await supabase.rpc("check_admin_lockout", { p_email: v.email });
      if ((lock.data as any)?.locked) {
        const unlockAt = (lock.data as any).unlock_at;
        const mins = unlockAt
          ? Math.max(1, Math.ceil((new Date(unlockAt).getTime() - Date.now()) / 60000))
          : 120;
        setLockMsg(
          `Too many failed attempts. Try again in ~${mins} minutes.`,
        );
        setSubmitting(false);
        return;
      }

      // 2) Attempt sign-in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: v.email,
        password: v.password,
      });

      if (error || !data.session) {
        await supabase.rpc("log_admin_attempt", { p_email: v.email, p_success: false });
        setServerError(error?.message ?? "Invalid credentials");
        setSubmitting(false);
        return;
      }

      // 3) Look up role
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();

      await supabase.rpc("log_admin_attempt", { p_email: v.email, p_success: true });

      setSubmitting(false);
      if (adminRole?.role === "admin") {
        navigate({ to: "/admin/dashboard" });
      } else {
        // Check if already submitted -> success page
        const { data: existing } = await supabase
          .from("teams")
          .select("id")
          .eq("user_id", data.user.id)
          .maybeSingle();
        if (existing) {
          navigate({ to: "/my-team" });
        } else {
          navigate({ to: "/register-team" });
        }
      }
    } catch (e) {
      setSubmitting(false);
      setServerError(e instanceof Error ? e.message : "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md panel rounded-2xl p-6 corner-frame">
          <div className="flex flex-col items-center text-center mb-6">
            <Logo />
            <h1 className="mt-4 font-display text-2xl">Sign in</h1>
            <p className="text-xs text-muted-foreground font-mono-ui mt-1 uppercase tracking-wider">
              Access the registration portal
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Email" error={errors.email?.message}>
              <input
                type="email"
                autoComplete="email"
                className="input"
                placeholder="teamlead@gmail.com"
                {...register("email")}
              />
            </Field>
            <Field label="Password" error={errors.password?.message}>
              <input
                type="password"
                autoComplete="current-password"
                className="input"
                placeholder="Enter your password"
                {...register("password")}
              />
            </Field>
            {lockMsg && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive font-mono-ui">
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{lockMsg}</span>
              </div>
            )}
            {serverError && (
              <div className="text-sm text-destructive font-mono-ui">{serverError}</div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-spider inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 font-display font-semibold disabled:opacity-50 min-h-[44px]"
            >
              <LogIn className="h-4 w-4" /> {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link to="/register" className="text-cyan-edge hover:underline">
              Register
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <FieldStyles />
    </div>
  );
}

export function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-mono-ui uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </span>
      {children}
      {hint && !error && <span className="block text-xs text-muted-foreground mt-1">{hint}</span>}
      {error && (
        <span className="block text-xs text-destructive font-mono-ui mt-1">{error}</span>
      )}
    </label>
  );
}

export function FieldStyles() {
  return (
    <style>{`
      .input {
        width: 100%;
        background: var(--input);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 0.65rem 0.8rem;
        color: var(--foreground);
        font-family: var(--font-sans);
        min-height: 44px;
        transition: box-shadow 0.15s, border-color 0.15s;
      }
      .input:focus {
        outline: none;
        border-color: var(--spider);
        box-shadow: 0 0 0 2px color-mix(in oklab, var(--spider) 35%, transparent);
      }
      .input::placeholder { color: color-mix(in oklab, var(--muted-foreground) 70%, transparent); }
      select.input {
        appearance: none;
        background-image: linear-gradient(45deg, transparent 50%, var(--cyan-edge) 50%),
                          linear-gradient(135deg, var(--cyan-edge) 50%, transparent 50%);
        background-position: calc(100% - 18px) 50%, calc(100% - 13px) 50%;
        background-size: 5px 5px, 5px 5px;
        background-repeat: no-repeat;
        padding-right: 2rem;
      }
    `}</style>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authRegisterSchema } from "@/lib/validation";
import { supabase } from "@/lib/supabase";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { Field, FieldStyles } from "./login";
import { UserPlus } from "lucide-react";
import { clean } from "@/lib/sanitize";
import type { z } from "zod";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({ meta: [{ title: "Create account — Make-a-Thon 7.0" }] }),
});

type Form = z.infer<typeof authRegisterSchema>;

function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(authRegisterSchema) });

  const onSubmit = async (v: Form) => {
    setServerError(null);
    setInfo(null);
    setSubmitting(true);
    const fullName = clean(v.full_name);
    const { data, error } = await supabase.auth.signUp({
      email: v.email,
      password: v.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName },
      },
    });
    setSubmitting(false);
    if (error) {
      setServerError(error.message);
      return;
    }
    if (data.session) {
      navigate({ to: "/register-team" });
    } else {
      setInfo("Account created. Please check your email to confirm, then sign in.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md panel rounded-2xl p-6 corner-frame">
          <div className="flex flex-col items-center text-center mb-6">
            <Logo />
            <h1 className="mt-4 font-display text-2xl">Create your account</h1>
            <p className="text-xs text-muted-foreground font-mono-ui mt-1">
              Step 1 of registration: identity
            </p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Full name" error={errors.full_name?.message}>
              <input className="input" autoComplete="name" placeholder="Enter your full name" {...register("full_name")} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input type="email" className="input" autoComplete="email" placeholder="xxxx@gmail.com" {...register("email")} />
            </Field>
            <Field
              label="Password"
              error={errors.password?.message}
              hint="Minimum 8 characters"
            >
              <input
                type="password"
                className="input"
                autoComplete="new-password"
                  placeholder="Create a strong password"
                {...register("password")}
              />
            </Field>
            <Field label="Confirm password" error={errors.confirm?.message}>
              <input
                type="password"
                className="input"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                {...register("confirm")}
              />
            </Field>
            {serverError && (
              <div className="text-sm text-destructive font-mono-ui">{serverError}</div>
            )}
            {info && (
              <div className="text-sm text-success font-mono-ui">{info}</div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 font-display font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" /> {submitting ? "Creating..." : "Create account"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </main>
      <Footer />
      <FieldStyles />
    </div>
  );
}

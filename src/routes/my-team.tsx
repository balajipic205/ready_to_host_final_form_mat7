import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { POC_CONTACTS } from "@/lib/contacts";
import { AlertTriangle, CheckCircle2, Phone, LogOut } from "lucide-react";

export const Route = createFileRoute("/my-team")({
  beforeLoad: async () => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) throw redirect({ to: "/login" });
  },
  component: MyTeamPage,
  head: () => ({ meta: [{ title: "My Registration — Make-a-Thon 7.0" }] }),
});

function MyTeamPage() {
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [ssUrl, setSsUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) return;
      const { data: t } = await supabase
        .from("teams")
        .select("*")
        .eq("user_id", sess.session.user.id)
        .maybeSingle();
      if (!t) {
        setLoading(false);
        return;
      }
      setTeam(t);
      const { data: m } = await supabase
        .from("members")
        .select("*")
        .eq("team_id", t.id)
        .order("member_order");
      setMembers(m || []);
      const photoMap: Record<string, string> = {};
      for (const mm of m || []) {
        if (mm.photo_url) {
          const { data } = await supabase.storage
            .from("member-photos")
            .createSignedUrl(mm.photo_url, 60 * 60);
          if (data?.signedUrl) photoMap[mm.id] = data.signedUrl;
        }
      }
      setPhotoUrls(photoMap);
      if (t.payment_screenshot_url) {
        const { data } = await supabase.storage
          .from("payment-screenshots")
          .createSignedUrl(t.payment_screenshot_url, 60 * 60);
        if (data?.signedUrl) setSsUrl(data.signedUrl);
      }
      setLoading(false);
    })();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center font-mono-ui text-muted-foreground">
          Loading your registration...
        </main>
        <Footer />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-center px-4">
          <div>
            <p className="font-mono-ui text-muted-foreground">No registration found for this account.</p>
            <Link to="/register-team" className="mt-4 inline-block text-primary hover:underline">
              Start registration →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="font-mono-ui text-[10px] uppercase tracking-[0.3em] text-primary">
                Your Registration
              </div>
              <h1 className="font-display text-3xl mt-1">{team.team_name}</h1>
              <div className="font-mono-ui text-sm text-muted-foreground">
                Team #{String(team.team_number).padStart(2, "0")} ·{" "}
                <span className="text-primary text-glow-cyan">{team.reference_id}</span>
              </div>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-2"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-mono-ui text-success">
            <CheckCircle2 className="h-3.5 w-3.5" /> Status: {team.submission_status}
          </div>

          {/* IMPORTANT NOTE */}
          <div className="mt-5 rounded-xl border border-amber/50 bg-amber/10 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-display font-semibold text-amber mb-1">
                One account = one registration
              </div>
              <p className="text-foreground/90">
                Your team has been registered. <span className="font-semibold">Please do not create
                a second account or attempt to resubmit.</span> If you spot a mistake or need any change
                (members, mentor, payment), <span className="font-semibold">contact our team directly</span>{" "}
                using the numbers below — we will fix it for you.
              </p>
              <div className="mt-3 grid sm:grid-cols-2 gap-2">
                {POC_CONTACTS.map((c) => (
                  <a
                    key={c.phone}
                    href={`tel:${c.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 hover:border-amber/60"
                  >
                    <Phone className="h-4 w-4 text-amber" />
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs font-mono-ui text-muted-foreground">{c.phone}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Team info */}
          <Section title="Team">
            <Row label="Category" value={team.category} />
            <Row label="College" value={team.is_svce ? "SVCE" : team.college_name} />
            <Row label="Team size" value={`${team.team_size} members`} />
            <Row label="Problem ID" value={team.problem_statement_id} />
            <Row label="Problem name" value={team.problem_statement_name} />
            {team.category === "Industry Problem Statement" && (
              <Row label="Company" value={team.company_name} />
            )}
          </Section>

          {/* Mentor */}
          <Section title="Mentor">
            <Row label="Name" value={team.mentor_name} />
            <Row label="Designation" value={team.mentor_designation} />
            <Row label="Department" value={team.mentor_department} />
            <Row label="Phone" value={team.mentor_phone} />
            <Row label="Email" value={team.mentor_email} />
          </Section>

          {/* Members */}
          <Section title={`Members (${members.length})`}>
            <div className="grid gap-3 sm:grid-cols-2">
              {members.map((m) => (
                <div key={m.id} className="rounded-lg border border-border p-3 flex gap-3">
                  <div className="h-20 w-20 rounded overflow-hidden bg-surface-2 flex-shrink-0">
                    {photoUrls[m.id] && (
                      <img src={photoUrls[m.id]} alt={m.full_name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="text-sm flex-1 min-w-0">
                    <div className="font-mono-ui text-xs text-amber">{m.unique_member_id}</div>
                    <div className="font-medium truncate">
                      {m.full_name} {m.is_leader && <span className="text-amber text-xs">★ Leader</span>}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {m.department} · Year {m.year_of_study}
                    </div>
                    <div className="text-muted-foreground text-xs truncate">{m.college_email}</div>
                    <div className="text-muted-foreground text-xs">📱 {m.phone_number}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Payment */}
          <Section title="Payment">
            <Row label="UPI UTR number" value={team.payment_transaction_id} />
            <Row label="Mobile" value={team.payment_mobile_number} />
            <Row label="GPay account holder" value={team.payment_account_holder_name} />
            {ssUrl && (
              <div className="mt-3">
                <div className="font-mono-ui text-xs text-muted-foreground mb-1">Screenshot</div>
                <img src={ssUrl} alt="Payment" className="max-h-72 rounded border border-border" />
              </div>
            )}
          </Section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 panel rounded-xl p-5 corner-frame">
      <div className="font-mono-ui text-xs uppercase tracking-wider text-primary mb-3">
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: any }) {
  return (
    <div className="flex justify-between gap-3 py-1 text-sm border-b border-border/40 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{String(value ?? "—")}</span>
    </div>
  );
}

import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/teams/$id")({
  beforeLoad: async () => {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) throw redirect({ to: "/login" });
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", sess.session.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (adminRole?.role !== "admin") throw redirect({ to: "/login" });
  },
  component: TeamDetail,
});

function TeamDetail() {
  const { id } = Route.useParams();
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [paymentSsUrl, setPaymentSsUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const updateStatus = async (s: "pending" | "verified" | "rejected") => {
    if (!team) return;
    setSavingStatus(true);
    setStatusMsg(null);
    const { error } = await supabase
      .from("teams")
      .update({ submission_status: s })
      .eq("id", team.id);
    setSavingStatus(false);
    if (error) {
      setStatusMsg(`Error: ${error.message}`);
      return;
    }
    setTeam({ ...team, submission_status: s });
    setStatusMsg(`Status updated to "${s}"`);
    setTimeout(() => setStatusMsg(null), 2500);
  };

  useEffect(() => {
    (async () => {
      const { data: t } = await supabase.from("teams").select("*").eq("id", id).maybeSingle();
      const { data: m } = await supabase
        .from("members")
        .select("*")
        .eq("team_id", id)
        .order("member_order");
      setTeam(t);
      setMembers(m || []);

      // Sign URLs
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
      if (t?.payment_screenshot_url) {
        const { data } = await supabase.storage
          .from("payment-screenshots")
          .createSignedUrl(t.payment_screenshot_url, 60 * 60);
        if (data?.signedUrl) setPaymentSsUrl(data.signedUrl);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center font-mono-ui text-muted-foreground">
          Loading team...
        </main>
        <Footer />
      </div>
    );
  }
  if (!team) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">Team not found</main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <div className="mt-4 panel rounded-xl p-5 corner-frame">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h1 className="font-display text-2xl">{team.team_name}</h1>
                <div className="text-xs font-mono-ui text-muted-foreground">
                  Team #{String(team.team_number).padStart(2, "0")} ·{" "}
                  <span className="text-primary">{team.reference_id}</span>
                </div>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded font-mono-ui ${
                  team.submission_status === "verified"
                    ? "bg-success/15 text-success"
                    : team.submission_status === "rejected"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-amber/15 text-amber"
                }`}
              >
                {team.submission_status}
              </span>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-sm">
              <Info label="Category" value={team.category} />
              <Info label="College" value={team.is_svce ? "SVCE" : team.college_name} />
              <Info label="Problem ID" value={team.problem_statement_id} />
              <Info label="Problem Name" value={team.problem_statement_name} />
              <Info label="Company" value={team.company_name} />
              <Info label="Team Size" value={team.team_size} />
            </div>
          </div>

          <div className="mt-4 panel rounded-xl p-5 corner-frame">
            <h2 className="font-display text-lg mb-3">Mentor</h2>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <Info label="Name" value={team.mentor_name} />
              <Info label="Designation" value={team.mentor_designation} />
              <Info label="Department" value={team.mentor_department} />
              <Info label="Phone" value={team.mentor_phone} />
              <Info label="Email" value={team.mentor_email} />
            </div>
          </div>

          <div className="mt-4 panel rounded-xl p-5 corner-frame">
            <h2 className="font-display text-lg mb-3">Members ({members.length})</h2>
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
          </div>

          <div className="mt-4 panel rounded-xl p-5 corner-frame">
            <h2 className="font-display text-lg mb-3">Payment</h2>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <Info label="UPI UTR number" value={team.payment_transaction_id} />
              <Info label="Mobile" value={team.payment_mobile_number} />
              <Info label="GPay account holder" value={team.payment_account_holder_name} />
            </div>
            {paymentSsUrl && (
              <div className="mt-3">
                <div className="font-mono-ui text-xs text-muted-foreground mb-1">Screenshot</div>
                <img src={paymentSsUrl} alt="Payment" className="max-h-96 rounded border border-border" />
              </div>
            )}

            {/* Status update — placed directly below the screenshot for fast review */}
            <div className="mt-5 rounded-lg border border-primary/30 bg-primary/5 p-4">
              <div className="font-mono-ui text-xs uppercase tracking-wider text-primary mb-2">
                Update submission status
              </div>
              <div className="flex flex-wrap gap-2">
                {(["pending", "verified", "rejected"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={savingStatus || team.submission_status === s}
                    onClick={() => updateStatus(s)}
                    className={`min-h-[40px] px-4 rounded-md border font-mono-ui text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      team.submission_status === s
                        ? s === "verified"
                          ? "bg-success text-background border-success"
                          : s === "rejected"
                            ? "bg-destructive text-background border-destructive"
                            : "bg-amber text-amber-foreground border-amber"
                        : "border-border hover:border-primary text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {statusMsg && (
                <div className="mt-2 text-xs font-mono-ui text-success">{statusMsg}</div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Info({ label, value }: { label: string; value?: any }) {
  return (
    <div>
      <div className="text-xs font-mono-ui text-muted-foreground uppercase">{label}</div>
      <div className="text-sm">{String(value ?? "—")}</div>
    </div>
  );
}

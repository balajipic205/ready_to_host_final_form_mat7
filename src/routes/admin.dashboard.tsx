import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { Search, LogOut, LayoutDashboard, Download } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export const Route = createFileRoute("/admin/dashboard")({
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
  component: AdminDashboard,
  head: () => ({ meta: [{ title: "Admin Dashboard — Make-a-Thon 7.0" }] }),
});

type Team = {
  id: string;
  reference_id: string;
  team_number: number;
  team_name: string;
  team_size: number;
  is_svce: boolean;
  category: string;
  submission_status: string;
  submitted_at: string;
};

const COLORS = ["#00F5FF", "#FFB800", "#A78BFA", "#34D399"];

function AdminDashboard() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const PAGE = 15;

  useEffect(() => {
    supabase
      .from("teams")
      .select("id,reference_id,team_number,team_name,team_size,is_svce,category,submission_status,submitted_at")
      .order("submitted_at", { ascending: false })
      .then(({ data }) => {
        setTeams(data || []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return teams.filter((t) => {
      if (statusFilter !== "all" && t.submission_status !== statusFilter) return false;
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (!q) return true;
      return (
        t.team_name.toLowerCase().includes(q) ||
        t.reference_id.toLowerCase().includes(q) ||
        String(t.team_number).padStart(2, "0").includes(q)
      );
    });
  }, [teams, search, statusFilter, categoryFilter]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/login" });
  };

  const total = teams.length;
  const byCategory = ["Hardware", "Software", "Industry Problem Statement"].map((c) => ({
    name: c.split(" ")[0],
    value: teams.filter((t) => t.category === c).length,
  }));
  const bySvce = [
    { name: "SVCE", value: teams.filter((t) => t.is_svce).length },
    { name: "Other", value: teams.filter((t) => !t.is_svce).length },
  ];
  const byStatus = ["pending", "verified", "rejected"].map((s) => ({
    name: s,
    value: teams.filter((t) => t.submission_status === s).length,
  }));
  // timeline: bucket by day
  const timeline = (() => {
    const map = new Map<string, number>();
    for (const t of teams) {
      const d = new Date(t.submitted_at).toISOString().slice(0, 10);
      map.set(d, (map.get(d) || 0) + 1);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  })();

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("teams").update({ submission_status: status }).eq("id", id);
    setTeams((ts) => ts.map((t) => (t.id === id ? { ...t, submission_status: status } : t)));
  };

  const exportCsv = async () => {
    const { data } = await supabase
      .from("teams")
      .select(
        "*,members(unique_member_id,member_order,full_name,department,year_of_study,phone_number,whatsapp_number,college_email,personal_email,registration_number,photo_url)",
      )
      .order("team_number", { ascending: true });
    if (!data) return;
    const rows: string[][] = [
      [
        "team_number", "reference_id", "team_name", "team_size", "is_svce", "college_name",
        "category", "problem_id", "problem_name", "company",
        "mentor_name", "mentor_email", "mentor_phone",
        "payment_txn", "payment_bank", "payment_mobile", "payment_holder", "payment_screenshot_url",
        "submission_status", "submitted_at",
        "member_order", "unique_member_id", "member_name", "department", "year",
        "phone", "whatsapp", "college_email", "personal_email", "reg_no", "photo_view_url",
      ],
    ];
    for (const t of data) {
      const ms: any[] = (t as any).members || [];
      ms.sort((a, b) => a.member_order - b.member_order);
      // Sign URLs (long expiry — 7 days for CSV export convenience)
      const ssSigned = t.payment_screenshot_url
        ? (await supabase.storage
            .from("payment-screenshots")
            .createSignedUrl(t.payment_screenshot_url, 60 * 60 * 24 * 7)).data?.signedUrl ?? ""
        : "";
      for (const m of ms) {
        const photoSigned = m.photo_url
          ? (await supabase.storage
              .from("member-photos")
              .createSignedUrl(m.photo_url, 60 * 60 * 24 * 7)).data?.signedUrl ?? ""
          : "";
        rows.push([
          t.team_number, t.reference_id, t.team_name, t.team_size, t.is_svce, t.college_name || "",
          t.category, t.problem_statement_id || "", t.problem_statement_name || "", t.company_name || "",
          t.mentor_name, t.mentor_email || "", t.mentor_phone || "",
          t.payment_transaction_id, t.payment_bank_name, t.payment_mobile_number, t.payment_account_holder_name, ssSigned,
          t.submission_status, t.submitted_at,
          m.member_order, m.unique_member_id, m.full_name, m.department, m.year_of_study,
          m.phone_number, m.whatsapp_number, m.college_email, m.personal_email, m.registration_number || "", photoSigned,
        ].map((v) => String(v ?? "")));
      }
    }
    const csv = rows
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mat7-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pageTeams = filtered.slice(page * PAGE, (page + 1) * PAGE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* Admin nav bar */}
          <div className="panel rounded-xl p-3 corner-frame flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-2 font-display text-sm">
              <LayoutDashboard className="h-4 w-4 text-cyan-edge" />
              <span className="text-foreground">Admin Console</span>
              <span className="font-mono-ui text-[10px] text-muted-foreground uppercase tracking-wider">
                Mission control
              </span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={exportCsv}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber/60 bg-amber/10 px-3 py-1.5 text-amber hover:bg-amber/20 text-sm"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-2"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 text-muted-foreground font-mono-ui">Loading...</div>
          ) : (
            <>
              <div className="mt-6 grid gap-3 sm:grid-cols-4">
                <Kpi label="Total teams" value={total} accent="primary" />
                <Kpi label="Pending" value={byStatus[0].value} accent="amber" />
                <Kpi label="Verified" value={byStatus[1].value} />
                <Kpi label="Rejected" value={byStatus[2].value} />
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <ChartCard title="By category">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={80}>
                        {byCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <Legend data={byCategory} />
                </ChartCard>

                <ChartCard title="SVCE vs Non-SVCE">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={bySvce}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                        }}
                      />
                      <Bar dataKey="value" fill="#00F5FF" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Status breakdown">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={byStatus}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                        }}
                      />
                      <Bar dataKey="value" fill="#FFB800" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Submissions over time">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={timeline}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                      <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                      <YAxis stroke="var(--muted-foreground)" allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                        }}
                      />
                      <Line type="monotone" dataKey="count" stroke="#00F5FF" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>

              <div className="mt-8 panel rounded-xl p-4 corner-frame">
                {/* Search + filters */}
                <div className="mb-4 flex gap-2 flex-wrap items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                      placeholder="Search by team name, ref ID, or team #"
                      className="w-full pl-9 pr-3 py-2 rounded-md bg-surface-2 border border-border focus:border-primary outline-none text-sm"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                    className="bg-surface-2 border border-border rounded-md px-2 py-2 text-sm"
                  >
                    <option value="all">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
                    className="bg-surface-2 border border-border rounded-md px-2 py-2 text-sm"
                  >
                    <option value="all">All categories</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Industry Problem Statement">Industry</option>
                  </select>
                  <span className="text-xs font-mono-ui text-muted-foreground">
                    {filtered.length} result{filtered.length !== 1 && "s"}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="text-left font-mono-ui text-xs text-muted-foreground border-b border-border">
                      <tr>
                        <th className="py-2 pr-3">#</th>
                        <th className="py-2 pr-3">Team</th>
                        <th className="py-2 pr-3">Ref</th>
                        <th className="py-2 pr-3">Cat</th>
                        <th className="py-2 pr-3">Size</th>
                        <th className="py-2 pr-3">College</th>
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2 pr-3">Submitted</th>
                        <th className="py-2 pr-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageTeams.map((t) => (
                        <tr key={t.id} className="border-b border-border/50 hover:bg-surface-2/60">
                          <td className="py-2 pr-3 font-mono-ui">{String(t.team_number).padStart(2, "0")}</td>
                          <td className="py-2 pr-3 font-medium">{t.team_name}</td>
                          <td className="py-2 pr-3 font-mono-ui text-primary">{t.reference_id}</td>
                          <td className="py-2 pr-3">{t.category.split(" ")[0]}</td>
                          <td className="py-2 pr-3">{t.team_size}</td>
                          <td className="py-2 pr-3">{t.is_svce ? "SVCE" : "Other"}</td>
                          <td className="py-2 pr-3">
                            <select
                              value={t.submission_status}
                              onChange={(e) => updateStatus(t.id, e.target.value)}
                              className="bg-surface-2 border border-border rounded px-2 py-1 text-xs"
                            >
                              <option value="pending">pending</option>
                              <option value="verified">verified</option>
                              <option value="rejected">rejected</option>
                            </select>
                          </td>
                          <td className="py-2 pr-3 text-xs font-mono-ui text-muted-foreground">
                            {new Date(t.submitted_at).toLocaleString()}
                          </td>
                          <td className="py-2 pr-3">
                            <Link
                              to="/admin/teams/$id"
                              params={{ id: t.id }}
                              className="text-primary hover:underline text-xs"
                            >
                              View →
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {teams.length === 0 && (
                    <div className="py-8 text-center text-muted-foreground">No registrations yet.</div>
                  )}
                </div>

                {pages > 1 && (
                  <div className="mt-3 flex items-center gap-2 justify-end font-mono-ui text-xs">
                    <button
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      className="rounded border border-border px-2 py-1 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <span>
                      {page + 1} / {pages}
                    </span>
                    <button
                      disabled={page + 1 >= pages}
                      onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                      className="rounded border border-border px-2 py-1 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: number; accent?: "primary" | "amber" }) {
  return (
    <div className="panel rounded-xl p-4 corner-frame">
      <div className="font-mono-ui text-xs uppercase text-muted-foreground">{label}</div>
      <div
        className={`mt-1 font-display text-3xl font-bold ${
          accent === "primary"
            ? "text-primary text-glow-cyan"
            : accent === "amber"
              ? "text-amber text-glow-amber"
              : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="panel rounded-xl p-4 corner-frame">
      <div className="font-mono-ui text-xs uppercase text-primary mb-3">{title}</div>
      {children}
    </div>
  );
}

function Legend({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-3 justify-center text-xs font-mono-ui">
      {data.map((d, i) => (
        <span key={d.name} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: COLORS[i % COLORS.length] }}
          />
          {d.name}: {d.value}
        </span>
      ))}
    </div>
  );
}

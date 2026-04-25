// ── Admin Approval Queue ─────────────────────────────────────────────────────
// Tabbed table of pending submissions. Approve / Reject / View source per row.

import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  approveItem, fetchPending, rejectItem,
  type AdminKind, type PendingAnswerDoc, type PendingExperience,
  type PendingInterview, type PendingReading, type PendingQueue,
} from "../api/admin";
import { FormShell } from "../components/FormShell";
import type { LayoutContext } from "../components/Layout";

const TABS: { kind: AdminKind; label: string }[] = [
  { kind: "readings",    label: "Readings" },
  { kind: "interviews",  label: "Questions" },
  { kind: "experiences", label: "Experiences" },
  { kind: "answers",     label: "Answer docs" },
];

export default function AdminQueue() {
  const ctx = useOutletContext<LayoutContext>();
  const qc  = useQueryClient();
  const [active, setActive] = useState<AdminKind>("readings");

  const { data: queue, isLoading, error } = useQuery<PendingQueue>({
    queryKey: ["admin", "pending"],
    queryFn:  fetchPending,
    staleTime: 15_000,
  });

  const approve = useMutation({
    mutationFn: ({ kind, id }: { kind: AdminKind; id: number }) => approveItem(kind, id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["admin", "pending"] }),
  });
  const reject  = useMutation({
    mutationFn: ({ kind, id }: { kind: AdminKind; id: number }) => rejectItem(kind, id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["admin", "pending"] }),
  });

  function counts(k: AdminKind): number {
    return queue ? queue[k].length : 0;
  }

  return (
    <FormShell
      title="Admin queue"
      subtitle="Review user submissions before they show up publicly. Rejecting deletes the row."
      isMobile={ctx.isMobile}
    >
      {/* Tab strip */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, overflowX: "auto" }}>
        {TABS.map((t) => {
          const isActive = active === t.kind;
          const c = counts(t.kind);
          return (
            <button key={t.kind} onClick={() => setActive(t.kind)}
              style={{
                padding: "8px 14px", borderRadius: 999,
                background:   isActive ? "#6366f1" : "transparent",
                color:        isActive ? "#fff" : "var(--text-secondary)",
                border:       "1px solid " + (isActive ? "#6366f1" : "var(--border)"),
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
                fontFamily: "inherit",
              }}>
              {t.label}
              <span style={{
                background: isActive ? "rgba(255,255,255,.2)" : "var(--bg-card-alt)",
                padding: "1px 7px", borderRadius: 999,
                fontSize: 11, fontWeight: 800,
              }}>{c}</span>
            </button>
          );
        })}
      </div>

      {error
        ? <div style={{ fontSize: 13, color: "#f87171" }}>Failed to load queue.</div>
        : isLoading
          ? <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Loading…</div>
          : queue && (
            <PendingList
              kind={active}
              queue={queue}
              onApprove={(id) => approve.mutate({ kind: active, id })}
              onReject={(id) => reject.mutate({ kind: active, id })}
              busy={approve.isPending || reject.isPending}
            />
          )}
    </FormShell>
  );
}

function PendingList({
  kind, queue, onApprove, onReject, busy,
}: {
  kind:      AdminKind;
  queue:     PendingQueue;
  onApprove: (id: number) => void;
  onReject:  (id: number) => void;
  busy:      boolean;
}) {
  if (kind === "readings") {
    return <Rows items={queue.readings} render={(r: PendingReading) => (
      <Row title={r.title} subtitle={`${r.type} · by ${r.addedBy}`} url={r.url}
           tags={r.topics} createdAt={r.createdAt}
           extra={r.notes ?? undefined}/>
    )} onApprove={(id) => onApprove(id)} onReject={(id) => onReject(id)} busy={busy}/>;
  }
  if (kind === "interviews") {
    return <Rows items={queue.interviews} render={(q: PendingInterview) => (
      <Row title={q.title}
           subtitle={`${q.category} · ${q.difficulty}${q.companies.length ? " · " + q.companies.join(", ") : ""}`}
           tags={q.topics} createdAt={q.createdAt}
           extra={q.hints?.[0]}/>
    )} onApprove={(id) => onApprove(id)} onReject={(id) => onReject(id)} busy={busy}/>;
  }
  if (kind === "experiences") {
    return <Rows items={queue.experiences} render={(e: PendingExperience) => (
      <Row title={e.title}
           subtitle={`${e.platform} · ${e.company} · ${e.role}${e.outcome ? " · " + e.outcome : ""}`}
           url={e.url} tags={e.topics} createdAt={e.createdAt}
           extra={e.notes ?? undefined}/>
    )} onApprove={(id) => onApprove(id)} onReject={(id) => onReject(id)} busy={busy}/>;
  }
  return <Rows items={queue.answers} render={(a: PendingAnswerDoc) => (
    <Row title={a.label} subtitle={`Answer for question #${a.questionId} · by ${a.by}`}
         url={a.url} createdAt={a.createdAt}/>
  )} onApprove={(id) => onApprove(id)} onReject={(id) => onReject(id)} busy={busy}/>;
}

function Rows<T extends { id: number }>({
  items, render, onApprove, onReject, busy,
}: {
  items: T[];
  render: (item: T) => React.ReactNode;
  onApprove: (id: number) => void;
  onReject:  (id: number) => void;
  busy: boolean;
}) {
  if (items.length === 0) {
    return <div style={{ fontSize: 13, color: "var(--text-muted)", padding: 16, textAlign: "center" }}>No pending items in this bucket.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item) => (
        <div key={item.id} style={{
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 10, padding: 14,
        }}>
          {render(item)}
          <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
            <button onClick={() => onReject(item.id)} disabled={busy}
              style={btn("transparent", "#f87171")}>
              Reject
            </button>
            <button onClick={() => onApprove(item.id)} disabled={busy}
              style={btn("#10b981", "#fff", "#10b981")}>
              Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Row({
  title, subtitle, url, tags, createdAt, extra,
}: {
  title: string; subtitle?: string; url?: string;
  tags?: string[]; createdAt: string; extra?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-bright)", marginBottom: 2 }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{subtitle}</div>}
      {url && (
        <a href={url} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: "#818cf8", display: "inline-block", marginTop: 4, wordBreak: "break-all" }}>
          {url}
        </a>
      )}
      {extra && <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 6, lineHeight: 1.5 }}>{extra}</div>}
      {tags && tags.length > 0 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 8 }}>
          {tags.slice(0, 8).map((t) => (
            <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "var(--bg-card-alt)", color: "var(--text-muted)" }}>{t}</span>
          ))}
        </div>
      )}
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
        Submitted {new Date(createdAt).toLocaleString()}
      </div>
    </div>
  );
}

function btn(bg: string, color: string, border?: string): React.CSSProperties {
  return {
    background: bg, color, border: `1px solid ${border ?? "var(--border)"}`,
    borderRadius: 8, padding: "7px 14px",
    fontSize: 12, fontWeight: 700, cursor: "pointer",
    fontFamily: "inherit",
  };
}

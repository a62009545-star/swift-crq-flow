import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CRQRecord, STATUS_STYLES, WORKFLOW_BY_CRQ, DEFAULT_WORKFLOW, TASKS_BY_CRQ } from "./data";
import { useState } from "react";
import { ChevronDown, Play, CheckCircle2, Circle, User } from "lucide-react";
import { cn } from "@/lib/utils";

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-50 transition">
        <span className="text-sm font-semibold text-slate-800">{title}</span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="px-5 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">{label}</div>
      <div className="text-sm text-slate-700 mt-0.5">{value}</div>
    </div>
  );
}

export function CrqDrawer({ crq, onClose }: { crq: CRQRecord | null; onClose: () => void }) {
  const disabled = crq?.status === "Canceled";
  const workflow = crq ? WORKFLOW_BY_CRQ[crq.id] ?? DEFAULT_WORKFLOW : [];
  const tasks = crq ? TASKS_BY_CRQ[crq.id] ?? TASKS_BY_CRQ.default : [];
  return (
    <Sheet open={!!crq} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-[480px] sm:max-w-[480px] p-0 flex flex-col">
        {crq && (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-slate-800">{crq.id}</span>
              <span className={cn("text-[11px] px-2 py-0.5 rounded-full", STATUS_STYLES[crq.status])}>{crq.status}</span>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <Section title="CRQ — General Information">
                <Field label="CRQ Number" value={crq.id} />
                <Field label="Vendor" value={crq.vendor} />
                <Field label="Location Code" value={crq.location || "—"} />
                <Field label="Reviewer OLMID" value={crq.olmid} />
              </Section>
              <Section title="Activity Window">
                <Field label="Start Date" value={crq.reviewStart} />
                <Field label="End Date" value={crq.reviewEnd} />
              </Section>
              <Section title="Change Information">
                <Field label="Impact" value={crq.impact} />
                <Field label="CRQ Status" value={crq.status} />
                <Field label="Review Status" value={crq.status} />
              </Section>
              <Section title="Workflow Assignment">
                <div className="space-y-2 -mx-1">
                  {workflow.map((w, i) => {
                    const assigned = !!w.empId;
                    return (
                      <div
                        key={w.stage}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg border border-slate-100 bg-slate-50/50"
                      >
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-white border border-slate-200 text-[10px] font-semibold text-slate-500">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] uppercase tracking-wide text-slate-400 font-medium">{w.stage}</div>
                          {assigned ? (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <User className="h-3 w-3 text-indigo-500" />
                              <span className="text-sm text-slate-800 font-medium truncate">{w.empName}</span>
                              <span className="font-mono text-[11px] text-slate-500">({w.empId})</span>
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 mt-0.5 italic">Unassigned</div>
                          )}
                        </div>
                        {assigned ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-300" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Section>
              <Section title={`Associated Tasks (${tasks.length})`}>
                <div className="space-y-3 -mx-1">
                  {tasks.map((t) => (
                    <div key={t.id} className="rounded-lg border border-slate-100 bg-white p-3 space-y-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400 font-medium">Task ID</div>
                        <div className="font-mono text-xs text-slate-800 break-all">{t.id}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="NE Label" value={t.neLabel} />
                        <Field label="Location" value={t.locationCode} />
                        <Field label="Plan Activity" value={t.planActivity} />
                        <Field label="Task Activity" value={t.taskActivity} />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400 font-medium mb-1">Profile Types</div>
                        <div className="flex flex-wrap gap-1">
                          {t.profileTypes.map((p) => (
                            <span key={p} className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{p}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            </div>
            <div className="border-t border-slate-100 p-4">
              <button
                disabled={disabled}
                title={disabled ? "Workflow cannot start for canceled CRQ." : ""}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                  disabled
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 hover:shadow-lg",
                )}
              >
                <Play className="h-4 w-4" /> Start Workflow
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

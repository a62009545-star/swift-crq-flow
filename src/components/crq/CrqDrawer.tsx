import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CRQRecord, STATUS_STYLES, ASSIGNMENT_COLUMNS } from "./data";
import { useState } from "react";
import { ChevronDown, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmployeePicker } from "./EmployeePicker";

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
  const [assigns, setAssigns] = useState<(string | null)[]>(Array(8).fill(null));
  const disabled = crq?.status === "Canceled";
  return (
    <Sheet open={!!crq} onOpenChange={(o) => !o && onClose()}>
      <SheetContent side="right" className="w-[420px] sm:max-w-[420px] p-0 flex flex-col">
        {crq && (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
              <span className="font-mono text-sm font-semibold text-slate-800">{crq.id}</span>
              <span className={cn("text-[11px] px-2 py-0.5 rounded-full", STATUS_STYLES[crq.status])}>{crq.status}</span>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <Section title="General Information">
                <Field label="CRQ Number" value={crq.id} />
                <Field label="Vendor" value={crq.vendor} />
                <Field label="Location Code" value={crq.location || "—"} />
              </Section>
              <Section title="Activity Window">
                <Field label="Start Date" value={crq.reviewStart} />
                <Field label="End Date" value={crq.reviewEnd} />
              </Section>
              <Section title="Review Information">
                <Field label="Reviewer" value={crq.olmid} />
                <Field label="Review Start" value={crq.reviewStart} />
                <Field label="Review End" value={crq.reviewEnd} />
              </Section>
              <Section title="Change Information">
                <Field label="Impact" value={crq.impact} />
                <Field label="CRQ Status" value={crq.status} />
                <Field label="Review Status" value={crq.status} />
              </Section>
              <Section title="Workflow Assignment" defaultOpen={false}>
                {[...ASSIGNMENT_COLUMNS, "Reviewer Backup"].map((label, i) => (
                  <EmployeePicker
                    key={label}
                    label={label}
                    value={assigns[i] ?? null}
                    onChange={(v) => {
                      const next = [...assigns];
                      next[i] = v;
                      setAssigns(next);
                    }}
                  />
                ))}
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

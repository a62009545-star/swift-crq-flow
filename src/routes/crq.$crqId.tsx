import { createFileRoute, Link, useParams, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import {
  PLANS,
  TASKS_BY_CRQ,
  WORKFLOW_BY_CRQ,
  DEFAULT_WORKFLOW,
  STATUS_STYLES,
  type CRQRecord,
  type Plan,
  type Task,
} from "@/components/crq/data";
import { Sidebar } from "@/components/crq/Sidebar";
import { Header } from "@/components/crq/Header";
import { PdfModal } from "@/components/crq/PdfModal";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Paperclip,
  ArrowLeft,
  Ban,
  Cpu,
  Activity,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/crq/$crqId")({
  validateSearch: (s: Record<string, unknown>) => ({ stage: typeof s.stage === "string" ? s.stage : undefined }),
  component: CrqDetail,
});

const STAGE_ID_TO_NAME: Record<string, string> = {
  plan: "Plan & Inventory Validation",
  impact: "Impact Analysis",
  mop: "MOP Creation",
  mopv: "MOP Validation",
  schedule: "Scheduling Approval",
  exec: "Network Execution",
  closure: "Task Closure",
};

type ValidationStatus = "Success" | "Pending" | "Failed";
type Checkpoint = {
  name: string;
  status: ValidationStatus;
  by: string;
  ts: string;
  remarks: string;
  attachments: string[];
};

const CHECKPOINTS: Checkpoint[] = [
  { name: "Plan Validation", status: "Success", by: "Rahul Sharma (B0316607)", ts: "12-Mar-2026 09:14", remarks: "Plan reviewed against MOP; activities aligned.", attachments: ["plan_review.pdf"] },
  { name: "Inventory Validation", status: "Success", by: "Amit Verma (B0421987)", ts: "12-Mar-2026 09:48", remarks: "Inventory snapshot verified; spare cards confirmed.", attachments: ["inventory_snapshot.xlsx"] },
  { name: "MOP Validation", status: "Pending", by: "Neha Singh (B0542190)", ts: "—", remarks: "Awaiting peer signoff on rollback steps.", attachments: [] },
  { name: "Risk Validation", status: "Success", by: "Priya Nair (B0612345)", ts: "13-Mar-2026 11:02", remarks: "Risk classified as Low; mitigations attached.", attachments: ["risk_matrix.pdf"] },
  { name: "Schedule Validation", status: "Success", by: "Karan Mehta (B0723451)", ts: "13-Mar-2026 12:30", remarks: "Window approved within CAB calendar.", attachments: [] },
  { name: "Approval Validation", status: "Pending", by: "Sneha Kapoor (B0834512)", ts: "—", remarks: "Final CAB approval queued.", attachments: [] },
  { name: "Execution Validation", status: "Failed", by: "Arjun Rao (B0945123)", ts: "14-Mar-2026 02:11", remarks: "Pre-check failed on uplink port; rework required.", attachments: ["execution_log.txt"] },
  { name: "Closure Validation", status: "Pending", by: "Vivek Sinha (B1056234)", ts: "—", remarks: "Pending post-implementation review.", attachments: [] },
];

const MOCK_TASKS = [
  { name: "Pre-check NE health", owner: "Rahul Sharma", status: "Done", timeline: "12-Mar 09:00 → 09:30" },
  { name: "Backup current config", owner: "Amit Verma", status: "Done", timeline: "12-Mar 10:00 → 10:20" },
  { name: "Card insertion", owner: "Neha Singh", status: "In Progress", timeline: "16-Mar 22:00 → 22:45" },
  { name: "Port-up & verify", owner: "Priya Nair", status: "Pending", timeline: "16-Mar 22:45 → 23:15" },
  { name: "Closure report", owner: "Karan Mehta", status: "Pending", timeline: "17-Mar 09:00 → 09:30" },
];

function findCrq(crqId: string): { plan: Plan | null; crq: CRQRecord | null } {
  for (const p of PLANS) {
    const c = p.crqs.find((x) => x.id === crqId);
    if (c) return { plan: p, crq: c };
  }
  return { plan: null, crq: null };
}

function CrqDetail() {
  const { crqId } = useParams({ from: "/crq/$crqId" });
  const { stage } = useSearch({ from: "/crq/$crqId" });
  const { plan, crq } = findCrq(crqId);
  const [pdfOpen, setPdfOpen] = useState(false);
  const currentStageName = stage ? STAGE_ID_TO_NAME[stage] : undefined;

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Sidebar active="workflow" onChange={() => {}} />
      <Header crumb={["CRQ Workflow", "CRQ Detail", crqId]} />
      <div className="ml-[220px] pt-14">
        <div className="px-6 py-5 max-w-[1400px]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <Link to="/" className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 text-slate-600">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-400">CRQ Number</div>
                <h1 className="font-mono text-base font-semibold text-slate-900">{crqId}</h1>
              </div>
              {crq && (
                <span className={cn("text-[11px] px-2 py-0.5 rounded-full ml-2", STATUS_STYLES[crq.status])}>{crq.status}</span>
              )}
            </div>
            <button
              onClick={() => setPdfOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 shadow-sm transition"
            >
              <FileText className="h-3.5 w-3.5" /> Preview Plan PDF
            </button>
          </div>

          {!crq ? (
            <div className="bg-white rounded-xl border border-slate-100 p-8 text-center text-sm text-slate-500">
              CRQ <span className="font-mono">{crqId}</span> not found.
            </div>
          ) : (
            <div className="space-y-4">
              <PlanDetailsSectionInner plan={plan!} crqId={crq.id} onPreview={() => setPdfOpen(true)} />
              <CrqDetailsSection crq={crq} plan={plan!} currentStageName={currentStageName} />
              <StageDetailsSection crq={crq} currentStageName={currentStageName} />
              <ValidationSection />
            </div>
          )}
        </div>
      </div>
      <PdfModal open={pdfOpen} onClose={() => setPdfOpen(false)} />
    </div>
  );
}

/* ---------- shared collapsible card ---------- */

function Section({
  title,
  subtitle,
  defaultOpen = true,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-left group"
        >
          {open ? (
            <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
          )}
          <span className="text-sm font-semibold text-slate-900">{title}</span>
          {subtitle && <span className="text-xs text-slate-400">— {subtitle}</span>}
        </button>
        {right}
      </div>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">{label}</div>
      <div className={cn("text-sm text-slate-800", mono && "font-mono text-xs")}>{value}</div>
    </div>
  );
}

/* ---------- A. Plan Details ---------- */

function PlanDetailsSectionInner({ plan, onPreview, crqId }: { plan: Plan; onPreview: () => void; crqId?: string }) {
  return (
    <Section
      title="Plan Details"
      subtitle="Plan attributes, execution window, team & tasks"
      right={
        <button
          onClick={onPreview}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs text-slate-700"
        >
          <FileText className="h-3.5 w-3.5" /> Preview Plan PDF
        </button>
      }
    >
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <Field label="Plan ID" value={plan.id} mono />
        <Field label="Plan Name" value={plan.description || "Plan"} />
        <Field label="Planned Activity" value={plan.type} />
        <Field label="Execution Window" value="16-Mar-2026 22:00 → 23:30 IST" />
        <Field label="Assigned Team" value="IP Access — CCB North" />
        <Field label="Total CRQs" value={String(plan.crqs.length)} />
      </div>
      <div className="text-xs font-semibold text-indigo-600 mb-3">
        {crqId ? `Tasks for ${crqId}` : "Tasks per CRQ"}
      </div>
      <div className="space-y-4">
        {(crqId ? plan.crqs.filter((c) => c.id === crqId) : plan.crqs).map((c) => {
          const tasks = TASKS_BY_CRQ[c.id] ?? TASKS_BY_CRQ.default;
          return (
            <div key={c.id} className="border border-slate-100 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-50/70 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wide text-slate-400">CRQ</span>
                  <span className="font-mono text-xs text-slate-800">{c.id}</span>
                </div>
                <span className="text-[11px] text-slate-500">{tasks.length} task{tasks.length === 1 ? "" : "s"}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {tasks.map((t) => (
                  <TaskDetailCard key={t.id} task={t} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}

function TaskDetailCard({ task }: { task: Task }) {
  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4 bg-white">
      <Field label="Task ID" value={task.id} mono />
      <Field label="NE Label" value={task.neLabel} mono />
      <Field label="Plan Activity Details" value={task.planActivity} />
      <div>
        <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">Task Profile Type</div>
        <div className="flex flex-wrap gap-1">
          {task.profileTypes.map((p) => (
            <span key={p} className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{p}</span>
          ))}
        </div>
      </div>
      <Field label="Location Code" value={task.locationCode} />
      <Field label="Task Activity" value={task.taskActivity} />
    </div>
  );
}

/* ---------- B. CRQ Details ---------- */

function CrqDetailsSection({ crq, plan, currentStageName }: { crq: CRQRecord; plan: Plan; currentStageName?: string }) {
  const wf = WORKFLOW_BY_CRQ[crq.id] ?? DEFAULT_WORKFLOW;
  const currentStage = wf.find((w) => w.empId)?.stage ?? "Not started";
  const stageFields = currentStageName
    ? buildStages(crq).find((s) => s.name === currentStageName)?.fields ?? []
    : [];
  return (
    <Section title="CRQ Details" subtitle="Full change request attributes">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        <Field label="CRQ Number" value={crq.id} mono />
        <Field label="Plan Reference" value={plan.id} mono />
        <Field label="Change Type" value={plan.type} />
        <Field label="Change Reason" value="Capacity augmentation & card addition" />
        <Field label="Impacted Circle" value={(crq.location ?? "DELHI-DEL").split("-")[0]} />
        <Field label="Impacted Party" value="Enterprise & Mobility customers" />
        <Field label="Priority" value={<span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px]">Medium</span>} />
        <Field label="Risk" value={<span className="px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-[11px]">Low</span>} />
        <Field label="Schedule" value={`${crq.reviewStart} → ${crq.reviewEnd}`} />
        <Field label="Current Workflow Stage" value={currentStage} />
        <Field label="Approval Status" value={<span className={cn("px-2 py-0.5 rounded-full text-[11px]", STATUS_STYLES[crq.status])}>{crq.status}</span>} />
        <Field label="Vendor" value={crq.vendor} />
        <Field label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-[11px]", STATUS_STYLES[crq.status])}>{crq.status}</span>} />
        <Field label="Support Company - Change Coordinator" value="Bharti Airtel Ltd" />
        <Field label="Support Organization - Change Coordinator" value="Network Operations" />
        <Field label="Support Group Name+ - Change Coordinator" value="IP-CCB-NORTH-COORD" />
        <Field label="Support Company - Change Implementer" value="Nokia Solutions" />
        <Field label="Support Organization - Change Implementer" value="Field Operations" />
        <Field label="Support Group Name+ - Change Implementer" value="IP-CCB-NORTH-IMPL" />
        <Field label="Scheduled Implementar" value={`${crq.olmid} — Karan Mehta`} />
        <Field label="CRQ Validated By" value="Amit Verma (B0421987)" />
        <Field label="CRQ Validated Time" value="13-Mar-2026 11:02" />
        <Field label="Node IP Address" value="10.142.88.21" mono />
        <Field label="Reason for Cancellation Rejection" value="—" />
        <Field label="Cancellation Rejection Rollback Owner" value="—" />
        <Field label="Reason for Cancellation Rejection Deviation" value="—" />
        <Field label="Host Name" value={(crq.location ?? "DEL") + "-CORE-01"} mono />
        <Field label="Layer" value="Access" />
        <div className="md:col-span-2">
          <Field label="Remarks / Comments" value="Card addition validated against latest MOP. Rollback documented. Field team briefed for the execution window." />
        </div>
      </div>
      {stageFields.length > 0 && (
        <>
          <div className="mt-6 mb-3 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide font-semibold text-indigo-600">{currentStageName} — Stage Details</span>
            <span className="h-px flex-1 bg-slate-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
            {stageFields.map((f) => (
              <Field key={f.label} label={f.label} value={f.value} mono={f.label.toLowerCase().includes("time") || f.label.toLowerCase().includes("date")} />
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

/* ---------- C. Validation ---------- */

const STATUS_ICON: Record<ValidationStatus, { icon: React.ElementType; cls: string; pill: string }> = {
  Success: { icon: CheckCircle2, cls: "text-green-600", pill: "bg-green-50 text-green-700 border-green-200" },
  Pending: { icon: Clock, cls: "text-amber-600", pill: "bg-amber-50 text-amber-700 border-amber-200" },
  Failed: { icon: XCircle, cls: "text-red-600", pill: "bg-red-50 text-red-700 border-red-200" },
};

/* ---------- B2. Stage-wise CRQ Details ---------- */

type StageDef = { name: string; fields: { label: string; value: string }[] };

function buildStages(crq: CRQRecord): StageDef[] {
  const commonCancel = [
    { label: "Reason for Cancellation Rejection", value: "—" },
    { label: "Cancellation Rejection Rollback Owner", value: "—" },
    { label: "Reason for Cancellation Rejection Deviation", value: "—" },
  ];
  return [
    {
      name: "Plan & Inventory Validation",
      fields: [
        { label: "Support Company – Change Coordinator", value: "Bharti Airtel Ltd" },
        { label: "Support Organization – Change Coordinator", value: "Network Operations" },
        { label: "Support Group Name – Change Coordinator", value: "IP-CCB-NORTH-COORD" },
        { label: "Plan Document", value: "PLAN_" + crq.id + ".pdf" },
        { label: "Plan Document Status", value: "Approved" },
        { label: "Plan Preview", value: "Available" },
        { label: "Plan Validation", value: "System Validated" },
        { label: "Plan Validation Action", value: "Approve" },
        { label: "Rejection Reason", value: "—" },
        { label: "Rejection Owner", value: "—" },
        { label: "Rejection Deviation Reason", value: "—" },
        ...commonCancel,
      ],
    },
    {
      name: "Impact Analysis",
      fields: [
        { label: "Change Impact", value: crq.impact },
        { label: "Actual Impact", value: "Non Service Affecting" },
        { label: "Technology", value: "IP / MPLS" },
        { label: "Impact Analysis Status", value: "Completed" },
        { label: "Impact Analysis Completed By", value: "Amit Verma (B0421987)" },
        { label: "Impact Analysis Completed Time", value: "11-Mar-2026 14:22" },
        { label: "B2B Impacted", value: "No" },
        { label: "Impacted Circles", value: (crq.location ?? "DEL").split("-")[0] },
        { label: "Impacted Parties", value: "Enterprise, Mobility" },
        { label: "Business Justification", value: "Capacity augmentation" },
        { label: "Change ID", value: crq.id },
        { label: "Type of CR", value: "Normal" },
        { label: "Domain", value: "IP / MPLS" },
      ],
    },
    {
      name: "MOP Creation",
      fields: [
        { label: "SOP Document Available", value: "Yes" },
        { label: "MOP Created By", value: "Neha Singh (B0542190)" },
        { label: "MOP Created Time", value: "12-Mar-2026 09:15" },
        { label: "MOP Creation Method", value: "Template Based" },
        { label: "MOP Created Attachment", value: "MOP_" + crq.id + ".pdf" },
      ],
    },
    {
      name: "MOP Validation",
      fields: [
        { label: "Validated MOP Attachment", value: "MOP_" + crq.id + "_validated.pdf" },
        { label: "MOP Validation Action", value: "Approve" },
        { label: "MOP Validation Remarks", value: "Rollback steps verified; pre/post checks aligned." },
        { label: "Validator Name", value: "Priya Nair (B0612345)" },
        { label: "Validation Time", value: "12-Mar-2026 18:40" },
        { label: "Status*", value: crq.status },
        { label: "Reason for Cancellation Rejection", value: "—" },
        { label: "Cancellation Rejection Rollback Owner", value: "—" },
        { label: "Reason for Cancellation Rejection Deviation", value: "—" },
        { label: "MOP Creation Method", value: "Template Based" },
        { label: "SOP Document", value: "SOP_" + crq.id + ".pdf" },
        { label: "MOP Document", value: "MOP_" + crq.id + ".pdf" },
        { label: "MOP Created By", value: "Neha Singh (B0542190)" },
        { label: "MOP Created By Time", value: "12-Mar-2026 09:15" },
      ],
    },
    {
      name: "Scheduling Approval",
      fields: [
        { label: "Status*", value: crq.status },
        { label: "Reason for Cancellation Rejection", value: "—" },
        { label: "Cancellation Rejection Rollback Owner", value: "—" },
        { label: "Reason for Cancellation Rejection Deviation", value: "—" },
        { label: "Scheduled Start Date+", value: crq.reviewStart },
        { label: "Scheduled End Date+", value: crq.reviewEnd },
        { label: "CRQ Scheduled By", value: "Karan Mehta (B0723451)" },
        { label: "CRQ Scheduled By Time", value: "13-Mar-2026 10:05" },
        { label: "Activity Executed By*", value: "Sneha Kapoor (B0834512)" },
        { label: "Business Justification", value: "Capacity augmentation for Q1 traffic growth." },
        { label: "L3 Approver OLM ID", value: "B0945123" },
      ],
    },
    {
      name: "Network Execution",
      fields: [
        { label: "Customer Type", value: "Enterprise" },
        { label: "Network Type", value: "IP / MPLS" },
        { label: "MOP Preparation Method", value: "Template Based" },
        { label: "Vendor Name", value: crq.vendor },
        { label: "Change Requestor", value: "Rahul Sharma (B0316607)" },
        { label: "Status Reason", value: "Execution in window" },
        { label: "Reason for Cancellation Rejection", value: "—" },
        { label: "Reason for Rollback", value: "—" },
        { label: "Actual Start Date", value: "16-Mar-2026 22:00" },
        { label: "Actual End Date", value: "16-Mar-2026 23:15" },
        { label: "Support Company - Change Implementer", value: "Nokia Solutions" },
        { label: "Support Organization - Change Implementer", value: "Field Operations" },
        { label: "Support Group Name+ - Change Implementer", value: "IP-CCB-NORTH-IMPL" },
        { label: "Actual Implementer Name", value: "Sneha Kapoor" },
        { label: "Actual Implementer Phone No", value: "+91-98xxxxxx21" },
        { label: "Exit Criteria Fulfilled", value: "Yes" },
        { label: "MOP Referred During Activity", value: "MOP_" + crq.id + ".pdf" },
        { label: "Pre Check Done", value: "Yes" },
        { label: "Pre - Checks Done By", value: "Arjun Rao (B0945123)" },
        { label: "Pre-Check Done Time", value: "16-Mar-2026 21:30" },
        { label: "Post Check Done", value: "Yes" },
        { label: "Requested Date Deviation Reason", value: "—" },
        { label: "Executer Location", value: crq.location ?? "—" },
        { label: "MOP Execution Method", value: "Manual + CLI Script" },
        { label: "CRQ approval status", value: crq.status },
        { label: "Hardware Change", value: "Yes" },
        { label: "Related Alarms", value: "None" },
      ],
    },
    {
      name: "Task Closure",
      fields: [
        { label: "Reason for Cancellation Rejection", value: "—" },
        { label: "Change Activity Done", value: "Yes" },
        { label: "Change Activity Done Time", value: "16-Mar-2026 23:30" },
        { label: "Completed Date", value: "17-Mar-2026 09:10" },
        { label: "CRQ Closed By", value: "Rahul Sharma (B0316607)" },
        { label: "CRQ Closed By Time", value: "17-Mar-2026 09:12" },
      ],
    },
  ];
}

function StageDetailsSection({ crq, currentStageName }: { crq: CRQRecord; currentStageName?: string }) {
  const all = buildStages(crq);
  const cutoffIdx = currentStageName ? all.findIndex((s) => s.name === currentStageName) : -1;
  const stages = cutoffIdx >= 0 ? all.slice(0, cutoffIdx + 1) : all;
  const [active, setActive] = useState(stages[stages.length - 1]?.name ?? all[0].name);
  const current = stages.find((s) => s.name === active) ?? stages[stages.length - 1];
  if (!current) return null;
  return (
    <Section
      title="Stage-wise CRQ Details"
      subtitle={currentStageName ? `Current & previous stages up to ${currentStageName}` : "Field-level details captured at each workflow stage"}
    >
      <div className="flex flex-wrap gap-2 mb-5 border-b border-slate-100 pb-3">
        {stages.map((s) => {
          const isActive = s.name === active;
          return (
            <button
              key={s.name}
              onClick={() => setActive(s.name)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg border transition",
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600",
              )}
            >
              {s.name}
              <span className={cn("ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full", isActive ? "bg-white/20" : "bg-slate-100 text-slate-500")}>
                {s.fields.length}
              </span>
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
        {current.fields.map((f) => (
          <Field key={f.label} label={f.label} value={f.value} mono={f.label.toLowerCase().includes("time") || f.label.toLowerCase().includes("date")} />
        ))}
      </div>
    </Section>
  );
}

function ValidationSection() {
  return (
    <Section title="Validation" subtitle="Checkpoint-wise validation status">
      <ValidationPanel />
    </Section>
  );
}

const VALIDATION_TILES = [
  { id: "PASS", label: "PASS", icon: CheckCircle2, color: "text-green-600", border: "border-green-300", bg: "bg-green-50" },
  { id: "FAILED", label: "FAILED", icon: XCircle, color: "text-red-600", border: "border-red-300", bg: "bg-red-50" },
  { id: "CANCELLED", label: "CANCELLED", icon: Ban, color: "text-slate-500", border: "border-slate-300", bg: "bg-slate-100" },
] as const;

const VALIDATION_CHECKPOINTS = [
  { title: "Node Details", icon: Cpu, count: 12, progress: 80 },
  { title: "Interface / Traffic / Power", icon: Activity, count: 8, progress: 55 },
  { title: "IS-IS Adjacency", icon: Network, count: 4, progress: 30 },
];

function ValidationPanel() {
  const [pick, setPick] = useState<string | null>("PASS");
  return (
    <div className="grid grid-cols-12 gap-5">
      <div className="col-span-12 md:col-span-5 space-y-3">
        {VALIDATION_TILES.map((t) => {
          const Icon = t.icon;
          const active = pick === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setPick(t.id)}
              className={cn(
                "w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200",
                active ? `${t.border} ${t.bg} scale-[1.02] shadow-sm` : "border-slate-200 hover:border-slate-300",
              )}
            >
              <Icon className={cn("h-6 w-6", t.color)} />
              <span className="font-semibold text-slate-800">{t.label}</span>
            </button>
          );
        })}
        <div className="relative pt-3">
          <label className="absolute -top-1 left-2.5 px-1 bg-white text-[10px] uppercase tracking-wide font-medium text-slate-500">CHM Remark</label>
          <textarea
            rows={4}
            placeholder="Add your remarks…"
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 transition resize-none"
          />
        </div>
      </div>
      <div className="col-span-12 md:col-span-7 space-y-4">
        <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
          {VALIDATION_CHECKPOINTS.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.title} className="min-w-[200px] rounded-xl border border-slate-100 p-3 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-4 w-4 text-indigo-500" />
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">{c.count}</span>
                </div>
                <div className="text-xs font-medium text-slate-700 mb-2">{c.title}</div>
                <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.progress}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-3 bg-slate-50 px-4 py-2 text-[11px] uppercase tracking-wide font-medium text-slate-500">
            <div>NiamReachable</div>
            <div>AdrsReachable</div>
            <div>LastDiscoveryTime</div>
          </div>
          <div className="grid grid-cols-3 px-4 py-3 text-xs text-slate-700">
            <div>Node NotAvailable in NIAM via IPPMS</div>
            <div>Inventory available in UIG</div>
            <div className="font-mono">2026-05-15 00:35:35</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckpointCard({ cp }: { cp: Checkpoint }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_ICON[cp.status];
  const Icon = cfg.icon;
  return (
    <div className="border border-slate-100 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition text-left"
      >
        {open ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
        <Icon className={cn("h-4 w-4", cfg.cls)} />
        <span className="text-sm font-medium text-slate-800 flex-1">{cp.name}</span>
        <span className={cn("text-[11px] px-2 py-0.5 rounded-full border", cfg.pill)}>{cp.status}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Validated By" value={cp.by} />
            <Field label="Validation Timestamp" value={cp.ts} />
            <Field label="Validation Status" value={<span className={cn("px-2 py-0.5 rounded-full border text-[11px]", cfg.pill)}>{cp.status}</span>} />
          </div>
          <div className="mt-4">
            <Field label="Validation Remarks" value={cp.remarks} />
          </div>
          {cp.attachments.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-wide text-slate-400 mb-1.5">Supporting Attachments</div>
              <div className="flex flex-wrap gap-2">
                {cp.attachments.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1.5 text-xs text-slate-700 px-2 py-1 rounded-md border border-slate-200 bg-white">
                    <Paperclip className="h-3 w-3 text-slate-400" />
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


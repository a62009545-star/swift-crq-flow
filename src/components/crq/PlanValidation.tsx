import { useState } from "react";
import { PLANS, Plan, CRQRecord, STATUS_STYLES, TASKS_BY_CRQ } from "./data";
import { ChevronRight, Eye, ExternalLink, FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ValidationModal } from "./ValidationModal";
import { PdfModal } from "./PdfModal";
import { CrqDrawer } from "./CrqDrawer";

export function PlanValidation() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["CEN/AC/CRD-A/MOB/10032026/001"]));
  const [taskOpen, setTaskOpen] = useState<Set<string>>(new Set());
  const [valCrq, setValCrq] = useState<CRQRecord | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [drawerCrq, setDrawerCrq] = useState<CRQRecord | null>(null);
  const [search, setSearch] = useState("");

  const toggle = (id: string) => {
    setExpanded((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleTask = (id: string) => {
    setTaskOpen((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const visiblePlans = PLANS.filter(
    (p) =>
      !search ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.crqs.some((c) => c.id.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900">Plan & Inventory Validation</h2>
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">85</span>
        </div>
        <div className="flex items-center bg-white rounded-lg border border-slate-200 px-3 py-2 w-72 focus-within:ring-2 focus-within:ring-indigo-200 focus-within:border-indigo-400 transition">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Plans / CRQs / Tasks..."
            className="flex-1 bg-transparent text-sm focus:outline-none px-2"
          />
        </div>
      </div>

      <div className="space-y-2">
        {visiblePlans.map((plan) => (
          <PlanRow
            key={plan.id}
            plan={plan}
            open={expanded.has(plan.id)}
            onToggle={() => toggle(plan.id)}
            taskOpen={taskOpen}
            onToggleTask={toggleTask}
            onEye={(c) => setValCrq(c)}
            onPdf={() => setPdfOpen(true)}
            onDrawer={(c) => setDrawerCrq(c)}
          />
        ))}
      </div>

      <ValidationModal crq={valCrq} onClose={() => setValCrq(null)} />
      <PdfModal open={pdfOpen} onClose={() => setPdfOpen(false)} />
      <CrqDrawer crq={drawerCrq} onClose={() => setDrawerCrq(null)} />
    </div>
  );
}

function PlanRow({
  plan,
  open,
  onToggle,
  taskOpen,
  onToggleTask,
  onEye,
  onPdf,
  onDrawer,
}: {
  plan: Plan;
  open: boolean;
  onToggle: () => void;
  taskOpen: Set<string>;
  onToggleTask: (id: string) => void;
  onEye: (c: CRQRecord) => void;
  onPdf: () => void;
  onDrawer: (c: CRQRecord) => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition text-left"
      >
        <ChevronRight className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", open && "rotate-90")} />
        <span className="font-mono text-sm text-slate-800 font-medium">{plan.id}</span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{plan.type}</span>
        <span className="text-sm text-slate-500 truncate">{plan.description}</span>
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 bg-slate-50/40 pl-8 pr-4 py-4">
            <div className="text-xs font-semibold text-indigo-600 mb-3">CRQs under {plan.id}</div>
            {plan.crqs.length === 0 ? (
              <div className="text-xs text-slate-400 py-3">No CRQs available for this plan.</div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full min-w-[1100px] text-sm">
                  <thead>
                    <tr className="text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="text-left font-medium py-2 pr-3 w-8"></th>
                      <th className="text-left font-medium py-2 pr-3 w-8"></th>
                      <th className="text-left font-medium py-2 pr-3">CRQ Number</th>
                      <th className="text-left font-medium py-2 pr-3">Review Status</th>
                      <th className="text-left font-medium py-2 pr-3">OLMID Review</th>
                      <th className="text-left font-medium py-2 pr-3">Review Start</th>
                      <th className="text-left font-medium py-2 pr-3">Review End</th>
                      <th className="text-left font-medium py-2 pr-3">Remedy Change Impact</th>
                      <th className="text-left font-medium py-2 pr-3">Vendor</th>
                      <th className="text-left font-medium py-2 pr-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.crqs.map((c) => (
                      <CrqSubRow
                        key={c.id}
                        crq={c}
                        open={taskOpen.has(c.id)}
                        onToggle={() => onToggleTask(c.id)}
                        onEye={() => onEye(c)}
                        onPdf={onPdf}
                        onDrawer={() => onDrawer(c)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CrqSubRow({
  crq,
  open,
  onToggle,
  onEye,
  onPdf,
  onDrawer,
}: {
  crq: CRQRecord;
  open: boolean;
  onToggle: () => void;
  onEye: () => void;
  onPdf: () => void;
  onDrawer: () => void;
}) {
  const tasks = TASKS_BY_CRQ.default;
  return (
    <>
      <tr className="border-t border-slate-100 hover:bg-white transition">
        <td className="py-2.5 pr-3">
          <button onClick={onToggle} className="p-1 rounded hover:bg-slate-100 text-slate-400">
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} />
          </button>
        </td>
        <td className="py-2.5 pr-3"><input type="checkbox" className="rounded border-slate-300" /></td>
        <td className="py-2.5 pr-3 font-mono text-xs text-slate-800 font-medium">{crq.id}</td>
        <td className="py-2.5 pr-3">
          <span className={cn("text-[11px] px-2 py-0.5 rounded-full inline-block", STATUS_STYLES[crq.status])}>{crq.status}</span>
        </td>
        <td className="py-2.5 pr-3 font-mono text-xs text-slate-600">{crq.olmid}</td>
        <td className="py-2.5 pr-3 text-xs text-slate-600 whitespace-nowrap">{crq.reviewStart}</td>
        <td className="py-2.5 pr-3 text-xs text-slate-600 whitespace-nowrap">{crq.reviewEnd}</td>
        <td className="py-2.5 pr-3 text-xs text-slate-600">{crq.impact}</td>
        <td className="py-2.5 pr-3 text-xs text-slate-600">{crq.vendor}</td>
        <td className="py-2.5 pr-3">
          <div className="flex items-center gap-1">
            <ActionBtn title="View Validation" onClick={onEye}><Eye className="h-3.5 w-3.5" /></ActionBtn>
            <ActionBtn title="Open details (double-click)" onClick={onDrawer} onDouble={onDrawer}><ExternalLink className="h-3.5 w-3.5" /></ActionBtn>
            <ActionBtn title="View PDF" onClick={onPdf}><FileText className="h-3.5 w-3.5" /></ActionBtn>
          </div>
        </td>
      </tr>
      {open && tasks.map((t) => (
        <tr key={t.id} className="bg-indigo-50/30">
          <td colSpan={10} className="px-4 py-3">
            <div className="text-xs font-semibold text-indigo-600 mb-2">Tasks Associated with CRQ <span className="ml-1 px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{tasks.length}</span></div>
            <div className="grid grid-cols-6 gap-3 text-xs">
              <div><div className="text-[10px] uppercase text-slate-400">Task ID</div><div className="font-mono text-slate-700 break-all">{t.id}</div></div>
              <div><div className="text-[10px] uppercase text-slate-400">NE Label</div><div className="font-mono text-slate-700 break-all">{t.neLabel}</div></div>
              <div><div className="text-[10px] uppercase text-slate-400">Plan Activity Details</div><div className="text-slate-700">{t.planActivity}</div></div>
              <div>
                <div className="text-[10px] uppercase text-slate-400 mb-1">Task Profile Type</div>
                <div className="flex flex-wrap gap-1">
                  {t.profileTypes.map((p) => (
                    <span key={p} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">{p}</span>
                  ))}
                </div>
              </div>
              <div><div className="text-[10px] uppercase text-slate-400">Location Code</div><div className="text-slate-700">{t.locationCode}</div></div>
              <div><div className="text-[10px] uppercase text-slate-400">Task Activity</div><div className="text-slate-700">{t.taskActivity}</div></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

function ActionBtn({ children, title, onClick, onDouble }: { children: React.ReactNode; title: string; onClick?: () => void; onDouble?: () => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      onDoubleClick={onDouble}
      className="p-1.5 rounded-md hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition"
    >
      {children}
    </button>
  );
}

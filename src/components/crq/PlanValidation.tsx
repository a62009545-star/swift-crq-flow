import { useState } from "react";
import { PLANS, Plan, CRQRecord, STATUS_STYLES, TASKS_BY_CRQ } from "./data";
import { ChevronRight, Eye, ExternalLink, FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ValidationModal } from "./ValidationModal";
import { PdfModal } from "./PdfModal";
import { CrqDrawer } from "./CrqDrawer";
import { Link } from "@tanstack/react-router";

export function PlanValidation() {
  const [taskOpen, setTaskOpen] = useState<Set<string>>(new Set());
  const [valCrq, setValCrq] = useState<CRQRecord | null>(null);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [drawerCrq, setDrawerCrq] = useState<CRQRecord | null>(null);
  const [search, setSearch] = useState("");

  const toggleTask = (id: string) => {
    setTaskOpen((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const rows: { plan: Plan; crq: CRQRecord }[] = PLANS.flatMap((p) =>
    p.crqs.map((c) => ({ plan: p, crq: c })),
  ).filter(({ plan, crq }) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return plan.id.toLowerCase().includes(q) || crq.id.toLowerCase().includes(q);
  });

  return (
    <div className="px-6 py-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-900">Plan & Inventory Validation</h2>
          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">{rows.length}</span>
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

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[1200px] text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-slate-500 bg-slate-50/60">
                <th className="text-left font-medium py-2.5 pl-4 pr-3 w-8"></th>
                <th className="text-left font-medium py-2.5 pr-3 w-8"></th>
                <th className="text-left font-medium py-2.5 pr-3">CRQ Number &nbsp;|&nbsp; Plan ID</th>
                <th className="text-left font-medium py-2.5 pr-3">Review Status</th>
                <th className="text-left font-medium py-2.5 pr-3">OLMID Review</th>
                <th className="text-left font-medium py-2.5 pr-3">Review Start</th>
                <th className="text-left font-medium py-2.5 pr-3">Review End</th>
                <th className="text-left font-medium py-2.5 pr-3">Remedy Change Impact</th>
                <th className="text-left font-medium py-2.5 pr-3">Vendor</th>
                <th className="text-left font-medium py-2.5 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-8 text-xs text-slate-400">No matching records.</td></tr>
              ) : rows.map(({ plan, crq }) => (
                <CrqFlatRow
                  key={crq.id}
                  plan={plan}
                  crq={crq}
                  open={taskOpen.has(crq.id)}
                  onToggle={() => toggleTask(crq.id)}
                  onEye={() => setValCrq(crq)}
                  onPdf={() => setPdfOpen(true)}
                  onDrawer={() => setDrawerCrq(crq)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ValidationModal crq={valCrq} onClose={() => setValCrq(null)} />
      <PdfModal open={pdfOpen} onClose={() => setPdfOpen(false)} />
      <CrqDrawer crq={drawerCrq} onClose={() => setDrawerCrq(null)} />
    </div>
  );
}

function CrqFlatRow({
  plan,
  crq,
  open,
  onToggle,
  onEye,
  onPdf,
  onDrawer,
}: {
  plan: Plan;
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
      <tr className="border-t border-slate-100 hover:bg-slate-50/60 transition">
        <td className="py-2.5 pl-4 pr-3">
          <button onClick={onToggle} className="p-1 rounded hover:bg-slate-100 text-slate-400">
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} />
          </button>
        </td>
        <td className="py-2.5 pr-3"><input type="checkbox" className="rounded border-slate-300" /></td>
        <td className="py-2.5 pr-3 whitespace-nowrap">
          <Link
            to="/crq/$crqId"
            params={{ crqId: crq.id }}
            className="font-mono text-xs text-indigo-600 font-medium hover:text-indigo-700 hover:underline"
          >
            {crq.id}
          </Link>
          <span className="font-mono text-xs text-slate-300 mx-1.5">|</span>
          <span className="font-mono text-xs text-slate-600">{plan.id}</span>
        </td>
        <td className="py-2.5 pr-3">
          <span className={cn("text-[11px] px-2 py-0.5 rounded-full inline-block", STATUS_STYLES[crq.status])}>{crq.status}</span>
        </td>
        <td className="py-2.5 pr-3 font-mono text-xs text-slate-600">{crq.olmid}</td>
        <td className="py-2.5 pr-3 text-xs text-slate-600 whitespace-nowrap">{crq.reviewStart}</td>
        <td className="py-2.5 pr-3 text-xs text-slate-600 whitespace-nowrap">{crq.reviewEnd}</td>
        <td className="py-2.5 pr-3 text-xs text-slate-600">{crq.impact}</td>
        <td className="py-2.5 pr-3 text-xs text-slate-600">{crq.vendor}</td>
        <td className="py-2.5 pr-4">
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

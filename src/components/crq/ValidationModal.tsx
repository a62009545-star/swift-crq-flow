import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CRQRecord, STATUS_STYLES } from "./data";
import { CheckCircle2, XCircle, Ban, Cpu, Activity, Network } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const TILES = [
  { id: "PASS", label: "PASS", icon: CheckCircle2, color: "text-green-600", border: "border-green-300", bg: "bg-green-50" },
  { id: "FAILED", label: "FAILED", icon: XCircle, color: "text-red-600", border: "border-red-300", bg: "bg-red-50" },
  { id: "CANCELLED", label: "CANCELLED", icon: Ban, color: "text-slate-500", border: "border-slate-300", bg: "bg-slate-100" },
] as const;

const CHECKPOINTS = [
  { title: "Node Details", icon: Cpu, count: 12, progress: 80 },
  { title: "Interface / Traffic / Power", icon: Activity, count: 8, progress: 55 },
  { title: "IS-IS Adjacency", icon: Network, count: 4, progress: 30 },
];

export function ValidationModal({ crq, onClose }: { crq: CRQRecord | null; onClose: () => void }) {
  const [pick, setPick] = useState<string | null>("PASS");
  if (!crq) return null;
  return (
    <Dialog open={!!crq} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-semibold text-slate-800">{crq.id}</span>
            <span className={cn("text-[11px] px-2 py-0.5 rounded-full", STATUS_STYLES[crq.status])}>{crq.status}</span>
          </div>
          <span className="w-8" />
        </div>
        <div className="grid grid-cols-12 gap-0">
          <div className="col-span-12 md:col-span-5 border-r border-slate-100 p-5 space-y-3">
            {TILES.map((t) => {
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
          <div className="col-span-12 md:col-span-7 p-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
            <div className="flex gap-3 overflow-x-auto scrollbar-thin pb-2">
              {CHECKPOINTS.map((c) => {
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
      </DialogContent>
    </Dialog>
  );
}

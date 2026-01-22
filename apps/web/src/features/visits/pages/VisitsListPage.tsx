import { useMemo, useState, type FormEvent } from "react";
import type { Visit } from "@medherb/shared";
import { useVisits, useDeleteVisit } from "../../../hooks/useVisits.ts";
import { usePatient } from "../../../hooks/usePatient.ts";
import { PatientDetailModal } from "../../patients/components/PatientDetailModal.tsx";
import { VisitFormModal } from "../components/VisitFormModal.tsx";
import { VisitDetailModal } from "../components/VisitDetailModal.tsx";
import { PlusCircle, Trash2 } from "lucide-react";

export function VisitsListPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [keyword, setKeyword] = useState("");
  const [applied, setApplied] = useState<{ from?: string; to?: string; keyword?: string }>(
    {}
  );
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageInput, setPageInput] = useState("1");

  const { data, isLoading, isError } = useVisits(applied);
  const allVisits = data ?? [];
  const totalItems = allVisits.length;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;

  const visits = useMemo(() => {
    if (totalItems === 0) return [];
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return allVisits.slice(start, end);
  }, [allVisits, page, pageSize, totalItems, totalPages]);

  const {
    data: selectedPatient,
    isLoading: isPatientLoading
  } = usePatient(selectedPatientId);

  const deleteVisit = useDeleteVisit();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setApplied({
      from: from || undefined,
      to: to || undefined,
      keyword: keyword.trim() || undefined
    });
    setPage(1);
  };

  const handleReset = () => {
    setFrom("");
    setTo("");
    setKeyword("");
    setApplied({});
    setPage(1);
  };

  const renderRow = (v: Visit) => (
    <tr key={v.id} className="border-b last:border-b-0 hover:bg-slate-50">
      <td className="px-3 py-2 text-sm font-medium text-slate-900">
        <button
          type="button"
          onClick={() => setSelectedPatientId(v.patientId)}
          className="underline-offset-2 hover:underline"
        >
          {v.patientName ?? "-"}
        </button>
      </td>
      <td className="px-3 py-2 text-sm text-slate-600">{v.gender ?? "-"}</td>
      <td className="px-3 py-2 text-sm text-slate-600">
        {typeof v.age === "number" ? v.age : "-"}
      </td>
      <td className="px-3 py-2 text-sm text-slate-600">{v.phone ?? "-"}</td>
      <td className="px-3 py-2 text-sm text-slate-600">
        {v.visitDate ? v.visitDate.slice(0, 10) : "-"}
      </td>
      <td className="px-3 py-2 text-sm text-slate-700 max-w-xs truncate">
        {v.mainComplaint ?? "-"}
      </td>
      <td className="px-3 py-2 text-xs text-slate-500 max-w-xs truncate">
        {v.prescription ?? ""}
      </td>
      <td className="px-3 py-2 text-xs text-right">
        <button
          type="button"
          onClick={() => setSelectedVisit(v)}
          className="inline-flex items-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted mr-2"
        >
          详情
        </button>
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm(
                "确定要删除该条问诊记录吗？此操作不可恢复（注意：不会删除病人本身）。"
              )
            ) {
              deleteVisit.mutate(v.id);
            }
          }}
          className="inline-flex items-center rounded-md border border-destructive/40 bg-background px-2 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Visits</h1>
          <p className="text-sm text-muted-foreground">
            问诊记录：按日期和主诉关键词浏览所有问诊记录。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4" />
          新增问诊记录
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
          >
            <div className="flex flex-1 flex-wrap gap-3">
              <div className="w-40">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  起始日期
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="w-40">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  结束日期
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex-1 min-w-[220px]">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  姓名 / 主述 / 备注关键词
                </label>
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="例如：Wang / Bridget / 失眠 / 关节痛"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="flex gap-2 w-40">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-md border border-input px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                清空
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                筛选
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  姓名
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  性别
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  年龄
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  电话
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  问诊日期
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  主述
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  处方（简要）
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-right">
                  详情
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-sm text-muted-foreground"
                  >
                    正在加载问诊记录…
                  </td>
                </tr>
              )}
              {isError && !isLoading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-sm text-destructive"
                  >
                    加载失败，请稍后重试。
                  </td>
                </tr>
              )}
              {!isLoading && !isError && totalItems === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-sm text-muted-foreground"
                  >
                    当前没有问诊记录。
                  </td>
                </tr>
              )}
              {!isLoading && !isError && visits.map(renderRow)}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <span>共 {totalItems} 条记录</span>
            <span>·</span>
            <span>
              第 {totalItems === 0 ? 0 : page} / {totalPages} 页
            </span>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="flex items-center gap-2">
              <span>每页</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value) || 10;
                  setPageSize(newSize);
                  setPage(1);
                }}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>条</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={page <= 1 || totalItems === 0}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
              >
                « 首页
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || totalItems === 0}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
              >
                ‹ 上一页
              </button>
              <button
                type="button"
                onClick={() =>
                  setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1))
                }
                disabled={page >= totalPages || totalItems === 0}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
              >
                下一页 ›
              </button>
              <button
                type="button"
                onClick={() => setPage(totalPages || 1)}
                disabled={page >= totalPages || totalItems === 0}
                className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
              >
                尾页 »
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span>跳转到</span>
              <input
                type="number"
                min={1}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="h-8 w-16 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span>页</span>
              <button
                type="button"
                onClick={() => {
                  const raw = Number(pageInput);
                  if (!Number.isFinite(raw) || raw <= 0) {
                    setPage(1);
                    return;
                  }
                  const target = totalPages ? Math.min(Math.max(1, raw), totalPages) : 1;
                  setPage(target);
                }}
                className="h-8 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:opacity-90"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedVisit && (
        <VisitDetailModal
          visit={selectedVisit}
          onClose={() => setSelectedVisit(null)}
          onEdit={() => {
            setEditingVisit(selectedVisit);
            setSelectedVisit(null);
          }}
        />
      )}

      {selectedPatientId && isPatientLoading && !selectedPatient && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
          <div className="rounded-md bg-card px-4 py-3 text-sm text-muted-foreground border border-border shadow-sm">
            正在加载病人详情…
          </div>
        </div>
      )}

      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatientId(null)}
        />
      )}

      {isCreateOpen && (
        <VisitFormModal mode="create" onClose={() => setIsCreateOpen(false)} />
      )}

      {editingVisit && (
        <VisitFormModal
          mode="edit"
          initialVisit={editingVisit}
          onClose={() => setEditingVisit(null)}
        />
      )}
    </div>
  );
}

function DetailRow(props: { label: string; value?: string | null; full?: boolean }) {
  const { label, value, full } = props;
  const content = value && value.toString().trim().length > 0 ? value : "—";
  const className = full ? "col-span-2 flex text-xs" : "flex text-xs";
  return (
    <div className={className}>
      <span className="w-20 text-muted-foreground">{label}</span>
      <span className="flex-1 text-foreground truncate">{content}</span>
    </div>
  );
}

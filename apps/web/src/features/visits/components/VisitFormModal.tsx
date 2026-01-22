import { useState } from "react";
import type { Visit } from "@medherb/shared";
import { usePatients } from "../../../hooks/usePatients.ts";
import { useCreateVisit, useUpdateVisit, type VisitFormValues } from "../../../hooks/useVisits.ts";

type Mode = "create" | "edit";

interface VisitFormModalProps {
  mode: Mode;
  initialVisit?: Visit;
  onClose: () => void;
}

function toInputDate(value?: string): string {
  if (!value) return "";

  // 优先用 Date 解析，失败再做简单字符串规范化
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  // 处理类似 2023/03/04 或 2023-03-04 之类的字符串
  const normalized = value.replace(/\//g, "-").slice(0, 10);
  // 如果仍然不合法，返回空字符串，让用户手动选择
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : "";
}

export function VisitFormModal({ mode, initialVisit, onClose }: VisitFormModalProps) {
  const [patientId, setPatientId] = useState(initialVisit?.patientId ?? "");
  const [visitDate, setVisitDate] = useState(
    initialVisit?.visitDate ? toInputDate(initialVisit.visitDate) : ""
  );
  const [mainComplaint, setMainComplaint] = useState(initialVisit?.mainComplaint ?? "");
  const [prescription, setPrescription] = useState(initialVisit?.prescription ?? "");
  const [notes, setNotes] = useState(initialVisit?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  // 这里需要拿到一个足够大的病人列表用于下拉选择，因此直接请求较大的 pageSize
  const { data: patientsResult } = usePatients({ page: 1, pageSize: 1000 });
  const patients = patientsResult?.items ?? [];

  const createMutation = useCreateVisit();
  const updateMutation = useUpdateVisit();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const effectivePatientId = initialVisit?.patientId ?? patientId;

    if (!effectivePatientId || !visitDate) {
      setError("病人和问诊日期为必填项。");
      return;
    }

    const payload: VisitFormValues = {
      patientId: effectivePatientId,
      visitDate,
      mainComplaint: mainComplaint.trim() || undefined,
      prescription: prescription.trim() || undefined,
      notes: notes.trim() || undefined
    };

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else if (mode === "edit" && initialVisit) {
        // 编辑时不允许切换病人，因此仅更新与该次问诊本身相关的字段
        await updateMutation.mutateAsync({
          id: initialVisit.id,
          data: {
            visitDate: payload.visitDate,
            mainComplaint: payload.mainComplaint,
            prescription: payload.prescription,
            notes: payload.notes
          }
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message ?? "保存失败，请稍后重试。");
    }
  };

  const title = mode === "create" ? "新增问诊记录" : "编辑问诊记录";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-5 py-10 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-lg bg-card border border-border shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            关闭
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                病人 *
              </label>
              {mode === "create" ? (
                <select
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">请选择病人</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName} {p.firstName}（{p.phone ?? "无电话"}）
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  readOnly
                  value={
                    patients.find((p) => p.id === initialVisit?.patientId)
                      ? `${patients.find((p) => p.id === initialVisit?.patientId)?.lastName} ${
                          patients.find((p) => p.id === initialVisit?.patientId)?.firstName
                        }`
                      : initialVisit?.patientName ?? ""
                  }
                  className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                问诊日期 *
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              主述
            </label>
            <textarea
              value={mainComplaint}
              onChange={(e) => setMainComplaint(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              处方
            </label>
            <textarea
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              备注
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && <div className="text-xs text-destructive">{error}</div>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              {isSubmitting ? "保存中…" : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



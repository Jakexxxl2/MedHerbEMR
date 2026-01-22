import type { Visit } from "@medherb/shared";

interface VisitDetailModalProps {
  visit: Visit;
  onClose: () => void;
  onEdit?: () => void;
}

export function VisitDetailModal({ visit, onClose, onEdit }: VisitDetailModalProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 px-5 py-10 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-lg bg-card border border-border shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              问诊详情：{visit.patientName ?? "未知病人"}
            </h2>
            <p className="text-xs text-muted-foreground">
              查看该次问诊的病人信息、日期、主诉与处方。
            </p>
          </div>
          <div className="flex gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                编辑
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
            >
              关闭
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-5 text-sm">
          <div>
            <div className="text-lg font-medium text-muted-foreground mb-2">病人信息</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <DetailRow label="姓名" value={visit.patientName} />
              <DetailRow label="性别" value={visit.gender} />
              <DetailRow
                label="年龄"
                value={
                  typeof visit.age === "number" ? visit.age.toString() : undefined
                }
              />
              <DetailRow label="电话" value={visit.phone} />
              <DetailRow
                label="问诊日期"
                value={visit.visitDate ? visit.visitDate.slice(0, 10) : undefined}
                full
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="text-lg font-medium text-muted-foreground mb-2">
              主述 / 问诊记录
            </div>
            <div className="text-sm text-foreground whitespace-pre-wrap">
              {visit.mainComplaint || visit.notes || "（暂无主述记录）"}
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="text-lg font-medium text-muted-foreground mb-2">处方</div>
            <div className="text-sm text-foreground whitespace-pre-wrap">
              {visit.prescription || "（暂无处方记录）"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow(props: { label: string; value?: string | null; full?: boolean }) {
  const { label, value, full } = props;
  const content = value && value.toString().trim().length > 0 ? value : "—";
  const className = full ? "col-span-2 flex text-xs" : "flex text-sm";
  return (
    <div className={className}>
      <span className="w-20 text-muted-foreground">{label}</span>
      <span className="flex-1 text-foreground truncate">{content}</span>
    </div>
  );
}



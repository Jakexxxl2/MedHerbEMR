import type { Patient } from "@medherb/shared";
import { useVisits } from "../../../hooks/useVisits.ts";

interface PatientDetailModalProps {
  patient: Patient;
  onClose: () => void;
  onEdit?: () => void;
}

export function PatientDetailModal({ patient, onClose, onEdit }: PatientDetailModalProps) {
  const {
    data: visitsForPatient,
    isLoading: isVisitsLoading
  } = useVisits({ patientId: patient.id }, { enabled: !!patient.id });

  return (
    // 整个背景，可滚动
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 px-5 py-10 overflow-y-auto">
      {/* 整个卡片区域 */}
      <div className="w-full max-w-2xl rounded-lg bg-card border border-border shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-5 py-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              病人详情：{patient.lastName} {patient.firstName}
            </h2>
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
        <div className="px-4 py-3 space-y-5 text-base">
          <div className="text-lg font-medium text-muted-foreground mb-1">基础信息</div>
          <div className="text-base grid grid-cols-2 gap-x-4 gap-y-1">
            <DetailRow label="姓" value={patient.lastName} />
            <DetailRow label="名" value={patient.firstName} />
            <DetailRow label="性别" value={patient.gender} />
            <DetailRow
              label="年龄"
              value={
                patient.age?.toString() ??
                (patient.birthDate
                  ? (
                      new Date().getFullYear() - Number(patient.birthDate.slice(0, 4))
                    ).toString()
                  : undefined)
              }
            />
            <DetailRow label="出生日期" value={patient.birthDate} />
            <DetailRow label="职业" value={patient.occupation} />
            <DetailRow label="电话" value={patient.phone} />
            <DetailRow label="Email" value={patient.email} />
            <DetailRow label="地址" value={patient.address} />
            <DetailRow label="地区" value={patient.region} />
            <DetailRow label="邮编" value={patient.postcode} />
            <DetailRow
              label="国籍/地区"
              value={patient.countryOrNationality}
            />
            <DetailRow label="初诊日期" value={patient.firstVisitDate} />
            <DetailRow
              label="问诊次数"
              value={patient.visitCount?.toString()}
            />
            <DetailRow
              label="了解途径"
              value={patient.acquisitionChannel}
            />
          </div>

          <div className="pt-2 border-t border-border">
            <div className="text-lg font-medium text-muted-foreground mb-1">
              就诊记录
            </div>
            <div className="text-sm text-foreground whitespace-pre-wrap space-y-2">
              {isVisitsLoading && <div>正在加载就诊记录…</div>}
              {!isVisitsLoading && (!visitsForPatient || visitsForPatient.length === 0) && (
                <div>（暂无就诊记录）</div>
              )}
              {!isVisitsLoading &&
                visitsForPatient &&
                visitsForPatient.map((v) => (
                  <div
                    key={v.id}
                    className="rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>
                        问诊日期：{v.visitDate ? v.visitDate.slice(0, 10) : "—"}
                      </span>
                    </div>
                    <div className="text-foreground">
                      主述：{v.mainComplaint || "（无主诉记录）"}
                    </div>
                    {v.prescription && (
                      <div className="text-foreground mt-1">处方：{v.prescription}</div>
                    )}
                  </div>
                ))}
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="text-lg font-medium text-muted-foreground mb-1">
              备注
            </div>
            <div className="text-sm text-foreground whitespace-pre-wrap">
              {patient.notes || "（暂无备注）"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow(props: { label: string; value?: string | null; full?: boolean }) {
  const { label, value, full } = props;
  const content = value && value.trim().length > 0 ? value : "—";
  const className = full ? "col-span-2 flex text-xs" : "flex text-sm";
  return (
    <div className={className}>
      <span className="w-20 text-muted-foreground">{label}</span>
      <span className="flex-1 text-foreground truncate">{content}</span>
    </div>
  );
}



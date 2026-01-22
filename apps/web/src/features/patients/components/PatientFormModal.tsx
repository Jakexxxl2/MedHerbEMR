import { useState } from "react";
import type { Patient } from "@medherb/shared";
import { useCreatePatient, useUpdatePatient } from "../../../hooks/usePatients.ts";

type Mode = "create" | "edit";

interface PatientFormModalProps {
  mode: Mode;
  initialPatient?: Patient;
  onClose: () => void;
}

export function PatientFormModal({ mode, initialPatient, onClose }: PatientFormModalProps) {
  const [lastName, setLastName] = useState(initialPatient?.lastName ?? "");
  const [firstName, setFirstName] = useState(initialPatient?.firstName ?? "");
  const [gender, setGender] = useState<Patient["gender"]>(initialPatient?.gender ?? "other");
  const [phone, setPhone] = useState(initialPatient?.phone ?? "");
  const [email, setEmail] = useState(initialPatient?.email ?? "");
  const [birthDate, setBirthDate] = useState(initialPatient?.birthDate ?? "");
  const [ageInput, setAgeInput] = useState(
    typeof initialPatient?.age === "number" ? String(initialPatient.age) : ""
  );
  const [occupation, setOccupation] = useState(initialPatient?.occupation ?? "");
  const [address, setAddress] = useState(initialPatient?.address ?? "");
  const [region, setRegion] = useState(initialPatient?.region ?? "");
  const [postcode, setPostcode] = useState(initialPatient?.postcode ?? "");
  const [country, setCountry] = useState(initialPatient?.countryOrNationality ?? "");
  const [firstVisitDate, setFirstVisitDate] = useState(
    initialPatient?.firstVisitDate ?? ""
  );
  const [mainComplaint, setMainComplaint] = useState(initialPatient?.mainComplaint ?? "");
  const [visitCountInput, setVisitCountInput] = useState(
    typeof initialPatient?.visitCount === "number" ? String(initialPatient.visitCount) : ""
  );
  const [acquisitionChannel, setAcquisitionChannel] = useState(
    initialPatient?.acquisitionChannel ?? ""
  );
  const [notes, setNotes] = useState(initialPatient?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useCreatePatient();
  const updateMutation = useUpdatePatient();

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!lastName.trim() || !firstName.trim()) {
      setError("姓和名为必填项。");
      return;
    }

    const age =
      ageInput.trim().length > 0 && !Number.isNaN(Number(ageInput))
        ? Number(ageInput)
        : undefined;
    const visitCount =
      visitCountInput.trim().length > 0 && !Number.isNaN(Number(visitCountInput))
        ? Number(visitCountInput)
        : undefined;

    const payload: Omit<Patient, "id"> = {
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      gender,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      birthDate: birthDate || undefined,
      age,
      occupation: occupation.trim() || undefined,
      address: address.trim() || undefined,
      region: region.trim() || undefined,
      postcode: postcode.trim() || undefined,
      countryOrNationality: country.trim() || undefined,
      firstVisitDate: firstVisitDate || undefined,
      mainComplaint: mainComplaint.trim() || undefined,
      visitCount,
      acquisitionChannel: acquisitionChannel.trim() || undefined,
      notes: notes.trim() || undefined
    };

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload, {
          onError: (err: any) => {
            if (err?.response?.status === 409) {
              throw new Error("该病人已存在（姓名 + 出生日期 已在系统中）。");
            }
          }
        });
      } else if (mode === "edit" && initialPatient) {
        await updateMutation.mutateAsync({
          id: initialPatient.id,
          data: payload
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message ?? "保存失败，请稍后重试。");
    }
  };

  const title = mode === "create" ? "新增病人" : "编辑病人信息";

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/40 px-5 py-10 overflow-y-auto">
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
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                姓 *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                名 *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                性别
              </label>
              <select
                value={gender ?? "other"}
                onChange={(e) => setGender(e.target.value as Patient["gender"])}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="female">女</option>
                <option value="male">男</option>
                <option value="other">其他/未填写</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                出生日期
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                年龄
              </label>
              <input
                type="number"
                value={ageInput}
                onChange={(e) => setAgeInput(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                职业
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                电话
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                地址
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                地区 / 郊区
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                邮编
              </label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                国籍 / 地区
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                初诊日期
              </label>
              <input
                type="date"
                value={firstVisitDate}
                onChange={(e) => setFirstVisitDate(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                主述（整体）
              </label>
              <textarea
                value={mainComplaint}
                onChange={(e) => setMainComplaint(e.target.value)}
                rows={2}
                className="w-full h-5/6 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                问诊次数
              </label>
              <input
                type="number"
                value={visitCountInput}
                onChange={(e) => setVisitCountInput(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <label className="block text-xs font-medium text-muted-foreground mb-1 mt-2">
                了解途径
              </label>
              <input
                type="text"
                value={acquisitionChannel}
                onChange={(e) => setAcquisitionChannel(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
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



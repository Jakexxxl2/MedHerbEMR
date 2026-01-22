import { useMemo, useState, useEffect, type FormEvent } from "react";
import type { Patient } from "@medherb/shared";
import { usePatients } from "../../../hooks/usePatients.ts";
import { PlusCircle, Trash2 } from "lucide-react";
import { PatientDetailModal } from "../components/PatientDetailModal.tsx";
import { PatientFormModal } from "../components/PatientFormModal.tsx";
import { useDeletePatient } from "../../../hooks/usePatients.ts";

export function PatientsListPage() {
  // 将用户输入和 api 要用的分开
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [appliedSearch, setAppliedSearch] = useState<{ search?: string; phone?: string }>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pageInput, setPageInput] = useState("1");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const deleteMutation = useDeletePatient();

  const { data, isLoading, isError } = usePatients({
    ...appliedSearch,
    page,
    pageSize
  });

  const patients = data?.items ?? [];
  const allPatients = (data?.allItems as Patient[] | undefined) ?? patients;
  const totalItems = data?.total ?? allPatients.length ?? 0;
  const totalPages = totalItems > 0 ? Math.ceil(totalItems / pageSize) : 1;

  useEffect(() => {
    setPageInput(String(page));
  }, [page]);

//   点击搜索，将用户输入searchName和searchPhone作为参数传给appliedsearch
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setAppliedSearch({
      search: searchName.trim() || undefined,
      phone: searchPhone.trim() || undefined
    });
    setPage(1);
  };

  const stats = useMemo(() => {
    if (!allPatients.length) {
      return {
        total: totalItems,
        male: 0,
        female: 0,
        avgAge: "-"
      };
    }
    let male = 0;
    let female = 0;
    let ageSum = 0;
    let ageCount = 0;

    for (const p of allPatients) {
      if (p.gender === "male") male += 1;
      if (p.gender === "female") female += 1;
      const age = p.age ?? (p.birthDate ? new Date().getFullYear() - Number(p.birthDate.slice(0, 4)) : undefined);
      if (typeof age === "number" && !Number.isNaN(age)) {
        ageSum += age;
        ageCount += 1;
      }
    }

    return {
      total: totalItems || allPatients.length,
      male,
      female,
      avgAge: ageCount ? Math.round(ageSum / ageCount) : "-"
    };
  }, [allPatients, totalItems]);

  const renderRow = (p: Patient) => {
    const fullName = `${p.lastName} ${p.firstName}`;
    return (
      <tr key={p.id} className="border-b last:border-b-0 hover:bg-slate-50">
        <td className="px-3 py-2 text-sm font-medium text-slate-900">{fullName}</td>
        <td className="px-3 py-2 text-sm text-slate-600">{p.gender ?? "-"}</td>
        <td className="px-3 py-2 text-sm text-slate-600">
          {p.age ?? (p.birthDate ? new Date().getFullYear() - Number(p.birthDate.slice(0, 4)) : "-")}
        </td>
        <td className="px-3 py-2 text-sm text-slate-600">{p.phone ?? "-"}</td>
        <td className="px-3 py-2 text-sm text-slate-600">{p.region ?? "-"}</td>
        <td className="px-3 py-2 text-sm text-slate-600">
          {p.firstVisitDate ? p.firstVisitDate.slice(0, 10) : "-"}
        </td>
        <td className="px-3 py-2 text-sm text-slate-600 text-center">
          {p.visitCount ?? "-"}
        </td>
        <td className="px-3 py-2 text-xs text-right space-x-2">
          <button
            type="button"
            onClick={() => setSelectedPatient(p)}
            className="inline-flex items-center rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          >
            详情
          </button>
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "确定要删除该病人及其所有问诊记录吗？此操作不可恢复。"
                )
              ) {
                deleteMutation.mutate(p.id);
              }
            }}
            className="inline-flex items-center rounded-md border border-destructive/40 bg-background px-2 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Patients</h1>
          <p className="text-sm text-muted-foreground">
            病人管理：查看所有病人，支持按姓名和电话快速搜索。
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-90"
        >
          <PlusCircle className="h-4 w-4" />
          新增病人
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <div className="text-xs text-muted-foreground mb-1">总病人数量</div>
          <div className="text-xl font-semibold text-foreground">{stats.total}</div>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <div className="text-xs text-muted-foreground mb-1">女性 / 男性</div>
          <div className="text-sm font-medium text-foreground">
            女 {stats.female} 人 · 男 {stats.male} 人
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
          <div className="text-xs text-muted-foreground mb-1">平均年龄（估算）</div>
          <div className="text-xl font-semibold text-foreground">{stats.avgAge}</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="border-b border-border px-4 py-3">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
          >
            <div className="flex flex-1 gap-3">
              <div className="w-70 mr-10">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  姓名
                </label>
                <input
                  type="text"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="例如：Wang / Bridget"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="w-70">
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  电话
                </label>
                <input
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="手机号"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex gap-2 w-40 mt-5">
              <button
                type="button"
                onClick={() => {
                  setSearchName("");
                  setSearchPhone("");
                  setAppliedSearch({});
                  setPage(1);
                }}
                className="rounded-md border border-input px-3 py-2 text-sm text-foreground hover:bg-muted"
              >
                清空
              </button>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                搜索
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">姓名</th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">性别</th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">年龄</th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">电话</th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">地区</th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground">
                  初诊日期
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-center">
                  问诊次数
                </th>
                <th className="px-3 py-2 text-xs font-semibold text-muted-foreground text-center">
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
                    正在加载病人列表…
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
              {!isLoading && !isError && patients.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-sm text-muted-foreground"
                  >
                    当前没有病人记录。
                  </td>
                </tr>
              )}
              {!isLoading && !isError && patients.map(renderRow)}
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

      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onEdit={() => {
            setEditingPatient(selectedPatient);
            setSelectedPatient(null);
          }}
        />
      )}

      {isCreateOpen && (
        <PatientFormModal mode="create" onClose={() => setIsCreateOpen(false)} />
      )}

      {editingPatient && (
        <PatientFormModal
          mode="edit"
          initialPatient={editingPatient}
          onClose={() => setEditingPatient(null)}
        />
      )}
    </div>
  );
}


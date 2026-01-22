import { useState } from "react";
import { useAnalytics } from "../../../hooks/useAnalytics.ts";

export function AnalyticsDashboardPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number | undefined>(currentYear);
  const [month, setMonth] = useState<number | undefined>(undefined);

  const { data, isLoading, isError } = useAnalytics({ year, month });

  const totalPatientsVisitsBuckets = data?.visitCountBuckets ?? [];
  const genderDistribution = data?.genderDistribution ?? [];
  const ageBuckets = data?.ageBuckets ?? [];
  const visitsByPeriod = data?.visitsByPeriod ?? [];

  const maxVisitsByPeriod =
    visitsByPeriod.length > 0 ? Math.max(...visitsByPeriod.map((i) => i.count)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            病人和问诊的整体统计：性别、年龄、问诊次数分布，以及按年/月的问诊人次趋势。
          </p>
        </div>
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              年份
            </label>
            <select
              value={year ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  setYear(undefined);
                  setMonth(undefined);
                } else {
                  setYear(Number(v));
                }
              }}
              className="w-28 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">全部年份</option>
              {Array.from({ length: 10 }).map((_, idx) => {
                const y = currentYear - idx;
                return (
                  <option key={y} value={y}>
                    {y} 年
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              月份
            </label>
            <select
              value={month ?? ""}
              disabled={year === undefined}
              onChange={(e) => {
                const v = e.target.value;
                setMonth(v === "" ? undefined : Number(v));
              }}
              className="w-28 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">全年</option>
              {Array.from({ length: 12 }).map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {idx + 1} 月
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground">正在加载统计数据…</div>
      )}
      {isError && !isLoading && (
        <div className="text-sm text-destructive">统计数据加载失败，请稍后重试。</div>
      )}

      {data && (
        <div className="space-y-6">
          {/* 顶部概要卡片 */}
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">
                {year
                  ? month
                    ? `${year} 年 ${month} 月问诊人次`
                    : `${year} 年问诊人次`
                  : "全部年份问诊人次"}
              </div>
              <div className="text-2xl font-semibold text-foreground">
                {data.visitSummary.totalVisits}
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">复诊率（至少 2 次）</div>
              <div className="text-2xl font-semibold text-foreground">
                {(data.visitSummary.returnRate * 100).toFixed(1)}%
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">
                统计区间
              </div>
              <div className="text-sm font-medium text-foreground">
                {data.range.from} ~ {data.range.to}
              </div>
            </div>
          </div>

          {/* 病人分布：性别 & 年龄 & 问诊次数 */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* 性别分布饼图（用简单的条形代替） */}
            <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
              <div className="text-sm font-medium text-foreground mb-2">病人性别分布</div>
              {genderDistribution.length === 0 ? (
                <div className="text-xs text-muted-foreground">暂无数据</div>
              ) : (
                <div className="space-y-2">
                  {genderDistribution.map((g) => {
                    const total = genderDistribution.reduce(
                      (sum, item) => sum + item.count,
                      0
                    );
                    const pct = total ? Math.round((g.count / total) * 100) : 0;
                    const label =
                      g.gender === "male"
                        ? "男"
                        : g.gender === "female"
                          ? "女"
                          : g.gender === "other"
                            ? "其他"
                            : "未知";
                    return (
                      <div key={g.gender} className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{label}</span>
                          <span>
                            {g.count} 人（{pct}%）
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 年龄分布 */}
            <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
              <div className="text-sm font-medium text-foreground mb-2">
                病人年龄分布（10 岁一档）
              </div>
              {ageBuckets.length === 0 ? (
                <div className="text-xs text-muted-foreground">暂无数据</div>
              ) : (
                <div className="h-48 flex items-end gap-2">
                  {(() => {
                    const max = Math.max(...ageBuckets.map((x) => x.count));
                    const maxBarHeight = 160; // px，最高的那根柱子
                    return ageBuckets.map((b) => {
                      if (max <= 0 || b.count <= 0) {
                        return (
                          <div
                            key={b.bucket}
                            className="flex-1 flex flex-col items-center justify-end gap-1"
                          >
                            <div className="w-full rounded-t-md bg-primary/80 opacity-0" />
                            <div className="text-[10px] text-center text-muted-foreground">
                              {b.bucket}
                            </div>
                          </div>
                        );
                      }
                      const ratio = b.count / max;
                      const heightPx = Math.max(18, ratio * maxBarHeight); // 最低高度，按比例缩放
                      return (
                        
                        <div
                          key={b.bucket}
                          className="flex-1 flex flex-col items-center justify-end gap-1"
                        >
                          <div
                            className="w-full rounded-t-md bg-primary/80"
                            style={{ height: `${heightPx}px` }}
                            title={`${b.bucket}: ${b.count} 人`}
                          />
                          <div className="min-h-[28px] flex items-center justify-center text-[10px] leading-tight text-muted-foreground text-center">
                            {b.bucket}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            {/* 问诊次数分布 */}
            <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
              <div className="text-sm font-medium text-foreground mb-2">
                病人问诊次数分布
              </div>
              {totalPatientsVisitsBuckets.length === 0 ? (
                <div className="text-xs text-muted-foreground">暂无数据</div>
              ) : (
                <div className="space-y-2">
                  {totalPatientsVisitsBuckets.map((b) => (
                    <div key={b.bucket} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{b.bucket}</span>
                      <span className="text-foreground">{b.count} 人</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 按年/月的问诊人次趋势 */}
          <div className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-foreground">
                {year
                  ? month
                    ? `${year} 年 ${month} 月按日问诊人次`
                    : `${year} 年按月问诊人次`
                  : "全部年份按年问诊人次"}
              </div>
            </div>
            {visitsByPeriod.length === 0 ? (
              <div className="text-xs text-muted-foreground">暂无数据</div>
            ) : (
              <div className="h-56 flex items-end gap-2 overflow-x-auto">
                {(() => {
                  const max = maxVisitsByPeriod;
                  const maxBarHeight = 180; // px
                  return visitsByPeriod.map((item) => {
                    if (max <= 0 || item.count <= 0) {
                      return (
                        <div
                          key={item.label}
                          className="flex flex-col items-center justify-end gap-1 min-w-[32px]"
                        >
                          <div className="w-full rounded-t-md bg-emerald-500/80 opacity-0" />
                          <div className="text-[10px] text-center text-muted-foreground">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-center text-foreground">
                            {item.count}
                          </div>
                        </div>
                      );
                    }
                    const ratio = item.count / max;
                    const heightPx = Math.max(18, ratio * maxBarHeight);
                    return (
                      <div
                        key={item.label}
                        className="flex flex-col items-center justify-end gap-1 min-w-[32px]"
                      >
                        <div
                          className="w-full rounded-t-md bg-emerald-500/80"
                          style={{ height: `${heightPx}px` }}
                          title={`${item.label}: ${item.count} 次`}
                        />
                        <div className="text-[10px] text-center text-muted-foreground">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-center text-foreground">
                          {item.count}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


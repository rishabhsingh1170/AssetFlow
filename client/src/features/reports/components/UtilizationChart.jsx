import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { humanize } from "../../../utils/assetStatus";

// SVG requires literal colors; these hexes mirror the CSS status tokens.
export const STATUS_COLORS = {
  available: "#0f766e",
  allocated: "#1d4ed8",
  reserved: "#6d28d9",
  under_maintenance: "#b45309",
  lost: "#b91c1c",
  retired: "#57534e",
  disposed: "#44403c",
};

export const OTHER_COLOR = "#79716b";
export const GRID_STROKE = "#e7e2d9";
export const AXIS_TICK = {
  fill: "#79716b",
  fontSize: 11,
  fontFamily: "IBM Plex Mono",
};

// Dark tooltip shared by every report chart.
export const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface-ink text-text-inverse rounded-default px-3 py-2 shadow-pop font-mono text-[11px] space-y-1">
      {label && <p className="font-semibold">{label}</p>}
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.payload?.fill }}
            aria-hidden="true"
          />
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const STACK_SERIES = [
  { key: "available", color: STATUS_COLORS.available },
  { key: "allocated", color: STATUS_COLORS.allocated },
  { key: "reserved", color: STATUS_COLORS.reserved },
  { key: "under_maintenance", color: STATUS_COLORS.under_maintenance },
  { key: "other", color: OTHER_COLOR },
];

export const UtilizationChart = ({ rows = [] }) => {
  const byStatus = useMemo(() => {
    const counts = {};
    rows.forEach((row) => {
      counts[row.status] = (counts[row.status] || 0) + 1;
    });
    return Object.keys(STATUS_COLORS)
      .filter((status) => counts[status])
      .map((status) => ({
        status,
        name: humanize(status),
        value: counts[status],
        fill: STATUS_COLORS[status],
      }));
  }, [rows]);

  const byCategory = useMemo(() => {
    const buckets = {};
    rows.forEach((row) => {
      const category = row.category_name || "Uncategorized";
      if (!buckets[category]) {
        buckets[category] = {
          category,
          available: 0,
          allocated: 0,
          reserved: 0,
          under_maintenance: 0,
          other: 0,
        };
      }
      const key = ["available", "allocated", "reserved", "under_maintenance"].includes(
        row.status
      )
        ? row.status
        : "other";
      buckets[category][key] += 1;
    });
    return Object.values(buckets).sort(
      (a, b) =>
        b.available + b.allocated + b.reserved + b.under_maintenance + b.other -
        (a.available + a.allocated + a.reserved + a.under_maintenance + a.other)
    );
  }, [rows]);

  const total = rows.length;

  return (
    <div className="space-y-8">
      {/* Donut: assets by status */}
      <div>
        <p className="eyebrow mb-3">Assets by status</p>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-56 h-56 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byStatus}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {byStatus.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-display text-3xl font-bold text-text-primary tabular-nums">
                {total}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-text-muted">
                Assets
              </span>
            </div>
          </div>
          <ul className="flex flex-col gap-2 min-w-0">
            {byStatus.map((entry) => (
              <li key={entry.status} className="flex items-center gap-2 text-sm">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: entry.fill }}
                  aria-hidden="true"
                />
                <span className="text-text-secondary truncate">{entry.name}</span>
                <span className="font-mono text-[13px] text-text-primary ml-auto pl-4">
                  {entry.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stacked bars: status mix per category */}
      <div>
        <p className="eyebrow mb-3">Status by category</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byCategory} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID_STROKE} />
            <XAxis
              dataKey="category"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={{ stroke: GRID_STROKE }}
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8f6f1" }} />
            {STACK_SERIES.map((series) => (
              <Bar
                key={series.key}
                dataKey={series.key}
                name={humanize(series.key)}
                stackId="status"
                fill={series.color}
                maxBarSize={48}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
          {STACK_SERIES.map((series) => (
            <span key={series.key} className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: series.color }}
                aria-hidden="true"
              />
              {humanize(series.key)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UtilizationChart;

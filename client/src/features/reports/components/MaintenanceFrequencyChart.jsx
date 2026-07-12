import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartTooltip, AXIS_TICK, GRID_STROKE } from "./UtilizationChart";

// SVG requires literal colors; these mirror accent-400 and status-available.
const RAISED_COLOR = "#f59e0b";
const RESOLVED_COLOR = "#0f766e";

const MONTH_LABEL = new Intl.DateTimeFormat("en", { month: "short" });

const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;

export const MaintenanceFrequencyChart = ({ rows = [] }) => {
  const data = useMemo(() => {
    // Last 6 calendar months, zero-filled so quiet months still chart.
    const now = new Date();
    const buckets = [];
    const byKey = {};
    for (let offset = 5; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const bucket = {
        key: monthKey(date),
        label: `${MONTH_LABEL.format(date)} ${String(date.getFullYear()).slice(2)}`,
        raised: 0,
        resolved: 0,
      };
      buckets.push(bucket);
      byKey[bucket.key] = bucket;
    }

    rows.forEach((row) => {
      if (row.created_at) {
        const created = new Date(row.created_at);
        if (!Number.isNaN(created.getTime())) {
          const bucket = byKey[monthKey(created)];
          if (bucket) bucket.raised += 1;
        }
      }
      if (row.resolved_at) {
        const resolved = new Date(row.resolved_at);
        if (!Number.isNaN(resolved.getTime())) {
          const bucket = byKey[monthKey(resolved)];
          if (bucket) bucket.resolved += 1;
        }
      }
    });

    return buckets;
  }, [rows]);

  return (
    <div>
      <p className="eyebrow mb-3">Requests raised vs resolved, last 6 months</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis
            dataKey="label"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={{ stroke: GRID_STROKE }}
          />
          <YAxis
            allowDecimals={false}
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f8f6f1" }} />
          <Bar
            dataKey="raised"
            name="Raised"
            fill={RAISED_COLOR}
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="resolved"
            name="Resolved"
            fill={RESOLVED_COLOR}
            radius={[4, 4, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
        <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: RAISED_COLOR }}
            aria-hidden="true"
          />
          Raised
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: RESOLVED_COLOR }}
            aria-hidden="true"
          />
          Resolved
        </span>
      </div>
    </div>
  );
};

export default MaintenanceFrequencyChart;

import React from "react";
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
import Card from "../../../components/ui/Card";
import EmptyState from "../../../components/common/EmptyState";
import { getStatusMeta } from "../../../utils/assetStatus";

// Mirrors the --color-status-* text tokens in index.css for SVG fills.
const STATUS_COLORS = {
  available: "#0f766e",
  allocated: "#1d4ed8",
  reserved: "#6d28d9",
  under_maintenance: "#b45309",
  lost: "#b91c1c",
  retired: "#57534e",
  disposed: "#44403c",
};

const AXIS_COLOR = "#79716b";
const GRID_COLOR = "#e7e2d9";

const ChartTooltip = ({ active, payload, labelFormatter }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="bg-surface-ink text-text-inverse rounded-default px-3 py-2 text-xs font-mono shadow-pop">
      {labelFormatter ? labelFormatter(item) : `${item.name}: ${item.value}`}
    </div>
  );
};

export const AssetStatusDonut = ({ data = [] }) => {
  const rows = data
    .map((row) => ({ ...row, count: Number(row.count) || 0 }))
    .filter((row) => row.count > 0);
  const total = rows.reduce((sum, row) => sum + row.count, 0);

  return (
    <Card className="h-full">
      <p className="eyebrow mb-4">Assets by status</p>
      {total === 0 ? (
        <EmptyState
          illustration="generic"
          title="No data to chart yet"
          description="Register assets to see the status breakdown."
          className="py-6"
        />
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={rows}
                  dataKey="count"
                  nameKey="status"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {rows.map((row) => (
                    <Cell
                      key={row.status}
                      fill={STATUS_COLORS[row.status] || STATUS_COLORS.retired}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltip
                      labelFormatter={(item) =>
                        `${getStatusMeta("asset", item.name).label}: ${item.value}`
                      }
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-display text-2xl font-bold text-text-primary tabular-nums">
                {total}
              </span>
              <span className="text-[10px] uppercase tracking-[0.08em] font-mono text-text-muted">
                assets
              </span>
            </div>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5">
            {rows.map((row) => (
              <li key={row.status} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: STATUS_COLORS[row.status] || STATUS_COLORS.retired }}
                />
                <span className="text-text-secondary flex-1 truncate">
                  {getStatusMeta("asset", row.status).label}
                </span>
                <span className="font-mono text-text-primary">{row.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
};

export const AllocationsByDepartmentBar = ({ data = [] }) => {
  const rows = data
    .map((row) => ({
      name: row.name,
      allocated: Number(row.allocated_assets) || 0,
    }))
    .filter((row) => row.name);
  const hasValues = rows.some((row) => row.allocated > 0);

  return (
    <Card className="h-full">
      <p className="eyebrow mb-4">Allocations by department</p>
      {!hasValues ? (
        <EmptyState
          illustration="generic"
          title="No data to chart yet"
          description="Allocate assets to departments to populate this chart."
          className="py-6"
        />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} stroke={GRID_COLOR} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: AXIS_COLOR, fontSize: 11, fontFamily: "IBM Plex Mono" }}
              axisLine={{ stroke: GRID_COLOR }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fill: AXIS_COLOR, fontSize: 11, fontFamily: "IBM Plex Mono" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(245, 158, 11, 0.08)" }}
              content={
                <ChartTooltip
                  labelFormatter={(item) => `${item.payload.name}: ${item.value} allocated`}
                />
              }
            />
            <Bar dataKey="allocated" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

// bookingHeatmap and assetsByCategory are intentionally left for the Reports page.
export default AssetStatusDonut;

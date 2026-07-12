import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PageHeader from "../../../components/common/PageHeader";
import EmptyState from "../../../components/common/EmptyState";
import Card from "../../../components/ui/Card";
import Tabs from "../../../components/ui/Tabs";
import Button from "../../../components/ui/Button";
import Skeleton from "../../../components/ui/Skeleton";
import { humanize } from "../../../utils/assetStatus";
import { formatDate } from "../../../utils/formatDate";
import UtilizationChart, {
  ChartTooltip,
  AXIS_TICK,
  GRID_STROKE,
  OTHER_COLOR,
} from "../components/UtilizationChart";
import MaintenanceFrequencyChart from "../components/MaintenanceFrequencyChart";
import MostUsedIdleList from "../components/MostUsedIdleList";
import DueForMaintenanceList from "../components/DueForMaintenanceList";
import ExportButton from "../components/ExportButton";
import {
  fetchAssetReport,
  fetchBookingReport,
  fetchMaintenanceReport,
  initialState as reportInitialState,
} from "../report.slice";

const TABS = [
  { value: "assets", label: "Assets" },
  { value: "bookings", label: "Bookings" },
  { value: "maintenance", label: "Maintenance" },
];

const today = () => new Date().toISOString().slice(0, 10);

const dateCol = (key, label) => ({
  key,
  label,
  format: (value) => formatDate(value, { withTime: true }),
});

const EXPORT_COLUMNS = {
  assets: [
    { key: "asset_tag", label: "Asset tag" },
    { key: "name", label: "Name" },
    { key: "status", label: "Status", format: humanize },
    { key: "condition", label: "Condition", format: humanize },
    { key: "category_name", label: "Category" },
    { key: "location_name", label: "Location" },
    { key: "department_name", label: "Department" },
    { key: "acquisition_date", label: "Acquisition date", format: (v) => formatDate(v) },
    { key: "acquisition_cost", label: "Acquisition cost" },
    dateCol("created_at", "Created at"),
  ],
  bookings: [
    { key: "asset_tag", label: "Asset tag" },
    { key: "asset_name", label: "Asset" },
    { key: "status", label: "Status", format: humanize },
    dateCol("starts_at", "Starts at"),
    dateCol("ends_at", "Ends at"),
    { key: "purpose", label: "Purpose" },
    { key: "booked_by_name", label: "Booked by" },
    { key: "department_name", label: "Department" },
    dateCol("created_at", "Created at"),
  ],
  maintenance: [
    { key: "asset_tag", label: "Asset tag" },
    { key: "asset_name", label: "Asset" },
    { key: "status", label: "Status", format: humanize },
    { key: "priority", label: "Priority", format: humanize },
    { key: "issue_description", label: "Issue" },
    { key: "resolution_notes", label: "Resolution notes" },
    { key: "estimated_cost", label: "Estimated cost" },
    { key: "actual_cost", label: "Actual cost" },
    { key: "category_name", label: "Category" },
    { key: "requested_by_name", label: "Requested by" },
    { key: "technician_name", label: "Technician" },
    dateCol("created_at", "Created at"),
    dateCol("resolved_at", "Resolved at"),
  ],
};

// SVG requires literal colors; these mirror the CSS status tokens.
const BOOKING_STATUS_COLORS = {
  requested: "#f59e0b",
  approved: "#1d4ed8",
  upcoming: "#6d28d9",
  ongoing: "#0f766e",
  completed: "#57534e",
  rejected: "#b91c1c",
  cancelled: OTHER_COLOR,
};

const ACTIVE_BOOKING_STATUSES = ["approved", "upcoming", "ongoing", "completed"];

const BookingsByStatusChart = ({ rows = [] }) => {
  const data = useMemo(() => {
    const counts = {};
    rows.forEach((row) => {
      counts[row.status] = (counts[row.status] || 0) + 1;
    });
    return Object.keys(BOOKING_STATUS_COLORS)
      .filter((status) => counts[status])
      .map((status) => ({
        status,
        name: humanize(status),
        count: counts[status],
        fill: BOOKING_STATUS_COLORS[status],
      }));
  }, [rows]);

  return (
    <div>
      <p className="eyebrow mb-3">Bookings by status</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID_STROKE} />
          <XAxis
            dataKey="name"
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
          <Bar dataKey="count" name="Bookings" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((entry) => (
              <Cell key={entry.status} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const BookedHoursByDepartment = ({ rows = [] }) => {
  const departments = useMemo(() => {
    const hours = {};
    rows
      .filter((row) => ACTIVE_BOOKING_STATUSES.includes(row.status))
      .forEach((row) => {
        const start = new Date(row.starts_at);
        const end = new Date(row.ends_at);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;
        const name = row.department_name || "No department";
        hours[name] =
          (hours[name] || 0) + Math.max(0, end.getTime() - start.getTime()) / 3600000;
      });
    return Object.entries(hours)
      .map(([name, value]) => ({ name, hours: Math.round(value * 10) / 10 }))
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5);
  }, [rows]);

  return (
    <div>
      <p className="eyebrow mb-3">Booked hours by department</p>
      {departments.length === 0 ? (
        <p className="text-sm text-text-muted">No active booked hours recorded yet.</p>
      ) : (
        <ul className="divide-y divide-border">
          {departments.map((entry) => (
            <li key={entry.name} className="flex items-center gap-2 py-2">
              <p className="text-sm text-text-primary truncate flex-1 min-w-0">
                {entry.name}
              </p>
              <span className="font-mono text-[13px] text-text-primary shrink-0">
                {entry.hours} hrs
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ChartCardSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-4 w-40" />
    <Skeleton className="h-64 w-full" />
  </div>
);

const ListCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-28" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
);

const ErrorBanner = ({ message, onRetry }) => (
  <div className="flex items-center justify-between gap-3 bg-danger-bg border border-danger-border text-danger text-sm rounded-default px-4 py-3">
    <span>{message}</span>
    {onRetry && (
      <Button size="sm" variant="secondary" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

export const ReportsPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("assets");

  const { assets, bookings, maintenance } = useSelector(
    (state) => state.report || reportInitialState
  );

  // Lazy fetch per tab. The Assets tab also needs the bookings report to
  // compute booked hours for the most used / idle list.
  useEffect(() => {
    if (activeTab === "assets") {
      if (!assets.loaded && !assets.loading) dispatch(fetchAssetReport());
      if (!bookings.loaded && !bookings.loading) dispatch(fetchBookingReport());
    }
    if (activeTab === "bookings" && !bookings.loaded && !bookings.loading) {
      dispatch(fetchBookingReport());
    }
    if (activeTab === "maintenance" && !maintenance.loaded && !maintenance.loading) {
      dispatch(fetchMaintenanceReport());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, dispatch]);

  const activeBucket =
    activeTab === "assets" ? assets : activeTab === "bookings" ? bookings : maintenance;

  const exportProps = {
    rows: activeBucket.rows,
    columns: EXPORT_COLUMNS[activeTab],
    filename: `assetflow-${activeTab}-${today()}.csv`,
    loading: activeBucket.loading,
  };

  const noChartData = (
    <EmptyState
      illustration="generic"
      title="No data to chart yet"
      description="Once records exist for this area, charts and lists build themselves from the live report."
    />
  );

  const renderAssetsTab = () => (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        {assets.loading ? (
          <ChartCardSkeleton />
        ) : assets.error ? (
          <ErrorBanner
            message={assets.error}
            onRetry={() => dispatch(fetchAssetReport())}
          />
        ) : assets.rows.length === 0 ? (
          noChartData
        ) : (
          <UtilizationChart rows={assets.rows} />
        )}
      </Card>
      <Card>
        {assets.loading || bookings.loading ? (
          <ListCardSkeleton />
        ) : bookings.error ? (
          <ErrorBanner
            message={bookings.error}
            onRetry={() => dispatch(fetchBookingReport())}
          />
        ) : assets.rows.length === 0 && bookings.rows.length === 0 ? (
          noChartData
        ) : (
          <MostUsedIdleList assets={assets.rows} bookings={bookings.rows} />
        )}
      </Card>
    </div>
  );

  const renderBookingsTab = () => (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        {bookings.loading ? (
          <ChartCardSkeleton />
        ) : bookings.error ? (
          <ErrorBanner
            message={bookings.error}
            onRetry={() => dispatch(fetchBookingReport())}
          />
        ) : bookings.rows.length === 0 ? (
          noChartData
        ) : (
          <BookingsByStatusChart rows={bookings.rows} />
        )}
      </Card>
      <Card>
        {bookings.loading ? (
          <ListCardSkeleton />
        ) : bookings.error ? (
          <ErrorBanner
            message={bookings.error}
            onRetry={() => dispatch(fetchBookingReport())}
          />
        ) : bookings.rows.length === 0 ? (
          noChartData
        ) : (
          <BookedHoursByDepartment rows={bookings.rows} />
        )}
      </Card>
    </div>
  );

  const renderMaintenanceTab = () => (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        {maintenance.loading ? (
          <ChartCardSkeleton />
        ) : maintenance.error ? (
          <ErrorBanner
            message={maintenance.error}
            onRetry={() => dispatch(fetchMaintenanceReport())}
          />
        ) : maintenance.rows.length === 0 ? (
          noChartData
        ) : (
          <MaintenanceFrequencyChart rows={maintenance.rows} />
        )}
      </Card>
      <Card>
        {maintenance.loading ? (
          <ListCardSkeleton />
        ) : maintenance.error ? (
          <ErrorBanner
            message={maintenance.error}
            onRetry={() => dispatch(fetchMaintenanceReport())}
          />
        ) : maintenance.rows.length === 0 ? (
          noChartData
        ) : (
          <>
            <p className="eyebrow mb-3">Due for maintenance</p>
            <DueForMaintenanceList rows={maintenance.rows} />
          </>
        )}
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Utilization, booking, and maintenance insight built from live records."
        actions={<ExportButton {...exportProps} />}
      />

      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
      />

      {activeTab === "assets" && renderAssetsTab()}
      {activeTab === "bookings" && renderBookingsTab()}
      {activeTab === "maintenance" && renderMaintenanceTab()}
    </div>
  );
};

export default ReportsPage;

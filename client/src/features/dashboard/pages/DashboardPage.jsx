import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PackageCheck,
  PackageOpen,
  Wrench,
  Calendar,
  ArrowLeftRight,
  Undo2,
} from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import EmptyState from "../../../components/common/EmptyState";
import Button from "../../../components/ui/Button";
import Skeleton from "../../../components/ui/Skeleton";
import KpiCard from "../components/KpiCard";
import OverdueAlert from "../components/OverdueAlert";
import QuickActions from "../components/QuickActions";
import RecentActivity from "../components/RecentActivity";
import { AssetStatusDonut, AllocationsByDepartmentBar } from "../components/DashboardCharts";
import { fetchDashboardSummary } from "../dashboard.slice";

const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-24" />
      ))}
    </div>
    <Skeleton className="h-9 w-96 max-w-full" />
    <div className="grid lg:grid-cols-5 gap-4">
      <Skeleton className="h-64 lg:col-span-2" />
      <Skeleton className="h-64 lg:col-span-3" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-5" />
      ))}
    </div>
  </div>
);

export const DashboardPage = () => {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchDashboardSummary({ limit: 10 }));
    }
  }, [status, dispatch]);

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const alerts = data?.alerts || {};

  const kpiCards = [
    { label: "Available", value: kpis.assetsAvailable, icon: PackageCheck, accent: "available" },
    { label: "Allocated", value: kpis.assetsAllocated, icon: PackageOpen, accent: "allocated" },
    { label: "Under maintenance", value: kpis.assetsUnderMaintenance, icon: Wrench, accent: "maintenance", to: "/maintenance" },
    { label: "Active bookings", value: kpis.activeBookings, icon: Calendar, accent: "reserved", to: "/resource-booking" },
    { label: "Pending transfers", value: kpis.pendingTransfers, icon: ArrowLeftRight, accent: "default", to: "/allocation-transfer" },
    { label: "Upcoming returns", value: kpis.upcomingReturns, icon: Undo2, accent: "default" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Monitor your organization's assets, bookings, and maintenance at a glance."
      />

      {(status === "loading" || status === "idle") && <DashboardSkeleton />}

      {status === "failed" && (
        <EmptyState
          illustration="generic"
          title="Dashboard could not load"
          description={error || "The server did not respond. Check that the API is running."}
          action={
            <Button
              variant="secondary"
              onClick={() => dispatch(fetchDashboardSummary({ limit: 10 }))}
            >
              Try again
            </Button>
          }
        />
      )}

      {status === "succeeded" && (
        <>
          <OverdueAlert
            count={Number(kpis.overdueReturns) || 0}
            items={alerts.overdueReturns || []}
          />

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpiCards.map((card) => (
              <KpiCard key={card.label} {...card} />
            ))}
          </div>

          <QuickActions />

          <div className="grid lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <AssetStatusDonut data={charts.assetsByStatus || []} />
            </div>
            <div className="lg:col-span-3">
              <AllocationsByDepartmentBar data={charts.allocationsByDepartment || []} />
            </div>
          </div>

          <RecentActivity
            bookings={data?.recentBookings || []}
            transfers={data?.recentTransfers || []}
            maintenance={data?.recentMaintenance || []}
          />
        </>
      )}
    </div>
  );
};

export default DashboardPage;

import React, { useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import { getDashboardSummary } from "../../../../api/dashboard.api";
import { useRole } from "../../../hooks/useRole";

export const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isEmployee, isDepartmentHead, profile } = useRole();

  useEffect(() => {
    let mounted = true;

    const fetchSummary = async () => {
      try {
        const params = {};
        if (isEmployee) {
          params.scope = "personal";
          params.user_id = profile?.id;
        } else if (isDepartmentHead) {
          params.scope = "department";
          params.department_id = profile?.department_id || profile?.departmentId;
        } else {
          params.scope = "organization";
        }

        // TODO(rbac): Integrate dynamic backend query scoping when the dashboard slice/service supports scoped summaries.
        const response = await getDashboardSummary(params);
        if (mounted) {
          setData(response.data);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to load dashboard summary:", err);
          setError(err.message || "Failed to load dashboard data");
          setLoading(false);
        }
      }
    };

    fetchSummary();

    return () => {
      mounted = false;
    };
  }, [isEmployee, isDepartmentHead, profile]);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[rgba(224,100,90,0.06)] border border-[rgba(224,100,90,0.2)] text-danger px-4 py-3 rounded-default text-xs font-semibold">
        Error loading dashboard metrics: {error}
      </div>
    );
  }

  const kpis = data?.kpis || {};
  
  const cards = [
    { label: "Available Assets", val: kpis.assetsAvailable ?? 0 },
    { label: "Allocated Assets", val: kpis.assetsAllocated ?? 0 },
    { label: "Under Maintenance", val: kpis.assetsUnderMaintenance ?? 0 },
    { label: "Active Bookings", val: kpis.activeBookings ?? 0 },
    { label: "Pending Transfers", val: kpis.pendingTransfers ?? 0 },
    { label: "Upcoming Returns", val: kpis.upcomingReturns ?? 0 },
  ];

  const getRecentActivities = () => {
    const activities = [];

    if (data?.recentBookings) {
      data.recentBookings.forEach((b) => {
        activities.push({
          id: `booking-${b.id}`,
          date: new Date(b.created_at || b.starts_at),
          content: (
            <>
              Resource <span className="text-text-primary font-semibold">{b.asset_name} ({b.asset_tag})</span> - booking {b.status} by {b.booked_by_name || "Unknown"}
            </>
          ),
        });
      });
    }

    if (data?.recentTransfers) {
      data.recentTransfers.forEach((t) => {
        activities.push({
          id: `transfer-${t.id}`,
          date: new Date(t.created_at),
          content: (
            <>
              Asset <span className="text-text-primary font-semibold">{t.asset_name} ({t.asset_tag})</span> - transfer requested by {t.requested_by_name || "Unknown"} to {t.target_user_name || t.target_department_name || "Unknown"}
            </>
          ),
        });
      });
    }

    if (data?.recentMaintenance) {
      data.recentMaintenance.forEach((m) => {
        activities.push({
          id: `maintenance-${m.id}`,
          date: new Date(m.created_at),
          content: (
            <>
              Asset <span className="text-text-primary font-semibold">{m.asset_name} ({m.asset_tag})</span> - maintenance {m.status} - requested by {m.requested_by_name || "Unknown"}
            </>
          ),
        });
      });
    }

    return activities.sort((a, b) => b.date - a.date).slice(0, 5);
  };

  const recentActivities = getRecentActivities();
  const overdueCount = kpis.overdueReturns || 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary uppercase select-none">
          Dashboard
        </h1>
        <p className="text-sm text-text-secondary select-none">
          Monitor your organization's assets, bookings, and active maintenance logs.
        </p>
      </div>

      {/* Grid KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <Card key={i} className="p-5 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary select-none">
              {c.label}
            </span>
            <span className="text-3xl font-extrabold text-text-primary mt-3 select-none">
              {c.val}
            </span>
          </Card>
        ))}
      </div>

      {/* Warning Notice Banner */}
      {overdueCount > 0 && (
        <div className="bg-[rgba(224,100,90,0.06)] border border-[rgba(224,100,90,0.2)] text-danger px-4 py-3.5 rounded-default text-xs font-semibold flex items-center justify-between">
          <span>{overdueCount} asset{overdueCount !== 1 ? "s" : ""} overdue for return - flagged for follow-up</span>
        </div>
      )}

      {/* Quick Action Button Row */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="secondary"
          className="px-5 py-2 font-bold uppercase tracking-wider text-[11px] rounded-full border border-border text-text-secondary hover:text-text-primary"
          onClick={() => window.location.href = "/assets"}
        >
          + register asset
        </Button>
        <Button
          variant="secondary"
          className="px-5 py-2 font-bold uppercase tracking-wider text-[11px] rounded-full border border-border text-text-secondary hover:text-text-primary"
          onClick={() => window.location.href = "/resource-booking"}
        >
          Book resource
        </Button>
        <Button
          variant="secondary"
          className="px-5 py-2 font-bold uppercase tracking-wider text-[11px] rounded-full border border-border text-text-secondary hover:text-text-primary"
          onClick={() => window.location.href = "/allocation-transfer"}
        >
          Raise requests
        </Button>
      </div>

      {/* Recent Activity Section */}
      <Card className="p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 select-none">
          Recent Activity
        </h3>
        {recentActivities.length > 0 ? (
          <ul className="space-y-3.5 text-xs text-text-secondary leading-relaxed">
            {recentActivities.map((act) => (
              <li key={act.id} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-1.5" />
                <p>{act.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-text-secondary select-none">
            No recent activity recorded.
          </p>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;

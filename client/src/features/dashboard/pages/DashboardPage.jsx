import React from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

export const DashboardPage = () => {
  const cards = [
    { label: "Available", val: "128" },
    { label: "Allocated", val: "76" },
    { label: "Available", val: "4" },
    { label: "Active Bookings", val: "9" },
    { label: "Pending Transfers", val: "3" },
    { label: "Upcoming returns", val: "12" },
  ];

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
      <div className="bg-[rgba(224,100,90,0.06)] border border-[rgba(224,100,90,0.2)] text-danger px-4 py-3.5 rounded-default text-xs font-semibold flex items-center justify-between">
        <span>3 assets overdue for return - flagged for follow-up</span>
      </div>

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
        <ul className="space-y-3.5 text-xs text-text-secondary leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-1.5" />
            <p>
              Laptop <span className="text-text-primary font-semibold">AF-0114</span> - allocated to Priya Shah - Engineering
            </p>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-1.5" />
            <p>
              Room <span className="text-text-primary font-semibold">B2</span> - booking confirmed - 2:00 to 3:00 PM
            </p>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-1.5" />
            <p>
              Projector <span className="text-text-primary font-semibold">AF-0062</span> - maintenance resolved
            </p>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default DashboardPage;

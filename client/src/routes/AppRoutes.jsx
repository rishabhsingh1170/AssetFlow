import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import RoleRoute from "./RoleRoute";
import OrganizationSetupPage from "../features/organization/pages/OrganizationSetupPage";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

// Simple placeholder page for demo navigation
const PagePlaceholder = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-[70vh]">
    <Card className="text-center max-w-md p-8">
      <h2 className="text-xl font-bold mb-3 text-text-primary uppercase tracking-wide">
        {title} Screen
      </h2>
      <p className="text-sm text-text-secondary mb-6">
        This screen is being built in parallel by your teammates. You are currently viewed under the Admin Workspace.
      </p>
      <Button variant="secondary" onClick={() => window.location.href = "/organization-setup"}>
        Go to Org Setup
      </Button>
    </Card>
  </div>
);

// Mock Login Screen matching Screen 1 wireframe
const LoginPage = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-surface-0 px-4">
    <Card className="w-full max-w-sm border border-border bg-surface-1 p-8 shadow-2xl rounded-card text-center">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-widest mb-4">
          AssetFlow – login
        </h2>
        <div className="w-12 h-12 rounded-full border border-border-strong flex items-center justify-center bg-surface-2 text-accent-400 font-bold text-sm tracking-wider">
          AF
        </div>
      </div>
      <div className="space-y-4 text-left">
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Email
          </label>
          <input
            type="email"
            value="admin@assetflow.com"
            disabled
            className="w-full px-3 py-2 bg-surface-2 border border-border rounded-default text-text-primary text-sm focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            value="••••••••••••"
            disabled
            className="w-full px-3 py-2 bg-surface-2 border border-border rounded-default text-text-primary text-sm focus:outline-none"
          />
        </div>
        <div className="text-right">
          <span className="text-xs text-text-secondary hover:text-text-primary cursor-pointer transition-colors">
            Forgot password
          </span>
        </div>
      </div>
      
      <hr className="border-border my-6" />

      <div className="text-left mb-6">
        <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
          New here?
        </span>
        <div className="bg-surface-2 border border-border rounded-default p-3 text-xs text-text-secondary leading-relaxed">
          Sign up creates an employee account <br />
          admin roles assigned later
        </div>
      </div>

      <Button
        variant="primary"
        className="w-full font-bold uppercase tracking-wider"
        onClick={() => window.location.href = "/dashboard"}
      >
        Sign In
      </Button>
    </Card>
  </div>
);

// Mock Dashboard matching Screen 2 wireframe
const DashboardPage = () => {
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          TODAY'S OVERVIEW
        </h1>
        <p className="text-sm text-text-secondary">
          Monitor your organization's assets and transfers.
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <Card key={i} className="p-5 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              {c.label}
            </span>
            <span className="text-3xl font-extrabold text-text-primary mt-3">
              {c.val}
            </span>
          </Card>
        ))}
      </div>

      {/* Warning Notice Banner */}
      <div className="bg-[rgba(224,100,90,0.08)] border border-[rgba(224,100,90,0.25)] text-danger px-4 py-3 rounded-default text-xs font-semibold flex items-center justify-between">
        <span>3 assets overdue for return - flagged for follow-up</span>
      </div>

      {/* Button Row */}
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" className="px-5 font-semibold text-xs uppercase tracking-wider" onClick={() => window.location.href = "/assets"}>
          + register asset
        </Button>
        <Button variant="secondary" className="px-5 font-semibold text-xs uppercase tracking-wider" onClick={() => window.location.href = "/resource-booking"}>
          Book resource
        </Button>
        <Button variant="secondary" className="px-5 font-semibold text-xs uppercase tracking-wider" onClick={() => window.location.href = "/allocation-transfer"}>
          Raise requests
        </Button>
      </div>

      {/* Recent Activity Section */}
      <Card className="p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">
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

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth Pathway */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Dashboard Pathway */}
      <Route element={<DashboardLayout />}>
        {/* Default route redirects to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Organization setup page, admin restricted */}
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/organization-setup" element={<OrganizationSetupPage />} />
        </Route>

        {/* Placeholders for sidebar links */}
        <Route path="/assets" element={<PagePlaceholder title="Assets" />} />
        <Route path="/allocation-transfer" element={<PagePlaceholder title="Allocation & Transfer" />} />
        <Route path="/resource-booking" element={<PagePlaceholder title="Resource Booking" />} />
        <Route path="/maintenance" element={<PagePlaceholder title="Maintenance" />} />
        <Route path="/audit" element={<PagePlaceholder title="Audit" />} />
        <Route path="/reports" element={<PagePlaceholder title="Reports" />} />
        <Route path="/notifications" element={<PagePlaceholder title="Notifications" />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;

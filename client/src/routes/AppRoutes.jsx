import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import RoleRoute from "./RoleRoute";
import OrganizationSetupPage from "../features/organization/pages/OrganizationSetupPage";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
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

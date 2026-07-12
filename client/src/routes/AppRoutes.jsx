import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import AuthLayout from "../layouts/AuthLayout";
import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import OrganizationSetupPage from "../features/organization/pages/OrganizationSetupPage";
import LoginPage from "../features/auth/pages/LoginPage";
import DashboardPage from "../features/dashboard/pages/DashboardPage";
import Skeleton from "../components/ui/Skeleton";

// Feature pages are code-split; Reports alone pulls in recharts.
const AssetDirectoryPage = React.lazy(() => import("../features/assets/pages/AssetDirectoryPage"));
const AllocationTransferPage = React.lazy(() => import("../features/allocation/pages/AllocationTransferPage"));
const ResourceBookingPage = React.lazy(() => import("../features/booking/pages/ResourceBookingPage"));
const MaintenancePage = React.lazy(() => import("../features/maintenance/pages/MaintenancePage"));
const AuditPage = React.lazy(() => import("../features/audit/pages/AuditPage"));
const ReportsPage = React.lazy(() => import("../features/reports/pages/ReportsPage"));
const NotificationsPage = React.lazy(() => import("../features/notifications/pages/NotificationsPage"));

const PageFallback = () => (
  <div className="space-y-6">
    <Skeleton className="h-9 w-64" />
    <Skeleton className="h-10 w-full max-w-2xl" />
    <Skeleton className="h-96 w-full" />
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth pathway */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected dashboard pathway */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Admin-only organization setup */}
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/organization-setup" element={<OrganizationSetupPage />} />
          </Route>

          {/* Feature pages (lazy). Keep role arrays in sync with constants/navConfig.js */}
          <Route
            path="/assets"
            element={
              <Suspense fallback={<PageFallback />}>
                <AssetDirectoryPage />
              </Suspense>
            }
          />
          <Route
            path="/allocation-transfer"
            element={
              <Suspense fallback={<PageFallback />}>
                <AllocationTransferPage />
              </Suspense>
            }
          />
          <Route
            path="/resource-booking"
            element={
              <Suspense fallback={<PageFallback />}>
                <ResourceBookingPage />
              </Suspense>
            }
          />
          <Route
            path="/maintenance"
            element={
              <Suspense fallback={<PageFallback />}>
                <MaintenancePage />
              </Suspense>
            }
          />
          <Route element={<RoleRoute allowedRoles={["admin", "asset_manager"]} />}>
            <Route
              path="/audit"
              element={
                <Suspense fallback={<PageFallback />}>
                  <AuditPage />
                </Suspense>
              }
            />
          </Route>
          <Route
            element={<RoleRoute allowedRoles={["admin", "asset_manager", "department_head"]} />}
          >
            <Route
              path="/reports"
              element={
                <Suspense fallback={<PageFallback />}>
                  <ReportsPage />
                </Suspense>
              }
            />
          </Route>
          <Route
            path="/notifications"
            element={
              <Suspense fallback={<PageFallback />}>
                <NotificationsPage />
              </Suspense>
            }
          />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;

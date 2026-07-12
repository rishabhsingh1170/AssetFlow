import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface-0 text-text-primary">
      {/* Sidebar navigation */}
      <Sidebar />

      {/* Main scrolling workspace content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-7xl mx-auto w-full h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

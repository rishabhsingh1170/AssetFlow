import { configureStore } from "@reduxjs/toolkit";
import departmentReducer from "./features/organization/department.slice";
import categoryReducer from "./features/organization/category.slice";
import employeeReducer from "./features/organization/employee.slice";
import authReducer from "./features/auth/auth.slice";
import dashboardReducer from "./features/dashboard/dashboard.slice";
import assetsReducer from "./features/assets/assets.slice";
import allocationReducer from "./features/allocation/allocation.slice";
import bookingReducer from "./features/booking/booking.slice";
import maintenanceReducer from "./features/maintenance/maintenance.slice";
import reportReducer from "./features/reports/report.slice";
import auditReducer from "./features/audit/audit.slice";
import notificationReducer from "./features/notifications/notification.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    department: departmentReducer,
    category: categoryReducer,
    employee: employeeReducer,
    dashboard: dashboardReducer,
    assets: assetsReducer,
    allocation: allocationReducer,
    booking: bookingReducer,
    maintenance: maintenanceReducer,
    report: reportReducer,
    audit: auditReducer,
    notifications: notificationReducer,
  },
});

export default store;

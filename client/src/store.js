import { configureStore } from "@reduxjs/toolkit";
import departmentReducer from "./features/organization/department.slice";
import categoryReducer from "./features/organization/category.slice";
import employeeReducer from "./features/organization/employee.slice";
import authReducer from "./features/auth/auth.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    department: departmentReducer,
    category: categoryReducer,
    employee: employeeReducer,
  },
});

export default store;

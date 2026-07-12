import { configureStore } from "@reduxjs/toolkit";
import departmentReducer from "../features/organization/department.slice";
import categoryReducer from "../features/organization/category.slice";
import employeeReducer from "../features/organization/employee.slice";

export const store = configureStore({
  reducer: {
    department: departmentReducer,
    category: categoryReducer,
    employee: employeeReducer,
  },
});

export default store;

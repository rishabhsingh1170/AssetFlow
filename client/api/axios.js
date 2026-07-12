import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to inject Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to easily toggle mocking on and off
const ENABLE_MOCKS = true;

// Mock databases
let departments = [
  { id: 1, name: "Engineering", headId: 2, headName: "Aditi Rao", parentDepartmentId: null, parentDepartmentName: null, status: "Active" },
  { id: 2, name: "Facilities", headId: 3, headName: "Rohan Mehta", parentDepartmentId: null, parentDepartmentName: null, status: "Active" },
  { id: 3, name: "Field Ops (East)", headId: 4, headName: "Sana Iqbal", parentDepartmentId: 4, parentDepartmentName: "Field Ops", status: "Inactive" },
  { id: 4, name: "Field Ops", headId: null, headName: null, parentDepartmentId: null, parentDepartmentName: null, status: "Active" },
];

let categories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Furniture" },
  { id: 3, name: "Vehicles" },
  { id: 4, name: "Office Equipment" },
];

let users = [
  { id: 1, name: "Admin User", email: "admin@assetflow.com", departmentId: 1, departmentName: "Engineering", role: "admin", status: "Active" },
  { id: 2, name: "Aditi Rao", email: "aditi.rao@assetflow.com", departmentId: 1, departmentName: "Engineering", role: "department_head", status: "Active" },
  { id: 3, name: "Rohan Mehta", email: "rohan.mehta@assetflow.com", departmentId: 2, departmentName: "Facilities", role: "department_head", status: "Active" },
  { id: 4, name: "Sana Iqbal", email: "sana.iqbal@assetflow.com", departmentId: 3, departmentName: "Field Ops (East)", role: "employee", status: "Inactive" },
  { id: 5, name: "Priya Shah", email: "priya.shah@assetflow.com", departmentId: 1, departmentName: "Engineering", role: "employee", status: "Active" },
  { id: 6, name: "Arjun Nair", email: "arjun.nair@assetflow.com", departmentId: 1, departmentName: "Engineering", role: "asset_manager", status: "Active" },
];

if (ENABLE_MOCKS) {
  api.interceptors.request.use(
    async (config) => {
      // Simulate network latency (300ms)
      await new Promise((resolve) => setTimeout(resolve, 300));

      const url = config.url || "";
      const method = config.method ? config.method.toLowerCase() : "get";
      const data = config.data ? JSON.parse(JSON.stringify(config.data)) : null;

      // Helper to return a mocked Axios response object wrapped in a rejected Promise
      // which we will catch and resolve in the response interceptor.
      const mockResponse = (status, responseData) => {
        return Promise.reject({
          isMock: true,
          response: {
            status,
            data: responseData,
            statusText: status >= 200 && status < 300 ? "OK" : "Error",
            headers: {},
            config,
          },
        });
      };

      // --- DEPARTMENTS INTERCEPTORS ---
      if (url === "/departments" && method === "get") {
        return mockResponse(200, departments);
      }
      if (url.startsWith("/departments/") && method === "get") {
        const id = parseInt(url.split("/").pop());
        const dept = departments.find((d) => d.id === id);
        return dept
          ? mockResponse(200, dept)
          : mockResponse(404, { message: "Department not found" });
      }
      if (url === "/departments" && method === "post") {
        const newDept = {
          id: departments.length > 0 ? Math.max(...departments.map((d) => d.id)) + 1 : 1,
          name: data.name,
          headId: data.headId ? parseInt(data.headId) : null,
          headName: data.headId ? users.find((u) => u.id === parseInt(data.headId))?.name || null : null,
          parentDepartmentId: data.parentDepartmentId ? parseInt(data.parentDepartmentId) : null,
          parentDepartmentName: data.parentDepartmentId
            ? departments.find((d) => d.id === parseInt(data.parentDepartmentId))?.name || null
            : null,
          status: data.status || "Active",
        };
        
        // Side-effect: update user's role to department_head if headId is assigned
        if (newDept.headId) {
          const userIdx = users.findIndex(u => u.id === newDept.headId);
          if (userIdx !== -1 && users[userIdx].role !== "admin") {
            users[userIdx].role = "department_head";
            users[userIdx].departmentId = newDept.id;
            users[userIdx].departmentName = newDept.name;
          }
        }
        
        departments.push(newDept);
        return mockResponse(201, newDept);
      }
      if (url.startsWith("/departments/") && method === "put") {
        const id = parseInt(url.split("/").pop());
        const idx = departments.findIndex((d) => d.id === id);
        if (idx !== -1) {
          departments[idx] = {
            ...departments[idx],
            name: data.name,
            headId: data.headId ? parseInt(data.headId) : null,
            headName: data.headId ? users.find((u) => u.id === parseInt(data.headId))?.name || null : null,
            parentDepartmentId: data.parentDepartmentId ? parseInt(data.parentDepartmentId) : null,
            parentDepartmentName: data.parentDepartmentId
              ? departments.find((d) => d.id === parseInt(data.parentDepartmentId))?.name || null
              : null,
            status: data.status || "Active",
          };
          
          // Side-effect: update user's role to department_head if headId is assigned
          if (departments[idx].headId) {
            const userIdx = users.findIndex(u => u.id === departments[idx].headId);
            if (userIdx !== -1 && users[userIdx].role !== "admin") {
              users[userIdx].role = "department_head";
              users[userIdx].departmentId = id;
              users[userIdx].departmentName = departments[idx].name;
            }
          }
          
          return mockResponse(200, departments[idx]);
        }
        return mockResponse(404, { message: "Department not found" });
      }
      if (url.startsWith("/departments/") && method === "delete") {
        const id = parseInt(url.split("/").pop());
        departments = departments.filter((d) => d.id !== id);
        return mockResponse(200, { success: true });
      }

      // --- CATEGORIES INTERCEPTORS ---
      if (url === "/categories" && method === "get") {
        return mockResponse(200, categories);
      }
      if (url.startsWith("/categories/") && method === "get") {
        const id = parseInt(url.split("/").pop());
        const cat = categories.find((c) => c.id === id);
        return cat
          ? mockResponse(200, cat)
          : mockResponse(404, { message: "Category not found" });
      }
      if (url === "/categories" && method === "post") {
        const newCat = {
          id: categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1,
          name: data.name,
        };
        categories.push(newCat);
        return mockResponse(201, newCat);
      }
      if (url.startsWith("/categories/") && method === "put") {
        const id = parseInt(url.split("/").pop());
        const idx = categories.findIndex((c) => c.id === id);
        if (idx !== -1) {
          categories[idx] = {
            ...categories[idx],
            name: data.name,
          };
          return mockResponse(200, categories[idx]);
        }
        return mockResponse(404, { message: "Category not found" });
      }
      if (url.startsWith("/categories/") && method === "delete") {
        const id = parseInt(url.split("/").pop());
        categories = categories.filter((c) => c.id !== id);
        return mockResponse(200, { success: true });
      }

      // --- USERS INTERCEPTORS ---
      if (url === "/users" && method === "get") {
        return mockResponse(200, users);
      }
      if (url.startsWith("/users/") && method === "get") {
        const id = parseInt(url.split("/").pop());
        const user = users.find((u) => u.id === id);
        return user
          ? mockResponse(200, user)
          : mockResponse(404, { message: "User not found" });
      }
      if (url === "/users" && method === "post") {
        const newUser = {
          id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
          name: data.name,
          email: data.email,
          departmentId: data.departmentId ? parseInt(data.departmentId) : null,
          departmentName: data.departmentId
            ? departments.find((d) => d.id === parseInt(data.departmentId))?.name || null
            : null,
          role: data.role || "employee",
          status: data.status || "Active",
        };
        users.push(newUser);
        return mockResponse(201, newUser);
      }
      if (url.startsWith("/users/") && method === "put") {
        const id = parseInt(url.split("/").pop());
        const idx = users.findIndex((u) => u.id === id);
        if (idx !== -1) {
          users[idx] = {
            ...users[idx],
            ...data,
            departmentId: data.departmentId !== undefined ? (data.departmentId ? parseInt(data.departmentId) : null) : users[idx].departmentId,
            departmentName: data.departmentId !== undefined ? (data.departmentId ? departments.find((d) => d.id === parseInt(data.departmentId))?.name || null : null) : users[idx].departmentName,
          };
          return mockResponse(200, users[idx]);
        }
        return mockResponse(404, { message: "User not found" });
      }
      if (url.startsWith("/users/") && method === "delete") {
        const id = parseInt(url.split("/").pop());
        users = users.filter((u) => u.id !== id);
        return mockResponse(200, { success: true });
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error && error.isMock) {
        return Promise.resolve(error.response);
      }
      return Promise.reject(error);
    }
  );
}

export default api;

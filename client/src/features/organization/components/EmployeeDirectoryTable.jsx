import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { Search, UserCog } from "lucide-react";

export const EmployeeDirectoryTable = ({ employees = [], onPromote }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filtering based on search queries
  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.departmentName && emp.departmentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Map roles to corresponding Badge variants
  const getRoleVariant = (role) => {
    switch (role) {
      case "admin":
        return "admin";
      case "asset_manager":
        return "asset_manager";
      case "department_head":
        return "department_head";
      default:
        return "employee";
    }
  };

  // Human readable role labels
  const getRoleLabel = (role) => {
    return role.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Search Filter Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-2 text-text-primary placeholder-text-muted border rounded-default border-border text-xs transition-all duration-200 focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400"
          />
        </div>
        <span className="text-xs text-text-muted">
          Showing {filteredEmployees.length} of {employees.length} employees
        </span>
      </div>

      {/* Main Directory Table */}
      <div className="border border-border rounded-card overflow-hidden bg-surface-1">
        {filteredEmployees.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-text-secondary">No employees found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right w-36">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-semibold text-text-primary">
                    {emp.name}
                  </TableCell>
                  <TableCell className="text-text-secondary font-mono text-xs">
                    {emp.email}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {emp.departmentName || <span className="text-text-muted">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleVariant(emp.role)}>
                      {getRoleLabel(emp.role)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={emp.status === "Active" ? "active" : "inactive"}>
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {/* Role Promotion Trigger Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onPromote(emp)}
                      className="px-3 py-1 font-bold uppercase tracking-wider text-[10px] rounded-full border border-border hover:border-accent-400/40 hover:bg-[rgba(232,163,61,0.05)] text-text-secondary hover:text-accent-400 gap-1.5 focus:ring-accent-400 transition-all duration-200"
                    >
                      <UserCog size={12} />
                      <span>Role</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default EmployeeDirectoryTable;

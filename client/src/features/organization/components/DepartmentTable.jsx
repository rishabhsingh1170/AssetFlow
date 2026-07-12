import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../components/ui/Table";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import { Edit2, Trash2, Search, AlertCircle } from "lucide-react";

export const DepartmentTable = ({ departments = [], onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filtering based on search query
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (dept.headName && dept.headName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (dept.parentDepartmentName &&
      dept.parentDepartmentName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-2 text-text-primary placeholder-text-muted border rounded-default border-border text-xs transition-all duration-200 focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400"
          />
        </div>
        <span className="text-xs text-text-muted">
          Showing {filteredDepartments.length} of {departments.length} departments
        </span>
      </div>

      {/* Main Table */}
      <div className="border border-border rounded-card overflow-hidden bg-surface-1">
        {filteredDepartments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-text-secondary">No departments found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead>Department</TableHead>
                <TableHead>Head</TableHead>
                <TableHead>Parent Dept</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-semibold text-text-primary">
                    {dept.name}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {dept.headName || <span className="text-text-muted">—</span>}
                  </TableCell>
                  <TableCell className="text-text-secondary">
                    {dept.parentDepartmentName || <span className="text-text-muted">—</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={dept.status === "Active" ? "active" : "inactive"}>
                      {dept.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(dept)}
                        className="p-1.5 rounded-default text-text-secondary hover:text-accent-400 hover:bg-surface-2 transition-colors cursor-pointer"
                        title="Edit Department"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(dept.id)}
                        className="p-1.5 rounded-default text-text-secondary hover:text-danger hover:bg-surface-2 transition-colors cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Warning Notice Caption from Wireframe */}
      <div className="flex items-start gap-2.5 bg-[rgba(232,163,61,0.06)] border border-[rgba(232,163,61,0.2)] text-warning p-4 rounded-default">
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        <span className="text-xs font-medium leading-relaxed">
          Editing a department here also drives the picklist in Screen 4 & 5
        </span>
      </div>
    </div>
  );
};

export default DepartmentTable;

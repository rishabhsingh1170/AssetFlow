import React, { useState } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../../components/ui/Table";
import { Edit2, Trash2, Search } from "lucide-react";

export const CategoryTable = ({ categories = [], onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filtering based on search query
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-2 text-text-primary placeholder-text-muted border rounded-default border-border text-xs transition-all duration-200 focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400"
          />
        </div>
        <span className="text-xs text-text-muted">
          Showing {filteredCategories.length} of {categories.length} categories
        </span>
      </div>

      {/* Main Table */}
      <div className="border border-border rounded-card overflow-hidden bg-surface-1">
        {filteredCategories.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-text-secondary">No categories found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow hover={false}>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead className="text-right w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="text-text-secondary font-mono">{cat.id}</TableCell>
                  <TableCell className="font-semibold text-text-primary">
                    {cat.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(cat)}
                        className="p-1.5 rounded-default text-text-secondary hover:text-accent-400 hover:bg-surface-2 transition-colors cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(cat.id)}
                        className="p-1.5 rounded-default text-text-secondary hover:text-danger hover:bg-surface-2 transition-colors cursor-pointer"
                        title="Delete Category"
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
    </div>
  );
};

export default CategoryTable;

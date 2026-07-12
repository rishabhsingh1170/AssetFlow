import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import OrgSetupTabs from "../components/OrgSetupTabs";
import DepartmentTable from "../components/DepartmentTable";
import DepartmentForm from "../components/DepartmentForm";
import CategoryTable from "../components/CategoryTable";
import CategoryForm from "../components/CategoryForm";
import EmployeeDirectoryTable from "../components/EmployeeDirectoryTable";
import PromoteRoleModal from "../components/PromoteRoleModal";
import Modal from "../../../components/ui/Modal";
import Spinner from "../../../components/ui/Spinner";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";

// Redux slice imports
import {
  fetchDepartments,
  addDepartment,
  editDepartment,
  removeDepartment,
  clearSubmitError as clearDeptSubmitError,
} from "../department.slice";
import {
  fetchCategories,
  addCategory,
  editCategory,
  removeCategory,
  clearSubmitError as clearCatSubmitError,
} from "../category.slice";
import {
  fetchEmployees,
  promoteEmployee,
  clearSubmitError as clearEmpSubmitError,
} from "../employee.slice";

export const OrganizationSetupPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("departments");

  // Selectors for departments slice
  const deptState = useSelector((state) => state.department);
  // Selectors for categories slice
  const catState = useSelector((state) => state.category);
  // Selectors for employees/users slice
  const empState = useSelector((state) => state.employee);

  // Modal Control States
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [targetEmployee, setTargetEmployee] = useState(null);

  // Delete Confirmation States
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    id: null,
    type: null, // "department" | "category"
  });

  // On mount data fetchers
  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchCategories());
    dispatch(fetchEmployees());
  }, [dispatch]);

  // Tab switching helper
  const handleTabChange = (tabValue) => {
    setActiveTab(tabValue);
  };

  // Add click routing depending on active tab
  const handleAddClick = () => {
    if (activeTab === "departments") {
      setEditingDept(null);
      dispatch(clearDeptSubmitError());
      setIsDeptModalOpen(true);
    } else if (activeTab === "categories") {
      setEditingCat(null);
      dispatch(clearCatSubmitError());
      setIsCatModalOpen(true);
    }
  };

  // Edit action routing
  const handleEditDeptClick = (dept) => {
    setEditingDept(dept);
    dispatch(clearDeptSubmitError());
    setIsDeptModalOpen(true);
  };

  const handleEditCatClick = (cat) => {
    setEditingCat(cat);
    dispatch(clearCatSubmitError());
    setIsCatModalOpen(true);
  };

  // Delete confirmations
  const handleDeleteDeptClick = (id) => {
    setDeleteConfirm({ isOpen: true, id, type: "department" });
  };

  const handleDeleteCatClick = (id) => {
    setDeleteConfirm({ isOpen: true, id, type: "category" });
  };

  const executeDelete = async () => {
    const { id, type } = deleteConfirm;
    if (type === "department") {
      await dispatch(removeDepartment(id)).unwrap();
    } else if (type === "category") {
      await dispatch(removeCategory(id)).unwrap();
    }
    setDeleteConfirm({ isOpen: false, id: null, type: null });
  };

  // Department Form Submission
  const handleDeptFormSubmit = async (formData) => {
    const payload = {
      name: formData.name,
      code: formData.code,
      headUserId: formData.headUserId || null,
      parentDepartmentId: formData.parentDepartmentId || null,
      status: formData.status ? formData.status.toLowerCase() : "active",
    };

    try {
      if (editingDept) {
        await dispatch(editDepartment({ id: editingDept.id, data: payload })).unwrap();
      } else {
        await dispatch(addDepartment(payload)).unwrap();
      }
      setIsDeptModalOpen(false);
      setEditingDept(null);
      // Reload lists to sync references/roles side effects
      dispatch(fetchDepartments());
      dispatch(fetchEmployees());
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  // Category Form Submission
  const handleCatFormSubmit = async (formData) => {
    try {
      if (editingCat) {
        await dispatch(editCategory({ id: editingCat.id, data: formData })).unwrap();
      } else {
        await dispatch(addCategory(formData)).unwrap();
      }
      setIsCatModalOpen(false);
      setEditingCat(null);
    } catch (err) {
      console.error("Category submission failed", err);
    }
  };

  // Employee Role Promotion Modal trigger
  const handlePromoteClick = (employee) => {
    setTargetEmployee(employee);
    dispatch(clearEmpSubmitError());
    setIsRoleModalOpen(true);
  };

  // Role promotion submission
  const handleRolePromotionSubmit = async (newRole) => {
    try {
      await dispatch(promoteEmployee({ id: targetEmployee.id, role: newRole })).unwrap();
      setIsRoleModalOpen(false);
      setTargetEmployee(null);
      // Reload department head names to keep state synchronized
      dispatch(fetchDepartments());
    } catch (err) {
      console.error("Role promotion failed", err);
    }
  };

  // Global loaders
  const isGlobalLoading =
    deptState.loading && catState.loading && empState.loading;

  if (isGlobalLoading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workspace Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary uppercase">
          Organization Setup
        </h1>
        <p className="text-sm text-text-secondary">
          Manage corporate structure, category registries, and promote staff roles.
        </p>
      </div>

      {/* Tabs & Add Button controls */}
      <OrgSetupTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAddClick={handleAddClick}
      />

      {/* Render active content tab */}
      <Card className="bg-surface-1/40 border border-border shadow-sm p-6">
        {activeTab === "departments" && (
          <DepartmentTable
            departments={deptState.items}
            onEdit={handleEditDeptClick}
            onDelete={handleDeleteDeptClick}
          />
        )}
        {activeTab === "categories" && (
          <CategoryTable
            categories={catState.items}
            onEdit={handleEditCatClick}
            onDelete={handleDeleteCatClick}
          />
        )}
        {activeTab === "employee" && (
          <EmployeeDirectoryTable
            employees={empState.items}
            onPromote={handlePromoteClick}
          />
        )}
      </Card>

      {/* --- MODALS --- */}

      {/* Department Modal */}
      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title={editingDept ? "Edit Department" : "Add Department"}
        size="lg"
      >
        <DepartmentForm
          editingDeptId={editingDept?.id}
          defaultValues={editingDept || { name: "", headId: "", parentDepartmentId: "", status: "Active" }}
          employees={empState.items}
          departments={deptState.items}
          onSubmit={handleDeptFormSubmit}
          submitLoading={deptState.submitLoading}
          submitError={deptState.submitError}
        />
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editingCat ? "Edit Category" : "Add Category"}
        size="md"
      >
        <CategoryForm
          defaultValues={editingCat || { name: "" }}
          onSubmit={handleCatFormSubmit}
          submitLoading={catState.submitLoading}
          submitError={catState.submitError}
        />
      </Modal>

      {/* Promote Employee Role Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Change staff role"
        size="lg"
      >
        <PromoteRoleModal
          employee={targetEmployee}
          onSubmit={handleRolePromotionSubmit}
          onClose={() => setIsRoleModalOpen(false)}
          submitLoading={empState.submitLoading}
          submitError={empState.submitError}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null, type: null })}
        title="Confirm Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary leading-relaxed">
            Are you sure you want to delete this {deleteConfirm.type}? This action is permanent and cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setDeleteConfirm({ isOpen: false, id: null, type: null })}
              className="font-bold uppercase tracking-wider text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={executeDelete}
              className="px-6 font-bold uppercase tracking-wider text-xs"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrganizationSetupPage;

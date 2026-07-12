import React from "react";
import Tabs from "../../../components/ui/Tabs";
import Button from "../../../components/ui/Button";

export const OrgSetupTabs = ({ activeTab, onTabChange, onAddClick }) => {
  const tabs = [
    { label: "Departments", value: "departments" },
    { label: "Categories", value: "categories" },
    { label: "Employee", value: "employee" },
  ];

  const showAddButton = activeTab === "departments" || activeTab === "categories";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-5 mb-6">
      {/* Tab Switcher */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={onTabChange} />

      {/* Inline "+ Add" Action Button */}
      {showAddButton && (
        <Button variant="secondary" size="sm" onClick={onAddClick}>
          + Add
        </Button>
      )}
    </div>
  );
};

export default OrgSetupTabs;

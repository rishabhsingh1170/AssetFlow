import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageHeader from "../../../components/common/PageHeader";
import EmptyState from "../../../components/common/EmptyState";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Tabs from "../../../components/ui/Tabs";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import { AUDIT_ENTITY_TABLES } from "../../../constants/assetStatuses";
import { humanize } from "../../../utils/assetStatus";
import { useDebounce } from "../../../hooks/useDebounce";
import { fetchAuditLogs, setFilters } from "../audit.slice";
import AuditChecklistTable from "../components/AuditChecklistTable";
import DiscrepancyBanner from "../components/DiscrepancyBanner";
import AuditCycleForm from "../components/AuditCycleForm";
import CloseCycleModal from "../components/CloseCycleModal";

const AUDIT_CYCLES_ENABLED = false; // BACKEND GAP: audit cycle CRUD is validated in server/validations/audit.validation.js but no routes exist; flip when /api/audit/cycles is mounted.

const TABS = [
  { value: "logs", label: "Activity logs" },
  { value: "cycles", label: "Audit cycles" },
];

const ENTITY_OPTIONS = [
  { value: "", label: "All entities" },
  ...AUDIT_ENTITY_TABLES.map((table) => ({ value: table, label: humanize(table) })),
];

const LIMIT_OPTIONS = [
  { value: "100", label: "Last 100" },
  { value: "250", label: "Last 250" },
  { value: "500", label: "Last 500" },
];

const AuditPage = () => {
  const dispatch = useDispatch();
  const { logs, loading, error, filters } = useSelector((state) => state.audit);

  const [activeTab, setActiveTab] = useState("logs");
  const [actionInput, setActionInput] = useState(filters.action);
  const [hasFetched, setHasFetched] = useState(false);
  const [cycleFormOpen, setCycleFormOpen] = useState(false);
  const [cycleToClose, setCycleToClose] = useState(null);

  const debouncedAction = useDebounce(actionInput);

  useEffect(() => {
    if (debouncedAction !== filters.action) {
      dispatch(setFilters({ action: debouncedAction }));
    }
  }, [debouncedAction, filters.action, dispatch]);

  useEffect(() => {
    let active = true;
    dispatch(fetchAuditLogs(filters)).then(() => {
      if (active) setHasFetched(true);
    });
    return () => {
      active = false;
    };
  }, [dispatch, filters]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compliance"
        title="Audit"
        description="Trace every create, update, and delete across the asset registry."
        actions={
          <Button
            disabled={!AUDIT_CYCLES_ENABLED}
            title={
              AUDIT_CYCLES_ENABLED
                ? undefined
                : "Audit cycle endpoints are not mounted on the server yet"
            }
            onClick={() => setCycleFormOpen(true)}
          >
            New audit cycle
          </Button>
        }
      />

      <DiscrepancyBanner show={hasFetched && !loading && !error && logs.length === 0} />

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} variant="line" />

      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              id="audit-filter-entity"
              label="Entity"
              options={ENTITY_OPTIONS}
              value={filters.entityTable}
              onChange={(event) =>
                dispatch(setFilters({ entityTable: event.target.value }))
              }
            />
            <Input
              id="audit-filter-action"
              label="Action"
              placeholder="create, update, delete"
              value={actionInput}
              onChange={(event) => setActionInput(event.target.value)}
            />
            <Select
              id="audit-filter-limit"
              label="Limit"
              options={LIMIT_OPTIONS}
              value={String(filters.limit)}
              onChange={(event) =>
                dispatch(setFilters({ limit: Number(event.target.value) }))
              }
            />
          </div>

          <Card padding="none">
            <AuditChecklistTable logs={logs} loading={loading} error={error} />
          </Card>
        </div>
      )}

      {activeTab === "cycles" &&
        (AUDIT_CYCLES_ENABLED ? (
          // Cycle listing renders here once /api/audit/cycles is mounted;
          // the create and close modals below are already wired.
          <Card padding="none">
            <EmptyState
              illustration="generic"
              title="No audit cycles yet"
              description="Create a cycle to start a verification checklist."
              action={
                <Button onClick={() => setCycleFormOpen(true)}>New audit cycle</Button>
              }
            />
          </Card>
        ) : (
          <Card padding="none">
            <EmptyState
              illustration="generic"
              title="Audit cycles are not available yet"
              description="The server validates audit cycles in audit.validation.js but does not mount /api/audit/cycles routes, so cycles cannot be created or listed from here yet."
            />
          </Card>
        ))}

      {AUDIT_CYCLES_ENABLED && (
        <>
          <AuditCycleForm
            isOpen={cycleFormOpen}
            onClose={() => setCycleFormOpen(false)}
          />
          <CloseCycleModal
            isOpen={Boolean(cycleToClose)}
            cycle={cycleToClose}
            onClose={() => setCycleToClose(null)}
          />
        </>
      )}
    </div>
  );
};

export default AuditPage;

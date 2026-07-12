import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { ArrowLeftRight, PackagePlus } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import EmptyState from "../../../components/common/EmptyState";
import StatusPill from "../../../components/common/StatusPill";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Skeleton from "../../../components/ui/Skeleton";
import Tabs from "../../../components/ui/Tabs";
import Pagination from "../../../components/ui/Pagination";
import { useToast } from "../../../components/ui/Toast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../../components/ui/Table";
import { useRole } from "../../../hooks/useRole";
import { usePagination } from "../../../hooks/usePagination";
import { getUsers } from "../../../../api/user.api";
import { fetchDepartments } from "../../organization/department.slice";
import {
  fetchAllocationAssets,
  allocate,
  returnAllocation,
  requestTransfer,
  clearActionError,
} from "../allocation.slice";
import AllocationConflictBanner from "../components/AllocationConflictBanner";
import AllocationForm from "../components/AllocationForm";
import ReturnCheckinModal from "../components/ReturnCheckinModal";
import TransferRequestForm from "../components/TransferRequestForm";
import AllocationHistoryList from "../components/AllocationHistoryList";

const TABS = [
  { label: "Allocated assets", value: "allocated" },
  { label: "Available assets", value: "available" },
  { label: "History", value: "history" },
];

const AllocationTransferPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { role, isAdmin, isAssetManager, isDepartmentHead } = useRole();

  const { items, loading, error, actionLoading, actionError } = useSelector(
    (state) => state.allocation
  );
  const departments = useSelector((state) => state.department.items);

  const [activeTab, setActiveTab] = useState("allocated");
  const [allocOpen, setAllocOpen] = useState(false);
  const [allocInitialAssetId, setAllocInitialAssetId] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferInitialAssetId, setTransferInitialAssetId] = useState("");
  const [returnTarget, setReturnTarget] = useState(null);

  // Managers can list users for holder pickers; employees get 401/403, so we
  // never call it for them and the forms fall back to "assign to me".
  const canListUsers = isAdmin || isAssetManager || isDepartmentHead;
  const [users, setUsers] = useState([]);
  const [usersUnavailable, setUsersUnavailable] = useState(true);

  const canAllocate = isAdmin || isAssetManager;
  // Employees may request transfers too (targeting themselves); the button
  // waits for the role to resolve so gating does not flash.
  const canTransfer = Boolean(role);

  useEffect(() => {
    dispatch(fetchAllocationAssets());
    dispatch(fetchDepartments());
  }, [dispatch]);

  useEffect(() => {
    if (!canListUsers) return;
    let mounted = true;
    getUsers()
      .then((response) => {
        if (!mounted) return;
        setUsers(response.data || []);
        setUsersUnavailable(false);
      })
      .catch(() => {
        if (!mounted) return;
        setUsers([]);
        setUsersUnavailable(true);
      });
    return () => {
      mounted = false;
    };
  }, [canListUsers]);

  // Deep link support: /allocation-transfer?assetId=... pre-opens the
  // allocation form with that asset selected.
  useEffect(() => {
    const assetId = searchParams.get("assetId");
    if (assetId) {
      setAllocInitialAssetId(assetId);
      setAllocOpen(true);
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allocatedAssets = useMemo(
    () => items.filter((asset) => asset.status === "allocated"),
    [items]
  );
  const availableAssets = useMemo(
    () => items.filter((asset) => asset.status === "available"),
    [items]
  );

  const tabAssets = activeTab === "allocated" ? allocatedAssets : availableAssets;
  const { page, setPage, totalPages, pageItems, reset } = usePagination(tabAssets, 10);

  const handleTabChange = (value) => {
    setActiveTab(value);
    reset();
  };

  const openAllocate = (assetId = "") => {
    dispatch(clearActionError());
    setAllocInitialAssetId(assetId);
    setAllocOpen(true);
  };

  const openTransfer = (assetId = "") => {
    dispatch(clearActionError());
    setTransferInitialAssetId(assetId);
    setTransferOpen(true);
  };

  const openReturn = (asset) => {
    dispatch(clearActionError());
    setReturnTarget(asset);
  };

  const handleAllocateSubmit = async (assetId, payload) => {
    try {
      await dispatch(allocate({ assetId, payload })).unwrap();
      setAllocOpen(false);
      toast({ title: "Asset allocated", variant: "success" });
    } catch {
      // The slice records actionError; the form and banner surface it.
    }
  };

  const handleReturnSubmit = async (payload) => {
    if (!returnTarget) return;
    try {
      await dispatch(returnAllocation({ assetId: returnTarget.id, payload })).unwrap();
      setReturnTarget(null);
      toast({ title: "Asset returned", variant: "success" });
    } catch {
      // Surfaced via actionError.
    }
  };

  const handleTransferSubmit = async (assetId, payload) => {
    try {
      await dispatch(requestTransfer({ assetId, payload })).unwrap();
      setTransferOpen(false);
      toast({
        title: "Transfer requested",
        description: "The request was recorded with status requested.",
        variant: "success",
      });
    } catch {
      // Surfaced via actionError.
    }
  };

  const showActions = activeTab === "allocated" && (canAllocate || canTransfer);

  const renderTable = () => {
    if (loading) {
      return (
        <div className="space-y-2 p-4">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-default border border-danger-border bg-danger-bg px-4 py-3">
            <p className="text-sm text-danger">{error}</p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => dispatch(fetchAllocationAssets())}
            >
              Try again
            </Button>
          </div>
        </div>
      );
    }

    if (!tabAssets.length) {
      return activeTab === "allocated" ? (
        <EmptyState
          illustration="assets"
          title="No assets are allocated right now"
          description="Allocate an available asset to hand it to an employee or department."
          action={
            canAllocate ? (
              <Button onClick={() => openAllocate()}>Allocate asset</Button>
            ) : undefined
          }
        />
      ) : (
        <EmptyState
          illustration="assets"
          title="No assets are available"
          description="Every registered asset is currently allocated, reserved, or out of service."
        />
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow hover={false}>
            <TableHead>Tag</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Holder</TableHead>
            {showActions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((asset) => (
            <TableRow key={asset.id}>
              <TableCell className="font-mono text-[13px]">
                {asset.asset_tag || "-"}
              </TableCell>
              <TableCell>{asset.name}</TableCell>
              <TableCell className="text-text-secondary">
                {asset.category_name || "-"}
              </TableCell>
              <TableCell className="text-text-secondary">
                {asset.owning_department_name || "-"}
              </TableCell>
              <TableCell>
                <StatusPill status={asset.status} domain="asset" />
              </TableCell>
              <TableCell className="text-text-muted">
                {/* BACKEND GAP: asset rows carry no holder data and GET
                    /api/allocations is unmounted, so we do not fake it. */}
                <span title="Holder details require the allocations API">-</span>
              </TableCell>
              {showActions && (
                <TableCell>
                  <div className="flex items-center gap-2">
                    {canAllocate && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openReturn(asset)}
                      >
                        Return
                      </Button>
                    )}
                    {canTransfer && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openTransfer(asset.id)}
                      >
                        Transfer
                      </Button>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Custody"
        title="Allocation and transfer"
        description="Hand assets to people or departments, take them back, and request transfers."
        actions={
          <>
            {canAllocate && (
              <Button onClick={() => openAllocate()}>
                <PackagePlus size={16} className="mr-2" aria-hidden="true" />
                Allocate asset
              </Button>
            )}
            {canTransfer && (
              <Button variant="secondary" onClick={() => openTransfer()}>
                <ArrowLeftRight size={16} className="mr-2" aria-hidden="true" />
                Request transfer
              </Button>
            )}
          </>
        }
      />

      <AllocationConflictBanner />

      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onChange={handleTabChange}
        variant="line"
      />

      <Card padding="none">
        {activeTab === "history" ? <AllocationHistoryList /> : renderTable()}
      </Card>

      {activeTab !== "history" && (
        <Pagination page={page} pageCount={totalPages} onPageChange={setPage} />
      )}

      <AllocationForm
        isOpen={allocOpen}
        onClose={() => setAllocOpen(false)}
        assets={items}
        users={users}
        departments={departments}
        usersUnavailable={usersUnavailable}
        initialAssetId={allocInitialAssetId}
        onSubmit={handleAllocateSubmit}
        submitting={actionLoading}
        submitError={allocOpen ? actionError : null}
      />

      <ReturnCheckinModal
        isOpen={Boolean(returnTarget)}
        onClose={() => setReturnTarget(null)}
        asset={returnTarget}
        onSubmit={handleReturnSubmit}
        submitting={actionLoading}
        submitError={returnTarget ? actionError : null}
      />

      <TransferRequestForm
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        assets={items}
        users={users}
        departments={departments}
        usersUnavailable={usersUnavailable}
        initialAssetId={transferInitialAssetId}
        onSubmit={handleTransferSubmit}
        submitting={actionLoading}
        submitError={transferOpen ? actionError : null}
      />
    </div>
  );
};

export default AllocationTransferPage;

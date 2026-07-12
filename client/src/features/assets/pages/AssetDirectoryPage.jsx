import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import PageHeader from "../../../components/common/PageHeader";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Modal from "../../../components/ui/Modal";
import Drawer from "../../../components/ui/Drawer";
import Pagination from "../../../components/ui/Pagination";
import Skeleton from "../../../components/ui/Skeleton";
import { useToast } from "../../../components/ui/Toast";

import useRole from "../../../hooks/useRole";
import useDebounce from "../../../hooks/useDebounce";
import usePagination from "../../../hooks/usePagination";

import AssetFilters from "../components/AssetFilters";
import AssetTable from "../components/AssetTable";
import AssetDetailPanel from "../components/AssetDetailPanel";
import AssetRegisterForm from "../components/AssetRegisterForm";

import {
  fetchAssets,
  fetchAssetById,
  addAsset,
  editAsset,
  removeAsset,
  fetchLocations,
  setFilters,
  clearFilters,
  setSelected,
  clearSubmitError,
} from "../assets.slice";
import { fetchCategories } from "../../organization/category.slice";
import { fetchDepartments } from "../../organization/department.slice";

const PAGE_SIZE = 10;

const TableSkeleton = () => (
  <div className="p-4 space-y-3">
    <Skeleton className="h-8 w-full" />
    {Array.from({ length: 8 }).map((_, index) => (
      <Skeleton key={index} className="h-10 w-full" />
    ))}
  </div>
);

const AssetDirectoryPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isAssetManager } = useRole();
  const canManage = isAdmin || isAssetManager;

  const {
    items,
    loading,
    error,
    status,
    filters,
    selected,
    detailLoading,
    locations,
    submitLoading,
    submitError,
  } = useSelector((state) => state.assets);
  const categories = useSelector((state) => state.category.items);
  const departments = useSelector((state) => state.department.items);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const debouncedFilters = useDebounce(filters, 350);
  const { page, setPage, totalPages, pageItems } = usePagination(
    items,
    PAGE_SIZE
  );

  // Lookup data for filters and the register form.
  useEffect(() => {
    dispatch(fetchLocations());
    dispatch(fetchCategories());
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Initial fetch plus refetch whenever the debounced filters settle.
  useEffect(() => {
    dispatch(fetchAssets(debouncedFilters));
    setPage(1);
  }, [dispatch, debouncedFilters, setPage]);

  const handleFilterChange = (patch) => dispatch(setFilters(patch));
  const handleClearFilters = () => dispatch(clearFilters());

  const handleRowClick = (asset) => {
    dispatch(setSelected(asset));
    setIsDrawerOpen(true);
    dispatch(fetchAssetById(asset.id));
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    dispatch(setSelected(null));
  };

  const openCreateForm = () => {
    setEditingAsset(null);
    dispatch(clearSubmitError());
    setIsFormOpen(true);
  };

  const openEditForm = (asset) => {
    setEditingAsset(asset);
    dispatch(clearSubmitError());
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAsset(null);
    dispatch(clearSubmitError());
  };

  const handleFormSubmit = async (payload) => {
    try {
      if (editingAsset) {
        await dispatch(
          editAsset({ id: editingAsset.id, data: payload })
        ).unwrap();
        toast({
          title: "Asset updated",
          description: `${payload.name || editingAsset.name} was saved.`,
          variant: "success",
        });
      } else {
        await dispatch(addAsset(payload)).unwrap();
        toast({
          title: "Asset registered",
          description: `${payload.name} was added to the registry.`,
          variant: "success",
        });
        // POST responses lack join columns (category, location names), so
        // refresh the list to pick them up.
        dispatch(fetchAssets(debouncedFilters));
      }
      closeForm();
    } catch {
      // submitError is rendered inside the form banner.
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await dispatch(removeAsset(deleteTarget.id)).unwrap();
      toast({
        title: "Asset deleted",
        description: `${deleteTarget.name} was removed from the registry.`,
        variant: "success",
      });
      if (selected?.id === deleteTarget.id) {
        setIsDrawerOpen(false);
      }
      setDeleteTarget(null);
    } catch (err) {
      const message = typeof err === "string" ? err : err?.message;
      toast({
        title: "Delete failed",
        description: `${message || "The server rejected the delete."} Consider retiring the asset instead.`,
        variant: "danger",
      });
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const showSkeleton = loading && items.length === 0;
  const countLabel =
    status === "succeeded" || items.length > 0
      ? `${items.length} ${items.length === 1 ? "asset" : "assets"} in the registry`
      : "Loading the registry";

  const drawerFooter = selected ? (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {canManage && selected.status === "available" && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/allocation-transfer?assetId=${selected.id}`)}
        >
          Allocate
        </Button>
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(`/maintenance?assetId=${selected.id}`)}
      >
        Raise maintenance
      </Button>
      {selected.is_shared_bookable && (
        <Button
          size="sm"
          onClick={() => navigate(`/resource-booking?assetId=${selected.id}`)}
        >
          Book
        </Button>
      )}
    </div>
  ) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registry"
        title="Asset directory"
        description={countLabel}
        actions={
          canManage && (
            <Button onClick={openCreateForm}>
              <Plus size={16} className="mr-1.5" />
              Register asset
            </Button>
          )
        }
      />

      <AssetFilters
        filters={filters}
        categories={categories}
        departments={departments}
        locations={locations}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 bg-danger-bg border border-danger-border text-danger rounded-default px-4 py-3 text-sm"
        >
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(fetchAssets(debouncedFilters))}
          >
            Try again
          </Button>
        </div>
      )}

      <Card padding="none">
        {showSkeleton ? (
          <TableSkeleton />
        ) : (
          <AssetTable
            assets={pageItems}
            onRowClick={handleRowClick}
            onEdit={openEditForm}
            onDelete={setDeleteTarget}
            canManage={canManage}
            onClearFilters={handleClearFilters}
          />
        )}
      </Card>

      <Pagination page={page} pageCount={totalPages} onPageChange={setPage} />

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title="Asset detail"
        width="lg"
        footer={drawerFooter}
      >
        <AssetDetailPanel asset={selected} loading={detailLoading} />
      </Drawer>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingAsset ? "Edit asset" : "Register asset"}
        size="xl"
      >
        <AssetRegisterForm
          asset={editingAsset}
          categories={categories}
          departments={departments}
          locations={locations}
          submitLoading={submitLoading}
          submitError={submitError}
          onSubmit={handleFormSubmit}
          onCancel={closeForm}
        />
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete this asset?"
        description={`Deleting ${deleteTarget?.name || "this asset"} is permanent and cannot be undone. The delete will fail if the asset has allocation, booking, or maintenance history: in that case, retire the asset instead to keep its records.`}
        confirmLabel="Delete asset"
        cancelLabel="Keep asset"
        tone="danger"
        loading={deleteLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AssetDirectoryPage;

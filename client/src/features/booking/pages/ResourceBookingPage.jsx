import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { CalendarPlus } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import EmptyState from "../../../components/common/EmptyState";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Button from "../../../components/ui/Button";
import Card from "../../../components/ui/Card";
import Skeleton from "../../../components/ui/Skeleton";
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
import { useAuth } from "../../../hooks/useAuth";
import { useRole } from "../../../hooks/useRole";
import { usePagination } from "../../../hooks/usePagination";
import { cleanPayload } from "../../../utils/validators";
import { formatDate, toDatetimeLocal } from "../../../utils/formatDate";
import {
  fetchBookings,
  fetchBookableAssets,
  addBooking,
  setBookingStatus,
  setFilters,
  clearSubmitError,
} from "../booking.slice";
import ResourceSelector from "../components/ResourceSelector";
import SlotCalendar from "../components/SlotCalendar";
import BookingForm from "../components/BookingForm";
import BookingStatusBadge from "../components/BookingStatusBadge";

// Statuses a booking can still be cancelled or completed from.
const ACTIVE_STATUSES = ["requested", "approved", "upcoming", "ongoing"];
const COMPLETABLE_STATUSES = ["approved", "upcoming", "ongoing"];

const ResourceBookingPage = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { isAdmin, isAssetManager } = useRole();
  const canModerate = isAdmin || isAssetManager;

  const {
    items,
    loading,
    error,
    bookableAssets,
    filters,
    submitLoading,
    submitError,
    actionLoading,
  } = useSelector((state) => state.booking);

  const [formOpen, setFormOpen] = useState(false);
  const [prefill, setPrefill] = useState({ assetId: "", startsAt: "" });
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchBookableAssets());
  }, [dispatch]);

  // Deep link support: /resource-booking?assetId=... preselects the resource.
  useEffect(() => {
    const assetId = searchParams.get("assetId");
    if (assetId) {
      dispatch(setFilters({ assetId }));
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const params = useMemo(
    () =>
      cleanPayload({
        assetId: filters.assetId,
        status: filters.status,
        bookedBy: filters.mineOnly ? user?.id : undefined,
      }),
    [filters.assetId, filters.status, filters.mineOnly, user?.id]
  );

  useEffect(() => {
    // "Mine only" needs the session user id; wait until it resolves.
    if (filters.mineOnly && !user?.id) return;
    dispatch(fetchBookings(params));
  }, [dispatch, params, filters.mineOnly, user?.id]);

  const selectedAsset = useMemo(
    () => bookableAssets.find((asset) => asset.id === filters.assetId) || null,
    [bookableAssets, filters.assetId]
  );

  const { page, setPage, totalPages, pageItems } = usePagination(items, 10);

  const openForm = (assetId = filters.assetId, startsAt = "") => {
    dispatch(clearSubmitError());
    setPrefill({ assetId, startsAt });
    setFormOpen(true);
  };

  const handleSlotClick = (slotDate) => {
    openForm(filters.assetId, toDatetimeLocal(slotDate.toISOString()));
  };

  const handleCreate = async (payload) => {
    try {
      await dispatch(addBooking(payload)).unwrap();
      setFormOpen(false);
      toast({ title: "Booking created", variant: "success" });
      dispatch(fetchBookings(params));
    } catch {
      // submitError is rendered inside the form via ConflictWarning.
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(setBookingStatus({ id, status })).unwrap();
      toast({ title: `Booking ${status}`, variant: "success" });
    } catch (err) {
      toast({
        title: "Could not update booking",
        description: typeof err === "string" ? err : err?.message,
        variant: "danger",
      });
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      await dispatch(
        setBookingStatus({
          id: cancelTarget.id,
          status: "cancelled",
          cancelledBy: user?.id,
        })
      ).unwrap();
      setCancelTarget(null);
      toast({ title: "Booking cancelled", variant: "success" });
    } catch (err) {
      setCancelTarget(null);
      toast({
        title: "Could not cancel booking",
        description: typeof err === "string" ? err : err?.message,
        variant: "danger",
      });
    }
  };

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
              onClick={() => dispatch(fetchBookings(params))}
            >
              Try again
            </Button>
          </div>
        </div>
      );
    }

    if (!items.length) {
      return (
        <EmptyState
          illustration="inbox"
          title="No bookings match these filters"
          description="Adjust the filters or create a new booking for a shared resource."
          action={<Button onClick={() => openForm()}>New booking</Button>}
        />
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow hover={false}>
            <TableHead>Asset</TableHead>
            <TableHead>Booked by</TableHead>
            <TableHead>Starts</TableHead>
            <TableHead>Ends</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageItems.map((row) => {
            const isOwner = row.booked_by === user?.id;
            const canCancel =
              (isOwner || canModerate) && ACTIVE_STATUSES.includes(row.status);
            return (
              <TableRow key={row.id}>
                <TableCell>
                  <span className="font-mono text-[13px]">{row.asset_tag || "-"}</span>
                  {row.asset_name && (
                    <span className="ml-2 text-text-secondary">{row.asset_name}</span>
                  )}
                </TableCell>
                <TableCell>{row.booked_by_name || "-"}</TableCell>
                <TableCell className="font-mono text-[13px]">
                  {formatDate(row.starts_at, { withTime: true })}
                </TableCell>
                <TableCell className="font-mono text-[13px]">
                  {formatDate(row.ends_at, { withTime: true })}
                </TableCell>
                <TableCell>
                  <span
                    className="block max-w-45 truncate text-text-secondary"
                    title={row.purpose || undefined}
                  >
                    {row.purpose || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={row.status} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {canModerate && row.status === "requested" && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleStatusChange(row.id, "approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actionLoading}
                          onClick={() => handleStatusChange(row.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {canModerate && COMPLETABLE_STATUSES.includes(row.status) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => handleStatusChange(row.id, "completed")}
                      >
                        Complete
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={actionLoading}
                        onClick={() => setCancelTarget(row)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Scheduling"
        title="Resource booking"
        description="Reserve shared resources and manage their weekly schedules."
        actions={
          <Button onClick={() => openForm()}>
            <CalendarPlus size={16} className="mr-2" aria-hidden="true" />
            New booking
          </Button>
        }
      />

      <ResourceSelector
        assets={bookableAssets}
        filters={filters}
        onChange={(patch) => dispatch(setFilters(patch))}
      />

      <SlotCalendar
        asset={selectedAsset}
        bookings={items}
        onSlotClick={handleSlotClick}
      />

      <Card padding="none">{renderTable()}</Card>

      <Pagination page={page} pageCount={totalPages} onPageChange={setPage} />

      <BookingForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        assets={bookableAssets}
        bookings={items}
        defaultAssetId={prefill.assetId}
        defaultStartsAt={prefill.startsAt}
        onSubmit={handleCreate}
        submitting={submitLoading}
        submitError={formOpen ? submitError : null}
      />

      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        title="Cancel booking"
        description={
          cancelTarget
            ? `Cancel the booking for ${cancelTarget.asset_name || cancelTarget.asset_tag || "this resource"} starting ${formatDate(cancelTarget.starts_at, { withTime: true })}? The slot becomes available again.`
            : ""
        }
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        tone="danger"
        loading={actionLoading}
        onConfirm={handleCancelConfirm}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};

export default ResourceBookingPage;

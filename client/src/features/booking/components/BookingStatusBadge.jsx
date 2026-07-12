import React from "react";
import StatusPill from "../../../components/common/StatusPill";

// Thin wrapper: all status rendering goes through the shared StatusPill.
export const BookingStatusBadge = ({ status, className = "" }) => (
  <StatusPill status={status} domain="booking" className={className} />
);

export default BookingStatusBadge;

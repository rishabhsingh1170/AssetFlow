import React from "react";
import StatusPill from "../../../components/common/StatusPill";

// Thin wrapper: all asset status rendering goes through the shared
// StatusPill so colors and labels stay consistent across features.
export const AssetStatusBadge = ({ status, className = "" }) => (
  <StatusPill status={status} domain="asset" className={className} />
);

export default AssetStatusBadge;

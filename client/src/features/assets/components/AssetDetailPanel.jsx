import React from "react";
import Skeleton from "../../../components/ui/Skeleton";
import Badge from "../../../components/ui/Badge";
import AssetStatusBadge from "./AssetStatusBadge";
import AssetHistoryTimeline from "./AssetHistoryTimeline";
import { humanize } from "../../../utils/assetStatus";
import { formatDate } from "../../../utils/formatDate";
import { formatCurrency } from "../../../utils/formatCurrency";

const Section = ({ title, children }) => (
  <section>
    <h4 className="eyebrow mb-2">{title}</h4>
    {children}
  </section>
);

const Row = ({ label, value, mono = false }) => (
  <div className="flex items-start justify-between gap-4 py-1.5">
    <dt className="text-xs text-text-muted shrink-0">{label}</dt>
    <dd
      className={`text-right text-text-primary ${
        mono ? "font-mono text-[13px]" : "text-sm"
      }`}
    >
      {value ?? "-"}
    </dd>
  </div>
);

// Rendered inside the page-owned Drawer; footer actions live on the
// Drawer footer prop, wired by the page.
export const AssetDetailPanel = ({ asset, loading = false }) => {
  if (!asset) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center font-mono text-[13px] bg-surface-2 border border-border rounded-default px-2 py-0.5">
          {asset.asset_tag || "-"}
        </span>
        <AssetStatusBadge status={asset.status} />
        {asset.condition && (
          <Badge variant="neutral">{humanize(asset.condition)}</Badge>
        )}
        {loading && (
          <span className="text-xs text-text-muted">Refreshing...</span>
        )}
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-text-primary">
          {asset.name}
        </h3>
        {asset.category_name && (
          <p className="text-sm text-text-secondary mt-0.5">
            {asset.category_name}
          </p>
        )}
      </div>

      <Section title="Identity">
        <dl className="divide-y divide-border">
          <Row label="Asset tag" value={asset.asset_tag || "-"} mono />
          <Row label="Serial number" value={asset.serial_number || "-"} mono />
          {asset.qr_code && <Row label="QR code" value={asset.qr_code} mono />}
        </dl>
      </Section>

      <Section title="Classification">
        <dl className="divide-y divide-border">
          <Row label="Category" value={asset.category_name || "-"} />
          <Row
            label="Department"
            value={asset.owning_department_name || "-"}
          />
          <Row label="Location" value={asset.location_name || "-"} />
        </dl>
      </Section>

      <Section title="Financial">
        <dl className="divide-y divide-border">
          <Row
            label="Acquisition cost"
            value={formatCurrency(asset.acquisition_cost)}
            mono
          />
          <Row
            label="Acquisition date"
            value={formatDate(asset.acquisition_date)}
            mono
          />
        </dl>
      </Section>

      <Section title="Flags">
        <dl className="divide-y divide-border">
          <Row
            label="Shared bookable"
            value={
              <Badge variant={asset.is_shared_bookable ? "info" : "neutral"}>
                {asset.is_shared_bookable ? "Yes" : "No"}
              </Badge>
            }
          />
        </dl>
      </Section>

      <Section title="Notes">
        {asset.notes ? (
          <p className="text-sm text-text-primary whitespace-pre-wrap">
            {asset.notes}
          </p>
        ) : (
          <p className="text-sm text-text-muted">
            No notes have been added for this asset.
          </p>
        )}
      </Section>

      <Section title="History">
        <AssetHistoryTimeline asset={asset} />
      </Section>
    </div>
  );
};

export default AssetDetailPanel;

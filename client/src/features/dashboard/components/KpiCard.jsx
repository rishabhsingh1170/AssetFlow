import React from "react";
import { Link } from "react-router-dom";
import Card from "../../../components/ui/Card";

const NUMBER_FORMAT = new Intl.NumberFormat("en-IN");

const ICON_CHIP_CLASSES = {
  default: "bg-accent-50 text-accent-600",
  available: "bg-status-available-bg text-status-available",
  allocated: "bg-status-allocated-bg text-status-allocated",
  reserved: "bg-status-reserved-bg text-status-reserved",
  maintenance: "bg-status-maintenance-bg text-status-maintenance",
  lost: "bg-status-lost-bg text-status-lost",
};

export const KpiCard = ({ label, value, icon: Icon, accent = "default", to }) => {
  const chipClasses = ICON_CHIP_CLASSES[accent] || ICON_CHIP_CLASSES.default;
  const numericValue =
    value === null || value === undefined ? "-" : NUMBER_FORMAT.format(Number(value) || 0);

  const body = (
    <Card className="p-5 h-full transition-colors hover:border-accent-300">
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow">{label}</p>
        {Icon && (
          <span className={`w-8 h-8 rounded-default flex items-center justify-center shrink-0 ${chipClasses}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <p className="font-display text-3xl font-bold text-text-primary tabular-nums mt-2">
        {numericValue}
      </p>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60">
        {body}
      </Link>
    );
  }
  return body;
};

export default KpiCard;

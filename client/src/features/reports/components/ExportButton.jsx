import React from "react";
import { Download } from "lucide-react";
import Button from "../../../components/ui/Button";

// RFC 4180 style escaping: wrap in quotes when the value contains a comma,
// quote, or newline, and double any inner quotes.
const escapeCsvField = (value) => {
  if (value === null || value === undefined) return "";
  const text = String(value);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const buildCsv = (rows, columns) => {
  const header = columns.map((col) => escapeCsvField(col.label)).join(",");
  const body = rows.map((row) =>
    columns
      .map((col) => {
        const raw = row[col.key];
        const value = col.format ? col.format(raw, row) : raw;
        return escapeCsvField(value);
      })
      .join(",")
  );
  return [header, ...body].join("\r\n");
};

export const ExportButton = ({ rows = [], columns = [], filename, loading = false }) => {
  const handleExport = () => {
    if (!rows.length || !columns.length) return;
    // UTF-8 BOM so Excel opens the file with the right encoding.
    const csv = `﻿${buildCsv(rows, columns)}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename || "assetflow-export.csv";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="secondary"
      onClick={handleExport}
      disabled={loading || rows.length === 0}
    >
      <Download size={16} className="mr-1.5" aria-hidden="true" />
      Export CSV
    </Button>
  );
};

export default ExportButton;

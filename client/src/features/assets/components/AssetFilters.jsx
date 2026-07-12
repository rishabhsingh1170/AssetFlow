import React from "react";
import SearchBar from "../../../components/common/SearchBar";
import Select from "../../../components/ui/Select";
import Button from "../../../components/ui/Button";
import { ASSET_STATUSES, ASSET_CONDITIONS } from "../../../constants/assetStatuses";
import { humanize } from "../../../utils/assetStatus";

const toOptions = (all, values) => [
  { value: "", label: all },
  ...values.map((value) => ({ value, label: humanize(value) })),
];

const toLookupOptions = (all, rows) => [
  { value: "", label: all },
  ...rows.map((row) => ({ value: row.id, label: row.name })),
];

export const AssetFilters = ({
  filters,
  categories = [],
  departments = [],
  locations = [],
  onChange,
  onClear,
}) => {
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.categoryId ||
      filters.departmentId ||
      filters.locationId ||
      filters.condition
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchBar
        value={filters.search}
        onChange={(value) => onChange({ search: value })}
        onClear={() => onChange({ search: "" })}
        placeholder="Search name, tag, or serial"
        className="w-full sm:w-64"
      />
      <div className="w-full sm:w-40">
        <Select
          aria-label="Filter by status"
          options={toOptions("All statuses", ASSET_STATUSES)}
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          aria-label="Filter by category"
          options={toLookupOptions("All categories", categories)}
          value={filters.categoryId}
          onChange={(event) => onChange({ categoryId: event.target.value })}
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          aria-label="Filter by department"
          options={toLookupOptions("All departments", departments)}
          value={filters.departmentId}
          onChange={(event) => onChange({ departmentId: event.target.value })}
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          aria-label="Filter by location"
          options={toLookupOptions("All locations", locations)}
          value={filters.locationId}
          onChange={(event) => onChange({ locationId: event.target.value })}
        />
      </div>
      <div className="w-full sm:w-40">
        <Select
          aria-label="Filter by condition"
          options={toOptions("All conditions", ASSET_CONDITIONS)}
          value={filters.condition}
          onChange={(event) => onChange({ condition: event.target.value })}
        />
      </div>
      <Button variant="ghost" onClick={onClear} disabled={!hasActiveFilters}>
        Clear
      </Button>
    </div>
  );
};

export default AssetFilters;

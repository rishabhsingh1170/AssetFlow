import React from "react";
import { Search, X } from "lucide-react";

export const SearchBar = ({
  value,
  onChange,
  placeholder = "Search",
  onClear,
  className = "",
  autoFocus = false,
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-9 pr-8 py-2 text-sm bg-surface-1 text-text-primary placeholder:text-text-muted border border-border-strong rounded-default transition-colors duration-150 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-ring/30"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-default text-text-muted hover:text-text-primary cursor-pointer"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

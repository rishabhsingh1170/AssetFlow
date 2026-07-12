import React from "react";

/*
 * AssetFlow brand mark: a luggage tag with a punched hole.
 * Same geometry as public/favicon.svg so the tab icon and in-app mark match.
 */
export const TagMark = ({ size = 28, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={className}
  >
    <path
      fill="#f59e0b"
      fillRule="evenodd"
      d="M11 6h12a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H11l-8-10 8-10Zm-1 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z"
    />
  </svg>
);

export const Logo = ({ size = 28, withWordmark = false, tone = "default", className = "" }) => {
  const wordmarkColor = tone === "inverse" ? "text-text-inverse" : "text-text-primary";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <TagMark size={size} />
      {withWordmark && (
        <span
          className={`font-display font-semibold tracking-tight ${wordmarkColor}`}
          style={{ fontSize: Math.round(size * 0.68) }}
        >
          AssetFlow
        </span>
      )}
    </span>
  );
};

export default Logo;

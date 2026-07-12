// Strip empty-string and undefined keys before POST/PUT. The server-side
// uuid validators reject "" values, so optional Selects must be omitted
// entirely when unset.
export const cleanPayload = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).filter(
      ([, value]) => value !== "" && value !== undefined && value !== null
    )
  );

// react-hook-form validate helper: end datetime must be after start.
export const endAfterStart = (getStart) => (endValue) => {
  const start = typeof getStart === "function" ? getStart() : getStart;
  if (!start || !endValue) return true;
  return new Date(endValue) > new Date(start) || "End time must be after start time";
};

export const isFutureDate = (value) => {
  if (!value) return true;
  return new Date(value) > new Date() || "Must be a future date";
};

export default { cleanPayload, endAfterStart, isFutureDate };

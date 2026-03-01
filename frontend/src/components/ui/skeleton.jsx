export function Skeleton({ className = "" }) {
  return (
    <div
      className={`bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
}

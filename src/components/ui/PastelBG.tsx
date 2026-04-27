export function PastelBG({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className="absolute h-[40vmax] w-[40vmax] rounded-full opacity-80 blur-[80px]"
        style={{
          left: "-10%",
          top: "-10%",
          background: "var(--color-pastel-1)",
        }}
      />
      <div
        className="absolute h-[35vmax] w-[35vmax] rounded-full opacity-80 blur-[80px]"
        style={{
          right: "-10%",
          top: "5%",
          background: "var(--color-pastel-2)",
        }}
      />
      <div
        className="absolute h-[30vmax] w-[30vmax] rounded-full opacity-70 blur-[80px]"
        style={{
          left: "15%",
          bottom: "-10%",
          background: "var(--color-pastel-3)",
        }}
      />
      <div
        className="absolute h-[28vmax] w-[28vmax] rounded-full opacity-70 blur-[80px]"
        style={{
          right: "10%",
          bottom: "0%",
          background: "var(--color-pastel-4)",
        }}
      />
    </div>
  );
}

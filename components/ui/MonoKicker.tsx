export function MonoKicker({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-[11px] tracking-[0.2em] uppercase text-ink/70 ${className}`}
    >
      {children}
    </span>
  );
}

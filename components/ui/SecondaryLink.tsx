import Link from "next/link";

export function SecondaryLink({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative inline-flex items-baseline gap-1 font-sans text-[15px] tracking-[-0.01em] text-ink ${className}`}
    >
      <span className="relative">
        {label}
        <span
          aria-hidden="true"
          className="absolute left-0 right-0 -bottom-1 h-px bg-ink origin-left scale-x-100 transition-transform duration-500 ease-cinema group-hover:scale-x-0"
        />
        <span
          aria-hidden="true"
          className="absolute left-0 right-0 -bottom-1 h-px bg-ember origin-right scale-x-0 transition-transform duration-500 ease-cinema group-hover:scale-x-100"
        />
      </span>
    </Link>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Props = {
  href: string;
  label: string;
  variant?: "ember" | "ink" | "outline";
  className?: string;
};

export function PrimaryButton({
  href,
  label,
  variant = "ember",
  className = "",
}: Props) {
  const base =
    "group inline-flex items-center justify-between gap-6 px-7 py-5 rounded-full font-sans text-[15px] tracking-[-0.01em] transition-all duration-500 ease-cinema";
  const variantClass =
    variant === "ember"
      ? "bg-ember text-bone-soft hover:bg-ink hover:text-bone-soft"
      : variant === "ink"
        ? "bg-ink text-bone-soft hover:bg-ember hover:text-bone-soft"
        : "border border-hairline text-ink hover:bg-ink hover:text-bone-soft hover:border-ink";

  const isEmberOrInk = variant === "ember" || variant === "ink";

  return (
    <Link
      href={href}
      className={`${base} ${variantClass} ${className}`}
      style={isEmberOrInk ? { backgroundColor: "var(--color-ember)" } : undefined}
    >
      <span>{label}</span>
      <span className="relative w-5 h-5 overflow-hidden">
        <ArrowRight
          size={18}
          className="absolute inset-0 transition-transform duration-500 ease-cinema group-hover:translate-x-6"
        />
        <ArrowRight
          size={18}
          className="absolute inset-0 -translate-x-6 transition-transform duration-500 ease-cinema group-hover:translate-x-0"
        />
      </span>
    </Link>
  );
}

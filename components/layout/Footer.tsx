import Link from "next/link";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

export default function Footer() {
  return (
    <footer className="relative bg-ink text-bone-soft pt-32 pb-12 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-20">
          <div className="md:col-span-7">
            <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-bone-soft/50 mb-8">
              Hand layered in Hamilton
            </div>
            <h2
              className="font-display tracking-[-0.035em] leading-[0.95]"
              style={{ fontSize: "clamp(48px, 7vw, 112px)" }}
            >
              Cups{" "}
              <span
                className="italic"
                style={{
                  fontVariationSettings: "'SOFT' 50, 'WONK' 1",
                  color: "var(--color-ember-soft)",
                }}
              >
                made
              </span>{" "}
              the morning of.
            </h2>
            <p className="mt-8 max-w-[44ch] text-bone-soft/70 text-[17px] leading-[1.55]">
              Pickup in Hamilton, delivery across the Greater Toronto Area.
              Minimum order is one cup. Maximum is whatever your event needs.
            </p>
          </div>

          <div className="md:col-span-5 grid grid-cols-2 gap-8">
            <FooterCol title="Browse">
              <FooterLink href="/menu">Menu</FooterLink>
              <FooterLink href="/#flavors">Flavours</FooterLink>
              <FooterLink href="/#packages">Packages</FooterLink>
              <FooterLink href="/#builder">How a cup is built</FooterLink>
            </FooterCol>
            <FooterCol title="Contact">
              <FooterLink href="mailto:farhanaakter2612@gmail.com">
                farhanaakter2612@gmail.com
              </FooterLink>
              <FooterLink href="https://instagram.com/dessertshot.ca">
                Instagram
              </FooterLink>
              <FooterLink href="/order">Place an Order</FooterLink>
            </FooterCol>
          </div>
        </div>

        <div className="border-t border-bone-soft/15 pt-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-bone-soft/45">
            © {new Date().getFullYear()} Dessert Shot. Hamilton, Ontario.
          </div>
          <Link
            href="https://instagram.com/dessertshot.ca"
            className="inline-flex items-center gap-2 text-bone-soft/65 hover:text-bone-soft transition-colors"
          >
            <InstagramIcon className="w-4 h-4" />
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase">
              @dessertshot.ca
            </span>
          </Link>
        </div>
      </div>

      {/* Big background wordmark */}
      <div
        aria-hidden="true"
        className="absolute -bottom-16 left-0 right-0 pointer-events-none flex justify-center select-none"
      >
        <span
          className="font-display italic text-bone-soft/[0.06] leading-none"
          style={{
            fontSize: "clamp(180px, 28vw, 420px)",
            fontVariationSettings: "'SOFT' 100, 'WONK' 1",
          }}
        >
          dessert
        </span>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-bone-soft/45 mb-2">
        {title}
      </div>
      {children}
    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="text-[15px] text-bone-soft/80 hover:text-bone-soft transition-colors"
    >
      {children}
    </Link>
  );
}

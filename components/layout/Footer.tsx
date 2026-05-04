import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";

export default function Footer() {
  return (
    <footer
      className="relative overflow-hidden pt-16 pb-8"
      style={{ backgroundColor: "var(--color-choco-600)" }}
    >
      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, var(--color-amber-300), var(--color-amber-500), var(--color-amber-300))" }} />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand */}
          <div>
            <span className="font-accent text-3xl font-bold" style={{ color: "var(--color-amber-300)" }}>
              Dessert Shot
            </span>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--color-choco-200)", opacity: 0.8 }}>
              Handcrafted layered dessert cups made with love in Hamilton, Ontario.
              Every cup is a little work of art — biscuit base, cream, flavour, topped to perfection.
            </p>
            {/* Instagram */}
            <a
              href="https://instagram.com/dessertshot.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--color-amber-300)" }}
            >
              <InstagramIcon size={18} />
              @dessertshot.ca
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--color-amber-400)", fontFamily: "var(--font-body)" }}>
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { href: "#flavors", label: "Our Flavours" },
                { href: "#packages", label: "Packages & Pricing" },
                { href: "#how-its-made", label: "How It's Made" },
                { href: "#about", label: "Our Story" },
                { href: "/order", label: "Place an Order" },
                { href: "/menu", label: "Full Menu" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-all hover:pl-2 duration-200 inline-block"
                    style={{ color: "var(--color-choco-100)", opacity: 0.75 }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--color-amber-400)", fontFamily: "var(--font-body)" }}>
              Get In Touch
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm" style={{ color: "var(--color-choco-100)", opacity: 0.75 }}>
                <MapPin size={16} className="mt-0.5 flex-shrink-0" style={{ color: "var(--color-amber-300)" }} />
                Hamilton, Ontario & Greater Toronto Area
              </li>
              <li>
                <a
                  href="mailto:hello@dessertshot.ca"
                  className="flex items-center gap-3 text-sm transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-choco-100)", opacity: 0.75 }}
                >
                  <Mail size={16} style={{ color: "var(--color-amber-300)" }} />
                  hello@dessertshot.ca
                </a>
              </li>
            </ul>

            <div className="mt-8">
              <Link
                href="/order"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-glow-amber"
                style={{
                  backgroundColor: "var(--color-amber-400)",
                  color: "white",
                }}
              >
                Order Now
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="border-t pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs"
          style={{ borderColor: "rgba(212, 168, 83, 0.2)", color: "var(--color-choco-200)", opacity: 0.6 }}
        >
          <p>© {new Date().getFullYear()} Dessert Shot. All rights reserved.</p>
          <p>Made with love in Hamilton 🍮</p>
        </div>
      </div>
    </footer>
  );
}

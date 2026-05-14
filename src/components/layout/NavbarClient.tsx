// src/components/layout/NavbarClient.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  House,
  ShoppingBag,
  Tag,
  PackageSearch,
  PhoneCall,
  Search,
  Menu,
  X,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CartButton from "./CartButton";
import UserMenuButton from "./UserMenuButton";
import SearchDropdown from "./SearchDropdown";
import Image from "next/image";
import { WhatsAppIcon } from "@/socialCustomSVGIcon/SocialCustomSVGIcon";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: House },
  { label: "Products", href: "/products", icon: ShoppingBag },
  { label: "Offers", href: "/products?sale=true", icon: Tag },
  { label: "Track Order", href: "/track-order", icon: PackageSearch },
  { label: "Contact", href: "/contact", icon: PhoneCall },
];

// ✅ useSearchParams শুধু এই inner component এ — Suspense দিয়ে wrap হবে
function NavLinks() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (href: string): boolean => {
    const [basePath, query] = href.split("?");
    if (basePath === "/") return pathname === "/";
    if (query) {
      const [key, value] = query.split("=");
      return pathname === basePath && searchParams.get(key) === value;
    }
    if (basePath === "/products") {
      const isOffersActive = searchParams.get("sale") === "true";
      if (isOffersActive) return false;
      return pathname.startsWith("/products");
    }
    return pathname.startsWith(basePath);
  };

  return (
    <div
      className="hidden lg:flex items-center gap-1"
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
              active
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            <Icon className="size-4" />
            <span>{label}</span>
            {active && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}

// ✅ Mobile Nav Links — আলাদা করা
function MobileNavLinks({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = (href: string): boolean => {
    const [basePath, query] = href.split("?");
    if (basePath === "/") return pathname === "/";
    if (query) {
      const [key, value] = query.split("=");
      return pathname === basePath && searchParams.get(key) === value;
    }
    if (basePath === "/products") {
      const isOffersActive = searchParams.get("sale") === "true";
      if (isOffersActive) return false;
      return pathname.startsWith("/products");
    }
    return pathname.startsWith(basePath);
  };

  return (
    <nav
      className="container mx-auto px-4 py-3 space-y-1"
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
              active
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg transition-colors",
                active ? "bg-primary/20" : "bg-accent/50",
              )}
            >
              <Icon className="size-4" />
            </div>
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ✅ pathname change এ mobile menu বন্ধ করার জন্য আলাদা component
function MobileMenuCloser({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onClose();
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [pathname, onClose]);

  return null;
}

export default function NavbarClient() {
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMobileClose = () => {
    setMobileOpen(false);
    setShowSearch(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/40 backdrop-blur-xl w-full h-12">
        <div className="container mx-auto flex h-full items-center justify-between px-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 shrink-0"
            aria-label="GadgetCollections Homepage"
          >
            <Image
              src="/logo.svg"
              alt="GadgetCollections logo"
              width={64}
              height={64}
              priority
            />
            <span className="text-xl font-bold tracking-tight hidden sm:inline">
              Gadget Collections
            </span>
          </Link>

          {/* ✅ Desktop Nav — Suspense দিয়ে wrap */}
          <Suspense
            fallback={
              <div className="hidden lg:flex items-center gap-1">
                {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground"
                  >
                    <Icon className="size-4" />
                    <span>{label}</span>
                  </Link>
                ))}
              </div>
            }
          >
            <NavLinks />
          </Suspense>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hover:bg-accent/50 transition-all hover:scale-105 active:scale-95"
              onClick={() => setShowSearch((s) => !s)}
              aria-label="Search"
            >
              {showSearch ? (
                <X className="size-4" />
              ) : (
                <Search className="size-4" />
              )}
            </Button>

            <CartButton />
            <UserMenuButton />

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 lg:hidden rounded-full hover:bg-accent/50 transition-all hover:scale-105 active:scale-95"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* ✅ pathname change এ close — Suspense wrap */}
      <Suspense fallback={null}>
        <MobileMenuCloser onClose={handleMobileClose} />
      </Suspense>

      {/* Search Dropdown */}
      {showSearch && (
        <div className="fixed top-12 left-0 right-0 z-60">
          <SearchDropdown onClose={() => setShowSearch(false)} />
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 top-12 z-45 bg-black/60 animate-in fade-in duration-200 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div
            className="fixed top-12 left-0 right-0 z-55 lg:hidden bg-popover/95 shadow-2xl animate-in slide-in-from-top-2 duration-200"
            style={{ backdropFilter: "blur(30px) saturate(180%)" }}
          >
            {/* ✅ Mobile Nav Links — Suspense wrap */}
            <Suspense
              fallback={
                <div className="p-4 text-sm text-muted-foreground">
                  লোডিং...
                </div>
              }
            >
              <MobileNavLinks onClose={() => setMobileOpen(false)} />
            </Suspense>
          </div>
        </>
      )}

      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-3">
        {/* WhatsApp Button */}
        <Link
          href="https://wa.me/8801568390014"
          target="_blank"
          rel="noopener noreferrer"
          className="flex size-11 items-center justify-center rounded-full bg-[#25D366]/20 backdrop-blur-xl border border-[#25D366]/30 text-[#25D366] shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 hover:bg-[#25D366]/30 group"
          aria-label="Chat on WhatsApp"
        >
          <div className="absolute inset-0 rounded-full bg-[#25D366]/10 animate-ping group-hover:hidden" />
          <WhatsAppIcon className="size-6 relative z-10" />
        </Link>

        {/* Scroll to Top */}
        {showScrollTop && (
          <Button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            size="icon"
            className="h-11 w-11 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 animate-in fade-in slide-in-from-bottom-4"
            aria-label="Scroll to top"
          >
            <ChevronUp className="size-5" />
          </Button>
        )}
      </div>

      <div className="h-14" />
    </>
  );
}
